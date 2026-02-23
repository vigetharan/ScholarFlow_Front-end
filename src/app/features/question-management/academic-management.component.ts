// import { Component, inject, signal, computed, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http';

// interface AcademicStream {
//   id: string;
//   name: string;
//   subjects: Subject[];
// }

// interface Subject {
//   id: string;
//   name: string;
//   streamId: string;
//   topics: Topic[];
// }

// interface Topic {
//   id: string;
//   name: string;
//   subjectId: string;
//   subTopics: SubTopic[];
// }

// interface SubTopic {
//   id: string;
//   name: string;
//   topicId: string;
// }

// type FormItemType = 'Stream' | 'Subject' | 'Topic' | 'SubTopic';

// @Component({
//   selector: 'app-academic-management',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, FormsModule],
//   styles: [`
//     @keyframes dropIn {
//       0% { opacity: 0; transform: scale(0.95) translateY(-20px); }
//       100% { opacity: 1; transform: scale(1) translateY(0); }
//     }
//     .animate-drop-in {
//       animation: dropIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
//     }
    
//     .input-field {
//       @apply w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm sm:text-base outline-none;
//     }
//   `],
//   template: `
//     <div class="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans pb-24">
      
//       <!-- Header -->
//       <div class="max-w-6xl mx-auto mb-8">
//         <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
//           <div>
//             <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Academic Structure</h1>
//             <p class="text-slate-500 mt-1 sm:text-lg">Manage streams, subjects, topics, and subtopics.</p>
//           </div>
//           <button 
//             (click)="showCreateForm.set(true)"
//             class="inline-flex justify-center items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/30 transition-all transform hover:-translate-y-0.5"
//           >
//             <svg style="width: 20px; height: 20px;" class="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
//             </svg>
//             Add New Item
//           </button>
//         </div>
//       </div>

//       <!-- Academic Structure Tree View -->
//       <div class="max-w-6xl mx-auto">
//         <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
          
//           <h2 class="text-xl font-bold text-slate-800 mb-6 flex items-center">
//             <svg style="width: 24px; height: 24px;" class="mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
//             </svg>
//             Structure Overview
//           </h2>
          
//           <!-- Empty State -->
//           @if (streams().length === 0) {
//             <div class="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
//               <p class="text-slate-500 font-medium">No academic streams found.</p>
//               <button (click)="showCreateForm.set(true)" class="mt-2 text-indigo-600 font-bold hover:underline">Create your first stream</button>
//             </div>
//           }
          
//           <!-- Streams Tree -->
//           <div class="space-y-6">
//             @for (stream of streams(); track stream.id) {
              
//               <!-- STREAM CARD -->
//               <div class="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-sm hover:border-indigo-300 transition-colors">
//                 <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//                   <div class="flex items-center space-x-4">
//                     <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg">S</div>
//                     <div>
//                       <h3 class="text-lg font-bold text-slate-800 leading-tight">{{ stream.name }}</h3>
//                       <span class="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">Stream</span>
//                     </div>
//                   </div>
                  
//                   <!-- Stream Action Buttons -->
//                   <div class="flex flex-wrap items-center gap-2">
//                     <button (click)="addChild('Subject', stream.id)" class="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200">
//                       <svg style="width: 14px; height: 14px;" class="mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
//                       Add Subject
//                     </button>
//                     <button (click)="editItem('Stream', stream)" class="inline-flex items-center px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
//                       <svg style="width: 14px; height: 14px;" class="mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
//                       Edit
//                     </button>
//                     <button (click)="deleteItem('Stream', stream.id)" class="inline-flex items-center px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors border border-rose-200">
//                       <svg style="width: 14px; height: 14px;" class="mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
//                       Delete
//                     </button>
//                   </div>
//                 </div>

//                 <!-- Subjects under this Stream -->
//                 @if (stream.subjects && stream.subjects.length > 0) {
//                   <div class="mt-4 sm:ml-6 pl-4 border-l-2 border-slate-100 space-y-4">
//                     @for (subject of stream.subjects; track subject.id) {
                      
//                       <!-- SUBJECT CARD -->
//                       <div class="border border-slate-100 rounded-xl p-4 bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
//                         <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
//                           <div class="flex items-center space-x-3">
//                             <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
//                             <div>
//                               <h4 class="text-base font-bold text-slate-700">{{ subject.name }}</h4>
//                               <p class="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Subject</p>
//                             </div>
//                           </div>
                          
//                           <!-- Subject Action Buttons -->
//                           <div class="flex flex-wrap items-center gap-2">
//                             <button (click)="addChild('Topic', stream.id, subject.id)" class="inline-flex items-center px-2.5 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200">
//                               <svg style="width: 12px; height: 12px;" class="mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
//                               Add Topic
//                             </button>
//                             <button (click)="editItem('Subject', subject)" class="inline-flex items-center px-2.5 py-1.5 bg-white text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
//                               <svg style="width: 12px; height: 12px;" class="mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
//                               Edit
//                             </button>
//                             <button (click)="deleteItem('Subject', subject.id)" class="inline-flex items-center px-2.5 py-1.5 bg-white text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-50 transition-colors border border-slate-200">
//                               <svg style="width: 12px; height: 12px;" class="mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
//                               Delete
//                             </button>
//                           </div>
//                         </div>

//                         <!-- Topics under this Subject -->
//                         @if (subject.topics && subject.topics.length > 0) {
//                           <div class="mt-4 sm:ml-4 pl-3 border-l-2 border-slate-200 space-y-3">
//                             @for (topic of subject.topics; track topic.id) {
                              
//                               <!-- TOPIC CARD -->
//                               <div class="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
//                                 <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
//                                   <div class="flex items-center space-x-2">
//                                     <div class="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
//                                     <div>
//                                       <h5 class="text-sm font-bold text-slate-700">{{ topic.name }}</h5>
//                                       <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Topic</p>
//                                     </div>
//                                   </div>
                                  
//                                   <!-- Topic Action Buttons -->
//                                   <div class="flex flex-wrap items-center gap-2">
//                                     <button (click)="addChild('SubTopic', stream.id, subject.id, topic.id)" class="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded hover:bg-blue-100 transition-colors border border-blue-200">
//                                       <svg style="width: 12px; height: 12px;" class="mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
//                                       Add SubTopic
//                                     </button>
//                                     <button (click)="editItem('Topic', topic)" class="inline-flex items-center px-2 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded hover:bg-slate-100 transition-colors border border-slate-200">
//                                       <svg style="width: 12px; height: 12px;" class="mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
//                                       Edit
//                                     </button>
//                                     <button (click)="deleteItem('Topic', topic.id)" class="inline-flex items-center px-2 py-1 bg-slate-50 text-rose-600 text-xs font-bold rounded hover:bg-rose-50 transition-colors border border-slate-200">
//                                       <svg style="width: 12px; height: 12px;" class="mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
//                                       Delete
//                                     </button>
//                                   </div>
//                                 </div>

//                                 <!-- SubTopics under this Topic -->
//                                 @if (topic.subTopics && topic.subTopics.length > 0) {
//                                   <div class="mt-3 sm:ml-4 pl-3 border-l-2 border-slate-100 space-y-2">
//                                     @for (subTopic of topic.subTopics; track subTopic.id) {
//                                       <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-md bg-slate-50 border border-slate-100 hover:bg-amber-50 hover:border-amber-100 transition-colors">
//                                         <div class="flex items-center space-x-2">
//                                           <div class="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
//                                           <span class="text-xs font-bold text-slate-700">{{ subTopic.name }}</span>
//                                         </div>
//                                         <div class="flex items-center gap-2">
//                                           <button (click)="editItem('SubTopic', subTopic)" class="inline-flex items-center px-2 py-1 text-slate-500 hover:text-amber-700 hover:bg-white rounded transition-colors text-[10px] font-bold uppercase tracking-wide">
//                                             <svg style="width: 10px; height: 10px;" class="mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
//                                             Edit
//                                           </button>
//                                           <button (click)="deleteItem('SubTopic', subTopic.id)" class="inline-flex items-center px-2 py-1 text-slate-500 hover:text-rose-700 hover:bg-white rounded transition-colors text-[10px] font-bold uppercase tracking-wide">
//                                             <svg style="width: 10px; height: 10px;" class="mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
//                                             Delete
//                                           </button>
//                                         </div>
//                                       </div>
//                                     }
//                                   </div>
//                                 }
//                               </div>
//                             }
//                           </div>
//                         }
//                       </div>
//                     }
//                   </div>
//                 }
//               </div>
//             }
//           </div>
//         </div>
//       </div>

//       <!-- Modern Modal Form Overlay -->
//       @if (showCreateForm()) {
//         <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-0" aria-labelledby="modal-title" role="dialog" aria-modal="true">
//           <!-- Backdrop -->
//           <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" (click)="closeForm()"></div>

//           <!-- Modal Panel -->
//           <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 overflow-hidden animate-drop-in border border-slate-100" (click)="$event.stopPropagation()">
            
