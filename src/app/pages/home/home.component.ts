import { Component, OnInit } from '@angular/core';
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
export class HomeComponent implements OnInit {
  foods: any[] = [];
  restaurants: any[] = [];
  selectedLocation: string = 'Taquara, RS';
  showLocationMenu: boolean = false;
  
  locations: string[] = [
    'Taquara, RS',
    'Parobé, RS',
    'Igrejinha, RS',
    'Sapiranga, RS'
  ];

  // Dados para o Carrossel do Banner Automático
  banners = [
    { title: 'X-IS ESPECIAL', subtitle: 'O melhor sabor da região', discount: 'R$ 10 OFF', bg: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)' },
    { title: 'PIZZA EM DOBRO', subtitle: 'Terça e Quarta imperdível', discount: '50% Off', bg: 'linear-gradient(135deg, #ff9f43 0%, #ff5252 100%)' },
    { title: 'ENTREGA GRÁTIS', subtitle: 'Em restaurantes parceiros', discount: 'Frete R$ 0', bg: 'linear-gradient(135deg, #2ed573 0%, #1e90ff 100%)' }
  ];
  currentBannerIndex = 0;
  bannerInterval: any;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
    this.startBannerSlider();
  }

  ngOnDestroy(): void {
    if (this.bannerInterval) clearInterval(this.bannerInterval);
  }

  startBannerSlider() {
    this.bannerInterval = setInterval(() => {
      this.currentBannerIndex = (this.currentBannerIndex + 1) % this.banners.length;
    }, 4000); // Troca a imagem a cada 4 segundos
  }

  toggleLocationMenu() {
    this.showLocationMenu = !this.showLocationMenu;
  }

  selectLocation(loc: string) {
    this.selectedLocation = loc;
    this.showLocationMenu = false;
    // Aqui pode filtrar dados por cidade futuramente
  }

  loadData() {
    this.apiService.getFoods().subscribe({
      next: (data) => (this.foods = data),
      error: (err) => console.error('Erro ao buscar comidas:', err)
    });

    this.apiService.getRestaurants().subscribe({
      next: (data) => (this.restaurants = data),
      error: (err) => console.error('Erro ao buscar restaurantes:', err)
    });
  }
}