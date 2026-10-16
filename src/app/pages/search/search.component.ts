import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px;">
      <h2>Buscar Lanches e Restaurantes</h2>
      <input type="text" placeholder="O que deseja comer hoje?" style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 8px; margin-top: 12px; box-sizing: border-box;" />
    </div>
  `
})
export class SearchComponent {}