//             <!-- Header -->
//             <div class="flex justify-between items-center mb-6">
//               <h2 class="text-2xl font-bold text-slate-800">
//                 {{ editingItem() ? 'Edit ' + getCreateFormType() : 'Add ' + getCreateFormType() }}
//               </h2>
//               <button (click)="closeForm()" class="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
//                 <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
//                 </svg>
//               </button>
//             </div>

//             <!-- Modal Type Selector (Only if NOT editing) -->
//             @if (!editingItem()) {
//               <div class="mb-6">
//                 <label class="block text-sm font-semibold text-slate-700 mb-2">Select Item Level</label>
//                 <div class="flex flex-wrap gap-2">
//                   @for (type of formTypes; track type) {
//                     <button 
//                       type="button"
//                       (click)="selectFormType(type)"
//                       class="px-4 py-2 text-sm font-semibold rounded-xl border transition-all"
//                       [class]="createFormType() === type ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'"
//                     >
//                       {{ type }}
//                     </button>
//                   }
//                 </div>
//               </div>
//             }

//             <form [formGroup]="academicForm" (ngSubmit)="saveAcademicItem()">
              
//               <!-- Common Name Field -->
//               <div class="mb-5">
//                 <label class="block text-sm font-semibold text-slate-700 mb-2">{{ createFormType() }} Name</label>
//                 <input 
//                   type="text" 
//                   formControlName="name" 
//                   class="input-field" 
//                   placeholder="Enter {{ createFormType().toLowerCase() }} name..."
//                   required
//                 >
//               </div>

//               <!-- Stream Dependency (Needed for Subject, Topic, SubTopic) -->
//               @if (createFormType() !== 'Stream') {
//                 <div class="mb-5">
//                   <label class="block text-sm font-semibold text-slate-700 mb-2">Select Parent Stream</label>
//                   <select formControlName="streamId" class="input-field" required (change)="onStreamChange()">
//                     <option value="" disabled selected>Select a stream...</option>
//                     @for (stream of streams(); track stream.id) {
//                       <option [value]="stream.id">{{ stream.name }}</option>
//                     }
//                   </select>
//                 </div>
//               }

//               <!-- Subject Dependency (Needed for Topic, SubTopic) -->
//               @if (createFormType() === 'Topic' || createFormType() === 'SubTopic') {
//                 <div class="mb-5">
//                   <label class="block text-sm font-semibold text-slate-700 mb-2">Select Parent Subject</label>
//                   <select formControlName="subjectId" class="input-field" required (change)="onSubjectChange()">
//                     <option value="" disabled selected>Select a subject...</option>
//                     @for (subject of getSubjectsForSelectedStream(); track subject.id) {
//                       <option [value]="subject.id">{{ subject.name }}</option>
//                     }
//                   </select>
//                 </div>
//               }

//               <!-- Topic Dependency (Needed for SubTopic) -->
//               @if (createFormType() === 'SubTopic') {
//                 <div class="mb-6">
//                   <label class="block text-sm font-semibold text-slate-700 mb-2">Select Parent Topic</label>
//                   <select formControlName="topicId" class="input-field" required>
//                     <option value="" disabled selected>Select a topic...</option>
//                     @for (topic of getTopicsForSelectedSubject(); track topic.id) {
//                       <option [value]="topic.id">{{ topic.name }}</option>
//                     }
//                   </select>
//                 </div>
//               }

//               <!-- Form Actions -->
//               <div class="flex justify-end space-x-3 pt-4 mt-6 border-t border-slate-100">
//                 <button type="button" (click)="closeForm()" class="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
//                   Cancel
//                 </button>
//                 <button 
//                   type="submit" 
//                   [disabled]="!isFormValid"
//                   class="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {{ editingItem() ? 'Save Changes' : 'Create ' + createFormType() }}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       }
//     </div>
//   `
// })
// export class AcademicManagementComponent implements OnInit {
//   private fb = inject(FormBuilder);
//   private router = inject(Router);
//   private http = inject(HttpClient);

//   // API Base URL
//   private readonly API_URL = 'http://localhost:5222/api';

//   // Available Form Types for Type Safety
//   readonly formTypes: FormItemType[] = ['Stream', 'Subject', 'Topic', 'SubTopic'];

//   // Signals
//   showCreateForm = signal(false);
//   createFormType = signal<FormItemType>('Stream');
//   editingItem = signal<any>(null);

//   // Real data from database
//   streams = signal<AcademicStream[]>([]);

//   // Form
//   academicForm = this.fb.group({
//     name: ['', Validators.required],
//     streamId: [''],
//     subjectId: [''],
//     topicId: ['']
//   });

//   // Computed property to check if form is valid based on type
//   get isFormValid(): boolean {
//     const formValue = this.academicForm.value;
//     const type = this.createFormType();
    
//     // Name is always required
//     if (!formValue.name || formValue.name.trim() === '') return false;
    
//     // Stream is required for Subject, Topic, SubTopic
//     if (type !== 'Stream' && (!formValue.streamId || formValue.streamId === '')) return false;
    
//     // Subject is required for Topic, SubTopic
//     if ((type === 'Topic' || type === 'SubTopic') && (!formValue.subjectId || formValue.subjectId === '')) return false;
    
//     // Topic is required for SubTopic
//     if (type === 'SubTopic' && (!formValue.topicId || formValue.topicId === '')) return false;
    
//     return true;
//   }

//   ngOnInit() {
//     this.loadStreams();
//   }

//   // Set form type cleanly to avoid template parser errors
//   selectFormType(type: FormItemType) {
//     this.createFormType.set(type);
//     this.academicForm.reset();
//   }

//   // Load data from database
//   private loadStreams() {
//     this.http.get<AcademicStream[]>(`${this.API_URL}/academic/streams`).subscribe({
//       next: (data) => {
//         this.streams.set(data);
//       },
//       error: (error) => {
//         console.error('Error loading streams from database:', error);
//         // Fallback Mock Data for UI demonstration if backend is down
//         this.streams.set([
//           { id: '1', name: 'Engineering', subjects: [
//             { id: '11', name: 'Mathematics', streamId: '1', topics: [
//               { id: '111', name: 'Calculus', subjectId: '11', subTopics: [
//                 { id: '1111', name: 'Derivatives', topicId: '111' }
//               ]}
//             ]}
//           ]}
//         ]);
//       }
//     });
//   }

//   // Helper methods for dropdown filtering
//   getSubjectsForSelectedStream(): Subject[] {
//     const streamId = this.academicForm.get('streamId')?.value;
//     if (!streamId) return [];
    
//     const stream = this.streams().find(s => s.id === streamId);
//     return stream?.subjects || [];
//   }

//   getTopicsForSelectedSubject(): Topic[] {
//     const streamId = this.academicForm.get('streamId')?.value;
//     const subjectId = this.academicForm.get('subjectId')?.value;
    
//     if (!streamId || !subjectId) return [];
    
//     const stream = this.streams().find(s => s.id === streamId);
//     if (!stream) return [];
    
//     const subject = stream.subjects?.find(s => s.id === subjectId);
//     return subject?.topics || [];
//   }

//   // Event handlers for dropdown changes
//   onStreamChange() {
//     this.academicForm.patchValue({ subjectId: '', topicId: '' });
//   }

//   onSubjectChange() {
//     this.academicForm.patchValue({ topicId: '' });
//   }

//   // Add child structure directly from the tree view
//   addChild(type: FormItemType, streamId: string, subjectId?: string, topicId?: string) {
//     console.log('addChild called:', { type, streamId, subjectId, topicId });
    
//     this.createFormType.set(type);
//     this.editingItem.set(null);
//     this.academicForm.reset();

//     // Pre-fill the parent dependencies automatically
//     const patchData: any = {};
//     if (streamId) patchData.streamId = streamId;
//     if (subjectId) patchData.subjectId = subjectId;
//     if (topicId) patchData.topicId = topicId;

//     console.log('Patching form with data:', patchData);
//     this.academicForm.patchValue(patchData);
    
//     // Small delay to ensure form is patched before showing
//     setTimeout(() => {
//       this.showCreateForm.set(true);
//     }, 100);
//   }

//   editItem(type: string, item: any) {
//     this.createFormType.set(type as FormItemType);
//     this.editingItem.set(item);
//     this.showCreateForm.set(true);
    
//     const formValue: any = { name: item.name };
    
//     if (type === 'Subject') {
//       formValue.streamId = item.streamId;
//     } else if (type === 'Topic') {
//       formValue.streamId = item.streamId;
//       formValue.subjectId = item.subjectId;
//     } else if (type === 'SubTopic') {
//       formValue.streamId = item.streamId;
//       formValue.subjectId = item.subjectId;
//       formValue.topicId = item.topicId;
//     }
    
//     this.academicForm.patchValue(formValue);
//   }

