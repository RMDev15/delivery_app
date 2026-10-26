import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem, Coupon } from '../../services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart-drawer.component.html',
  styleUrls: ['./cart-drawer.component.css']
})
export class CartDrawerComponent implements OnInit {
  isOpen: boolean = false;
  couponInput: string = '';
  couponMessage: string = '';
  showPaymentModal: boolean = false;

  sameRestaurantSuggestions = [
    { 
      id: 801, 
      name: 'Refrigerante Coca-Cola 350ml', 
      price: 12.00,
      image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=200&q=80' 
    },
    { 
      id: 802, 
      name: 'Batata Frita Especial 200g', 
      price: 18.90,
      image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=200&q=80' 
    }
  ];

  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.cartDrawerOpen$.subscribe(open => {
      this.isOpen = open;
    });
  }

  toggleDrawer() {
    this.isOpen = !this.isOpen;
    this.cartService.setCartDrawerState(this.isOpen);
  }

  updateQty(item: CartItem, delta: number) {
    this.cartService.updateQuantity(item.id, item.quantity + delta);
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.id);
  }

  removeCoupon(code: string) {
    this.cartService.removeCoupon(code);
    this.couponMessage = '';
  }

  applyEnteredCoupon() {
    if (!this.couponInput.trim()) return;
    const result = this.cartService.applyCouponCode(this.couponInput);
    this.couponMessage = result.message;
    this.couponInput = '';
  }

  addSuggestion(product: any) {
    const currentItems = this.cartService.getItems();
    if (currentItems.length > 0) {
      const rest = { id: currentItems[0].restaurantId, name: currentItems[0].restaurantName };
      this.cartService.addToCart(product, rest, 1);
    }
  }

  checkout() {
    const items = this.cartService.getItems();
    if (items.length === 0) return;

    // Verificar se o usuário está logado
    const user = this.cartService.getCurrentUser();
    if (!user) {
      // Fecha a gaveta e redireciona para a tela de login
      this.toggleDrawer();
      this.router.navigate(['/login']);
      return;
    }

    // Se estiver logado, abre a modal de pagamento fictício (PIX ou Cartão)
    this.showPaymentModal = true;
  }

  confirmPayment(method: string) {
    const items = this.cartService.getItems();
    const restName = items[0]?.restaurantName || 'Estabelecimento';
    const total = this.cartService.getTotal();

    setTimeout(() => {
      alert(`✅ Pedido confirmado com sucesso via ${method}!\nEstabelecimento: ${restName}\nTotal: R$ ${total.toFixed(2)}`);
      this.cartService.clearCart();
      this.showPaymentModal = false;
      this.toggleDrawer();
    }, 400);
  }
}