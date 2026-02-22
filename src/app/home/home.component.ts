import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { EnhancedLoginComponent } from '../features/auth/login/login.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, EnhancedLoginComponent],
  styles: [`
    .gradient-bg {
      background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
      position: relative;
      overflow: hidden;
    }
    .floating-shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      z-index: 0;
      animation: float 8s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-20px) scale(1.05); }
    }
    @keyframes dropIn {
      0% { opacity: 0; transform: scale(0.95) translateY(-30px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-drop-in {
      animation: dropIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `],
  template: `
    <div class="min-h-screen flex flex-col justify-center items-center text-center p-6 gradient-bg relative overflow-hidden font-sans">
      
      <!-- Modern Background Blobs -->
      <div class="floating-shape w-64 h-64 sm:w-96 sm:h-96 bg-indigo-300/40 -top-20 -left-20 sm:-top-32 sm:-left-32"></div>
      <div class="floating-shape w-64 h-64 sm:w-96 sm:h-96 bg-cyan-300/30 top-1/2 -right-20 sm:-right-32" style="animation-delay: 2s;"></div>
      
      <div class="max-w-3xl mx-auto relative z-10 w-full">
        
        <!-- App Logo & Branding -->
        <div class="mb-10 sm:mb-12 flex flex-col items-center">
          <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-3xl shadow-xl shadow-indigo-200 mb-8 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <!-- FIX: Hardcoded width and height to prevent gigantic scaling -->
            <svg width="48" height="48" class="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12l5-2.5V7L12 2z"/>
              <path d="M2 17l5 2.5V7L2 7v10z" opacity="0.5"/>
              <path d="M17 17l5 2.5V7l-5 2.5v10z" opacity="0.5"/>
            </svg>
          </div>
          
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Welcome to <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">ScholarFlow</span>
          </h1>
          <p class="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Your premium platform for academic excellence. Seamlessly manage streams, topics, and master your examinations.
          </p>
        </div>

        <!-- Call to Action Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4 sm:px-0">
          
          @if (!authService.isAuthenticated()) {
            <button 
              (click)="openLoginModal()"
              class="w-full sm:w-auto min-w-[180px] inline-flex justify-center items-center px-8 py-4 text-base sm:text-lg font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all transform hover:-translate-y-1"
            >
              <!-- FIX: Hardcoded width/height -->
              <svg width="24" height="24" class="-ml-1 mr-2 w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a1 1 0 00-1 1v5H6a1 1 0 100 2h3v5a1 1 0 001 1h1a1 1 0 100-2v-5h3a1 1 0 100-2h-3V3a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Login
            </button>
            
            <a 
              routerLink="/auth/register" 
              class="w-full sm:w-auto min-w-[180px] inline-flex justify-center items-center px-8 py-4 border-2 border-indigo-100 bg-white text-base sm:text-lg font-bold rounded-2xl text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all transform hover:-translate-y-1"
            >
              Create Account
            </a>
          } @else {
            <a 
              routerLink="/dashboard" 
              class="w-full sm:w-auto min-w-[220px] inline-flex justify-center items-center px-8 py-4 text-lg font-bold rounded-2xl text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all transform hover:-translate-y-1"
            >
              Go to Dashboard
              <!-- FIX: Hardcoded width/height -->
              <svg width="24" height="24" class="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          }
        </div>
      </div>
    </div>

    <!-- Drop-down Login Modal -->
    @if (showLoginModal()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" (click)="closeLoginModal()"></div>
        <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl ring-1 ring-slate-900/5 transition-all sm:my-8 sm:w-full sm:max-w-md w-full animate-drop-in" (click)="$event.stopPropagation()">
            <button (click)="closeLoginModal()" class="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <!-- FIX: Hardcoded width/height -->
              <svg width="20" height="20" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <app-enhanced-login [isModal]="true" (loginSuccess)="onLoginSuccess()"></app-enhanced-login>
          </div>
        </div>
      </div>
    }
  `
})
export class HomeComponent {
  public authService = inject(AuthService);
  private router = inject(Router);
  
  showLoginModal = signal(false);

  openLoginModal() {
    this.showLoginModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeLoginModal() {
    this.showLoginModal.set(false);
    document.body.style.overflow = 'auto';
  }

  onLoginSuccess() {
    this.closeLoginModal();
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 150);
  }
}