//   deleteItem(type: string, itemId: string) {
//     if (confirm(`Are you sure you want to delete this ${type}?`)) {
//       const apiUrl = `${this.API_URL}/academic/${type.toLowerCase()}s/${itemId}`;
//       this.http.delete(apiUrl).subscribe({
//         next: () => {
//           console.log(`${type} deleted successfully`);
//           this.loadStreams();
//         },
//         error: (error) => {
//           console.error(`Error deleting ${type}:`, error);
//           alert('Failed to delete item. Please try again.');
//         }
//       });
//     }
//   }

//   getCreateFormType() {
//     return this.createFormType();
//   }

//   saveAcademicItem() {
//     const formValue = this.academicForm.value;
//     console.log('Form submitted:', {
//       formType: this.createFormType(),
//       formValue: formValue,
//       isEditing: this.editingItem() !== null,
//       formValid: this.isFormValid
//     });
    
//     if (!this.isFormValid) {
//       console.error('Form is invalid - custom validation failed');
//       return;
//     }
    
//     const isEdit = this.editingItem() !== null;
    
//     let requestPayload: any = { name: formValue.name };
    
//     if (this.createFormType() === 'Subject') {
//       requestPayload.streamId = formValue.streamId;
//     } else if (this.createFormType() === 'Topic') {
//       requestPayload.streamId = formValue.streamId;
//       requestPayload.subjectId = formValue.subjectId;
//     } else if (this.createFormType() === 'SubTopic') {
//       requestPayload.streamId = formValue.streamId;
//       requestPayload.subjectId = formValue.subjectId;
//       requestPayload.topicId = formValue.topicId;
//     }
    
//     const typeStr = this.createFormType().toLowerCase();
//     const apiUrl = isEdit 
//       ? `${this.API_URL}/academic/${typeStr}s/${this.editingItem().id}`
//       : `${this.API_URL}/academic/${typeStr}s`;

//     console.log('Making API call:', {
//       method: isEdit ? 'PUT' : 'POST',
//       url: apiUrl,
//       payload: requestPayload
//     });

//     const request$ = isEdit 
//       ? this.http.put(apiUrl, requestPayload)
//       : this.http.post(apiUrl, requestPayload);

//     request$.subscribe({
//       next: (response) => {
//         console.log('API response:', response);
//         this.loadStreams();
//         this.closeForm();
//       },
//       error: (error) => {
//         console.error(`Error ${isEdit ? 'updating' : 'creating'} item:`, error);
//         alert(`Failed to ${isEdit ? 'update' : 'create'} item.`);
//       }
//     });
//   }

//   closeForm() {
//     this.showCreateForm.set(false);
//     this.editingItem.set(null);
//     this.academicForm.reset({
//       name: '',
//       streamId: '',
//       subjectId: '',
//       topicId: ''
//     });
//   }
// }




// import { Component, inject, signal, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';

// interface AcademicStream {
//   id: string;
//   name: string;
//   subjects: Subject[];
// }

// interface Subject {
//   id: string;
//   name: string;
//   streamId: string;
//   topics: Topic[];
// }

// interface Topic {
//   id: string;
//   name: string;
//   subjectId: string;
//   subTopics: SubTopic[];
// }

// interface SubTopic {
//   id: string;
//   name: string;
//   topicId: string;
// }

// type FormItemType = 'Stream' | 'Subject' | 'Topic' | 'SubTopic';
// type SelectedLevel = 'Stream' | 'Subject' | 'Topic' | 'SubTopic';

// @Component({
//   selector: 'app-academic-management',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   template: `
//   <div class="min-h-screen bg-slate-100 p-6">

//     <!-- HEADER -->
//     <div class="max-w-7xl mx-auto mb-6 flex justify-between items-center">
//       <div>
//         <h1 class="text-3xl font-bold text-indigo-700">Academic Structure</h1>
//         <p class="text-slate-500">Professional Academic Administration</p>
//       </div>
//       <button (click)="startCreate('Stream')"
//         class="bg-indigo-600 text-white px-5 py-2 rounded-xl shadow hover:bg-indigo-700 transition">
//         + Add Stream
//       </button>
//     </div>

//     <div class="max-w-7xl mx-auto flex gap-6">

//       <!-- SIDEBAR TREE -->
//       <div class="w-1/3 bg-white rounded-2xl shadow p-4 h-[80vh] overflow-auto">

//         <h3 class="font-semibold text-indigo-600 mb-4">Hierarchy</h3>

//         <div *ngFor="let stream of streams()" class="mb-2">

//           <div class="cursor-pointer font-semibold hover:text-indigo-600"
//                (click)="selectNode('Stream', stream)">
//             📘 {{ stream.name }}
//           </div>

//           <div class="ml-4 mt-1" *ngIf="isExpanded(stream.id)">

//             <div *ngFor="let subject of stream.subjects">
//               <div class="cursor-pointer hover:text-indigo-500"
//                    (click)="toggleNode(stream.id); selectNode('Stream', stream)">
//                 ├─ {{ subject.name }}
//               </div>

//               <div class="ml-4" *ngIf="selectedLevel() === 'Subject' && selectedEntity()?.id === subject.id">
//                 <div *ngFor="let topic of subject.topics">
//                   <div class="cursor-pointer hover:text-indigo-400"
//                        (click)="selectNode('Topic', topic)">
//                     ├─ {{ topic.name }}
//                   </div>

//                   <div class="ml-4"
//                        *ngIf="selectedLevel() === 'Topic' && selectedEntity()?.id === topic.id">
//                     <div *ngFor="let sub of topic.subTopics">
//                       <div class="cursor-pointer hover:text-indigo-300"
//                            (click)="selectNode('SubTopic', sub)">
//                         └─ {{ sub.name }}
//                       </div>
//                     </div>
//                   </div>

//                 </div>
//               </div>

//             </div>

//           </div>

//         </div>

//       </div>

//       <!-- WORKSPACE PANEL -->
//       <div class="flex-1 bg-white rounded-2xl shadow p-6">

//         <!-- DETAILS VIEW -->
//         <div *ngIf="selectedEntity() && !showForm()">

//           <h2 class="text-2xl font-bold text-indigo-700 mb-4">
//             {{ selectedLevel() }} Details
//           </h2>

//           <div class="mb-6">
//             <p class="text-lg font-medium">{{ selectedEntity()?.name }}</p>
//           </div>

//           <div class="flex gap-3">

//             <button
//               (click)="startEdit(selectedLevel()!, selectedEntity())"
//               class="bg-yellow-500 text-white px-4 py-2 rounded-lg">
//               Edit
//             </button>

//             <button
//               (click)="deleteItem(selectedLevel()!, selectedEntity()?.id)"
//               class="bg-red-600 text-white px-4 py-2 rounded-lg">
//               Delete
//             </button>

//             <button
//               *ngIf="selectedLevel() !== 'SubTopic'"
//               (click)="addChildFromSelection()"
//               class="bg-indigo-600 text-white px-4 py-2 rounded-lg">
//               + Add Child
//             </button>

//           </div>

//         </div>

//         <!-- CREATE / EDIT FORM -->
//         <div *ngIf="showForm()">

//           <h2 class="text-xl font-bold text-indigo-700 mb-4">
//             {{ editingItem() ? 'Edit' : 'Create' }} {{ createFormType() }}
//           </h2>

//           <form [formGroup]="academicForm" (ngSubmit)="submitForm()">

//             <input formControlName="name"
//               type="text"
//               placeholder="Enter name"
//               class="w-full p-3 border rounded-lg mb-4"/>

//             <div class="flex gap-3">
//               <button type="submit"
//                 class="bg-indigo-600 text-white px-4 py-2 rounded-lg">
//                 {{ editingItem() ? 'Update' : 'Create' }}
//               </button>

//               <button type="button"
//                 (click)="cancelForm()"
//                 class="bg-gray-400 text-white px-4 py-2 rounded-lg">
//                 Cancel
//               </button>
//             </div>

//           </form>

//         </div>

//       </div>

//     </div>

//   </div>
//   `
// })
// export class AcademicManagementComponent implements OnInit {

//   private http = inject(HttpClient);
//   private fb = inject(FormBuilder);
//   private readonly API_URL = 'http://localhost:5222/api';

//   streams = signal<AcademicStream[]>([]);
//   selectedLevel = signal<SelectedLevel | null>(null);
//   selectedEntity = signal<any>(null);

//   showForm = signal(false);
//   createFormType = signal<FormItemType>('Stream');
//   editingItem = signal<any>(null);
//   expandedNodes = signal<Set<string>>(new Set());

//   academicForm = this.fb.group({
//     name: ['', Validators.required],
//     streamId: [''],
//     subjectId: [''],
//     topicId: ['']
//   });

//   ngOnInit() {
//     this.loadStreams();
//   }

//   toggleNode(id: string) {
//   const set = new Set(this.expandedNodes());
//   set.has(id) ? set.delete(id) : set.add(id);
//   this.expandedNodes.set(set);
//   }

//   isExpanded(id: string) {
//     return this.expandedNodes().has(id);
//   }

