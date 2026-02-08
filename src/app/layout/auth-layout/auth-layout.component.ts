import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <!-- Logo or Branding here -->
        <h1 class="text-2xl font-bold text-center mb-6">Industrial App</h1>
        <router-outlet /> 
      </div>
    </div>
  `
})
export class AuthLayoutComponent {}