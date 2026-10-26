import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: number;
  restaurantId: number;
  restaurantName: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  image_url?: string;
  observations?: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  type: 'XIS' | 'PIZZA' | 'FRETE';
  isValidForCurrentItems: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  // Lista de cupons ativos no carrinho (permite múltiplos cupons visíveis)
  private activeCouponsSubject = new BehaviorSubject<Coupon[]>([]);
  activeCoupons$ = this.activeCouponsSubject.asObservable();

  // Estado de controle para abrir/fechar a gaveta do carrinho globalmente
  private cartDrawerOpenSubject = new BehaviorSubject<boolean>(false);
  cartDrawerOpen$ = this.cartDrawerOpenSubject.asObservable();

  // Simulação de usuário logado na sessão regional (ajuste para null caso queira testar o redirecionamento de login)
  private currentUserSubject = new BehaviorSubject<{ name: string; email: string; phone: string } | null>({
    name: 'Cliente Regional (Cadastrado)',
    email: 'cliente@valedosinos.rs',
    phone: '(51) 99999-9999'
  });
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  getItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: { name: string; email: string; phone: string } | null) {
    this.currentUserSubject.next(user);
  }

  setCartDrawerState(isOpen: boolean) {
    this.cartDrawerOpenSubject.next(isOpen);
  }

  addToCart(product: any, restaurant: any, quantity: number = 1, obs: string = ''): void {
    const currentItems = this.getItems();
    const targetRestId = restaurant.id || product.restaurant_id;
    const targetRestName = restaurant.name || product.restaurants?.name || 'Estabelecimento';

    // Bloqueio rígido de mistura de empresas diferentes
    if (currentItems.length > 0 && currentItems[0].restaurantId !== targetRestId) {
      const confirmClear = confirm(
        `⚠️ Seu carrinho contém itens de "${currentItems[0].restaurantName}".\n\nPor garantia de repasse correto ao estabelecimento regional, só é permitido um pedido por vez por empresa.\n\nDeseja limpar o carrinho atual para encomendar de "${targetRestName}"?`
      );
      if (!confirmClear) return;
      this.clearCart();
    }

    const updatedItems = this.getItems();
    const existingIndex = updatedItems.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      updatedItems[existingIndex].quantity += quantity;
      if (obs) updatedItems[existingIndex].observations = obs;
      this.itemsSubject.next([...updatedItems]);
    } else {
      const newItem: CartItem = {
        id: product.id,
        restaurantId: targetRestId,
        restaurantName: targetRestName,
        name: product.name,
        price: product.price,
        quantity: quantity,
        category: product.category || 'Geral',
        image_url: product.image_url || product.image,
        observations: obs
      };
      this.itemsSubject.next([...this.getItems(), newItem]);
    }
    this.revalidateCoupons();
  }

  removeFromCart(productId: number): void {
    const updated = this.getItems().filter(item => item.id !== productId);
    this.itemsSubject.next(updated);
    if (updated.length === 0) {
      this.clearCart();
    } else {
      this.revalidateCoupons();
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const currentItems = this.getItems();
    const item = currentItems.find(i => i.id === productId);
    if (item) {
      item.quantity = quantity;
      this.itemsSubject.next([...currentItems]);
      this.revalidateCoupons();
    }
  }

  // Adiciona o cupom diretamente à lista de cupons ativos sem pop-up
  applyCouponCode(code: string): { success: boolean; message: string } {
    if (!code || !code.trim()) return { success: false, message: 'Código vazio.' };
    const upperCode = code.trim().toUpperCase();
    const currentCoupons = this.activeCouponsSubject.value;

    if (currentCoupons.some(c => c.code === upperCode)) {
      return { success: false, message: 'Este cupom já foi adicionado ao carrinho.' };
    }

    const items = this.getItems();
    let type: 'XIS' | 'PIZZA' | 'FRETE' = 'FRETE';
    let discountPercent = 0;
    let isValid = true;
    let msg = `Cupom ${upperCode} adicionado com sucesso!`;

    if (upperCode.startsWith('XIS')) {
      type = 'XIS';
      discountPercent = 10;
      const hasXis = items.some(i => 
        i.name.toLowerCase().includes('xis') || 
        i.name.toLowerCase().includes('burger') ||
        i.category?.toLowerCase().includes('burgers')
      );
      if (items.length > 0 && !hasXis) {
        isValid = false;
        msg = `Cupom ${upperCode} adicionado, mas não é válido para os produtos atuais (exclusivo para XIS).`;
      }
    } else if (upperCode.startsWith('PIZZA')) {
      type = 'PIZZA';
      discountPercent = 50;
      const hasPizza = items.some(i => 
        i.name.toLowerCase().includes('pizza') || 
        i.category?.toLowerCase().includes('pizza')
      );
      if (items.length > 0 && !hasPizza) {
        isValid = false;
        msg = `Cupom ${upperCode} adicionado, mas não é válido para os produtos atuais (exclusivo para Pizza).`;
      }
    } else {
      type = 'FRETE';
      discountPercent = 0;
      msg = `Cupom ${upperCode} de Entrega Grátis adicionado!`;
    }

    const newCoupon: Coupon = {
      code: upperCode,
      discountPercent,
      type,
      isValidForCurrentItems: isValid,
      message: msg
    };

    this.activeCouponsSubject.next([...currentCoupons, newCoupon]);
    return { success: true, message: msg };
  }

  // Revalida os cupons sempre que o carrinho muda
  private revalidateCoupons() {
    const items = this.getItems();
    const coupons = this.activeCouponsSubject.value;

    const updated = coupons.map(c => {
      if (c.type === 'XIS') {
        const hasXis = items.some(i => i.name.toLowerCase().includes('xis') || i.name.toLowerCase().includes('burger') || i.category?.toLowerCase().includes('burgers'));
        return { ...c, isValidForCurrentItems: hasXis };
      }
      if (c.type === 'PIZZA') {
        const hasPizza = items.some(i => i.name.toLowerCase().includes('pizza') || i.category?.toLowerCase().includes('pizza'));
        return { ...c, isValidForCurrentItems: hasPizza };
      }
      return c;
    });

    this.activeCouponsSubject.next(updated);
  }

  removeCoupon(code: string): void {
    const filtered = this.activeCouponsSubject.value.filter(c => c.code !== code);
    this.activeCouponsSubject.next(filtered);
  }

  clearCart(): void {
    this.itemsSubject.next([]);
    this.activeCouponsSubject.next([]);
  }

  getSubtotal(): number {
    return this.getItems().reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  getDiscountAmount(): number {
    const coupons = this.activeCouponsSubject.value;
    const subtotal = this.getSubtotal();
    let totalDiscount = 0;

    for (const c of coupons) {
      if (c.isValidForCurrentItems && c.type !== 'FRETE') {
        totalDiscount += (subtotal * c.discountPercent) / 100;
      }
    }
    return totalDiscount;
  }

  getDeliveryFee(): number {
    const items = this.getItems();
    if (items.length === 0) return 0;

    const coupons = this.activeCouponsSubject.value;
    const hasFreeShipping = coupons.some(c => c.type === 'FRETE');
    if (hasFreeShipping) {
      return 0; // Frete grátis zerado
    }
    return 4.99; // Taxa regional padrão
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    const deliveryFee = this.getDeliveryFee();
    return Math.max(0, subtotal - discount + deliveryFee);
  }
}