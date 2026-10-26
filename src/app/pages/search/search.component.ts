import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { CartDrawerComponent } from '../cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CartDrawerComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchTerm: string = '';
  allFoods: any[] = [];
  allRestaurants: any[] = [];
  
  filteredFoods: any[] = [];
  filteredRestaurants: any[] = [];

  constructor(
    private apiService: ApiService,
    public cartService: CartService
  ) {}

  ngOnInit() {
    // Carrega dados gerais de todas as cidades para pesquisa global
    this.apiService.getFoodsByCity('Todas as Cidades').subscribe(data => {
      this.allFoods = data || [];
      this.filteredFoods = this.allFoods;
    });

    this.apiService.getRestaurantsByCity('Todas as Cidades').subscribe(data => {
      this.allRestaurants = data || [];
      this.filteredRestaurants = this.allRestaurants;
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredFoods = this.allFoods;
      this.filteredRestaurants = this.allRestaurants;
      return;
    }

    // Filtra produtos por nome ou categoria
    this.filteredFoods = this.allFoods.filter(f => 
      f.name.toLowerCase().includes(term) || 
      f.category?.toLowerCase().includes(term)
    );

    // Filtra lojas ou região (cidade)
    this.filteredRestaurants = this.allRestaurants.filter(r => 
      r.name.toLowerCase().includes(term) || 
      r.city?.toLowerCase().includes(term) ||
      r.address?.toLowerCase().includes(term)
    );
  }

  addToCart(product: any) {
    const rest = { 
      id: product.restaurant_id || 1, 
      name: product.restaurants?.name || 'Estabelecimento' 
    };
    this.cartService.addToCart(product, rest, 1);
    this.cartService.setCartDrawerState(true);
  }
}