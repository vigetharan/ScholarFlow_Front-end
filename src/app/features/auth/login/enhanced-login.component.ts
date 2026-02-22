import { Component, inject, signal, Output, input, EventEmitter,OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // isPlatformBrowser
import { ActivatedRoute } from '@angular/router'; // For route check
import { HostBinding, PLATFORM_ID } from '@angular/core'; // HostBinding, PLATFORM_ID

@Component({
  selector: 'app-enhanced-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './enhanced-login.component.html', // Use external HTML file
  styles: [`
    :host {
      display: block;
      /* Default to block display to ensure it takes its parent's width */
      width: 100%; 
      /* No background or positioning here, the modal parent handles it */
      position: relative; /* Ensure child absolute positioning works */
    }
      

    /* Original animation and glass effect styles - These are fine for the card itself */
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    .gradient-bg { /* This will now only be used if it's the root route, not when embedded */
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      position: relative;
      overflow: hidden;
    }
    
    .gradient-bg::before { /* This will now only be used if it's the root route, not when embedded */
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
    
    .floating-shape { /* This will now only be used if it's the root route, not when embedded */
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

    /* Social Button Hover Effects */
    .social-btn {
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .social-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    /* Specific overrides for when this component acts as the primary login route (e.g., /auth/login) */
    /* This ensures it retains full-page styling if directly navigated to */
    :host.full-page-login {
        position: fixed;
        inset: 0;
        z-index: 50; /* Ensure it's above other content */
        overflow-y: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem; /* Equivalent to p-6 */
        background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); /* Re-apply gradient background */
        /* Re-apply shimmering effect if needed for full page */
    }
    :host.full-page-login::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 200%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        animation: shimmer 8s infinite;
        z-index: 0; /* Behind the content */
    }
    :host.full-page-login .floating-shape { /* Only show floating shapes in full-page context */
        display: block;
    }
    :host.full-page-login .logo-section {
      margin-bottom: 2rem !important; /* Reset to larger spacing for full page */
    }
    :host.full-page-login .logo-section h1 {
      font-size: 2.25rem !important; /* Reset to larger title for full page */
    }
    :host.full-page-login .logo-section p {
      font-size: 1rem !important; /* Reset to larger subtitle for full page */
    }
  `],
})

export class EnhancedLoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute); // Inject ActivatedRoute
  private platformId = inject(PLATFORM_ID); // Inject PLATFORM_ID

  
  // FIX: Explicitly defined isModal input using Angular Signals
  isModal = input<boolean>(false);
  
  // FIX: Explicitly defined loginSuccess output
  // loginSuccess = Output<void>();

  isLoading = signal(false);
  showPassword = signal(false);

  @Output() loginSuccess = new EventEmitter<void>();
   @HostBinding('class.full-page-login') isFullPageLogin = false;
   ngOnInit() {
      if (isPlatformBrowser(this.platformId)) {
       this.route.url.subscribe(urlSegments => {
        // If the path contains 'auth' and 'login' and it's the root of the routing outlet,
        // we can assume it's a full-page login.
        this.isFullPageLogin = urlSegments.some(segment => segment.path === 'auth') && 
                               urlSegments.some(segment => segment.path === 'login');
      });
    }
  }

  // ... rest of the component methods ...
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
        this.loginSuccess.emit(); // Emit event on successful login
      },
      error: (err) => {
        console.error('Login failed', err);
        this.isLoading.set(false);
        const errorMessage = err.error?.title || err.error?.detail || 'Invalid credentials or an unexpected error occurred.';
        this.notificationService.showError(errorMessage);
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