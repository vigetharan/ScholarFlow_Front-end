import { Component, inject, signal, output, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-enhanced-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  styles: [`
    :host {
      display: block;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    .gradient-bg {
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      position: relative;
      overflow: hidden;
    }
    
    .gradient-bg::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 200%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      animation: shimmer 8s infinite;
    }
    
    @keyframes shimmer {
      0% { left: -100%; }
      100% { left: 100%; }
    }
    
    .floating-shape {
      position: absolute;
      opacity: 0.15;
      animation: float 6s ease-in-out infinite;
    }
    
    .glass-effect {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    }
    
    .input-focus {
      transition: all 0.3s ease;
    }
    
    .input-focus:focus {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      background: rgba(255, 255, 255, 0.2);
    }

    .social-btn {
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .social-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
  `],
  template: `
    <!-- Conditional Container: Full Screen vs Modal Embedded -->
    <div [class]="isModal() ? 'w-full' : 'fixed inset-0 z-50 overflow-y-auto gradient-bg flex items-center justify-center p-4 sm:p-6 lg:p-8'">
      
      <!-- Floating Background Elements (Only show if NOT in modal mode) -->
      @if (!isModal()) {
        <div class="floating-shape w-40 h-40 sm:w-64 sm:h-64 bg-white rounded-full -top-20 -left-20 sm:-top-32 sm:-left-32"></div>
        <div class="floating-shape w-60 h-60 sm:w-96 sm:h-96 bg-white rounded-full top-1/2 -right-24 sm:-right-48" style="animation-delay: 2s;"></div>
        <div class="floating-shape w-32 h-32 sm:w-48 sm:h-48 bg-white rounded-full bottom-10 left-10 sm:bottom-20 sm:left-1/4" style="animation-delay: 4s;"></div>
      }
      
      <!-- Login Container -->
      <div [class]="isModal() ? 'w-full' : 'relative z-10 w-full max-w-md lg:max-w-lg animate-fade-in-up my-auto'">
        
        <!-- Logo Section -->
        <div class="text-center mb-6 sm:mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl mb-4 border border-white/30 transform transition-transform hover:scale-105 hover:rotate-3">
            <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white" width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12l5-2.5V7L12 2z"/>
              <path d="M2 17l5 2.5V7L2 7v10z" opacity="0.5"/>
              <path d="M17 17l5 2.5V7l-5 2.5v10z" opacity="0.5"/>
            </svg>
          </div>
          <h1 class="text-3xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-sm">ScholarFlow</h1>
          <p class="text-indigo-50 mt-2 font-medium text-sm sm:text-base">Advanced Learning Platform</p>
        </div>

        <!-- Login Card -->
        <div class="glass-effect rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div class="mb-6 sm:mb-8">
            <h2 class="text-2xl font-bold text-white">Welcome Back</h2>
            <p class="text-indigo-100 text-sm mt-1">Please enter your details to sign in.</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5 sm:space-y-6">
            <!-- Email Field -->
            <div>
              <label for="email" class="block text-sm font-medium text-white mb-2 ml-1">Email Address</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-indigo-200 group-focus-within:text-white transition-colors" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <input 
                  id="email" 
                  type="email" 
                  formControlName="email"
                  placeholder="name@example.com"
                  class="input-focus w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-200/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent text-sm font-medium"
                >
              </div>
              @if (loginForm.get('email')?.touched && loginForm.get('email')?.invalid) {
                <div class="text-rose-300 text-xs mt-1.5 flex items-center ml-1 animate-pulse">
                  <svg class="w-3.5 h-3.5 mr-1" width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ loginForm.get('email')?.errors?.['required'] ? 'Email is required' : 'Invalid email address' }}</span>
                </div>
              }
            </div>

            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-medium text-white mb-2 ml-1">Password</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-indigo-200 group-focus-within:text-white transition-colors" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input 
                  id="password" 
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  class="input-focus w-full pl-11 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-200/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent text-sm font-medium"
                >
                <button 
                  type="button"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-indigo-200 hover:text-white transition-colors focus:outline-none"
                  (click)="togglePasswordVisibility()"
                >
                  @if (!showPassword()) {
                    <svg class="w-5 h-5" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  } @else {
                    <svg class="w-5 h-5" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563 3.729m5.858.907a3 3 0 114.243 4.242M9.878 15.5a3 3 0 114.242 4.242M9.88 9H15m-6 3l3 3m0-6l-3 3"/>
                    </svg>
                  }
                </button>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 pt-1">
              <label class="flex items-center cursor-pointer group">
                <input type="checkbox" class="w-4 h-4 text-indigo-600 rounded border-white/30 bg-white/10 focus:ring-offset-0 focus:ring-2 focus:ring-white/50 cursor-pointer">
                <span class="ml-2 text-sm text-indigo-100 group-hover:text-white transition-colors">Remember me</span>
              </label>
              <a href="#" class="text-sm font-medium text-indigo-100 hover:text-white transition-colors hover:underline">
                Forgot password?
              </a>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              [disabled]="loginForm.invalid || isLoading()"
              class="w-full relative overflow-hidden group flex justify-center items-center px-6 py-3.5 bg-white text-indigo-600 font-bold text-base rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
            >
              @if (isLoading()) {
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-indigo-600" width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              } @else {
                <span>Sign In</span>
                <svg class="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              }
            </button>
          </form>

          <!-- Divider -->
          <div class="relative my-6 sm:my-8">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-white/20"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-transparent text-indigo-100/70 backdrop-blur-md rounded">Or continue with</span>
            </div>
          </div>

          <!-- Social Login Buttons -->
          <div class="grid grid-cols-3 gap-3">
            <!-- Google -->
            <button (click)="socialLogin('google')" class="social-btn flex items-center justify-center px-4 py-2.5 bg-white rounded-xl shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all">
              <svg class="w-5 h-5" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.52 12.29C23.52 11.43 23.44 10.61 23.3 9.81H12V14.49H18.47C18.18 15.99 17.29 17.25 15.96 18.15V21.16H19.82C22.09 19.06 23.52 15.97 23.52 12.29Z" fill="#4285F4"/>
                <path d="M12 24C15.24 24 17.96 22.92 19.83 21.16L15.96 18.15C14.89 18.88 13.53 19.32 12 19.32C8.87 19.32 6.22 17.21 5.27 14.39H1.29V17.48C3.25 21.36 7.33 24 12 24Z" fill="#34A853"/>
                <path d="M5.27 14.39C5.02 13.65 4.89 12.85 4.89 12C4.89 11.15 5.03 10.35 5.27 9.61V6.51H1.29C0.47 8.16 0 10.02 0 12C0 13.98 0.47 15.84 1.29 17.48L5.27 14.39Z" fill="#FBBC05"/>
                <path d="M12 4.68C13.76 4.68 15.34 5.29 16.59 6.47L19.92 3.14C17.96 1.31 15.24 0 12 0C7.33 0 3.25 2.64 1.29 6.51L5.27 9.61C6.22 6.79 8.87 4.68 12 4.68Z" fill="#EA4335"/>
              </svg>
            </button>

            <!-- Facebook -->
            <button (click)="socialLogin('facebook')" class="social-btn flex items-center justify-center px-4 py-2.5 bg-[#1877F2] text-white rounded-xl shadow-md hover:bg-[#1569d6] focus:outline-none focus:ring-2 focus:ring-white/50 transition-all">
              <svg class="w-5 h-5" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.048 0-3.037.494-3.037 1.68v2.282h3.949l-.597 3.672h-3.352v7.98h-4.776z"/>
              </svg>
            </button>

            <!-- TikTok -->
            <button (click)="socialLogin('tiktok')" class="social-btn flex items-center justify-center px-4 py-2.5 bg-black text-white rounded-xl shadow-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all">
              <svg class="w-5 h-5" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </button>
          </div>

          <!-- Register Link -->
          <div class="text-center mt-6 sm:mt-8 pt-6 border-t border-white/10">
            <p class="text-indigo-100 text-sm">
              Don't have an account? 
              <a routerLink="/auth/register" class="font-bold text-white hover:underline transition-all hover:text-indigo-50">
                Create Account
              </a>
            </p>
          </div>
        </div>

        @if (!isModal()) {
          <div class="mt-8 text-center animate-fade-in-up hidden xs:block" style="animation-delay: 0.2s;">
            <p class="text-indigo-200/60 text-xs uppercase tracking-widest font-semibold mb-4">Quick Demo Access</p>
            <div class="flex flex-wrap justify-center gap-2 sm:gap-3">
              <button (click)="quickLogin('admin')" class="px-3 py-1.5 bg-white/5 hover:bg-white/20 border border-white/10 rounded-full text-xs font-medium text-white transition-all backdrop-blur-sm">Admin</button>
              <button (click)="quickLogin('teacher')" class="px-3 py-1.5 bg-white/5 hover:bg-white/20 border border-white/10 rounded-full text-xs font-medium text-white transition-all backdrop-blur-sm">Teacher</button>
              <button (click)="quickLogin('student')" class="px-3 py-1.5 bg-white/5 hover:bg-white/20 border border-white/10 rounded-full text-xs font-medium text-white transition-all backdrop-blur-sm">Student</button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class EnhancedLoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // Allow this component to be embedded in a modal by removing full-screen styles
  isModal = input<boolean>(false);
  loginSuccess = output<void>();

  isLoading = signal(false);
  showPassword = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.notificationService.showSuccess('Welcome back!');
        this.loginSuccess.emit(); 
      },
      error: (err) => {
        console.error('Login failed', err);
        this.isLoading.set(false);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  quickLogin(role: string) {
    const credentials = {
      admin: { email: 'admin@scholarflow.com', password: 'Admin@123' },
      teacher: { email: 'teacher@scholarflow.com', password: 'Teacher@123' },
      student: { email: 'student@scholarflow.com', password: 'Student@123' }
    };

    const cred = credentials[role as keyof typeof credentials];
    if (cred) {
      this.loginForm.patchValue(cred);
    }
  }

  socialLogin(provider: string) {
    this.notificationService.showInfo(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not configured in this demo.`);
  }
}