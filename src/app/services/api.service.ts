import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private supabaseService: SupabaseService) {}

  getFoods(): Observable<any[]> {
    const promise = this.supabaseService.client
      .from('foods')
      .select('*')
      .then(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar foods do Supabase:', error);
          throw error;
        }
        console.log('Foods vindos do Supabase:', data);
        return (data || []).map(item => ({
          ...item,
          image: item.image_url,
          rating: 4.8,
          deliveryTime: '30-40 min',
          deliveryFee: 5.99
        }));
      });
    return from(promise);
  }

  getRestaurants(): Observable<any[]> {
    const promise = this.supabaseService.client
      .from('restaurants')
      .select('*')
      .then(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar restaurants do Supabase:', error);
          throw error;
        }
        console.log('Restaurants vindos do Supabase:', data);
        return (data || []).map(item => ({
          ...item,
          image: item.image_url,
          category: item.cuisine
        }));
      });
    return from(promise);
  }
}