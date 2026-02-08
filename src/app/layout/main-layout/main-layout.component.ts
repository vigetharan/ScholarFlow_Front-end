import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <aside class="w-64 bg-slate-800 text-white flex-shrink-0">
        <div class="p-4 text-xl font-bold border-b border-slate-700">App Name</div>
        <nav class="p-4 space-y-2">
          <a routerLink="/dashboard" class="block p-2 hover:bg-slate-700 rounded">Dashboard</a>
          <a routerLink="/settings" class="block p-2 hover:bg-slate-700 rounded">Settings</a>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <header class="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <h2 class="text-lg font-semibold text-gray-700">Page Title</h2>
          <button (click)="logout()" class="text-red-600 hover:text-red-800 font-medium">
            Logout
          </button>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-auto p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
