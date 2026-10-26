import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { SupabaseService } from '../../services/supabase.service';
import { CartService } from '../../services/cart.service';
import { CartDrawerComponent } from '../cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CartDrawerComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  foods: any[] = [];
  burgers: any[] = [];
  restaurants: any[] = [];
  drinksAndDesserts: any[] = [];

  selectedLocation: string = 'Todas as Cidades';
  showLocationMenu: boolean = false;

  selectedProduct: any = null;
  productQuantity: number = 1;
  productObs: string = '';

  locations: string[] = [
    'Todas as Cidades',
    'Parobé, RS',
    'Taquara, RS',
    'Igrejinha, RS',
    'Sapiranga, RS',
    'Novo Hamburgo, RS',
    'Três Coroas, RS',
    'Rolante, RS',
    'Nova Hartz, RS',
    'Araricá, RS'
  ];

  banners = [
    { title: 'XIS ESPECIAL', subtitle: 'O melhor sabor da região', discount: 'R$ 10 OFF', codeType: 'XIS', bg: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)' },
    { title: 'PIZZA EM DOBRO', subtitle: 'Terça e Quarta imperdível', discount: '50% Off', codeType: 'PIZZA', bg: 'linear-gradient(135deg, #ff9f43 0%, #ff5252 100%)' },
    { title: 'ENTREGA GRÁTIS', subtitle: 'Em restaurantes parceiros', discount: 'Frete R$ 0', codeType: 'FRETE', bg: 'linear-gradient(135deg, #2ed573 0%, #1e90ff 100%)' }
  ];
  currentBannerIndex = 0;

  bannerInterval: any;
  autoScrollInterval: any;
  realtimeSubscription: any;

  @ViewChild('foodScroll', { read: ElementRef }) foodScroll!: ElementRef;
  @ViewChild('burgerScroll', { read: ElementRef }) burgerScroll!: ElementRef;
  @ViewChild('restScroll', { read: ElementRef }) restScroll!: ElementRef;
  @ViewChild('drinkScroll', { read: ElementRef }) drinkScroll!: ElementRef;

  constructor(
    private apiService: ApiService,
    private supabaseService: SupabaseService,
    public cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadDataByCity(this.selectedLocation);
    this.startAutoCarousels();
    this.initRealtimeListener();
  }

  ngOnDestroy(): void {
    this.stopAutoCarousels();
    if (this.realtimeSubscription) {
      this.supabaseService.client.removeChannel(this.realtimeSubscription);
    }
  }

  initRealtimeListener() {
    this.realtimeSubscription = this.supabaseService.client
      .channel('public-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'foods' },
        () => this.loadDataByCity(this.selectedLocation)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'restaurants' },
        () => this.loadDataByCity(this.selectedLocation)
      )
      .subscribe();
  }

  startAutoCarousels() {
    this.bannerInterval = setInterval(() => {
      this.currentBannerIndex = (this.currentBannerIndex + 1) % this.banners.length;
    }, 4000);

    this.autoScrollInterval = setInterval(() => {
      this.stepAutoScroll(this.foodScroll);
      this.stepAutoScroll(this.burgerScroll);
      this.stepAutoScroll(this.restScroll);
      this.stepAutoScroll(this.drinkScroll);
    }, 2500);
  }

  stopAutoCarousels() {
    if (this.bannerInterval) clearInterval(this.bannerInterval);
    if (this.autoScrollInterval) clearInterval(this.autoScrollInterval);
  }

  stepAutoScroll(container: ElementRef) {
    if (container && container.nativeElement) {
      const el = container.nativeElement;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 5) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 180, behavior: 'smooth' });
      }
    }
  }

  scrollManual(element: HTMLElement, direction: number) {
    if (element) {
      element.scrollBy({ left: direction * 220, behavior: 'smooth' });
    }
  }

  toggleLocationMenu(event?: Event) {
    if (event) event.stopPropagation();
    this.showLocationMenu = !this.showLocationMenu;
  }

  selectLocation(loc: string, event?: Event) {
    if (event) event.stopPropagation();
    this.selectedLocation = loc;
    this.showLocationMenu = false;
    this.loadDataByCity(loc);
  }

  openProductModal(product: any) {
    this.selectedProduct = product;
    this.productQuantity = 1;
    this.productObs = '';
  }

  closeProductModal() {
    this.selectedProduct = null;
  }

  addToCartFromHome() {
    if (this.selectedProduct) {
      const dummyRestaurant = { 
        id: this.selectedProduct.restaurant_id || 1, 
        name: this.selectedProduct.restaurants?.name || 'Estabelecimento Regional' 
      };
      this.cartService.addToCart(this.selectedProduct, dummyRestaurant, this.productQuantity, this.productObs);
      this.closeProductModal();
      alert('🎉 Produto adicionado ao carrinho!');
    }
  }

  // Gera códigos aleatórios de 6 dígitos sem conflitar com o estado anterior
  onBannerClick(banner: any) {
    let prefix = 'DISC';
    if (banner.codeType === 'XIS') prefix = 'XIS';
    else if (banner.codeType === 'PIZZA') prefix = 'PIZZA';
    else if (banner.codeType === 'FRETE') prefix = 'FRETE';

    const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
    const generatedCoupon = `${prefix}${randomSixDigits}`;

    const result = this.cartService.applyCouponCode(generatedCoupon);
    alert(`${result.message}\n(Código dinâmico: ${generatedCoupon})`);
  }

  loadDataByCity(city: string) {
    this.apiService.getRestaurantsByCity(city).subscribe({
      next: (data) => {
        // Atribui cupons de 6 dígitos e aplica 70% de chance de múltiplos cupons por empresa
        this.restaurants = (data || []).map((rest: any) => {
          const coupons: string[] = [];
          const firstCode = Math.floor(100000 + Math.random() * 900000).toString();
          coupons.push(`REG${firstCode}`);

          if (Math.random() < 0.7) {
            const secondCode = Math.floor(100000 + Math.random() * 900000).toString();
            coupons.push(`PROMO${secondCode}`);
          }

          return { ...rest, availableCoupons: coupons };
        });
      }
    });

    this.apiService.getFoodsByCity(city).subscribe({
      next: (data) => {
        const allData = data || [];
        const burgersList = allData.filter(item => 
          item.category === 'X-Burgers' || 
          item.category === 'Burgers' ||
          item.name.toLowerCase().includes('burger') || 
          item.name.toLowerCase().includes('xis')
        );
        const foodsList = allData.filter(item => !burgersList.includes(item));

        this.foods = foodsList.length > 0 ? foodsList : allData;
        this.burgers = burgersList.length > 0 ? burgersList : allData;
      }
    });

    this.drinksAndDesserts = [
      { id: 991, name: 'Milkshake de Ninho', price: 16.90, rating: 4.8, time: '15-25 min', fee: '4.99', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=500&q=80' },
      { id: 992, name: 'Petit Gateau', price: 14.00, rating: 4.9, time: '20-30 min', fee: '5.00', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=500&q=80' },
      { id: 993, name: 'Açaí Tradicional 500ml', price: 22.00, rating: 4.7, time: '15-20 min', fee: '3.99', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=500&q=80' },
      { id: 994, name: 'Suco Natural Laranja 1L', price: 12.00, rating: 4.6, time: '10-20 min', fee: '3.00', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=500&q=80' }
    ];
  }
}