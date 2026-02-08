import { Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <!-- 🔒 VIEWPORT (BOTTOM-RIGHT, NON-BLOCKING) -->
    <div class="toast-viewport">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div class="toast" [class]="toast.type">

          <div class="accent"></div>

          <div class="content">
            <div class="icon">
              {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : 'i' }}
            </div>

            <div class="message">
              {{ toast.message }}
            </div>

            <button
              class="close"
              type="button"
              (click)="notificationService.remove(toast.id)"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div class="progress"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* =========================
       TOAST VIEWPORT (IMPORTANT)
       ========================= */
    .toast-viewport {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 99999;

      display: flex;
      flex-direction: column;
      gap: 12px;

      /* 🔑 prevents blocking your app */
      pointer-events: none;
    }

    /* =========================
       TOAST CARD
       ========================= */
    .toast {
      pointer-events: auto;

      min-width: 320px;
      max-width: 420px;

      border-radius: 16px;
      overflow: hidden;

      backdrop-filter: blur(16px);
      background: rgba(18, 18, 18, 0.75);
      color: #fff;

      box-shadow:
        0 20px 40px rgba(0,0,0,.35),
        inset 0 1px 0 rgba(255,255,255,.06);

      animation: slideIn 0.35s cubic-bezier(.2,.9,.3,1.2);
    }

    .content {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
    }

    .icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;

      display: grid;
      place-items: center;

      background: rgba(255,255,255,.14);
      font-weight: bold;
      font-size: 16px;
      flex-shrink: 0;
    }

    .message {
      flex: 1;
      font-size: 14px;
      line-height: 1.4;
    }

    .close {
      font-size: 20px;
      line-height: 1;
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;

      opacity: .5;
      transition: opacity .2s;
    }

    .close:hover {
      opacity: 1;
    }

    /* =========================
       ACCENT + PROGRESS
       ========================= */
    .accent {
      height: 4px;
    }

    .progress {
      height: 2px;
      animation: progress 5s linear forwards;
    }

    .success .accent,
    .success .progress {
      background: linear-gradient(90deg,#34d399,#10b981);
    }

    .error .accent,
    .error .progress {
      background: linear-gradient(90deg,#fb7185,#e11d48);
    }

    .info .accent,
    .info .progress {
      background: linear-gradient(90deg,#60a5fa,#2563eb);
    }

    /* =========================
       ANIMATIONS
       ========================= */
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(40px) scale(.95);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    @keyframes progress {
      from { width: 100%; }
      to   { width: 0%; }
    }
  `]
})
export class ToastComponent {
  notificationService = inject(NotificationService);
}
