import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { HomeComponent } from './home/home.component'; // Import HomeComponent

export const routes: Routes = [
  // 1. Set root path to HomeComponent (publicly accessible)
  { path: '', component: HomeComponent, pathMatch: 'full' }, // Redirect directly to HomeComponent

  // 2. Auth Routes (Public) - Wrapped in AuthLayout
  // We keep this route for '/auth/register' and potentially other auth-related pages that aren't the main login modal
  {
    path: 'auth',
    loadComponent: () => import('./layout/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      // Note: '/auth/login' can now optionally be removed if the modal is the primary login.
      // Keeping it as a fallback full-page login is also an option.
      { 
        path: 'login', 
        loadComponent: () => import('./features/auth/login/enhanced-login.component').then(m => m.EnhancedLoginComponent) 
      },
      { 
        path: 'register', 
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) 
      },
      { path: '**', component: NotFoundComponent }
    ]
  },
  
  // 3. App Routes (Protected) - Wrapped in MainLayout
  {
    path: '', // This path is relative, so it applies to '/dashboard', '/exam-dashboard', etc.
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
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
      { 
        path: 'questions', 
        loadComponent: () => import('./features/question-management/question-management.component').then(m => m.QuestionManagementComponent) 
      },
      { 
        path: 'academic', 
        loadComponent: () => import('./features/question-management/academic-management.component').then(m => m.AcademicManagementComponent) 
      },
      { path: '**', component: NotFoundComponent }
    ]
  },

  // 4. Global Wildcard (404) for any routes not matched by the above (e.g. if someone directly accesses '/non-existent-page')
  // This should typically be the last route.
  { path: '**', component: NotFoundComponent }
];