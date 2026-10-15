import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  foods: any[] = [];
  restaurants: any[] = [];
  selectedLocation: string = 'Taquara, RS';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.apiService.getFoods().subscribe({
      next: (data) => {
        this.foods = data;
      },
      error: (err) => console.error('Erro ao buscar comidas:', err)
    });

    this.apiService.getRestaurants().subscribe({
      next: (data) => {
        this.restaurants = data;
      },
      error: (err) => console.error('Erro ao buscar restaurantes:', err)
    });
  }
}