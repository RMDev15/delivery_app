import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <h2>Entrar no Delivery</h2>
      <p>Informe o seu e-mail para receber o acesso rápido.</p>

      <form (ngSubmit)="handleLogin()">
        <input type="email" [(ngModel)]="email" name="email" placeholder="Seu e-mail" required class="input-field" />
        <button type="submit" class="submit-btn" [disabled]="loading">
          {{ loading ? 'A enviar...' : 'Entrar com E-mail' }}
        </button>
      </form>

      <p *ngIf="message" class="message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .login-container { padding: 30px 20px; max-width: 400px; margin: 40px auto; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center; }
    h2 { color: #2f3542; margin-bottom: 8px; }
    p { color: #747d8c; font-size: 14px; margin-bottom: 24px; }
    .input-field { width: 100%; padding: 12px; border: 1px solid #dfe4ea; border-radius: 8px; margin-bottom: 16px; box-sizing: border-box; font-size: 14px; }
    .submit-btn { width: 100%; padding: 12px; background-color: #ff4757; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; }
    .message { margin-top: 16px; color: #2ed573; font-weight: 600; font-size: 14px; }
  `]
})
export class LoginComponent {
  email = '';
  loading = false;
  message = '';

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async handleLogin() {
    this.loading = true;
    const { error } = await this.supabaseService.client.auth.signInWithOtp({
      email: this.email,
      options: { emailRedirectTo: window.location.origin }
    });

    this.loading = false;
    if (error) {
      this.message = 'Erro ao enviar link de login: ' + error.message;
    } else {
      this.message = 'Link de acesso enviado para o seu e-mail!';
    }
  }
}