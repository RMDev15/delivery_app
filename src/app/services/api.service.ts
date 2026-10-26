import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private supabaseService: SupabaseService) {}

  // 1. Busca todos os produtos ativos no Supabase com os dados do restaurante
  getFoods(): Observable<any[]> {
    const promise = this.supabaseService.client
      .from('foods')
      .select('*, restaurants(*)')
      .eq('is_available', true)
      .then(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar comidas do Supabase:', error);
          return [];
        }
        return (data || []).map(item => ({
          ...item,
          image: item.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
          rating: item.rating || 4.8,
          deliveryTime: item.deliveryTime || '25-35 min',
          deliveryFee: item.deliveryFee || 4.99
        }));
      });
    return from(promise);
  }

  // 2. Filtra os produtos estritamente pela cidade selecionada
  getFoodsByCity(city: string): Observable<any[]> {
    if (city === 'Todas as Cidades') {
      return this.getFoods();
    }

    const cleanCity = city.replace(', RS', '').trim();

    const promise = this.supabaseService.client
      .from('restaurants')
      .select('id')
      .ilike('city', `%${cleanCity}%`)
      .then(async ({ data: restData, error: restError }) => {
        if (restError || !restData || restData.length === 0) {
          return [];
        }

        const restIds = restData.map(r => r.id);

        const { data: foodData, error: foodError } = await this.supabaseService.client
          .from('foods')
          .select('*, restaurants(*)')
          .in('restaurant_id', restIds)
          .eq('is_available', true);

        if (foodError) {
          console.error(`Erro ao buscar alimentos para ${city}:`, foodError);
          return [];
        }

        return (foodData || []).map(item => ({
          ...item,
          image: item.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
          rating: item.rating || 4.8,
          deliveryTime: item.deliveryTime || '25-35 min',
          deliveryFee: item.deliveryFee || 4.99
        }));
      });

    return from(promise);
  }

  // 3. Busca todos os restaurantes ativos no Supabase
  getRestaurants(): Observable<any[]> {
    const promise = this.supabaseService.client
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .then(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar restaurantes do Supabase:', error);
          return [];
        }
        return (data || []).map(item => ({
          ...item,
          image: item.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80',
          category: item.cuisine || 'Variada'
        }));
      });
    return from(promise);
  }

  // 4. Filtra os restaurantes ativamente pela cidade escolhida
  getRestaurantsByCity(city: string): Observable<any[]> {
    if (city === 'Todas as Cidades') {
      return this.getRestaurants();
    }

    const cleanCity = city.replace(', RS', '').trim();

    const promise = this.supabaseService.client
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .ilike('city', `%${cleanCity}%`)
      .then(({ data, error }) => {
        if (error) {
          console.error(`Erro ao buscar restaurantes para ${city}:`, error);
          return [];
        }
        return (data || []).map(item => ({
          ...item,
          image: item.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80',
          category: item.cuisine || 'Variada'
        }));
      });

    return from(promise);
  }
}