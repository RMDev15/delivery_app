import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['./restaurant-detail.component.css']
})
export class RestaurantDetailComponent implements OnInit {
  restaurantId!: number;
  restaurant: any = null;
  foods: any[] = [];
  selectedProduct: any = null;
  productQuantity: number = 1;
  productObs: string = '';

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    public cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.restaurantId = +params['id'];
      if (this.restaurantId) {
        this.loadRestaurantData();
      }
    });
  }

  async loadRestaurantData() {
    // 1. Procura as informações completas da empresa no Supabase
    const { data: rest } = await this.supabaseService.client
      .from('restaurants')
      .select('*')
      .eq('id', this.restaurantId)
      .single();

    this.restaurant = rest;

    // 2. Busca os produtos associados a este restaurante
    const { data: foods } = await this.supabaseService.client
      .from('foods')
      .select('*')
      .eq('restaurant_id', this.restaurantId)
      .eq('is_available', true);

    this.foods = foods || [];
  }

  openProductModal(product: any) {
    this.selectedProduct = product;
    this.productQuantity = 1;
    this.productObs = '';
  }

  closeProductModal() {
    this.selectedProduct = null;
  }

  addToCart() {
    if (this.selectedProduct && this.restaurant) {
      this.cartService.addToCart(
        this.selectedProduct,
        this.restaurant,
        this.productQuantity,
        this.productObs
      );
      this.closeProductModal();
    }
  }

  getGoogleMapsUrl(address: string, city: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', ' + city + ' RS')}`;
  }
}