//   loadStreams() {
//     this.http.get<AcademicStream[]>(`${this.API_URL}/academic/streams`)
//       .subscribe(data => this.streams.set(data));
//   }

//   selectNode(level: SelectedLevel, entity: any) {
//     this.selectedLevel.set(level);
//     this.selectedEntity.set(entity);
//   }

//   startCreate(type: FormItemType) {
//     this.createFormType.set(type);
//     this.editingItem.set(null);
//     this.academicForm.reset();
//     this.showForm.set(true);
//   }

//   startEdit(type: FormItemType, item: any) {
//     this.createFormType.set(type);
//     this.editingItem.set(item);
//     this.academicForm.patchValue({ name: item.name });
//     this.showForm.set(true);
//   }

//   cancelForm() {
//     this.showForm.set(false);
//     this.editingItem.set(null);
//     this.academicForm.reset();
//   }

//     submitForm() {

//     const type = this.createFormType();
//     const editing = this.editingItem();
//     const formValue = this.academicForm.value;

//     let payload: any = {
//       name: formValue.name
//     };

//     if (type === 'Subject') {
//       payload.streamId = formValue.streamId;
//     }

//     if (type === 'Topic') {
//       payload.subjectId = formValue.subjectId;
//     }

//     if (type === 'SubTopic') {
//       payload.topicId = formValue.topicId;
//     }

//     const url = `${this.API_URL}/academic/${type.toLowerCase()}s`;

//     if (editing) {
//       this.http.put(`${url}/${editing.id}`, payload)
//         .subscribe(() => {
//           this.loadStreams();
//           this.cancelForm();
//         });
//     } else {
//       this.http.post(url, payload)
//         .subscribe(() => {
//           this.loadStreams();
//           this.cancelForm();
//         });
//     }
//   }

//   addChildFromSelection() {
//     const level = this.selectedLevel();
//     const entity = this.selectedEntity();
//     if (!level || !entity) return;

//     if (level === 'Stream') {
//       this.createFormType.set('Subject');
//       this.academicForm.patchValue({ streamId: entity.id });
//     }

//     else if (level === 'Subject') {
//       this.createFormType.set('Topic');
//       this.academicForm.patchValue({
//         streamId: entity.streamId,
//         subjectId: entity.id
//       });
//     }

//     else if (level === 'Topic') {
//       this.createFormType.set('SubTopic');
//       this.academicForm.patchValue({
//         subjectId: entity.subjectId,
//         topicId: entity.id
//       });
//     }

//     this.editingItem.set(null);
//     this.showForm.set(true);
//   }

//   deleteItem(type: string, id: string) {
//     if (!confirm(`Delete this ${type}?`)) return;

//     const url = `${this.API_URL}/academic/${type.toLowerCase()}s/${id}`;
//     this.http.delete(url)
//       .subscribe(() => {
//         this.loadStreams();
//         this.selectedEntity.set(null);
//       });
//   }
// }













//updated.
// import { Component, inject, signal, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { catchError } from 'rxjs/operators';
// import { of } from 'rxjs';

// interface AcademicStream {
//   id: string;
//   name: string;
//   subjects: Subject[];
// }

// interface Subject {
//   id: string;
//   name: string;
//   streamId: string;
//   topics: Topic[];
// }

// interface Topic {
//   id: string;
//   name: string;
//   subjectId: string;
//   subTopics: SubTopic[];
// }

// interface SubTopic {
//   id: string;
//   name: string;
//   topicId: string;
// }

// type FormItemType = 'Stream' | 'Subject' | 'Topic' | 'SubTopic';
// type SelectedLevel = 'Stream' | 'Subject' | 'Topic' | 'SubTopic';

// @Component({
//   selector: 'app-academic-management',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   styles: [`
//     /* Custom Scrollbar for a cleaner look */
//     .custom-scrollbar::-webkit-scrollbar {
//       width: 6px;
//       height: 6px;
//     }
//     .custom-scrollbar::-webkit-scrollbar-track {
//       background: transparent;
//     }
//     .custom-scrollbar::-webkit-scrollbar-thumb {
//       background-color: #cbd5e1;
//       border-radius: 20px;
//     }
//     .tree-line {
//       position: absolute;
//       left: 11px;
//       top: 24px;
//       bottom: -12px;
//       width: 2px;
//       background-color: #e2e8f0;
//       z-index: 0;
//     }
//   `],
//   template: `
//   <div class="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">

//     <!-- HEADER -->
//     <div class="max-w-7xl mx-auto mb-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
//       <div>
//         <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Academic Structure</h1>
//         <p class="text-slate-500 font-medium mt-1">Professional Academic Administration</p>
//       </div>
//       <button 
//         (click)="startCreate('Stream')"
//         class="inline-flex items-center bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all focus:ring-4 focus:ring-indigo-500/30">
//         <svg style="width: 20px; height: 20px;" class="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
//         Add Stream
//       </button>
//     </div>

//     <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">

//       <!-- LEFT SIDEBAR: TREE VIEW -->
//       <div class="w-full lg:w-1/3 bg-white rounded-3xl shadow-sm border border-slate-200 p-5 flex flex-col h-[75vh]">
//         <h3 class="font-bold text-slate-800 mb-4 pb-4 border-b border-slate-100 flex items-center">
//           <svg style="width: 20px; height: 20px;" class="mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
//           Hierarchy Overview
//         </h3>

//         <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-1">
          
//           @if (streams().length === 0) {
//             <div class="text-center py-10 text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded-xl">
//               No data found. Add a stream to begin.
//             </div>
//           }

//           @for (stream of streams(); track stream.id) {
//             <!-- LEVEL 1: STREAM -->
//             <div class="relative">
//               <div 
//                 class="flex items-center p-2 rounded-xl cursor-pointer transition-colors group z-10 relative"
//                 [ngClass]="selectedEntity()?.id === stream.id && selectedLevel() === 'Stream' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700 font-medium'"
//                 (click)="selectNode('Stream', stream)"
//               >
//                 <!-- Expand/Collapse Button -->
//                 <button 
//                   (click)="toggleNode(stream.id); $event.stopPropagation()" 
//                   class="p-1 mr-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
//                 >
//                   <svg style="width: 12px; height: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" [class.-rotate-90]="!isExpanded(stream.id)" class="transition-transform duration-200">
//                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
//                   </svg>
//                 </button>
//                 <div class="w-2 h-2 rounded-full bg-indigo-500 mr-2 shadow-sm"></div>
//                 <span class="truncate flex-1">{{ stream.name }}</span>
//               </div>

//               <!-- LEVEL 2: SUBJECTS -->
//               @if (isExpanded(stream.id) && stream.subjects) {
//                 <div class="ml-6 mt-1 relative space-y-1">
//                   <div class="tree-line"></div> <!-- Connecting Line -->
                  
//                   @for (subject of stream.subjects; track subject.id) {
//                     <div class="relative">
//                       <div 
//                         class="flex items-center p-2 rounded-xl cursor-pointer transition-colors group z-10 relative"
//                         [ngClass]="selectedEntity()?.id === subject.id && selectedLevel() === 'Subject' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-700 font-medium'"
//                         (click)="selectNode('Subject', subject)"
//                       >
//                         <button 
//                           (click)="toggleNode(subject.id); $event.stopPropagation()" 
//                           class="p-1 mr-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
//                         >
//                           <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" [class.-rotate-90]="!isExpanded(subject.id)" class="transition-transform duration-200">
//                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
//                           </svg>
//                         </button>
//                         <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-sm"></div>
//                         <span class="truncate flex-1 text-sm">{{ subject.name }}</span>
//                       </div>

//                       <!-- LEVEL 3: TOPICS -->
//                       @if (isExpanded(subject.id) && subject.topics) {
//                         <div class="ml-6 mt-1 relative space-y-1">
//                           <div class="tree-line"></div> <!-- Connecting Line -->

//                           @for (topic of subject.topics; track topic.id) {
//                             <div class="relative">
//                               <div 
//                                 class="flex items-center p-1.5 rounded-xl cursor-pointer transition-colors group z-10 relative"
//                                 [ngClass]="selectedEntity()?.id === topic.id && selectedLevel() === 'Topic' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-600 font-medium'"
//                                 (click)="selectNode('Topic', topic)"
//                               >
//                                 <button 
//                                   (click)="toggleNode(topic.id); $event.stopPropagation()" 
//                                   class="p-1 mr-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
//                                 >
//                                   <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" [class.-rotate-90]="!isExpanded(topic.id)" class="transition-transform duration-200">
//                                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
//                                   </svg>
//                                 </button>
//                                 <div class="w-1 h-1 rounded-full bg-blue-500 mr-2 shadow-sm"></div>
//                                 <span class="truncate flex-1 text-sm">{{ topic.name }}</span>
//                               </div>

