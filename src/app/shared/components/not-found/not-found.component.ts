import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  styles: [`
    :host {
      display: block;
    }
    
    .gradient-text {
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .blob {
      position: absolute;
      filter: blur(40px);
      z-index: 0;
      opacity: 0.4;
      animation: float 10s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
    }
  `],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      <!-- Animated Background Blobs -->
      <div class="blob w-96 h-96 bg-indigo-300 rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
      <div class="blob w-96 h-96 bg-cyan-300 rounded-full bottom-0 right-0 translate-x-1/3 translate-y-1/3" style="animation-delay: -5s;"></div>

      <!-- Content Container -->
      <div class="relative z-10 text-center max-w-lg w-full">
        
        <div class="glass-card rounded-3xl p-10 md:p-14">
          <!-- 404 Illustration Area -->
          <div class="relative h-40 mb-6 flex justify-center items-center">
            <h1 class="text-9xl font-black gradient-text tracking-tighter opacity-20 absolute select-none">404</h1>
            <div class="relative z-10 animate-bounce" style="animation-duration: 3s;">
              <svg class="w-32 h-32 text-indigo-600 drop-shadow-xl" width="128" height="128" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <!-- Text Content -->
          <h2 class="text-3xl font-bold text-slate-800 mb-3">Page Not Found</h2>
          <p class="text-slate-500 mb-8 text-lg">
            Oops! The page you are looking for has vanished into the digital void.
          </p>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5">
              <svg class="w-5 h-5 mr-2" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </a>
            
            <button onclick="history.back()" class="inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-base font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
              <svg class="w-5 h-5 mr-2" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          </div>
        </div>
        
        <!-- Footer / Branding -->
        <div class="mt-8">
          <p class="text-slate-400 text-sm">© ScholarFlow Platform</p>
        </div>

      </div>
    </div>
  `
})
export class NotFoundComponent {}