import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';
import { AuthResponse, User } from './user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root' // Singleton
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = `${environment.apiUrl}/auth`;

  // STATE: Private writable signals
  private _currentUser = signal<User | null>(null);
  private _accessToken = signal<string | null>(localStorage.getItem('token'));

  // SELECTORS: Public read-only signals
  public currentUser = this._currentUser.asReadonly();
  public isAuthenticated = computed(() => !!this._accessToken());

  constructor() {
    // Optional: Hydrate user from API on load if token exists
    if (this._accessToken()) {
      this.fetchProfile();
    }
  }

  login(credentials: any) {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((response) => {
        this.setSession(response);
      })
    );
  }

  logout() {
    this._accessToken.set(null);
    this._currentUser.set(null);
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }

  private setSession(authResult: AuthResponse) {
    localStorage.setItem('token', authResult.accessToken);
    this._accessToken.set(authResult.accessToken);
    this._currentUser.set(authResult.user);
    this.router.navigate(['/dashboard']);
  }
  
  private fetchProfile() {
    // Implementation to get user details via token
  }

  getToken(): string | null {
    return this._accessToken();
  }
}
