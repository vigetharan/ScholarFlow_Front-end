import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Exam {
  id: string;
  title: string;
  subject: string;
  duration: string;
  questions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Not Started' | 'In Progress' | 'Completed';
  score?: number;
  attempts: number;
  lastAttempt?: string;
}

@Component({
  selector: 'app-exam-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <!-- Header -->
      <div class="max-w-7xl mx-auto mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Exam Center</h1>
              <p class="text-gray-600 mt-1">Test your knowledge and track your progress</p>
            </div>
            <button 
              (click)="createNewExam()"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Create Exam
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="max-w-7xl mx-auto mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-3 bg-blue-100 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2H9z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Exams</p>
                <p class="text-2xl font-semibold text-gray-900">{{ totalExams() }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-3 bg-green-100 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Completed</p>
                <p class="text-2xl font-semibold text-gray-900">{{ completed() }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-3 bg-yellow-100 rounded-lg">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">In Progress</p>
                <p class="text-2xl font-semibold text-gray-900">{{ inProgress() }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-3 bg-purple-100 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0l-4-4m4 4l-4 4m6-4H9a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-2z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Average Score</p>
                <p class="text-2xl font-semibold text-gray-900">{{ averageScore() }}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="max-w-7xl mx-auto mb-6">
        <div class="bg-white rounded-lg shadow">
          <div class="border-b border-gray-200">
            <nav class="flex -mb-px">
              <button 
                *ngFor="let tab of filterTabs"
                (click)="activeFilter.set(tab)"
                class="py-4 px-6 border-b-2 font-medium text-sm transition-colors"
                [class]="activeFilter() === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                {{ tab }}
              </button>
            </nav>
          </div>
        </div>
      </div>

      <!-- Exams List -->
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            *ngFor="let exam of filteredExams(); trackBy: exam.id"
            class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            (click)="startExam(exam.id)"
          >
            <div class="p-6">
              <!-- Exam Header -->
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-800">{{ exam.title }}</h3>
                  <p class="text-sm text-gray-600">{{ exam.subject }}</p>
                </div>
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  [class]="getDifficultyClass(exam.difficulty)"
                >
                  {{ exam.difficulty }}
                </span>
              </div>

              <!-- Exam Details -->
              <div class="space-y-2 mb-4">
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {{ exam.duration }}
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 1.58-2 3-2 .925 2.678 1.58 4.231.77 1.676 1.582 2.831 1.58.751 0 1.506-.32 2.047-.784 2.291-1.151.236-.261.463-.534.658-.8.97-.603-1.765-.14-3.174-.403-2.607-.766-2.467-1.666-.145-.353-.319-.684-.48-1.04-.219-.747-.371-1.459-.373-2.51 0-1.053.385-2.06 1.08-2.833L15.78.892c-.425-.532-.672-.968-.766-1.329-.192-1.004-.277-2.09-.38-2.831.019-1.266.94-2.425 1.616-3.42.672-1.638 1.523-3.023 1.523-2.347 0-4.29-1.91-4.29-4.29h-1.241c-1.014 0-1.914.495-1.914 1.09v1.241c0 .595.425 1.09 1.014 1.09h2.756l-.118 2.143c-.011.21-.043.416-.12.615-.064.29-.146.583-.246.848-.099.325-.232.624-.401.914-.17.556-.402 1.055-.402 1.755 0 1.416.672 2.475 1.958 3.023l2.914 2.914m1.414 1.414c-.785.785-1.814 1.234-2.914 1.234H6.5c-1.1 0-2.129-.449-2.914-1.234L.707 15.814C.449 16.129 0 17.158 0 18.258V19.5c0 .925.376 1.755 1.014 1.755h2.756l-.118 2.143c-.011.21-.043.416-.12.615-.064.29-.146.583-.246.848-.099.325-.232.624-.401.914-.17.556-.402 1.055-.402 1.755 0 1.416.672 2.475 1.958 3.023l2.914 2.914"/>
                  </svg>
                  {{ exam.questions }} questions
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  {{ exam.attempts }} attempts
                </div>
              </div>

              <!-- Status Badge -->
              <div class="flex items-center justify-between">
                <span 
                  class="px-3 py-1 text-xs font-medium rounded-full"
                  [class]="getStatusClass(exam.status)"
                >
                  {{ exam.status }}
                </span>
                <div *ngIf="exam.score" class="text-sm font-medium">
                  <span class="text-gray-600">Score:</span>
                  <span class="text-lg font-bold" [class]="exam.score >= 60 ? 'text-green-600' : 'text-red-600'">
                    {{ exam.score }}%
                  </span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex space-x-2 mt-4">
                <button 
                  *ngIf="exam.status === 'Not Started' || exam.status === 'Completed'"
                  (click)="startExam(exam.id)"
                  class="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {{ exam.status === 'Completed' ? 'Retake' : 'Start' }}
                </button>
                <button 
                  *ngIf="exam.status === 'In Progress'"
                  (click)="continueExam(exam.id)"
                  class="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Continue
                </button>
                <button 
                  (click)="viewResults(exam.id)"
                  class="px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ExamDashboardComponent {
  private router = inject(Router);

  activeFilter = signal('All Exams');
  filterTabs = ['All Exams', 'Not Started', 'In Progress', 'Completed'];

  exams = signal<Exam[]>([
    {
      id: '1',
      title: 'JavaScript Fundamentals',
      subject: 'Programming',
      duration: '45 minutes',
      questions: 20,
      difficulty: 'Easy',
      status: 'Not Started',
      attempts: 0
    },
    {
      id: '2',
      title: 'React Components & Props',
      subject: 'Programming',
      duration: '60 minutes',
      questions: 25,
      difficulty: 'Medium',
      status: 'In Progress',
      attempts: 1
    },
    {
      id: '3',
      title: 'Advanced TypeScript',
      subject: 'Programming',
      duration: '90 minutes',
      questions: 30,
      difficulty: 'Hard',
      status: 'Completed',
      attempts: 2,
      score: 85,
      lastAttempt: '2024-01-15'
    },
    {
      id: '4',
      title: 'Database Design Principles',
      subject: 'Database',
      duration: '75 minutes',
      questions: 35,
      difficulty: 'Medium',
      status: 'Completed',
      attempts: 1,
      score: 92,
      lastAttempt: '2024-01-10'
    }
  ]);

  totalExams = computed(() => this.exams().length);
completed = computed(() => this.exams().filter(e => e.status === 'Completed').length);
inProgress = computed(() => this.exams().filter(e => e.status === 'In Progress').length);
averageScore = computed(() => {
  const scoredExams = this.exams().filter(e => e.score !== undefined);
  return scoredExams.length > 0 
    ? Math.round(scoredExams.reduce((sum, e) => sum + (e.score || 0), 0) / scoredExams.length)
    : 0;
});

  filteredExams = computed(() => {
    const examList = this.exams();
    switch (this.activeFilter()) {
      case 'Not Started':
        return examList.filter(e => e.status === 'Not Started');
      case 'In Progress':
        return examList.filter(e => e.status === 'In Progress');
      case 'Completed':
        return examList.filter(e => e.status === 'Completed');
      default:
        return examList;
    }
  });

  getDifficultyClass(difficulty: string) {
    const classes = {
      'Easy': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Hard': 'bg-red-100 text-red-800'
    };
    return classes[difficulty as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  getStatusClass(status: string) {
    const classes = {
      'Not Started': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800'
    };
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  startExam(examId: string) {
    this.router.navigate([`/exam/${examId}`]);
  }

  continueExam(examId: string) {
    this.router.navigate([`/exam/${examId}`]);
  }

  viewResults(examId: string) {
    this.router.navigate([`/exam/${examId}/results`]);
  }

  createNewExam() {
    // Navigate to exam creation page
    console.log('Create new exam');
  }
}