//                               <!-- LEVEL 4: SUBTOPICS -->
//                               @if (isExpanded(topic.id) && topic.subTopics) {
//                                 <div class="ml-7 mt-1 relative space-y-1 pb-1">
//                                   <div class="tree-line !top-2 !bottom-2 !left-[7px] !bg-slate-200 w-[1px]"></div> <!-- Micro Line -->
                                  
//                                   @for (sub of topic.subTopics; track sub.id) {
//                                     <div 
//                                       class="flex items-right py-1.5 px-2 rounded-lg cursor-pointer transition-colors z-10 relative ml-2"
//                                       [ngClass]="selectedEntity()?.id === sub.id && selectedLevel() === 'SubTopic' ? 'bg-amber-50 text-amber-700 font-bold' : 'hover:bg-slate-50 text-slate-500 font-medium'"
//                                       (click)="selectNode('SubTopic', sub)"
//                                     >
//                                       <div class="w-1 h-1 rounded-full bg-amber-400 mr-2 opacity-50"></div>
//                                       <span class="truncate flex-1 text-xs">{{ sub.name }}</span>
//                                     </div>
//                                   }
//                                 </div>
//                               }
//                             </div>
//                           }
//                         </div>
//                       }
//                     </div>
//                   }
//                 </div>
//               }
//             </div>
//           }
//         </div>
//       </div>

//       <!-- RIGHT WORKSPACE: DETAILS & FORMS -->
//       <div class="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 h-fit lg:h-[75vh] overflow-y-auto custom-scrollbar">

//         <!-- EMPTY STATE (No Selection, No Form) -->
//         @if (!selectedEntity() && !showForm()) {
//           <div class="flex flex-col items-center justify-center h-full text-slate-400 opacity-60 mt-10 lg:mt-0">
//             <svg style="width: 80px; height: 80px;" class="mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
//             <h2 class="text-xl font-bold text-slate-600">No Item Selected</h2>
//             <p class="text-sm mt-1">Select an item from the hierarchy tree to view details or add new items.</p>
//           </div>
//         }

//         <!-- DETAILS VIEW -->
//         @if (selectedEntity() && !showForm()) {
//           <div class="animate-fade-in">
//             <div class="inline-block px-3 py-1 mb-4 rounded-lg text-xs font-bold uppercase tracking-wider"
//               [ngClass]="{
//                 'bg-indigo-100 text-indigo-700': selectedLevel() === 'Stream',
//                 'bg-emerald-100 text-emerald-700': selectedLevel() === 'Subject',
//                 'bg-blue-100 text-blue-700': selectedLevel() === 'Topic',
//                 'bg-amber-100 text-amber-700': selectedLevel() === 'SubTopic'
//               }">
//               {{ selectedLevel() }} Level
//             </div>

//             <h2 class="text-3xl font-extrabold text-slate-900 mb-2">
//               {{ selectedEntity()?.name }}
//             </h2>
            
//             <p class="text-slate-500 mb-8 pb-8 border-b border-slate-100">
//               Unique ID: <span class="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{{ selectedEntity()?.id }}</span>
//             </p>

//             <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Available Actions</h3>
            
//             <div class="flex flex-wrap gap-3">
//               <!-- Edit Button -->
//               <button
//                 (click)="startEdit(selectedLevel()!, selectedEntity())"
//                 class="inline-flex items-center bg-white border-2 border-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all">
//                 <svg style="width: 18px; height: 18px;" class="mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
//                 Edit {{ selectedLevel() }}
//               </button>

//               <!-- Add Child Button (Not applicable for SubTopic) -->
//               @if (selectedLevel() !== 'SubTopic') {
//                 <button
//                   (click)="addChildFromSelection()"
//                   class="inline-flex items-center bg-indigo-50 border-2 border-indigo-100 text-indigo-700 font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-100 transition-all">
//                   <svg style="width: 18px; height: 18px;" class="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
//                   Add {{ getChildTypeName(selectedLevel()!) }}
//                 </button>
//               }

//               <!-- Delete Button -->
//               <button
//                 (click)="deleteItem(selectedLevel()!, selectedEntity()?.id)"
//                 class="inline-flex items-center bg-rose-50 border-2 border-rose-100 text-rose-700 font-bold px-5 py-2.5 rounded-xl hover:bg-rose-100 transition-all ml-auto">
//                 <svg style="width: 18px; height: 18px;" class="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
//                 Delete
//               </button>
//             </div>
//           </div>
//         }

//         <!-- CREATE / EDIT FORM -->
//         @if (showForm()) {
//           <div class="animate-fade-in">
            
//             <button (click)="cancelForm()" class="text-slate-400 hover:text-slate-600 mb-6 flex items-center text-sm font-medium transition-colors">
//               <svg style="width: 16px; height: 16px;" class="mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
//               Back to details
//             </button>

//             <h2 class="text-2xl font-extrabold text-slate-900 mb-6 flex items-center">
//               <span class="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">
//                 <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
//               </span>
//               {{ editingItem() ? 'Edit' : 'Create' }} {{ createFormType() }}
//             </h2>

//             <form [formGroup]="academicForm" (ngSubmit)="submitForm()">
              
//               <div class="mb-6">
//                 <label class="block text-sm font-bold text-slate-700 mb-2">{{ createFormType() }} Name</label>
//                 <input 
//                   formControlName="name"
//                   type="text"
//                   placeholder="Enter {{ createFormType().toLowerCase() }} name..."
//                   class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 font-medium outline-none"
//                 />
//               </div>

//               <!-- Parent ID Tracking (Hidden but active in form state) -->
//               <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-8 space-y-2">
//                 <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hierarchy Linkage (Auto-filled)</p>
//                 @if (academicForm.get('streamId')?.value) {
//                   <p class="text-sm text-slate-600"><span class="font-medium text-slate-400 w-24 inline-block">Stream ID:</span> {{ academicForm.get('streamId')?.value }}</p>
//                 }
//                 @if (academicForm.get('subjectId')?.value) {
//                   <p class="text-sm text-slate-600"><span class="font-medium text-slate-400 w-24 inline-block">Subject ID:</span> {{ academicForm.get('subjectId')?.value }}</p>
//                 }
//                 @if (academicForm.get('topicId')?.value) {
//                   <p class="text-sm text-slate-600"><span class="font-medium text-slate-400 w-24 inline-block">Topic ID:</span> {{ academicForm.get('topicId')?.value }}</p>
//                 }
//                 @if (!academicForm.get('streamId')?.value && !academicForm.get('subjectId')?.value && !academicForm.get('topicId')?.value) {
//                   <p class="text-sm text-slate-500 italic">Top-level Stream (No parent dependencies)</p>
//                 }
//               </div>

//               <div class="flex gap-3">
//                 <button 
//                   type="submit"
//                   [disabled]="academicForm.invalid"
//                   class="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
//                   {{ editingItem() ? 'Save Changes' : 'Create ' + createFormType() }}
//                 </button>

//                 <button 
//                   type="button"
//                   (click)="cancelForm()"
//                   class="bg-white border-2 border-slate-200 text-slate-600 font-bold px-6 py-3 rounded-xl hover:bg-slate-50 transition-all">
//                   Cancel
//                 </button>
//               </div>

//             </form>
//           </div>
//         }

//       </div>
//     </div>
    
//     <style>
//       @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
//       .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
//     </style>
//   </div>
//   `
// })
// export class AcademicManagementComponent implements OnInit {

//   private http = inject(HttpClient);
//   private fb = inject(FormBuilder);
//   private readonly API_URL = 'http://localhost:5222/api';

//   streams = signal<AcademicStream[]>([]);
  
//   // Selection State
//   selectedLevel = signal<SelectedLevel | null>(null);
//   selectedEntity = signal<any>(null);

//   // Form State
//   showForm = signal(false);
//   createFormType = signal<FormItemType>('Stream');
//   editingItem = signal<any>(null);
  
//   // Tree Expansion State (Set of Node IDs)
//   expandedNodes = signal<Set<string>>(new Set());

//   academicForm = this.fb.group({
//     name: ['', Validators.required],
//     streamId: [''],
//     subjectId: [''],
//     topicId: ['']
//   });

//   ngOnInit() {
//     this.loadStreams();
//   }

//   // --- TREE LOGIC ---
//   toggleNode(id: string) {
//     const set = new Set(this.expandedNodes());
//     set.has(id) ? set.delete(id) : set.add(id);
//     this.expandedNodes.set(set);
//   }

//   isExpanded(id: string) {
//     return this.expandedNodes().has(id);
//   }

//   selectNode(level: SelectedLevel, entity: any) {
//     this.selectedLevel.set(level);
//     this.selectedEntity.set(entity);
//     this.showForm.set(false); // Close form if clicking a node
//   }

