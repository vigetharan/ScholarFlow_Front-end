import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div class="max-w-3xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p class="text-gray-500 mt-1">Manage your profile and preferences.</p>
      </header>

      <!-- Profile Section -->
      <section class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Profile Details</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Full Name</label>
            <div class="mt-1 p-2.5 bg-gray-50 rounded-lg text-gray-800 font-medium">
              {{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email Address</label>
            <div class="mt-1 p-2.5 bg-gray-50 rounded-lg text-gray-800">
              {{ authService.currentUser()?.email }}
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Role</label>
            <span class="inline-flex mt-1 items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {{ authService.currentUser()?.role }}
            </span>
          </div>
        </div>
      </section>

      <!-- Preferences Section -->
      <section class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Application Preferences</h2>
        
        <div class="flex items-center justify-between py-3">
          <div>
            <div class="font-medium text-gray-900">Test Error Handling</div>
            <div class="text-sm text-gray-500">Click to simulate a crash and test the Toast system.</div>
          </div>
          <button 
            (click)="simulateError()"
            class="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
          >
            Throw Error
          </button>
        </div>

        <div class="flex items-center justify-between py-3 border-t border-gray-100">
          <div>
            <div class="font-medium text-gray-900">Notifications</div>
            <div class="text-sm text-gray-500">Receive success messages.</div>
          </div>
          <button 
            (click)="savePreferences()"
            class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Save Changes
          </button>
        </div>
      </section>
    </div>
  `
})
export class SettingsComponent {
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  savePreferences() {
    // Simulating an API call
    this.notificationService.showSuccess('Preferences saved successfully!');
  }

  simulateError() {
    // This will be caught by GlobalErrorHandler
    throw new Error('This is a simulated crash to test the Toast system!');
  }
}



