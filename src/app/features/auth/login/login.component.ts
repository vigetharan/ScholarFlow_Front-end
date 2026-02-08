import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
      <!-- Email Field -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
        <div class="mt-1">
          <input 
            id="email" 
            type="email" 
            formControlName="email"
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
        </div>
        <div *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.errors?.['required']" class="text-red-500 text-xs mt-1">
          Email is required
        </div>
      </div>

      <!-- Password Field -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <div class="mt-1">
          <input 
            id="password" 
            type="password" 
            formControlName="password"
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
        </div>
      </div>

      <!-- Submit Button -->
      <div>
        <button 
          type="submit" 
          [disabled]="loginForm.invalid || isLoading()"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span *ngIf="isLoading()">Signing in...</span>
          <span *ngIf="!isLoading()">Sign in</span>
        </button>
      </div>

      <!-- Links -->
      <div class="text-sm text-center">
        <a routerLink="/auth/register" class="font-medium text-indigo-600 hover:text-indigo-500">
          Don't have an account? Register
        </a>
      </div>
    </form>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        // Navigation is handled in AuthService
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Login failed', err);
        this.isLoading.set(false);
        // ideally show a toast notification here
      }
    });
  }
}