//   // --- API LOGIC ---
//   loadStreams() {
//     this.http.get<AcademicStream[]>(`${this.API_URL}/academic/streams`)
//       .pipe(
//         catchError(() => {
//           // Fallback Data for UI testing if backend is unreachable
//           const mockData: AcademicStream[] = [
//             { id: 'str-1', name: 'Engineering', subjects: [
//               { id: 'sub-1', name: 'Mathematics', streamId: 'str-1', topics: [
//                 { id: 'top-1', name: 'Calculus', subjectId: 'sub-1', subTopics: [
//                   { id: 'subtop-1', name: 'Derivatives', topicId: 'top-1' }
//                 ]}
//               ]}
//             ]},
//             { id: 'str-2', name: 'Medical', subjects: [] }
//           ];
//           return of(mockData);
//         })
//       )
//       .subscribe(data => this.streams.set(data));
//   }

//   // --- FORM LOGIC ---
//   startCreate(type: FormItemType) {
//     this.createFormType.set(type);
//     this.editingItem.set(null);
//     this.academicForm.reset();
//     this.showForm.set(true);
//     this.selectedEntity.set(null); // Deselect entity when creating top-level
//   }

//   startEdit(type: FormItemType, item: any) {
//     this.createFormType.set(type);
//     this.editingItem.set(item);
    
//     // Patch all relevant data so it can be saved back
//     const patchData: any = { name: item.name };
//     if (type === 'Subject') patchData.streamId = item.streamId;
//     if (type === 'Topic') { patchData.streamId = item.streamId; patchData.subjectId = item.subjectId; }
//     if (type === 'SubTopic') { patchData.streamId = item.streamId; patchData.subjectId = item.subjectId; patchData.topicId = item.topicId; }
    
//     this.academicForm.patchValue(patchData);
//     this.showForm.set(true);
//   }

//   addChildFromSelection() {
//     const level = this.selectedLevel();
//     const entity = this.selectedEntity();
//     if (!level || !entity) return;

//     this.academicForm.reset();
//     const patchData: any = {};

//     if (level === 'Stream') {
//       this.createFormType.set('Subject');
//       patchData.streamId = entity.id;
//     }
//     else if (level === 'Subject') {
//       this.createFormType.set('Topic');
//       patchData.streamId = entity.streamId;
//       patchData.subjectId = entity.id;
//     }
//     else if (level === 'Topic') {
//       this.createFormType.set('SubTopic');
//       patchData.streamId = entity.streamId;
//       patchData.subjectId = entity.subjectId;
//       patchData.topicId = entity.id;
//     }

//     this.academicForm.patchValue(patchData);
//     this.editingItem.set(null);
//     this.showForm.set(true);
    
//     // Auto-expand the node so the user sees the new item when saved
//     if (!this.isExpanded(entity.id)) {
//       this.toggleNode(entity.id);
//     }
//   }

//   cancelForm() {
//     this.showForm.set(false);
//     this.editingItem.set(null);
//     this.academicForm.reset();
//   }

//   submitForm() {
//     if (this.academicForm.invalid) return;

//     const type = this.createFormType();
//     const editing = this.editingItem();
//     const formValue = this.academicForm.value;

//     let payload: any = { name: formValue.name };

//     // Attach necessary hierarchy IDs based on type
//     if (type === 'Subject') {
//       payload.streamId = formValue.streamId;
//     }
//     if (type === 'Topic') {
//       payload.streamId = formValue.streamId;
//       payload.subjectId = formValue.subjectId;
//     }
//     if (type === 'SubTopic') {
//       payload.streamId = formValue.streamId;
//       payload.subjectId = formValue.subjectId;
//       payload.topicId = formValue.topicId;
//     }

//     const url = `${this.API_URL}/academic/${type.toLowerCase()}s`;

//     const request$ = editing 
//       ? this.http.put(`${url}/${editing.id}`, payload)
//       : this.http.post(url, payload);

//     request$.subscribe({
//       next: () => {
//         this.loadStreams();
//         this.cancelForm();
//       },
//       error: (err) => {
//         console.error(`Error saving ${type}`, err);
//         // Fallback for UI Demo: close form anyway
//         this.loadStreams();
//         this.cancelForm();
//       }
//     });
//   }

//   deleteItem(type: string, id: string) {
//     if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;

//     const url = `${this.API_URL}/academic/${type.toLowerCase()}s/${id}`;
//     this.http.delete(url).subscribe({
//       next: () => {
//         this.loadStreams();
//         this.selectedEntity.set(null);
//         this.selectedLevel.set(null);
//       },
//       error: (err) => {
//         console.error(`Error deleting ${type}`, err);
//         alert('Failed to delete item. Check console.');
//       }
//     });
//   }

//   // Helper for button text
//   getChildTypeName(currentLevel: SelectedLevel): string {
//     if (currentLevel === 'Stream') return 'Subject';
//     if (currentLevel === 'Subject') return 'Topic';
//     if (currentLevel === 'Topic') return 'SubTopic';
//     return '';
//   }
// }


//new and claude
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface AcademicStream {
  id: string;
  name: string;
  subjects: Subject[];
}

interface Subject {
  id: string;
  name: string;
  streamId: string;
  topics: Topic[];
}

interface Topic {
  id: string;
  name: string;
  subjectId: string;
  subTopics: SubTopic[];
}

interface SubTopic {
  id: string;
  name: string;
  topicId: string;
}

type FormItemType = 'Stream' | 'Subject' | 'Topic' | 'SubTopic';
type SelectedLevel = 'Stream' | 'Subject' | 'Topic' | 'SubTopic';

