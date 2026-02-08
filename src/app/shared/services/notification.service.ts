import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // Signal containing the list of active toasts
  readonly toasts = signal<Toast[]>([]);

  showSuccess(message: string) {
    this.add(message, 'success');
  }

  showError(message: string) {
    this.add(message, 'error');
  }

  showInfo(message: string) {
    this.add(message, 'info');
  }

  remove(id: number) {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }

  private add(message: string, type: 'success' | 'error' | 'info') {
    const id = Date.now();
    this.toasts.update((current) => [...current, { id, message, type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => this.remove(id), 5000);
  }
}
