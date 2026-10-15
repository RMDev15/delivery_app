import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://ubnwbppegpxdgmxprqth.supabase.co', 
      'sb_publishable_tIxN_nsKL6ijYgcpMBKoRA_EP5arpVK'
    );
  }

  getUsers(): Observable<any> {
    const promise = this.supabase.from('profiles').select('*').then(({ data, error }) => {
      if (error) throw error;
      return data;
    });
    return from(promise);
  }

  getUser(id: string): Observable<any> {
    const promise = this.supabase.from('profiles').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error) throw error;
      return data;
    });
    return from(promise);
  }

  getRestaurants(): Observable<any> {
    const promise = this.supabase.from('restaurants').select('*').then(({ data, error }) => {
      if (error) throw error;
      return data;
    });
    return from(promise);
  }

  getRestaurant(id: number): Observable<any> {
    const promise = this.supabase.from('restaurants').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error) throw error;
      return data;
    });
    return from(promise);
  }

  getFoods(): Observable<any> {
    const promise = this.supabase.from('foods').select('*').then(({ data, error }) => {
      if (error) throw error;
      return data;
    });
    return from(promise);
  }

  getFood(id: number): Observable<any> {
    const promise = this.supabase.from('foods').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error) throw error;
      return data;
    });
    return from(promise);
  }
}