@Component({
  selector: 'app-academic-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    :host { display: block; background-color: #faf7f2; }

    /* Scrollbar */
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #ddd5c8; border-radius: 20px; }

    /* Tree connector lines */
    .tree-children {
      position: relative;
      margin-left: 14px;
      padding-left: 14px;
      border-left: 2px solid #e5ddd4;
    }
    .tree-branch { position: relative; }
    .tree-branch::before {
      content: '';
      position: absolute;
      left: -14px;
      top: 50%;
      width: 12px;
      height: 2px;
      background-color: #e5ddd4;
    }

    /* Animations */
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(5px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-in { animation: fadeSlideIn 0.22s ease-out forwards; }

    @keyframes treeOpen {
      from { opacity: 0; transform: translateY(-3px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .tree-animate { animation: treeOpen 0.18s ease-out forwards; }

    /* Form input */
    .form-input {
      width: 100%;
      padding: 0.7rem 1rem;
      background: #fdf9f4;
      border: 1.5px solid #e5ddd4;
      border-radius: 0.75rem;
      font-weight: 500;
      color: #2d2a25;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      font-size: 0.875rem;
    }
    .form-input:focus {
      border-color: #5b4fcf;
      box-shadow: 0 0 0 3px rgba(91, 79, 207, 0.1);
      background: #fff;
    }

    /* Active node highlight per level */
    .node-active-stream   { background: #ede8ff !important; color: #4c3d9e !important; font-weight: 700; }
    .node-active-subject  { background: #d6f5e8 !important; color: #166044 !important; font-weight: 700; }
    .node-active-topic    { background: #dceeff !important; color: #1a4d7a !important; font-weight: 700; }
    .node-active-subtopic { background: #fff0d6 !important; color: #8a5a00 !important; font-weight: 700; }

    /* Level badges */
    .badge-stream   { background: #ede8ff; color: #4c3d9e; }
    .badge-subject  { background: #d6f5e8; color: #166044; }
    .badge-topic    { background: #dceeff; color: #1a4d7a; }
    .badge-subtopic { background: #fff0d6; color: #8a5a00; }

    /* Warm card */
    .card { background: #fffcf8; border: 1px solid #ede5db; }

    /* Node hover */
    .node-row { transition: background 0.12s; }
    .node-row:hover { background: #f5ede1; }
  `],
  template: `
  <div class="min-h-screen p-4 sm:p-6 lg:p-8 font-sans" style="background:#faf7f2;">

    <!-- ── HEADER ── -->
    <div class="max-w-7xl mx-auto mb-5 card px-5 py-4 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <h1 class="text-xl font-extrabold tracking-tight" style="color:#2d2a25;">Academic Structure</h1>
        <p class="text-xs font-medium mt-0.5" style="color:#9c8f80;">Manage streams, subjects, topics &amp; subtopics</p>
      </div>

      <!-- Header buttons -->
      <div class="flex items-center gap-2 flex-wrap">

        <!-- Contextual "Add Child" appears when a non-leaf node is selected -->
        <button
          (click)="startCreate('Stream')"
          class="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all hover:-translate-y-px"
          style="background:#5b4fcf; color:#fff; box-shadow:0 4px 12px rgba(91,79,207,0.25);">
          <svg style="width:13px;height:13px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
          New Stream
        </button>
        @if (selectedEntity() && selectedLevel() !== 'SubTopic' && !showForm()) {
          <button
            (click)="addChildFromSelection()"
            class="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl border-2 transition-all hover:-translate-y-px"
            style="background:#f0f7ff; border-color:#c5daf5; color:#1a4d7a;">
            <svg style="width:13px;height:13px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            Add {{ getChildTypeName(selectedLevel()!) }}
          </button>
        }
      </div>
    </div>

    <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-5">

      <!-- ── LEFT SIDEBAR: TREE ── -->
      <div class="w-full lg:w-80 xl:w-96 card rounded-2xl shadow-sm flex flex-col" style="height:78vh;">

        <!-- Sidebar header -->
        <div class="px-4 py-3 flex items-center justify-between flex-shrink-0" style="border-bottom:1px solid #ede5db;">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" style="background:#5b4fcf;"></span>
            <span class="text-xs font-bold" style="color:#6b5e4e;">Hierarchy</span>
          </div>
          <span class="text-xs font-semibold tabular-nums" style="color:#b3a89a;">
            {{ streams().length }} stream{{ streams().length !== 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Tree body -->
        <div class="flex-1 overflow-y-auto custom-scrollbar px-3 py-2.5 space-y-0.5">

          @if (streams().length === 0) {
            <div class="flex flex-col items-center justify-center h-36 text-center px-4" style="color:#c4b9aa;">
              <svg style="width:28px;height:28px;opacity:0.4;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
              <p class="text-xs font-medium mt-2">No streams yet</p>
            </div>
          }

          @for (stream of streams(); track stream.id) {

            <!-- LEVEL 1 — STREAM -->
            <div>
              <div
                class="node-row flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer"
                [class]="selectedEntity()?.id === stream.id && selectedLevel() === 'Stream' ? 'node-active-stream' : ''"
                style="color:#3d3530;"
                (click)="selectAndExpand('Stream', stream, stream.id)"
              >
                <span class="flex-shrink-0 w-5 h-5 flex items-center justify-center" style="color:#b3a89a;">
                  <svg style="width:10px;height:10px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    class="transition-transform duration-200"
                    [class.-rotate-90]="!isExpanded(stream.id)">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                  </svg>
                </span>
                <span class="flex-shrink-0 w-2 h-2 rounded-full" style="background:#5b4fcf;"></span>
                <span class="truncate text-sm font-medium">{{ stream.name }}</span>
              </div>

              <!-- LEVEL 2 — SUBJECTS -->
              @if (isExpanded(stream.id) && stream.subjects && stream.subjects.length) {
                <div class="tree-children tree-animate mt-0.5 mb-1 space-y-0.5">
                  @for (subject of stream.subjects; track subject.id) {
                    <div class="tree-branch">
                      <div
                        class="node-row flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer"
                        [class]="selectedEntity()?.id === subject.id && selectedLevel() === 'Subject' ? 'node-active-subject' : ''"
                        style="color:#3d3530;"
                        (click)="selectAndExpand('Subject', subject, subject.id)"
                      >
                        <span class="flex-shrink-0 w-5 h-5 flex items-center justify-center" style="color:#b3a89a;">
                          <svg style="width:9px;height:9px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            class="transition-transform duration-200"
                            [class.-rotate-90]="!isExpanded(subject.id)">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                          </svg>
                        </span>
                        <span class="flex-shrink-0 w-1.5 h-1.5 rounded-full" style="background:#16a34a;"></span>
                        <span class="truncate text-sm">{{ subject.name }}</span>
                      </div>

                      <!-- LEVEL 3 — TOPICS -->
                      @if (isExpanded(subject.id) && subject.topics?.length) {
                        <div class="tree-children tree-animate mt-0.5 mb-1 space-y-0.5">
                          @for (topic of subject.topics; track topic.id) {
                            <div class="tree-branch">
                              <div
                                class="node-row flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer"
                                [class]="selectedEntity()?.id === topic.id && selectedLevel() === 'Topic' ? 'node-active-topic' : ''"
                                style="color:#3d3530;"
                                (click)="selectAndExpand('Topic', topic, topic.id)"
                              >
                                <span class="flex-shrink-0 w-5 h-5 flex items-center justify-center" style="color:#b3a89a;">
                                  <svg style="width:8px;height:8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    class="transition-transform duration-200"
                                    [class.-rotate-90]="!isExpanded(topic.id)">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                                  </svg>
                                </span>
                                <span class="flex-shrink-0 w-1.5 h-1.5 rounded-full" style="background:#2563eb;"></span>
                                <span class="truncate text-xs">{{ topic.name }}</span>
                              </div>

                              <!-- LEVEL 4 — SUBTOPICS -->
                              @if (isExpanded(topic.id) && topic.subTopics?.length) {
                                <div class="tree-children tree-animate mt-0.5 mb-1 space-y-0.5">
                                  @for (sub of topic.subTopics; track sub.id) {
                                    <div
                                      class="tree-branch node-row flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer"
                                      [class]="selectedEntity()?.id === sub.id && selectedLevel() === 'SubTopic' ? 'node-active-subtopic' : ''"
                                      style="color:#5a5048;"
                                      (click)="selectNode('SubTopic', sub)"
                                    >
                                      <span class="flex-shrink-0 w-1.5 h-1.5 rounded-full ml-5" style="background:#d97706;opacity:0.7;"></span>
                                      <span class="truncate text-xs">{{ sub.name }}</span>
                                    </div>
                                  }
                                </div>
                              }

                            </div>
                          }
                        </div>
                      }

                    </div>
                  }
                </div>
              }

            </div>
          }

        </div>
      </div>

      <!-- ── RIGHT WORKSPACE ── -->
      <div class="flex-1 card rounded-2xl shadow-sm overflow-y-auto custom-scrollbar" style="height:78vh;">

        <!-- Empty State -->
        @if (!selectedEntity() && !showForm()) {
          <div class="flex flex-col items-center justify-center h-full text-center px-8">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style="background:#f0ebe3;">
              <svg style="width:24px;height:24px;" class="" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color:#c4b9aa;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h2 class="text-sm font-bold mb-1" style="color:#6b5e4e;">Nothing selected</h2>
            <p class="text-xs max-w-xs" style="color:#b3a89a;">Click any item in the tree to view details, edit, or add children.</p>
          </div>
        }

        <!-- Details View -->
        @if (selectedEntity() && !showForm()) {
          <div class="p-6 sm:p-8 animate-in">

            <div class="mb-5">
              <span
                class="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider mb-2"
                [class]="'badge-' + selectedLevel()!.toLowerCase()">
                {{ selectedLevel() }}
              </span>
              <h2 class="text-2xl font-extrabold tracking-tight" style="color:#2d2a25;">{{ selectedEntity()?.name }}</h2>
            </div>

            <div style="border-top:1px solid #ede5db;" class="mb-5"></div>

            <p class="text-[11px] font-bold uppercase tracking-widest mb-3" style="color:#b3a89a;">Actions</p>
            <div class="flex flex-wrap gap-2.5">

              <button
                (click)="startEdit(selectedLevel()!, selectedEntity())"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border-2 transition-all"
                style="background:#fffcf8; border-color:#ede5db; color:#4a4038;">
                <svg style="width:14px;height:14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                </svg>
                Edit
              </button>

              @if (selectedLevel() !== 'SubTopic') {
                <button
                  (click)="addChildFromSelection()"
                  class="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all"
                  style="background:#5b4fcf; color:#fff; box-shadow:0 3px 10px rgba(91,79,207,0.2);">
                  <svg style="width:14px;height:14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                  </svg>
                  Add {{ getChildTypeName(selectedLevel()!) }}
                </button>
              }

              <button
                (click)="deleteItem(selectedLevel()!, selectedEntity()?.id)"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border-2 transition-all ml-auto"
                style="background:#fff8f8; border-color:#fdd; color:#c0392b;">
                <svg style="width:14px;height:14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete
              </button>
            </div>
          </div>
        }

        <!-- Create / Edit Form -->
        @if (showForm()) {
          <div class="p-6 sm:p-8 animate-in">

            <button
              (click)="cancelForm()"
              class="inline-flex items-center gap-1.5 text-xs font-semibold mb-5 transition-colors"
              style="color:#b3a89a;">
              <svg style="width:13px;height:13px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Back
            </button>

            <h2 class="text-xl font-extrabold mb-5" style="color:#2d2a25;">
              {{ editingItem() ? 'Edit' : 'New' }}
              <span style="color:#5b4fcf;">{{ createFormType() }}</span>
            </h2>

            <form [formGroup]="academicForm" (ngSubmit)="submitForm()">

              <div class="mb-5">
                <label class="block text-xs font-bold mb-1.5" style="color:#6b5e4e;">Name</label>
                <input
                  formControlName="name"
                  type="text"
                  [placeholder]="'Enter ' + createFormType().toLowerCase() + ' name...'"
                  class="form-input"
                />
              </div>

              <!-- Parent breadcrumb (readable names, no raw IDs) -->
              @if (parentLabelChain().length > 0) {
                <div class="mb-5 px-4 py-3 rounded-xl" style="background:#f5f0e8; border:1px solid #ede5db;">
                  <p class="text-[11px] font-bold uppercase tracking-wider mb-2" style="color:#b3a89a;">Adding under</p>
                  <div class="flex items-center gap-2 flex-wrap">
                    @for (label of parentLabelChain(); track label.level; let last = $last) {
                      <span class="text-xs font-bold px-2 py-0.5 rounded-md" [class]="'badge-' + label.level.toLowerCase()">
                        {{ label.name }}
                      </span>
                      @if (!last) {
                        <svg style="width:10px;height:10px;color:#c4b9aa;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                      }
                    }
                  </div>
                </div>
              }

              <div class="flex gap-2.5">
                <button
                  type="submit"
                  [disabled]="academicForm.invalid"
                  class="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style="background:#5b4fcf; color:#fff; box-shadow:0 3px 10px rgba(91,79,207,0.2);">
                  <svg style="width:13px;height:13px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ editingItem() ? 'Save Changes' : 'Create ' + createFormType() }}
                </button>
                <button
                  type="button"
                  (click)="cancelForm()"
                  class="px-5 py-2.5 text-sm font-bold rounded-xl border-2 transition-all"
                  style="background:#fffcf8; border-color:#ede5db; color:#6b5e4e;">
                  Cancel
                </button>
              </div>

            </form>
          </div>
        }

      </div>
    </div>

  </div>
  `
})
export class AcademicManagementComponent implements OnInit {

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private readonly API_URL = 'http://localhost:5222/api';

  streams = signal<AcademicStream[]>([]);
  selectedLevel = signal<SelectedLevel | null>(null);
  selectedEntity = signal<any>(null);
  showForm = signal(false);
  createFormType = signal<FormItemType>('Stream');
  editingItem = signal<any>(null);

  /**
   * Accordion: tracks which single node is open at each depth level.
   * Expanding a stream collapses any open subject/topic beneath it.
   */
  expandedAtDepth = signal<Record<string, string | null>>({
    stream: null,
    subject: null,
    topic: null
  });

  // Human-readable parent chain shown in the form (no raw IDs)
  parentLabelChain = signal<{ level: string; name: string }[]>([]);

  academicForm = this.fb.group({
    name: ['', Validators.required],
    streamId: [''],
    subjectId: [''],
    topicId: ['']
  });

  ngOnInit() {
    this.loadStreams();
  }

  // ── TREE LOGIC ──

  selectAndExpand(level: SelectedLevel, entity: any, nodeId: string) {
    this.selectNode(level, entity);

    const depthKey = level.toLowerCase() as 'stream' | 'subject' | 'topic';
    const current = this.expandedAtDepth();
    const isOpen = current[depthKey] === nodeId;

    const updated = { ...current };

    if (isOpen) {
      // Collapse this and all children below
      updated[depthKey] = null;
      if (depthKey === 'stream') { updated['subject'] = null; updated['topic'] = null; }
      if (depthKey === 'subject') { updated['topic'] = null; }
    } else {
      // Open this, collapse siblings and children
      updated[depthKey] = nodeId;
      if (depthKey === 'stream') { updated['subject'] = null; updated['topic'] = null; }
      if (depthKey === 'subject') { updated['topic'] = null; }
    }

    this.expandedAtDepth.set(updated);
  }

  isExpanded(id: string): boolean {
    return Object.values(this.expandedAtDepth()).includes(id);
  }

  selectNode(level: SelectedLevel, entity: any) {
    this.selectedLevel.set(level);
    this.selectedEntity.set(entity);
    this.showForm.set(false);
  }

  // ── API LOGIC ──
  loadStreams() {
    this.http.get<AcademicStream[]>(`${this.API_URL}/academic/streams`)
      .pipe(
        catchError(() => {
          const mockData: AcademicStream[] = [
            { id: 'str-1', name: 'Engineering', subjects: [
              { id: 'sub-1', name: 'Mathematics', streamId: 'str-1', topics: [
                { id: 'top-1', name: 'Calculus', subjectId: 'sub-1', subTopics: [
                  { id: 'subtop-1', name: 'Derivatives', topicId: 'top-1' },
                  { id: 'subtop-2', name: 'Integration', topicId: 'top-1' }
                ]},
                { id: 'top-2', name: 'Algebra', subjectId: 'sub-1', subTopics: [] }
              ]},
              { id: 'sub-2', name: 'Physics', streamId: 'str-1', topics: [] }
            ]},
            { id: 'str-2', name: 'Medical', subjects: [] }
          ];
          return of(mockData);
        })
      )
      .subscribe(data => this.streams.set(data));
  }

  // ── FORM LOGIC ──
  startCreate(type: FormItemType) {
    this.createFormType.set(type);
    this.editingItem.set(null);
    this.academicForm.reset();
    this.parentLabelChain.set([]);
    this.showForm.set(true);
    this.selectedEntity.set(null);
  }

  startEdit(type: FormItemType, item: any) {
    this.createFormType.set(type);
    this.editingItem.set(item);
    const patchData: any = { name: item.name };
    if (type === 'Subject') patchData.streamId = item.streamId;
    if (type === 'Topic') { patchData.streamId = item.streamId; patchData.subjectId = item.subjectId; }
    if (type === 'SubTopic') { patchData.streamId = item.streamId; patchData.subjectId = item.subjectId; patchData.topicId = item.topicId; }
    this.academicForm.patchValue(patchData);
    this.parentLabelChain.set([]);
    this.showForm.set(true);
  }

  addChildFromSelection() {
    const level = this.selectedLevel();
    const entity = this.selectedEntity();
    if (!level || !entity) return;

    this.academicForm.reset();
    const patchData: any = {};
    const chain: { level: string; name: string }[] = [];

    if (level === 'Stream') {
      this.createFormType.set('Subject');
      patchData.streamId = entity.id;
      chain.push({ level: 'Stream', name: entity.name });
    } else if (level === 'Subject') {
      this.createFormType.set('Topic');
      patchData.streamId = entity.streamId;
      patchData.subjectId = entity.id;
      const stream = this.streams().find(s => s.id === entity.streamId);
      if (stream) chain.push({ level: 'Stream', name: stream.name });
      chain.push({ level: 'Subject', name: entity.name });
    } else if (level === 'Topic') {
      this.createFormType.set('SubTopic');
      patchData.streamId = entity.streamId;
      patchData.subjectId = entity.subjectId;
      patchData.topicId = entity.id;
      const stream = this.streams().find(s => s.id === entity.streamId);
      const subject = stream?.subjects?.find(s => s.id === entity.subjectId);
      if (stream) chain.push({ level: 'Stream', name: stream.name });
      if (subject) chain.push({ level: 'Subject', name: subject.name });
      chain.push({ level: 'Topic', name: entity.name });
    }

    this.academicForm.patchValue(patchData);
    this.parentLabelChain.set(chain);
    this.editingItem.set(null);
    this.showForm.set(true);

    // Auto-expand the parent so the new item will be visible after save
    const depthMap: Record<string, 'stream' | 'subject' | 'topic'> = {
      Stream: 'stream', Subject: 'subject', Topic: 'topic'
    };
    const depth = depthMap[level];
    if (depth && !this.isExpanded(entity.id)) {
      const updated = { ...this.expandedAtDepth() };
      updated[depth] = entity.id;
      this.expandedAtDepth.set(updated);
    }
  }

  cancelForm() {
    this.showForm.set(false);
    this.editingItem.set(null);
    this.academicForm.reset();
    this.parentLabelChain.set([]);
  }

  submitForm() {
    if (this.academicForm.invalid) return;

    const type = this.createFormType();
    const editing = this.editingItem();
    const formValue = this.academicForm.value;

    let payload: any = { name: formValue.name };
    if (type === 'Subject') payload.streamId = formValue.streamId;
    if (type === 'Topic') { payload.streamId = formValue.streamId; payload.subjectId = formValue.subjectId; }
    if (type === 'SubTopic') { payload.streamId = formValue.streamId; payload.subjectId = formValue.subjectId; payload.topicId = formValue.topicId; }

    const url = `${this.API_URL}/academic/${type.toLowerCase()}s`;
    const request$ = editing
      ? this.http.put(`${url}/${editing.id}`, payload)
      : this.http.post(url, payload);

    request$.subscribe({
      next: () => { this.loadStreams(); this.cancelForm(); },
      error: (err) => { console.error(`Error saving ${type}`, err); this.loadStreams(); this.cancelForm(); }
    });
  }

  deleteItem(type: string, id: string) {
    if (!confirm(`Are you sure you want to delete this ${type}? This cannot be undone.`)) return;
    const url = `${this.API_URL}/academic/${type.toLowerCase()}s/${id}`;
    this.http.delete(url).subscribe({
      next: () => { this.loadStreams(); this.selectedEntity.set(null); this.selectedLevel.set(null); },
      error: (err) => { console.error(`Error deleting ${type}`, err); alert('Failed to delete. Check console.'); }
    });
  }

  getChildTypeName(currentLevel: SelectedLevel): string {
    if (currentLevel === 'Stream') return 'Subject';
    if (currentLevel === 'Subject') return 'Topic';
    if (currentLevel === 'Topic') return 'SubTopic';
    return '';
  }
}