import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  template: `
    @if (loadingService.loading()) {
      <div class="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center backdrop-blur-sm">
        <div class="flex flex-col items-center">
          <!-- Spinner -->
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <div class="text-white font-medium text-lg tracking-wide">Loading...</div>
        </div>
      </div>
    }
  `
})
export class GlobalLoaderComponent {
  public loadingService = inject(LoadingService);
}