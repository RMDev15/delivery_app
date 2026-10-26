import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  get client() {
    return this.supabase;
  }

  // Método real para salvar ou atualizar o perfil do usuário no Supabase
  async saveUserProfile(email: string, name: string = 'Cliente Regional') {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .upsert(
          [{ email: email, name: name, updated_at: new Date() }],
          { onConflict: 'email' }
        );

      if (error) {
        console.warn('Nota do Supabase (tabela profiles):', error.message);
      }
      return data;
    } catch (err) {
      console.error('Erro ao salvar perfil no Supabase:', err);
      return null;
    }
  }
}