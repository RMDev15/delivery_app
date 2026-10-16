import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { SearchComponent } from './pages/search/search.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' }
];