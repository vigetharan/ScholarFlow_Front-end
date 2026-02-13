import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface ExamResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  timeSpent: string;
}

@Component({
  selector: 'app-exam',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <!-- Exam Header -->
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-800">ScholarFlow Exam</h1>
              <p class="text-gray-600 mt-1">Test your knowledge</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">Time Remaining</div>
              <div class="text-2xl font-mono font-bold text-indigo-600">{{ timeRemaining() }}</div>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-700">Progress</span>
            <span class="text-sm text-gray-500">{{ currentQuestionIndex() + 1 }} / {{ questions().length }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div 
              class="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
              [style.width.%]="progressPercentage()"
            ></div>
          </div>
        </div>

        <!-- Question Card -->
        <div class="bg-white rounded-xl shadow-lg p-8 mb-6" *ngIf="!examCompleted()">
          <div class="mb-6">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span class="text-indigo-600 font-semibold text-sm">{{ currentQuestionIndex() + 1 }}</span>
              </div>
              <div class="flex-1">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">{{ currentQuestion().question }}</h2>
              </div>
            </div>
          </div>

          <!-- Options -->
          <div class="space-y-3">
            <div 
              *ngFor="let option of currentQuestion()?.options; let i = index"
              class="relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200"
              [class]="getOptionClass(i)"
              (click)="selectAnswer(i)"
            >
              <div class="flex items-center">
                <div class="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 mr-3 flex items-center justify-center">
                  <div 
                    *ngIf="selectedAnswers()[currentQuestionIndex()] === i"
                    class="w-3 h-3 rounded-full bg-indigo-600"
                  ></div>
                </div>
                <span class="text-gray-700 font-medium">{{ option }}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between items-center mt-8">
            <button 
              *ngIf="currentQuestionIndex() > 0"
              (click)="previousQuestion()"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            
            <div class="flex space-x-3">
              <button 
                (click)="skipQuestion()"
                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
              
              <button 
                (click)="nextQuestion()"
                [disabled]="selectedAnswers()[currentQuestionIndex()] === undefined"
                class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ isLastQuestion() ? 'Finish Exam' : 'Next' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Exam Results -->
        <div class="bg-white rounded-xl shadow-lg p-8" *ngIf="examCompleted()">
          <div class="text-center">
            <div class="mb-6">
              <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-800 mb-2">Exam Completed!</h2>
              <p class="text-gray-600">Here are your results</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div class="bg-blue-50 rounded-lg p-4">
                <div class="text-3xl font-bold text-blue-600">{{ examResult()?.score }}</div>
                <div class="text-sm text-gray-600">Score</div>
              </div>
              <div class="bg-green-50 rounded-lg p-4">
                <div class="text-3xl font-bold text-green-600">{{ examResult()?.percentage }}%</div>
                <div class="text-sm text-gray-600">Percentage</div>
              </div>
              <div class="bg-purple-50 rounded-lg p-4">
                <div class="text-3xl font-bold text-purple-600">{{ examResult()?.timeSpent }}</div>
                <div class="text-sm text-gray-600">Time Spent</div>
              </div>
            </div>

            <div class="flex justify-center space-x-4">
              <button 
                (click)="reviewAnswers()"
                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Review Answers
              </button>
              <button 
                (click)="retakeExam()"
                class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Retake Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ExamComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  questions = signal<MCQQuestion[]>([
    {
      id: '1',
      question: 'What is the primary purpose of dependency injection in software development?',
      options: [
        'To improve code readability',
        'To achieve loose coupling and easier testing',
        'To make code run faster',
        'To reduce memory usage'
      ],
      correctAnswer: 1,
      explanation: 'Dependency injection helps achieve loose coupling between components and makes unit testing easier.'
    },
    {
      id: '2',
      question: 'Which of the following is a characteristic of good software design?',
      options: [
        'High complexity',
        'Tight coupling',
        'Modularity',
        'Code duplication'
      ],
      correctAnswer: 2,
      explanation: 'Modularity is a key characteristic of good software design.'
    },
    {
      id: '3',
      question: 'What does SOLID stand for in software engineering?',
      options: [
        'Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion',
        'Simple, Organized, Logical, Intuitive, Dependable',
        'Secure, Optimized, Lightweight, Integrated, Deployable',
        'Scalable, Observable, Lock-free, Idempotent, Testable'
      ],
      correctAnswer: 0,
      explanation: 'SOLID is an acronym for five principles of object-oriented design.'
    }
  ]);

  currentQuestionIndex = signal(0);
  selectedAnswers = signal<number[]>([]);
  timeRemaining = signal('30:00');
  examCompleted = signal(false);
  examResult = signal<ExamResult | null>(null);
  startTime = signal<Date | null>(null);

  currentQuestion = computed(() => 
    this.questions()[this.currentQuestionIndex()]
  );

  progressPercentage = computed(() => 
    ((this.currentQuestionIndex() + 1) / this.questions().length) * 100
  );

  isLastQuestion = computed(() => 
    this.currentQuestionIndex() === this.questions().length - 1
  );

  ngOnInit() {
    this.startTimer();
    this.startTime.set(new Date());
  }

  getOptionClass(index: number) {
    const selectedIndex = this.selectedAnswers()[this.currentQuestionIndex()];
    const isSelected = selectedIndex === index;
    
    let baseClass = 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50';
    if (isSelected) {
      baseClass = 'border-indigo-500 bg-indigo-50';
    }
    
    return baseClass;
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

  finishExam() {
    this.calculateResults();
    this.examCompleted.set(true);
  }

  calculateResults() {
    const correctAnswers = this.selectedAnswers().filter((answer, index) => 
      answer === this.questions()[index].correctAnswer
    ).length;

    const totalTime = this.startTime() ? 
      Math.floor((new Date().getTime() - this.startTime()!.getTime()) / 1000 / 60) : 0;

    this.examResult.set({
      score: correctAnswers,
      totalQuestions: this.questions().length,
      percentage: Math.round((correctAnswers / this.questions().length) * 100),
      passed: correctAnswers >= this.questions().length * 0.6, // 60% passing grade
      timeSpent: `${totalTime} min`
    });
  }

  reviewAnswers() {
    // Implementation for reviewing answers
    console.log('Reviewing answers...');
  }

  retakeExam() {
    this.currentQuestionIndex.set(0);
    this.selectedAnswers.set([]);
    this.examCompleted.set(false);
    this.examResult.set(null);
    this.timeRemaining.set('30:00');
    this.startTimer();
    this.startTime.set(new Date());
  }

  private startTimer() {
    let minutes = 30;
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
}
