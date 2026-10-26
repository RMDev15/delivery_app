import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  allFoods: any[] = [];
  allRestaurants: any[] = [];
  foods: any[] = [];
  burgers: any[] = [];
  restaurants: any[] = [];
  drinksAndDesserts: any[] = [];

  selectedLocation: string = 'Taquara, RS';
  showLocationMenu: boolean = false;

  locations: string[] = [
    'Taquara, RS',
    'Parobé, RS',
    'Igrejinha, RS',
    'Sapiranga, RS'
  ];

  // Carrossel do Banner
  banners = [
    { title: 'XIS ESPECIAL', subtitle: 'O melhor sabor da região', discount: 'R$ 10 OFF', bg: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)' },
    { title: 'PIZZA EM DOBRO', subtitle: 'Terça e Quarta imperdível', discount: '50% Off', bg: 'linear-gradient(135deg, #ff9f43 0%, #ff5252 100%)' },
    { title: 'ENTREGA GRÁTIS', subtitle: 'Em restaurantes parceiros', discount: 'Frete R$ 0', bg: 'linear-gradient(135deg, #2ed573 0%, #1e90ff 100%)' }
  ];
  currentBannerIndex = 0;

  // Timers dos carrosséis
  bannerInterval: any;
  foodsInterval: any;
  burgersInterval: any;
  restaurantsInterval: any;
  drinksInterval: any;

  // Referências dos Containers para Scroll Automático e Manual
  @ViewChild('foodScroll', { read: ElementRef }) foodScroll!: ElementRef;
  @ViewChild('burgerScroll', { read: ElementRef }) burgerScroll!: ElementRef;
  @ViewChild('restScroll', { read: ElementRef }) restScroll!: ElementRef;
  @ViewChild('drinkScroll', { read: ElementRef }) drinkScroll!: ElementRef;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
    this.startAutoCarousels();
  }

  ngOnDestroy(): void {
    this.stopAutoCarousels();
  }

  startAutoCarousels() {
    // Carrossel do Banner principal
    this.bannerInterval = setInterval(() => {
      this.currentBannerIndex = (this.currentBannerIndex + 1) % this.banners.length;
    }, 4000);

    // Carrossel de Comidas Recomendadas (desliza para a direita a cada 3.5s)
    this.foodsInterval = setInterval(() => {
      this.autoScroll(this.foodScroll, 180);
    }, 3500);

    // Carrossel de X-Burgers & Artesanais (desliza a cada 4s)
    this.burgersInterval = setInterval(() => {
      this.autoScroll(this.burgerScroll, 180);
    }, 4000);

    // Carrossel de Restaurantes Recomendados (desliza a cada 3s)
    this.restaurantsInterval = setInterval(() => {
      this.autoScroll(this.restScroll, 120);
    }, 3000);

    // Carrossel de Bebidas & Sobremesas (desliza a cada 4.5s)
    this.drinksInterval = setInterval(() => {
      this.autoScroll(this.drinkScroll, 180);
    }, 4500);
  }

  stopAutoCarousels() {
    if (this.bannerInterval) clearInterval(this.bannerInterval);
    if (this.foodsInterval) clearInterval(this.foodsInterval);
    if (this.burgersInterval) clearInterval(this.burgersInterval);
    if (this.restaurantsInterval) clearInterval(this.restaurantsInterval);
    if (this.drinksInterval) clearInterval(this.drinksInterval);
  }

// Função de rolagem automática contínua
  autoScroll(container: ElementRef, step: number) {
    if (container && container.nativeElement) {
      const el = container.nativeElement;
      const maxScroll = el.scrollWidth - el.clientWidth;
      
      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    }
  }

  // Scroll manual via botões direcionais recebendo o elemento nativo diretamente
  scrollManual(element: HTMLElement, direction: number) {
    if (element) {
      element.scrollBy({ left: direction * 220, behavior: 'smooth' });
    }
  }

  toggleLocationMenu() {
    this.showLocationMenu = !this.showLocationMenu;
  }

  selectLocation(loc: string) {
    this.selectedLocation = loc;
    this.showLocationMenu = false;
    this.filterDataByLocation();
  }

  loadData() {
    this.apiService.getFoods().subscribe({
      next: (data) => {
        this.allFoods = data;
        this.filterDataByLocation();
      },
      error: (err) => console.error('Erro ao buscar comidas:', err)
    });

    this.apiService.getRestaurants().subscribe({
      next: (data) => {
        this.allRestaurants = data;
        this.filterDataByLocation();
      },
      error: (err) => console.error('Erro ao buscar restaurantes:', err)
    });

    // Dados fixos para Bebidas & Sobremesas
    this.drinksAndDesserts = [
      { name: 'Milkshake de Ninho', price: 16.90, rating: 4.8, time: '15-25 min', fee: '4.99', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=500&q=80' },
      { name: 'Petit Gateau', price: 14.00, rating: 4.9, time: '20-30 min', fee: '5.00', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=500&q=80' },
      { name: 'Açaí Tradicional 500ml', price: 22.00, rating: 4.7, time: '15-20 min', fee: '3.99', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=500&q=80' },
      { name: 'Suco Natural Laranja 1L', price: 12.00, rating: 4.6, time: '10-20 min', fee: '3.00', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=500&q=80' }
    ];
  }

  // Filtro real por cidade selecionada
  filterDataByLocation() {
    if (this.selectedLocation === 'Taquara, RS') {
      this.foods = this.allFoods.filter((_, i) => i % 2 === 0);
      this.burgers = this.allFoods.filter((_, i) => i % 2 !== 0);
      this.restaurants = this.allRestaurants.slice(0, 4);
    } else if (this.selectedLocation === 'Parobé, RS') {
      this.foods = this.allFoods.filter((_, i) => i % 3 === 0);
      this.burgers = this.allFoods.slice(1, 4);
      this.restaurants = this.allRestaurants.slice(1, 5);
    } else if (this.selectedLocation === 'Igrejinha, RS') {
      this.foods = this.allFoods.filter((_, i) => i % 2 !== 0);
      this.burgers = this.allFoods.slice(0, 3);
      this.restaurants = this.allRestaurants.slice(2, 6);
    } else {
      // Sapiranga
      this.foods = this.allFoods;
      this.burgers = this.allFoods;
      this.restaurants = this.allRestaurants;
    }

    if (this.foods.length === 0) this.foods = this.allFoods;
    if (this.burgers.length === 0) this.burgers = this.allFoods;
    if (this.restaurants.length === 0) this.restaurants = this.allRestaurants;
  }
}