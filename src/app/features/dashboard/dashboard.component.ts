import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
      
      <div class="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        <!-- Welcome Header Banner -->
        <div class="relative bg-gradient-to-r from-indigo-600 to-blue-500 rounded-3xl p-6 sm:p-10 shadow-lg overflow-hidden">
          <!-- Decorative Background Blobs -->
          <div class="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>
          <div class="absolute bottom-0 left-20 -mb-10 w-32 h-32 bg-indigo-900 opacity-20 rounded-full blur-xl pointer-events-none"></div>
          
          <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Welcome back, {{ authService.currentUser()?.firstName || 'User' }}! 👋
              </h1>
              <p class="text-indigo-100 mt-2 text-sm sm:text-base max-w-xl">
                Here is what's happening with your academic structures and examinations today.
              </p>
            </div>
            
            <!-- User Role Badge -->
            <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-xl text-white w-max shadow-sm">
              <!-- FIX: Hardcoded width and height -->
              <svg width="20" height="20" class="w-5 h-5 text-indigo-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span class="font-semibold text-sm tracking-wide">{{ authService.currentUser()?.role || 'USER' }}</span>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <!-- Stat 1 -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-500 mb-1">Academic Streams</p>
                <p class="text-3xl font-bold text-slate-800">4</p>
              </div>
              <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <!-- FIX: Hardcoded width and height -->
                <svg width="24" height="24" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Stat 2 -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-500 mb-1">Subjects</p>
                <p class="text-3xl font-bold text-slate-800">12</p>
              </div>
              <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 19.775 2 21.253 2 21.253v13C2 21.253 4.168 19.775 6.253 6.253z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Stat 3 -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-500 mb-1">Topics</p>
                <p class="text-3xl font-bold text-slate-800">24</p>
              </div>
              <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Stat 4 -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-500 mb-1">SubTopics</p>
                <p class="text-3xl font-bold text-slate-800">48</p>
              </div>
              <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          <!-- User Profile & Status (Takes 1 Column) -->
          <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 flex flex-col h-full">
            <h3 class="text-lg font-bold text-slate-800 mb-6">Account Status</h3>
            
            <div class="flex items-center gap-4 mb-8">
              <div class="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 border border-indigo-100">
                <svg width="28" height="28" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div class="min-w-0">
                <h4 class="text-base font-bold text-slate-900 truncate">
                  {{ authService.currentUser()?.firstName || 'User' }} {{ authService.currentUser()?.lastName || '' }}
                </h4>
                <p class="text-sm text-slate-500 truncate">{{ authService.currentUser()?.email }}</p>
              </div>
            </div>

            <div class="bg-slate-50 rounded-2xl p-5 flex-1 border border-slate-100">
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium text-slate-600">Account Health</span>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-slate-600">Permissions</span>
                <span class="text-sm font-bold text-indigo-600">{{ authService.currentUser()?.role || 'Standard' }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions & Activity (Takes 2 Columns) -->
          <div class="lg:col-span-2 flex flex-col gap-6 sm:gap-8">
            
            <!-- Quick Actions -->
            <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
              <h3 class="text-lg font-bold text-slate-800 mb-6">Quick Actions</h3>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  (click)="goToExamDashboard()"
                  class="group flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 hover:border-indigo-600 rounded-2xl transition-all duration-300"
                >
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-white text-indigo-600 group-hover:text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                      <svg width="20" height="20" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                    </div>
                    <span class="font-semibold text-indigo-900 group-hover:text-white transition-colors">Take Exam</span>
                  </div>
                  <svg width="20" height="20" class="w-5 h-5 text-indigo-400 group-hover:text-white transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>

                <button 
                  (click)="goToQuestionManagement()"
                  class="group flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-500 border border-emerald-100 hover:border-emerald-500 rounded-2xl transition-all duration-300"
                >
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-white text-emerald-600 group-hover:text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                      <svg width="20" height="20" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.651 2.033-2.814 3.772-2.814 1.739 0 3.223 1.163 3.772 2.814M9 5a3 3 0 11-6 0 3 3 0 016 0zm3 4a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    <span class="font-semibold text-emerald-900 group-hover:text-white transition-colors">Manage Questions</span>
                  </div>
                  <svg width="20" height="20" class="w-5 h-5 text-emerald-400 group-hover:text-white transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>

                <button 
                  (click)="goToAcademicManagement()"
                  class="group flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-600 border border-purple-100 hover:border-purple-600 rounded-2xl transition-all duration-300"
                >
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-white text-purple-600 group-hover:text-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                      <svg width="20" height="20" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                      </svg>
                    </div>
                    <span class="font-semibold text-purple-900 group-hover:text-white transition-colors">Academic Structure</span>
                  </div>
                  <svg width="20" height="20" class="w-5 h-5 text-purple-400 group-hover:text-white transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>

                <button class="group flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-500 border border-amber-100 hover:border-amber-500 rounded-2xl transition-all duration-300">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-white text-amber-600 group-hover:text-amber-600 rounded-xl flex items-center justify-center shadow-sm">
                      <svg width="20" height="20" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v1a3 3 0 003 3h0a3 3 0 003-3v-1m-6 0h6m-6 0l-1-1m7 1l1-1m-1-1v1m0-1a3 3 0 00-3-3h0a3 3 0 00-3 3v1"/>
                      </svg>
                    </div>
                    <span class="font-semibold text-amber-900 group-hover:text-white transition-colors">Generate Report</span>
                  </div>
                  <svg width="20" height="20" class="w-5 h-5 text-amber-400 group-hover:text-white transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
              <h3 class="text-lg font-bold text-slate-800 mb-6">Recent Activity</h3>
              
              <div class="space-y-4">
                <!-- Activity Item 1 -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors border border-transparent hover:border-slate-200">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 19.775 2 21.253 2 21.253v13C2 21.253 4.168 19.775 6.253 6.253z"/></svg>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-800">Created Engineering Stream</p>
                      <p class="text-xs font-medium text-slate-500 mt-0.5">2 hours ago</p>
                    </div>
                  </div>
                  <span class="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg w-max self-start sm:self-auto shadow-sm">Completed</span>
                </div>
                
                <!-- Activity Item 2 -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors border border-transparent hover:border-slate-200">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-800">Completed Mathematics Exam</p>
                      <p class="text-xs font-medium text-slate-500 mt-0.5">5 hours ago</p>
                    </div>
                  </div>
                  <span class="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg w-max self-start sm:self-auto shadow-sm">Score: 85%</span>
                </div>
                
                <!-- Activity Item 3 -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors border border-transparent hover:border-slate-200">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 19.775 2 21.253 2 21.253v13C2 21.253 4.168 19.775 6.253 6.253z"/></svg>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-800">Added Computer Science Subject</p>
                      <p class="text-xs font-medium text-slate-500 mt-0.5">1 day ago</p>
                    </div>
                  </div>
                  <span class="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg w-max self-start sm:self-auto shadow-sm">Completed</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  public authService = inject(AuthService);
  private router = inject(Router);

  goToExamDashboard() {
    this.router.navigate(['/exam-dashboard']);
  }

  goToQuestionManagement() {
    this.router.navigate(['/questions']);
  }

  goToAcademicManagement() {
    this.router.navigate(['/academic']);
  }
}