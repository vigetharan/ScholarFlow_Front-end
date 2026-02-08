import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="text-center">
      <h2 class="text-lg font-medium text-gray-900">Create an Account</h2>
      <p class="mt-2 text-sm text-gray-600">
        (Registration form implementation would go here similar to login)
      </p>
      <div class="mt-6">
        <a routerLink="/auth/login" class="font-medium text-indigo-600 hover:text-indigo-500">
          Already have an account? Sign in
        </a>
      </div>
    </div>
  `
})
export class RegisterComponent {}
