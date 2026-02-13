import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // 1. Redirect root to Dashboard (or Login if guarded)
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // 2. Auth Routes (Public) - Wrapped in AuthLayout
  {
    path: 'auth',
    loadComponent: () => import('./layout/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      { 
        path: 'login', 
        loadComponent: () => import('./features/auth/login/enhanced-login.component').then(m => m.EnhancedLoginComponent) 
      },
      { 
        path: 'register', 
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) 
      }
    ]
  },
  
  // 3. App Routes (Protected) - Wrapped in MainLayout
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard], // Guard applied to parent, protects all children
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) 
      },
      { 
        path: 'exam-dashboard', 
        loadComponent: () => import('./features/exam/exam-dashboard.component').then(m => m.ExamDashboardComponent) 
      },
      { 
        path: 'exam/:id', 
        loadComponent: () => import('./features/exam/exam.component').then(m => m.ExamComponent) 
      },
      // Add more features here...
    ]
  },

  // 4. Wildcard (404)
  { path: '**', redirectTo: 'dashboard' }
];


//5. Sample Feature: Dashboard (src/app/features/dashboard/dashboard.component.ts)

