import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      
      <!-- ETAPA 1: DIGITAR E-MAIL -->
      <div *ngIf="step === 'email'">
        <h2>Entrar no Delivery</h2>
        <p>Informe o seu e-mail para receber o acesso rápido.</p>

        <form (ngSubmit)="sendCode()">
          <input type="email" [(ngModel)]="email" name="email" placeholder="Seu e-mail (ex: cliente@valedosinos.rs)" required class="input-field" />
          <button type="submit" class="submit-btn" [disabled]="loading">
            {{ loading ? 'A processar...' : 'Entrar com E-mail' }}
          </button>
        </form>

        <div class="divider"><span>ou</span></div>

        <button type="button" class="google-btn" (click)="loginWithGoogle()">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
          Continuar com o Google
        </button>
      </div>

      <!-- ETAPA 2: DIGITAR CÓDIGO DE CONFIRMAÇÃO -->
      <div *ngIf="step === 'code'">
        <h2>Confirme seu Acesso</h2>
        <p>Digite o código de 6 dígitos gerado para <strong>{{ email }}</strong>:</p>

        <div class="form-group">
          <input type="text" [(ngModel)]="code" maxlength="6" placeholder="000000" class="input-field code-input" />
        </div>

        <button type="button" class="submit-btn" (click)="verifyCode()">Confirmar e Entrar</button>
        <button type="button" class="back-btn" (click)="step = 'email'">← Alterar e-mail</button>
      </div>

      <!-- ETAPA 3: LOGADO -->
      <div *ngIf="step === 'logged'" class="user-profile">
        <h2>👤 Minha Conta</h2>
        <p>Você está conectado como:</p>
        <div class="user-badge">
          <strong>{{ currentUser?.name }}</strong>
          <span>{{ currentUser?.email }}</span>
        </div>

        <button type="button" class="submit-btn" (click)="router.navigate(['/'])">Ir para o Cardápio</button>
        <button type="button" class="logout-btn" (click)="logout()">Sair da Conta</button>
      </div>

      <p *ngIf="message" [class.error-message]="isError" [class.message]="!isError">{{ message }}</p>
    </div>
  `,
  styles: [`
    .login-container { padding: 30px 20px; max-width: 400px; margin: 40px auto; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    h2 { color: #2f3542; margin-bottom: 8px; }
    p { color: #747d8c; font-size: 14px; margin-bottom: 24px; }
    .input-field { width: 100%; padding: 12px; border: 1px solid #dfe4ea; border-radius: 8px; margin-bottom: 16px; box-sizing: border-box; font-size: 14px; outline: none; }
    .input-field:focus { border-color: #ff4757; }
    .code-input { text-align: center; letter-spacing: 6px; font-size: 20px !important; font-weight: bold; }
    .submit-btn { width: 100%; padding: 12px; background-color: #ff4757; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; transition: background 0.2s; }
    .submit-btn:hover { background-color: #ff6b81; }
    .divider { margin: 20px 0; position: relative; }
    .divider::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; border-top: 1px solid #dfe4ea; }
    .divider span { position: relative; background: white; padding: 0 10px; color: #a4b0be; font-size: 13px; }
    .google-btn { width: 100%; padding: 12px; background: white; border: 1px solid #dfe4ea; border-radius: 8px; font-weight: bold; color: #2f3542; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; }
    .google-btn img { width: 18px; height: 18px; }
    .back-btn { background: none; border: none; color: #747d8c; margin-top: 12px; cursor: pointer; font-size: 13px; width: 100%; }
    .message { margin-top: 16px; color: #2ed573; font-weight: 600; font-size: 14px; }
    .error-message { margin-top: 16px; color: #ff4757; font-weight: 600; font-size: 14px; background: #ffeaa7; padding: 10px; border-radius: 6px; }
    .user-badge { background: #f1f2f6; padding: 16px; border-radius: 8px; display: flex; flex-direction: column; margin-bottom: 20px; }
    .logout-btn { background: none; border: 1px solid #ff4757; color: #ff4757; width: 100%; padding: 10px; border-radius: 8px; margin-top: 10px; cursor: pointer; font-weight: bold; }
  `]
})
export class LoginComponent {
  email = '';
  code = '';
  loading = false;
  message = '';
  isError = false;
  step: 'email' | 'code' | 'logged' = 'email';
  generatedCode = '';
  currentUser: any = null;

  constructor(
    private supabaseService: SupabaseService, 
    private cartService: CartService,
    public router: Router
  ) {
    this.currentUser = this.cartService.getCurrentUser();
    if (this.currentUser) {
      this.step = 'logged';
    }
  }

  sendCode() {
    this.message = '';
    this.isError = false;

    if (!this.email || !this.email.includes('@')) {
      this.isError = true;
      this.message = 'Por favor, informe um e-mail válido.';
      return;
    }

    this.loading = true;
    
    // Gera o código local de 6 dígitos simulando o envio
    this.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    setTimeout(() => {
      this.loading = false;
      this.step = 'code';
      alert(`🔑 Código de acesso gerado para ${this.email}:\n\n➡️ CÓDIGO: ${this.generatedCode}`);
    }, 400);
  }

  async verifyCode() {
    this.message = '';
    this.isError = false;

    if (this.code.trim() !== this.generatedCode) {
      this.isError = true;
      this.message = '❌ Código incorreto. Tente novamente.';
      return;
    }

    const userData = {
      name: this.email.split('@')[0],
      email: this.email,
      phone: '(51) 99999-9999'
    };

    try {
      // Salva ou atualiza os dados na tabela 'profiles' no Supabase
      await this.supabaseService.client
        .from('profiles')
        .upsert([{ email: userData.email, name: userData.name, updated_at: new Date() }], { onConflict: 'email' });

      // Salva no estado global do carrinho/sessão
      this.cartService.setCurrentUser(userData);

      this.isError = false;
      this.message = '✅ Login efetuado com sucesso!';

      setTimeout(() => {
        if (this.cartService.getItems().length > 0) {
          this.cartService.setCartDrawerState(true);
          this.router.navigate(['/']);
        } else {
          this.step = 'logged';
          this.currentUser = userData;
        }
      }, 500);

    } catch (err: any) {
      this.isError = true;
      this.message = 'Erro ao salvar no banco de dados: ' + err.message;
    }
  }

  async loginWithGoogle() {
    const userData = {
      name: 'Cliente Google Regional',
      email: 'cliente.google@valedosinos.rs',
      phone: '(51) 98888-8888'
    };

    try {
      await this.supabaseService.client
        .from('profiles')
        .upsert([{ email: userData.email, name: userData.name, updated_at: new Date() }], { onConflict: 'email' });

      this.cartService.setCurrentUser(userData);
      this.currentUser = userData;
      this.step = 'logged';

      alert('✅ Conectado com sucesso via Google!');

      if (this.cartService.getItems().length > 0) {
        this.cartService.setCartDrawerState(true);
        this.router.navigate(['/']);
      }
    } catch (err: any) {
      this.isError = true;
      this.message = 'Erro no login Google: ' + err.message;
    }
  }

  logout() {
    this.cartService.setCurrentUser(null);
    this.step = 'email';
    this.email = '';
    this.code = '';
    this.currentUser = null;
    this.message = '';
  }
}