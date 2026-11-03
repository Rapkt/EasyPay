import { Routes } from '@angular/router';
import { ShellComponent } from './components/shell/shell';
import { CheckoutComponent } from './components/checkout/checkout';
import { DashboardComponent } from './components/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'dashboard', component: DashboardComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
