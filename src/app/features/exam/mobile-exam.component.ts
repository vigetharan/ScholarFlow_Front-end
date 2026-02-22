import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface ReviewMaterial {
  id: string;
  title: string;
  content: string;
  resourceUrl?: string;
  materialType: string;
}

interface Question {
  id: string;
  questionText: string;
  options: Option[];
}

interface Option {
  id: string;
  optionText: string;
  isCorrect: boolean;
}

@Component({
  selector: 'app-mobile-exam',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    @media (max-width: 768px) {
      .exam-container {
        padding: 1rem !important;
      }
      
      .question-card {
        margin: 0.5rem 0 !important;
        padding: 1rem !important;
      }
      
      .option-button {
        padding: 1rem !important;
        margin: 0.5rem 0 !important;
        font-size: 1rem !important;
        min-height: 60px !important;
      }
      
      .timer-display {
        font-size: 1.5rem !important;
      }
      
      .navigation-buttons {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        background: white !important;
        padding: 1rem !important;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.1) !important;
      }
      
      .question-grid {
        display: grid !important;
        grid-template-columns: repeat(auto-fit, minmax(40px, 1fr)) !important;
        gap: 0.5rem !important;
      }
      
      .grid-item {
        width: 40px !important;
        height: 40px !important;
        font-size: 0.8rem !important;
      }
    }

    @media (max-width: 480px) {
      .exam-header {
        flex-direction: column !important;
        gap: 1rem !important;
      }
      
      .question-text {
        font-size: 1rem !important;
        line-height: 1.5 !important;
      }
      
      .option-button {
        padding: 0.75rem !important;
        font-size: 0.9rem !important;
      }
      
      .navigation-buttons button {
        padding: 0.75rem 1rem !important;
        font-size: 0.9rem !important;
      }
    }

    .touch-friendly {
      min-height: 44px;
      min-width: 44px;
    }

    .swipe-hint {
      position: relative;
      overflow: hidden;
    }

    .swipe-hint::after {
      content: 'Swipe to navigate';
      position: absolute;
      bottom: 10px;
      right: 10px;
      font-size: 0.8rem;
      color: #666;
      animation: fadeInOut 3s infinite;
    }

    @keyframes fadeInOut {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.8; }
    }
  `],
  template: `
    <div class="min-h-screen bg-gray-50 exam-container">
      <!-- Mobile Header -->
      <div class="bg-white shadow-sm p-4 exam-header">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <button 
              (click)="toggleQuestionGrid()"
              class="p-2 rounded-lg bg-indigo-100 text-indigo-600 touch-friendly"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
            </button>
            <div>
              <div class="text-sm text-gray-600">Question</div>
              <div class="font-semibold">{{ currentQuestionIndex() + 1 }} / {{ totalQuestions() }}</div>
            </div>
          </div>
          
          <div class="text-center">
            <div class="text-sm text-gray-600">Time</div>
            <div class="timer-display font-bold text-indigo-600">{{ timeRemaining() }}</div>
          </div>

          <button 
            (click)="endExam()"
            class="p-2 rounded-lg bg-red-100 text-red-600 touch-friendly"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Question Grid Overlay -->
      <div 
        *ngIf="showGrid()" 
        class="fixed inset-0 bg-black bg-opacity-50 z-50 p-4"
        (click)="toggleQuestionGrid()"
      >
        <div class="bg-white rounded-lg p-4 max-w-md mx-auto mt-10" (click)="$event.stopPropagation()">
          <h3 class="font-bold mb-4">Question Navigator</h3>
          <div class="question-grid">
            <button 
              *ngFor="let i of questionNumbers(); trackBy: trackByIndex"
              (click)="goToQuestion(i)"
              class="grid-item touch-friendly rounded-lg border-2 font-medium transition-colors"
              [class]="getQuestionGridClass(i)"
            >
              {{ i + 1 }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="p-4 pb-24">
        <!-- Question Card -->
        <div class="bg-white rounded-lg shadow-md p-6 question-card mb-4">
          <div class="mb-4">
            <div class="flex items-start justify-between mb-3">
              <span class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                Question {{ currentQuestionIndex() + 1 }}
              </span>
              <button 
                (click)="toggleMarkForReview()"
                class="p-2 rounded-lg touch-friendly"
                [class]="markedForReview()[currentQuestionIndex()] ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                </svg>
              </button>
            </div>
            
            <div class="question-text text-gray-800 mb-6">
              {{ currentQuestion().questionText }}
            </div>

            <!-- Options -->
            <div class="space-y-3">
              <div 
                *ngFor="let option of currentQuestion().options; let i = index"
                (click)="selectAnswer(i)"
                class="option-button touch-friendly p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center"
                [class]="getOptionClass(i)"
              >
                <div class="flex-shrink-0 w-8 h-8 rounded-full border-2 border-gray-300 mr-3 flex items-center justify-center">
                  <div 
                    *ngIf="selectedAnswers()[currentQuestionIndex()] === i"
                    class="w-4 h-4 rounded-full bg-indigo-600"
                  ></div>
                </div>
                <span class="text-gray-700 font-medium">{{ option.optionText }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Review Materials (if wrong answer) -->
        <div 
          *ngIf="showReviewMaterials() && currentQuestionReviewMaterials().length > 0"
          class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
        >
          <h4 class="font-semibold text-blue-800 mb-3">📚 Review Materials</h4>
          <div class="space-y-3">
            <div 
              *ngFor="let material of currentQuestionReviewMaterials()"
              class="bg-white rounded-lg p-3 border border-blue-100"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h5 class="font-medium text-gray-800">{{ material.title }}</h5>
                  <p class="text-sm text-gray-600 mt-1">{{ material.content }}</p>
                </div>
                <button 
                  *ngIf="material.resourceUrl"
                  (click)="openReviewMaterial(material.resourceUrl)"
                  class="p-2 bg-blue-100 text-blue-600 rounded-lg touch-friendly"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fixed Bottom Navigation -->
      <div class="navigation-buttons">
        <div class="flex justify-between items-center max-w-4xl mx-auto">
          <button 
            *ngIf="currentQuestionIndex() > 0"
            (click)="previousQuestion()"
            class="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg touch-friendly font-medium"
          >
            ← Previous
          </button>
          
          <div class="flex space-x-2">
            <button 
              (click)="skipQuestion()"
              class="px-4 py-3 bg-yellow-100 text-yellow-700 rounded-lg touch-friendly font-medium"
            >
              Skip
            </button>
            
            <button 
              (click)="nextQuestion()"
              [disabled]="selectedAnswers()[currentQuestionIndex()] === undefined"
              class="px-4 py-3 bg-indigo-600 text-white rounded-lg touch-friendly font-medium disabled:opacity-50"
            >
              {{ isLastQuestion() ? 'Finish' : 'Next' }} →
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MobileExamComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Signals for state management
  currentQuestionIndex = signal(0);
  selectedAnswers = signal<(number | undefined)[]>([]);
  markedForReview = signal<boolean[]>([]);
  timeRemaining = signal('45:00');
  showQuestionGridFlag = signal(false);
  questions = signal<Question[]>([]);
  reviewMaterials = signal<ReviewMaterial[]>([]);

  // Computed properties
  currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);
  totalQuestions = computed(() => this.questions().length);
  isLastQuestion = computed(() => this.currentQuestionIndex() === this.questions().length - 1);

  ngOnInit() {
    this.loadExamData();
    this.startTimer();
  }

  private loadExamData() {
    // Load exam data from API
    // For now, using mock data
    this.questions.set([
      {
        id: '1',
        questionText: 'What is the primary purpose of dependency injection?',
        options: [
          { id: '1', optionText: 'To improve code readability', isCorrect: false },
          { id: '2', optionText: 'To achieve loose coupling', isCorrect: true },
          { id: '3', optionText: 'To make code run faster', isCorrect: false },
          { id: '4', optionText: 'To reduce memory usage', isCorrect: false }
        ]
      }
      // Add more questions...
    ]);
  }

  selectAnswer(index: number) {
    const newAnswers = [...this.selectedAnswers()];
    newAnswers[this.currentQuestionIndex()] = index;
    this.selectedAnswers.set(newAnswers);
  }

  nextQuestion() {
    if (this.currentQuestionIndex() < this.questions().length - 1) {
      this.currentQuestionIndex.set(this.currentQuestionIndex() + 1);
    } else {
      this.finishExam();
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.set(this.currentQuestionIndex() - 1);
    }
  }

  skipQuestion() {
    this.nextQuestion();
  }

  toggleMarkForReview() {
    const newMarked = [...this.markedForReview()];
    newMarked[this.currentQuestionIndex()] = !newMarked[this.currentQuestionIndex()];
    this.markedForReview.set(newMarked);
  }

  toggleQuestionGrid() {
    this.showQuestionGridFlag.set(!this.showQuestionGridFlag());
  }

  showGrid() {
    return this.showQuestionGridFlag();
  }

  questionNumbers() {
    return Array.from({ length: this.totalQuestions() }, (_, i) => i);
  }

  trackByIndex(index: number) {
    return index;
  }

  goToQuestion(index: number) {
    this.currentQuestionIndex.set(index);
    this.toggleQuestionGrid();
  }

  getQuestionGridClass(index: number) {
    const isSelected = index === this.currentQuestionIndex();
    const isAnswered = this.selectedAnswers()[index] !== undefined;
    const isMarked = this.markedForReview()[index];

    if (isSelected) return 'border-indigo-500 bg-indigo-50 text-indigo-700';
    if (isMarked) return 'border-yellow-500 bg-yellow-50 text-yellow-700';
    if (isAnswered) return 'border-green-500 bg-green-50 text-green-700';
    return 'border-gray-300 bg-white text-gray-700';
  }

  getOptionClass(index: number) {
    const selectedIndex = this.selectedAnswers()[this.currentQuestionIndex()];
    const isSelected = selectedIndex === index;
    
    if (isSelected) {
      return 'border-indigo-500 bg-indigo-50';
    }
    return 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50';
  }

  showReviewMaterials() {
    // Show review materials for wrong answers
    return false; // Implement logic
  }

  currentQuestionReviewMaterials(): ReviewMaterial[] {
    // Get review materials for current question
    return this.reviewMaterials(); // Implement logic
  }

  openReviewMaterial(url: string) {
    window.open(url, '_blank');
  }

  private startTimer() {
    let minutes = 45;
    let seconds = 0;

    const timer = setInterval(() => {
      if (minutes === 0 && seconds === 0) {
        clearInterval(timer);
        this.finishExam();
        return;
      }

      if (seconds === 0) {
        minutes--;
        seconds = 59;
      } else {
        seconds--;
      }

      this.timeRemaining.set(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
  }

  finishExam() {
    // Navigate to results
    this.router.navigate(['/exam/results']);
  }

  endExam() {
    if (confirm('Are you sure you want to end the exam?')) {
      this.finishExam();
    }
  }
}
