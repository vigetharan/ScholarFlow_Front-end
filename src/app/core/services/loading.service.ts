import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  // Signal to track loading state
  private _loading = signal(false);
  private requestCount = 0;

  readonly loading = this._loading.asReadonly();

  show() {
    this.requestCount++;
    if (this.requestCount > 0) {
      this._loading.set(true);
    }
  }

  hide() {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this._loading.set(false);
    }
  }
}