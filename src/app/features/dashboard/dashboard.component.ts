import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [], // No imports needed for current template
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Info Card -->
      <div class="bg-white p-6 rounded-lg shadow border border-gray-100">
        <h3 class="text-gray-500 text-sm font-medium uppercase">Current User</h3>
        <p class="text-2xl font-bold text-gray-800 mt-2">
          {{ authService.currentUser()?.firstName }}
        </p>
        <span class="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
          {{ authService.currentUser()?.role }}
        </span>
      </div>

      <!-- Action Card -->
      <div class="bg-white p-6 rounded-lg shadow border border-gray-100 md:col-span-2">
        <h3 class="text-gray-800 font-bold mb-4">Quick Actions</h3>
        <button class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
          Generate Report
        </button>
      </div>
    </div>
  `
})
export class DashboardComponent {
  public authService = inject(AuthService);
}
