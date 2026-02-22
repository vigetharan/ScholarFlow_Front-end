import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

// ── Enums matching C# backend ───────────────────────────────────────────
export enum BloomLevel {
  Remember   = 1, Understand = 2, Apply    = 3,
  Analyze    = 4, Evaluate   = 5, Create   = 6
}
export enum ReviewStatus {
  Pending = 1, Approved = 2, NeedsRevision = 3, Rejected = 4
}

// ── Domain interfaces ────────────────────────────────────────────────────
interface SubTopic { id: string; name: string; topicId: string; }
interface Topic    { id: string; name: string; subjectId: string; subTopics: SubTopic[]; }
interface Subject  { id: string; name: string; streamId: string; topics: Topic[]; }
interface AcademicStream { id: string; name: string; subjects: Subject[]; }
interface Paper    { id: string; title: string; }

interface OptionItem { id?: string; optionText: string; isCorrect: boolean; }
interface ReviewMaterial {
  id?: string; title: string; content: string;
  resourceUrl?: string; materialType: 'Text' | 'Image' | 'Video' | 'Article';
}
interface Question {
  id: string; paperId: string; subTopicId: string;
  questionText: string; questionImageUrl?: string;
  difficulty: number; marks: number; orderIndex: number;
  tags: string[]; bloomLevel: BloomLevel; reviewStatus: ReviewStatus;
  isFlagged: boolean; flagReason?: string;
  usageCount: number; successRate: number;
  options: OptionItem[]; explanation?: string;
  reviewMaterials: ReviewMaterial[]; createdAt: Date;
  // resolved display names
  streamName?: string; subjectName?: string; topicName?: string; subTopicName?: string;
}

// ── Sentinel ID for "Others" ─────────────────────────────────────────────
const OTHERS_ID = '__others__';

@Component({
  selector: 'app-question-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700;900&family=DM+Sans:wght@400;500;600;700&display=swap');

    :host {
      display: block;
      font-family: 'DM Sans', sans-serif;
      background: #f5f1eb;
    }

    /* ── Scrollbar ── */
    .cs::-webkit-scrollbar { width: 4px; }
    .cs::-webkit-scrollbar-track { background: transparent; }
    .cs::-webkit-scrollbar-thumb { background: #d6cbbf; border-radius: 99px; }

    /* ── Page texture overlay ── */
    .page-bg {
      background-color: #f5f1eb;
      background-image:
        radial-gradient(ellipse 80% 50% at 20% -10%, rgba(91,79,207,.07) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 110%, rgba(22,160,68,.05) 0%, transparent 60%);
      min-height: 100vh;
    }

    /* ── Glass card ── */
    .glass {
      background: rgba(255,252,248,.92);
      border: 1px solid rgba(237,229,219,.8);
      backdrop-filter: blur(12px);
    }

    /* ── Header gradient strip ── */
    .header-card {
      background: linear-gradient(135deg, #2d2520 0%, #3d3028 50%, #2a2060 100%);
      border: none;
    }

    /* ── Input ── */
    .fi {
      width: 100%;
      padding: .65rem .95rem;
      background: #fdf9f5;
      border: 1.5px solid #e5ddd4;
      border-radius: .7rem;
      font-size: .84rem;
      font-weight: 500;
      color: #2d2a25;
      outline: none;
      font-family: 'DM Sans', sans-serif;
      transition: border-color .18s, box-shadow .18s, background .18s;
    }
    .fi:focus { border-color: #5b4fcf; box-shadow: 0 0 0 3px rgba(91,79,207,.12); background: #fff; }
    .fi::placeholder { color: #c4b9aa; }
    .fi:disabled { opacity: .5; cursor: not-allowed; background: #f0ebe3; }
    select.fi {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23b3a89a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right .85rem center;
      padding-right: 2.2rem;
      cursor: pointer;
    }
    textarea.fi { resize: vertical; min-height: 90px; }

    /* ── Buttons ── */
    .btn { display:inline-flex; align-items:center; gap:6px; font-family:'DM Sans',sans-serif; font-weight:700; border:none; cursor:pointer; transition:all .15s; white-space:nowrap; }
    .btn:disabled { opacity:.4; cursor:not-allowed; transform:none !important; }

    .btn-violet {
      padding:.6rem 1.25rem; font-size:.82rem;
      background: linear-gradient(135deg,#5b4fcf,#7c3aed);
      color:#fff; border-radius:.75rem;
      box-shadow: 0 4px 14px rgba(91,79,207,.35);
    }
    .btn-violet:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(91,79,207,.4); }

    .btn-outline {
      padding:.55rem 1.1rem; font-size:.82rem;
      background: rgba(255,252,248,.9); color:#4a4038;
      border: 1.5px solid #e5ddd4; border-radius:.7rem;
    }
    .btn-outline:hover:not(:disabled) { background:#f5ede1; border-color:#d5c9bb; }

    .btn-ghost-green {
      padding:.5rem .9rem; font-size:.78rem;
      background:#f0faf4; color:#166044;
      border:1.5px solid #c3e6cb; border-radius:.65rem;
    }
    .btn-ghost-green:hover { background:#dcf3e5; }

    .btn-ghost-red {
      padding:.5rem .9rem; font-size:.78rem;
      background:#fff5f5; color:#b91c1c;
      border:1.5px solid #fecaca; border-radius:.65rem;
    }
    .btn-ghost-red:hover { background:#fee2e2; }

    .btn-sm { padding:.38rem .75rem !important; font-size:.76rem !important; }

    /* ── Filter pill ── */
    .filter-pill {
      display:inline-flex; align-items:center; gap:5px;
      padding:.3rem .75rem; font-size:.75rem; font-weight:600;
      border-radius:99px; border:1.5px solid #e5ddd4;
      background:#fdf9f5; color:#6b5e4e; cursor:pointer; transition:all .15s;
    }
    .filter-pill.active { background:#ede8ff; border-color:#c4b8f5; color:#4c3d9e; }
    .filter-pill:hover { border-color:#c4b8f5; }

    /* ── Question card ── */
    .q-card {
      background: rgba(255,252,248,.95);
      border: 1px solid #ede5db;
      border-radius: 1.1rem;
      transition: box-shadow .2s, border-color .2s, transform .15s;
    }
    .q-card:hover {
      box-shadow: 0 8px 30px rgba(0,0,0,.09);
      border-color: #d0c4b4;
      transform: translateY(-1px);
    }
    .q-card.selected { border-color: #5b4fcf; box-shadow: 0 0 0 3px rgba(91,79,207,.1); }

    /* ── Badges ── */
    .badge { display:inline-flex; align-items:center; gap:3px; padding:.2rem .6rem; font-size:.7rem; font-weight:700; border-radius:99px; letter-spacing:.02em; }
    .badge-easy     { background:#dcfce7; color:#15803d; }
    .badge-medium   { background:#fef3c7; color:#92400e; }
    .badge-hard     { background:#fee2e2; color:#b91c1c; }
    .badge-pending  { background:#fef3c7; color:#92400e; }
    .badge-approved { background:#dcfce7; color:#15803d; }
    .badge-revision { background:#fff7ed; color:#c2410c; }
    .badge-rejected { background:#fee2e2; color:#b91c1c; }
    .badge-bloom    { background:#ede9fe; color:#5b21b6; }
    .badge-mark     { background:#f0f9ff; color:#0369a1; }
    .badge-flag     { background:#fff7ed; color:#b45309; }
    .badge-stream   { background:#ede8ff; color:#4c3d9e; }
    .badge-subject  { background:#d6f5e8; color:#166044; }
    .badge-topic    { background:#dceeff; color:#1a4d7a; }
    .badge-subtopic { background:#fff0d6; color:#8a5a00; }
    .badge-tag      { background:#f1f0ff; color:#5b4fcf; }

    /* ── Option row ── */
    .opt-row {
      background: #fdf9f5; border: 1.5px solid #e5ddd4;
      border-radius: .8rem; padding: .8rem 1rem;
      transition: border-color .15s, background .15s;
    }
    .opt-row.is-correct { border-color: #4ade80; background: #f0fdf4; }

    /* ── Step pill ── */
    .step-pill {
      display:flex; align-items:center; justify-content:center;
      width:28px; height:28px; border-radius:50%;
      font-size:.72rem; font-weight:800; flex-shrink:0;
      transition: all .2s;
    }
    .step-pill.done   { background:#4ade80; color:#14532d; }
    .step-pill.active { background: linear-gradient(135deg,#5b4fcf,#7c3aed); color:#fff; box-shadow:0 3px 10px rgba(91,79,207,.4); }
    .step-pill.idle   { background:#f0ebe3; color:#b3a89a; }

    /* ── Diff bar ── */
    .diff-track { height:5px; background:#f0ebe3; border-radius:99px; overflow:hidden; margin-top:6px; }
    .diff-fill  { height:100%; border-radius:99px; transition: width .3s, background .3s; }

    /* ── Section separator ── */
    .section-sep { font-size:.68rem; font-weight:800; text-transform:uppercase; letter-spacing:.1em; color:#b3a89a; display:flex; align-items:center; gap:8px; margin-bottom:.75rem; }
    .section-sep::after { content:''; flex:1; height:1px; background:#f0ebe3; }

    /* ── Animations ── */
    @keyframes fadeUp   { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
    @keyframes fadeIn   { from{opacity:0;} to{opacity:1;} }
    @keyframes slideIn  { from{opacity:0;transform:translateX(12px);} to{opacity:1;transform:translateX(0);} }
    .ani-up   { animation: fadeUp   .22s ease-out forwards; }
    .ani-in   { animation: fadeIn   .18s ease-out forwards; }
    .ani-side { animation: slideIn  .2s  ease-out forwards; }

    /* ── Stat chip ── */
    .stat-chip { background:#f5f0e8; border-radius:.6rem; padding:.5rem .75rem; text-align:center; }

    /* ── Empty state ── */
    .empty { text-align:center; padding:4rem 2rem; color:#b3a89a; }

    /* ── Form panel ── */
    .form-panel {
      background: rgba(255,252,248,.97);
      border: 1px solid #ede5db;
      border-radius: 1.25rem;
      overflow: hidden;
    }

    /* ── Breadcrumb bar ── */
    .breadcrumb-bar {
      background: linear-gradient(90deg, #f5f0e8, #fdf9f5);
      border: 1px solid #ede5db;
      border-radius: .75rem;
      padding: .6rem 1rem;
    }

    /* ── Validation warning ── */
    .val-warn { background:#fffbeb; border:1px solid #fde68a; border-radius:.65rem; padding:.6rem .9rem; font-size:.78rem; font-weight:600; color:#92400e; }
  `],
  template: `
  <div class="page-bg p-4 sm:p-6 lg:p-8">

    <!-- ══ HEADER ══════════════════════════════════════════════════════════ -->
    <div class="max-w-7xl mx-auto mb-6">
      <div class="header-card rounded-2xl px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-2 h-2 rounded-full" style="background:#a78bfa;"></div>
            <span class="text-xs font-bold uppercase tracking-widest" style="color:#9f8fcb;">Question Bank</span>
          </div>
          <h1 class="text-2xl font-black tracking-tight" style="font-family:'Fraunces',serif; color:#fff;">
            Question Management
          </h1>
          <p class="text-xs mt-1 font-medium" style="color:#9b8fa8;">
            {{ questions().length }} question{{ questions().length !== 1 ? 's' : '' }} total
            @if (isLoading()) { <span style="color:#a78bfa;"> · Loading…</span> }
          </p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          @if (questions().length > 0) {
            <button class="btn btn-outline" style="font-size:.78rem;" (click)="exportQuestions()">
              <svg style="width:13px;height:13px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Export
            </button>
          }
          <button class="btn btn-violet" (click)="openForm()">
            <svg style="width:13px;height:13px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            Add Question
          </button>
        </div>
      </div>
    </div>

    <!-- ══ BODY ═════════════════════════════════════════════════════════════ -->
    <div class="max-w-7xl mx-auto flex flex-col xl:flex-row gap-5 items-start">

      <!-- ── LEFT: LIST ──────────────────────────────────────────────────── -->
      <div class="flex-1 min-w-0 space-y-4">

        <!-- Filter bar -->
        <div class="glass rounded-2xl px-4 py-3.5 space-y-3">
          <!-- Search -->
          <div class="relative">
            <svg style="width:14px;height:14px;position:absolute;left:.85rem;top:50%;transform:translateY(-50%);color:#b3a89a;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/></svg>
            <input class="fi" style="padding-left:2.2rem;" type="text" placeholder="Search by question text or tag…" [(ngModel)]="searchQuery">
          </div>

          <!-- Filter pills -->
          <div class="flex flex-wrap gap-2">
            <!-- Difficulty pills -->
            <button class="filter-pill" [class.active]="filterDiff===''" (click)="filterDiff=''">All</button>
            <button class="filter-pill" [class.active]="filterDiff==='easy'"   (click)="filterDiff='easy'">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Easy
            </button>
            <button class="filter-pill" [class.active]="filterDiff==='medium'" (click)="filterDiff='medium'">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Medium
            </button>
            <button class="filter-pill" [class.active]="filterDiff==='hard'"   (click)="filterDiff='hard'">
              <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Hard
            </button>

            <span class="filter-pill" style="cursor:default; border-color:transparent; background:transparent; padding:0 .25rem; color:#d6cbbf;">|</span>

            <!-- Status pills -->
            <button class="filter-pill" [class.active]="filterStatus===''"  (click)="filterStatus=''">Any Status</button>
            <button class="filter-pill" [class.active]="filterStatus==='2'" (click)="filterStatus='2'">Approved</button>
            <button class="filter-pill" [class.active]="filterStatus==='1'" (click)="filterStatus='1'">Pending</button>
            <button class="filter-pill" [class.active]="filterStatus==='3'" (click)="filterStatus='3'">Needs Revision</button>
            <button class="filter-pill" [class.active]="filterStatus==='4'" (click)="filterStatus='4'">Rejected</button>
          </div>

          <!-- Count -->
          <p class="text-xs font-semibold" style="color:#b3a89a;">
            Showing <span style="color:#5b4fcf;font-weight:800;">{{ filteredQuestions().length }}</span> of {{ questions().length }} questions
          </p>
        </div>

        <!-- Loading skeleton -->
        @if (isLoading()) {
          <div class="space-y-3">
            @for (i of [1,2,3]; track i) {
              <div class="q-card p-5 ani-up" style="animation-delay:{{(i-1)*60}}ms;">
                <div class="space-y-2.5">
                  <div class="h-3 bg-amber-100 rounded-full w-2/3 animate-pulse"></div>
                  <div class="h-3 bg-amber-100 rounded-full w-full animate-pulse"></div>
                  <div class="h-3 bg-amber-100 rounded-full w-1/2 animate-pulse"></div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty state -->
        @if (!isLoading() && filteredQuestions().length === 0) {
          <div class="q-card empty ani-in">
            <div class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style="background:#f5f0e8;">
              <svg style="width:28px;height:28px;color:#c4b9aa;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <p class="text-sm font-bold" style="color:#6b5e4e;">No questions yet</p>
            <p class="text-xs mt-1">Click "Add Question" to create your first one.</p>
          </div>
        }

        <!-- Question cards -->
        @if (!isLoading()) {
          @for (q of filteredQuestions(); track q.id; let idx = $index) {
            <div class="q-card p-5 ani-up" [class.selected]="selectedQId() === q.id" [style.animation-delay]="(idx * 40) + 'ms'">

              <!-- Top row: badges + actions -->
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex flex-wrap gap-1.5">
                  <span class="badge" [class]="diffBadge(q.difficulty)">
                    <span class="w-1.5 h-1.5 rounded-full" [style.background]="q.difficulty<=3?'#15803d':q.difficulty<=7?'#92400e':'#b91c1c'"></span>
                    {{ diffLabel(q.difficulty) }} · {{ q.difficulty }}/10
                  </span>
                  <span class="badge" [class]="statusBadge(q.reviewStatus)">{{ statusLabel(q.reviewStatus) }}</span>
                  <span class="badge badge-bloom">{{ bloomLabel(q.bloomLevel) }}</span>
                  <span class="badge badge-mark">{{ q.marks }} mark{{ q.marks !== 1 ? 's' : '' }}</span>
                  @if (q.isFlagged) { <span class="badge badge-flag">⚑ Flagged</span> }
                </div>
                <!-- Actions -->
                <div class="flex gap-1.5 flex-shrink-0">
                  <button class="btn btn-outline btn-sm" (click)="editQuestion(q); selectedQId.set(q.id)">
                    <svg style="width:11px;height:11px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
                    Edit
                  </button>
                  <button class="btn btn-ghost-green btn-sm" (click)="duplicateQuestion(q)">
                    <svg style="width:11px;height:11px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    Copy
                  </button>
                  <button class="btn btn-ghost-red btn-sm" (click)="deleteQuestion(q.id)">
                    <svg style="width:11px;height:11px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    Del
                  </button>
                </div>
              </div>

              <!-- Breadcrumb -->
              <div class="flex flex-wrap items-center gap-1 mb-2">
                @if (q.streamName)  { <span class="badge badge-stream">{{ q.streamName }}</span>  <svg style="width:8px;height:8px;color:#c4b9aa;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg> }
                @if (q.subjectName) { <span class="badge badge-subject">{{ q.subjectName }}</span> <svg style="width:8px;height:8px;color:#c4b9aa;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg> }
                @if (q.topicName)   { <span class="badge badge-topic">{{ q.topicName }}</span>   <svg style="width:8px;height:8px;color:#c4b9aa;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg> }
                @if (q.subTopicName){ <span class="badge badge-subtopic">{{ q.subTopicName }}</span> }
              </div>

              <!-- Question text -->
              <p class="text-sm font-semibold leading-snug mb-3" style="color:#2d2a25; font-family:'Fraunces',serif;">{{ q.questionText }}</p>

              <!-- Options -->
              <div class="space-y-1 mb-3">
                @for (opt of q.options; track opt.id; let oi = $index) {
                  <div class="flex items-center gap-2 text-xs py-1 px-2 rounded-lg transition-colors"
                    [style.background]="opt.isCorrect ? '#f0fdf4' : 'transparent'"
                    [style.color]="opt.isCorrect ? '#15803d' : '#6b5e4e'">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                      [style.background]="opt.isCorrect ? '#4ade80' : '#f0ebe3'"
                      [style.color]="opt.isCorrect ? '#fff' : '#b3a89a'">
                      {{ ['A','B','C','D','E'][oi] }}
                    </span>
                    <span [style.fontWeight]="opt.isCorrect ? '700' : '500'">{{ opt.optionText }}</span>
                    @if (opt.isCorrect) { <span class="ml-auto font-bold" style="color:#16a34a;">✓ Correct</span> }
                  </div>
                }
              </div>

              <!-- Tags + explanation toggle -->
              <div class="flex flex-wrap items-center gap-1.5">
                @for (tag of q.tags; track tag) {
                  <span class="badge badge-tag"># {{ tag }}</span>
                }
                @if (q.explanation) {
                  <span class="badge" style="background:#f5f0e8; color:#9c8f80; cursor:pointer;"
                    (click)="toggleExp(q.id)">
                    {{ expandedExp.has(q.id) ? '▲' : '▼' }} Explanation
                  </span>
                }
              </div>

              @if (q.explanation && expandedExp.has(q.id)) {
                <div class="mt-2.5 px-3 py-2.5 rounded-xl text-xs font-medium leading-relaxed ani-in"
                  style="background:#f5f0e8; color:#4a4038; border-left:3px solid #d5c9bb;">
                  {{ q.explanation }}
                </div>
              }
            </div>
          }
        }

      </div>

      <!-- ── RIGHT: FORM PANEL ───────────────────────────────────────────── -->
      @if (showForm()) {
        <div class="w-full xl:w-[460px] flex-shrink-0 ani-side">
          <div class="form-panel shadow-xl" style="max-height:88vh; overflow-y:auto;" class="cs">

            <!-- Form header -->
            <div class="px-5 py-4 flex items-center justify-between" style="background:linear-gradient(135deg,#2d2520,#2a2060); border-bottom:1px solid rgba(255,255,255,.06);">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest mb-0.5" style="color:#9f8fcb;">
                  {{ editingQuestion() ? 'Editing' : 'Creating' }}
                </p>
                <h2 class="text-base font-black" style="color:#fff; font-family:'Fraunces',serif;">
                  {{ editingQuestion() ? 'Edit Question' : 'New Question' }}
                </h2>
              </div>
              <button (click)="closeForm()" style="color:#9f8fcb; line-height:0;" class="hover:text-white transition-colors">
                <svg style="width:18px;height:18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Step indicator -->
            <div class="px-5 py-3 flex items-center gap-2" style="background:#fdf9f5; border-bottom:1px solid #ede5db;">
              @for (s of [1,2,3]; track s) {
                <div class="step-pill" [class]="currentStep()===s ? 'active' : currentStep()>s ? 'done' : 'idle'">
                  @if (currentStep() > s) { ✓ } @else { {{ s }} }
                </div>
                <div class="flex-1 text-[10px] font-bold leading-tight" [style.color]="currentStep()===s ? '#5b4fcf' : '#b3a89a'">
                  {{ ['Classification','Question & Options','Materials & Status'][s-1] }}
                </div>
                @if (s < 3) { <div style="width:1px; height:20px; background:#e5ddd4; flex-shrink:0;"></div> }
              }
            </div>

            <form [formGroup]="qForm" (ngSubmit)="saveQuestion()" class="px-5 py-5 space-y-5">

              <!-- ═══ STEP 1 ═══════════════════════════════════════════════ -->
              @if (currentStep() === 1) {
                <div class="space-y-4 ani-up">

                  <p class="section-sep">Academic Location</p>

                  <!-- Stream -->
                  <div>
                    <label class="block text-xs font-bold mb-1.5" style="color:#6b5e4e;">Stream</label>
                    <select formControlName="streamId" class="fi" (change)="onStreamChange()">
                      <option value="">Select stream…</option>
                      @for (s of streams(); track s.id) { <option [value]="s.id">{{ s.name }}</option> }
                      <option [value]="OTHERS">Others</option>
                    </select>
                  </div>

                  <!-- Subject -->
                  <div>
                    <label class="block text-xs font-bold mb-1.5" style="color:#6b5e4e;">Subject</label>
                    @if (qForm.get('streamId')?.value === OTHERS) {
                      <input type="text" formControlName="subjectOther" class="fi" placeholder="Type subject name…">
                    } @else {
                      <select formControlName="subjectId" class="fi" [attr.disabled]="!qForm.get('streamId')?.value || null" (change)="onSubjectChange()">
                        <option value="">Select subject…</option>
                        @for (s of availableSubjects(); track s.id) { <option [value]="s.id">{{ s.name }}</option> }
                        <option [value]="OTHERS">Others</option>
                      </select>
                    }
                  </div>

                  <!-- Topic -->
                  <div>
                    <label class="block text-xs font-bold mb-1.5" style="color:#6b5e4e;">Topic</label>
                    @if (qForm.get('subjectId')?.value === OTHERS || qForm.get('streamId')?.value === OTHERS) {
                      <input type="text" formControlName="topicOther" class="fi" placeholder="Type topic name…">
                    } @else {
                      <select formControlName="topicId" class="fi" [attr.disabled]="!qForm.get('subjectId')?.value || null" (change)="onTopicChange()">
                        <option value="">Select topic…</option>
                        @for (t of availableTopics(); track t.id) { <option [value]="t.id">{{ t.name }}</option> }
                        <option [value]="OTHERS">Others</option>
                      </select>
                    }
                  </div>

                  <!-- Sub-Topic -->
                  <div>
                    <label class="block text-xs font-bold mb-1.5" style="color:#6b5e4e;">Sub-Topic</label>
                    @if (qForm.get('topicId')?.value === OTHERS || qForm.get('subjectId')?.value === OTHERS || qForm.get('streamId')?.value === OTHERS) {
                      <input type="text" formControlName="subTopicOther" class="fi" placeholder="Type sub-topic name…">
                    } @else {
                      <select formControlName="subTopicId" class="fi" [attr.disabled]="!qForm.get('topicId')?.value || null">
                        <option value="">Select sub-topic…</option>
                        @for (st of availableSubTopics(); track st.id) { <option [value]="st.id">{{ st.name }}</option> }
                        <option [value]="OTHERS">Others</option>
                      </select>
                    }
                  </div>

                  <!-- Live breadcrumb preview -->
                  @if (breadcrumbPreview().length > 0) {
                    <div class="breadcrumb-bar flex flex-wrap items-center gap-1.5 ani-in">
                      @for (crumb of breadcrumbPreview(); track crumb.label; let last = $last) {
                        <span class="badge" [class]="crumb.cls">{{ crumb.label }}</span>
                        @if (!last) { <svg style="width:8px;height:8px;color:#c4b9aa;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg> }
                      }
                    </div>
                  }

                  <p class="section-sep" style="margin-top:1rem;">Metadata</p>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-bold mb-1.5" style="color:#6b5e4e;">Difficulty <span style="color:#b3a89a;font-weight:500;">(1–10)</span></label>
                      <input type="number" formControlName="difficulty" class="fi" min="1" max="10">
                      @if (difficultyValue > 0) {
                        <div class="diff-track">
                          <div class="diff-fill"
                            [style.width]="(difficultyValue / 10 * 100) + '%'"
                            [style.background]="difficultyValue <= 3 ? '#4ade80' : difficultyValue <= 7 ? '#fbbf24' : '#f87171'">
                          </div>
                        </div>
                      }
                    </div>
                    <div>
                      <label class="block text-xs font-bold mb-1.5" style="color:#6b5e4e;">Marks</label>
                      <input type="number" formControlName="marks" class="fi" min="0.5" step="0.5">
                    </div>
                    <div>
                      <label class="block text-xs font-bold mb-1.5" style="color:#6b5e4e;">Order Index</label>
                      <input type="number" formControlName="orderIndex" class="fi" min="1">
                    </div>
                    <div>
                      <label class="block text-xs font-bold mb-1.5" style="color:#6b5e4e;">Bloom's Level</label>
                      <select formControlName="bloomLevel" class="fi">
                        <option value="1">Remember</option>
                        <option value="2">Understand</option>
                        <option value="3">Apply</option>
                        <option value="4">Analyze</option>
                        <option value="5">Evaluate</option>
                        <option value="6">Create</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold mb-1.5" style="color:#6b5e4e;">Tags <span style="color:#b3a89a;font-weight:400;">(comma separated)</span></label>
                    <input type="text" formControlName="tags" class="fi" placeholder="calculus, derivatives, hard…">
                    @if (liveTagPreview().length) {
                      <div class="flex flex-wrap gap-1 mt-2 ani-in">
                        @for (t of liveTagPreview(); track t) { <span class="badge badge-tag"># {{ t }}</span> }
                      </div>
                    }
                  </div>

                  <div>
                    <label class="block text-xs font-bold mb-1.5" style="color:#6b5e4e;">Question Image URL <span style="color:#b3a89a;font-weight:400;">(optional)</span></label>
                    <input type="url" formControlName="questionImageUrl" class="fi" placeholder="https://…">
                  </div>

                </div>
              }

              <!-- ═══ STEP 2 ═══════════════════════════════════════════════ -->
              @if (currentStep() === 2) {
                <div class="space-y-4 ani-up">

                  <p class="section-sep">Question</p>
                  <textarea formControlName="questionText" class="fi" rows="4"
                    placeholder="Write the full question here. LaTeX supported e.g. \\(\\frac{d}{dx}\\)…"></textarea>

                  <!-- Options -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <p class="section-sep" style="margin:0;">Answer Options</p>
                      <div class="flex items-center gap-2">
                        <span class="text-[11px] font-semibold" style="color:#b3a89a;">{{ optArr.length }}/5</span>
                        <button type="button" class="btn btn-outline btn-sm" (click)="addOpt()" [disabled]="optArr.length >= 5">+ Add</button>
                      </div>
                    </div>

                    @if (optValidMsg()) {
                      <div class="val-warn mb-3 flex items-center gap-2">
                        <svg style="width:14px;height:14px;flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        {{ optValidMsg() }}
                      </div>
                    }

                    <div formArrayName="options" class="space-y-2">
                      @for (opt of optArr.controls; track opt; let i = $index) {
                        <div [formGroupName]="i" class="opt-row" [class.is-correct]="isOptCorrect(i)">
                          <div class="flex items-center gap-2 mb-2">
                            <label class="flex items-center gap-2 flex-1 cursor-pointer">
                              <input type="radio" name="correctOpt" [checked]="isOptCorrect(i)"
                                (change)="setCorrect(i)" class="accent-green-500 w-3.5 h-3.5 flex-shrink-0">
                              <span class="text-xs font-bold" style="color:#6b5e4e;">
                                Option {{ ['A','B','C','D','E'][i] }}
                                @if (isOptCorrect(i)) {
                                  <span class="ml-1 px-1.5 py-0.5 rounded text-[10px]" style="background:#dcfce7;color:#15803d;">✓ Correct</span>
                                }
                              </span>
                            </label>
                            <button type="button" (click)="removeOpt(i)" [disabled]="optArr.length <= 4"
                              class="text-xs font-bold transition-colors"
                              [style.color]="optArr.length > 4 ? '#f87171' : '#e5ddd4'">✕</button>
                          </div>
                          <input type="text" formControlName="optionText" class="fi"
                            [placeholder]="'Write option ' + ['A','B','C','D','E'][i] + '…'">
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Explanation -->
                  <div>
                    <p class="section-sep">Explanation <span style="text-transform:none;font-size:.72rem;font-weight:400;">(optional)</span></p>
                    <textarea formControlName="explanation" class="fi" rows="3"
                      placeholder="Why is the correct answer correct?…"></textarea>
                  </div>

                </div>
              }

              <!-- ═══ STEP 3 ═══════════════════════════════════════════════ -->
              @if (currentStep() === 3) {
                <div class="space-y-4 ani-up">

                  <p class="section-sep">Review Materials</p>

                  <button type="button" class="btn btn-outline w-full justify-center" (click)="addMat()">
                    <svg style="width:12px;height:12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
                    Attach Review Material
                  </button>

                  <div formArrayName="reviewMaterials" class="space-y-3">
                    @for (mat of matArr.controls; track mat; let i = $index) {
                      <div [formGroupName]="i" class="p-3.5 rounded-xl space-y-2.5 ani-in"
                        style="background:#f5f0e8; border:1px solid #e5ddd4;">
                        <div class="flex justify-between items-center">
                          <span class="text-xs font-bold" style="color:#6b5e4e;">Material {{ i + 1 }}</span>
                          <button type="button" class="btn btn-ghost-red btn-sm" (click)="removeMat(i)">Remove</button>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                          <input type="text" formControlName="title" class="fi" placeholder="Title…">
                          <select formControlName="materialType" class="fi">
                            <option value="Text">Text</option>
                            <option value="Image">Image</option>
                            <option value="Video">Video</option>
                            <option value="Article">Article</option>
                          </select>
                        </div>
                        <textarea formControlName="content" class="fi" rows="2" placeholder="Content or description…"></textarea>
                        <input type="url" formControlName="resourceUrl" class="fi" placeholder="Resource URL (optional)">
                      </div>
                    }
                  </div>

                  <p class="section-sep" style="margin-top:.25rem;">Quality Control</p>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-bold mb-1.5" style="color:#6b5e4e;">Review Status</label>
                      <select formControlName="reviewStatus" class="fi">
                        <option value="1">Pending Review</option>
                        <option value="2">Approved</option>
                        <option value="3">Needs Revision</option>
                        <option value="4">Rejected</option>
                      </select>
                    </div>
                    <div class="flex flex-col justify-center pt-4">
                      <label class="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" formControlName="isFlagged" class="w-4 h-4 rounded accent-amber-500">
                        <span class="text-xs font-bold" style="color:#6b5e4e;">Flag this question</span>
                      </label>
                    </div>
                  </div>

                  @if (qForm.get('isFlagged')?.value) {
                    <div class="ani-up">
                      <label class="block text-xs font-bold mb-1.5" style="color:#6b5e4e;">Flag Reason</label>
                      <input type="text" formControlName="flagReason" class="fi" placeholder="Describe the issue…">
                    </div>
                  }

                  <!-- Summary stats -->
                  <div class="grid grid-cols-3 gap-2 pt-1">
                    <div class="stat-chip">
                      <p class="text-[10px] font-bold uppercase tracking-wider mb-1" style="color:#b3a89a;">Difficulty</p>
                      <p class="text-base font-black" style="color:#2d2a25; font-family:'Fraunces',serif;">{{ difficultyValue }}<span class="text-xs font-normal">/10</span></p>
                    </div>
                    <div class="stat-chip">
                      <p class="text-[10px] font-bold uppercase tracking-wider mb-1" style="color:#b3a89a;">Marks</p>
                      <p class="text-base font-black" style="color:#2d2a25; font-family:'Fraunces',serif;">{{ qForm.get('marks')?.value }}</p>
                    </div>
                    <div class="stat-chip">
                      <p class="text-[10px] font-bold uppercase tracking-wider mb-1" style="color:#b3a89a;">Options</p>
                      <p class="text-base font-black" style="color:#2d2a25; font-family:'Fraunces',serif;">{{ optArr.length }}</p>
                    </div>
                  </div>

                </div>
              }

              <!-- ── Navigation ── -->
              <div class="flex items-center justify-between pt-4" style="border-top:1px solid #f0ebe3;">
                <div>
                  @if (currentStep() > 1) {
                    <button type="button" class="btn btn-outline" (click)="prevStep()">
                      <svg style="width:12px;height:12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                      Back
                    </button>
                  }
                </div>
                <div class="flex gap-2">
                  <button type="button" class="btn btn-outline" style="font-size:.78rem;" (click)="saveDraft()">
                    Save Draft
                  </button>
                  @if (currentStep() < 3) {
                    <button type="button" class="btn btn-violet" (click)="nextStep()" [disabled]="!canProceed()">
                      Next
                      <svg style="width:12px;height:12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  } @else {
                    <button type="submit" class="btn btn-violet" [disabled]="qForm.invalid || !!optValidMsg()">
                      <svg style="width:12px;height:12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                      {{ editingQuestion() ? 'Update' : 'Create' }}
                    </button>
                  }
                </div>
              </div>

            </form>
          </div>
        </div>
      }

    </div>
  </div>
  `
})
export class QuestionManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private fb   = inject(FormBuilder);
  private readonly API = 'http://localhost:5222/api';

  // Expose sentinel to template
  readonly OTHERS = OTHERS_ID;

  // ── State ────────────────────────────────────────────────────────────────
  streams          = signal<AcademicStream[]>([]);
  questions        = signal<Question[]>([]);
  isLoading        = signal(false);
  showForm         = signal(false);
  editingQuestion  = signal<Question | null>(null);
  currentStep      = signal(1);
  selectedQId      = signal<string | null>(null);
  expandedExp      = new Set<string>();

  // ── Filters (plain properties, used in computed) ─────────────────────────
  searchQuery  = '';
  filterDiff   = '';
  filterStatus = '';

  // ── Form ─────────────────────────────────────────────────────────────────
  qForm = this.fb.group({
    // Location (IDs or OTHERS_ID)
    streamId:      ['', Validators.required],
    subjectId:     ['', Validators.required],
    topicId:       ['', Validators.required],
    subTopicId:    ['', Validators.required],
    // "Others" free-text overrides
    subjectOther:  [''],
    topicOther:    [''],
    subTopicOther: [''],
    // Metadata
    difficulty:    [5,    [Validators.required, Validators.min(1), Validators.max(10)]],
    marks:         [1,    [Validators.required, Validators.min(0.5)]],
    orderIndex:    [1,    [Validators.required, Validators.min(1)]],
    bloomLevel:    [1,    Validators.required],
    tags:          [''],
    questionImageUrl: [''],
    // Content
    questionText:  ['',   Validators.required],
    options:       this.fb.array([
      this.mkOpt(), this.mkOpt(), this.mkOpt(), this.mkOpt()
    ]),
    explanation:   [''],
    // Materials & QC
    reviewMaterials: this.fb.array([]),
    reviewStatus:  [1,    Validators.required],
    isFlagged:     [false],
    flagReason:    ['']
  });

  get optArr() { return this.qForm.get('options')      as FormArray; }
  get matArr() { return this.qForm.get('reviewMaterials') as FormArray; }
  get difficultyValue(): number { return (this.qForm.get('difficulty')?.value as number) ?? 0; }
  isOptCorrect(i: number): boolean { return !!(this.optArr.at(i)?.get('isCorrect')?.value); }

  // ── Cascading dropdowns ───────────────────────────────────────────────────
  availableSubjects = computed(() => {
    const sid = this.qForm.get('streamId')?.value;
    if (!sid || sid === OTHERS_ID) return [];
    return this.streams().find(s => s.id === sid)?.subjects || [];
  });

  availableTopics = computed(() => {
    const tid = this.qForm.get('subjectId')?.value;
    if (!tid || tid === OTHERS_ID) return [];
    for (const st of this.streams())
      for (const su of st.subjects)
        if (su.id === tid) return su.topics;
    return [];
  });

  availableSubTopics = computed(() => {
    const tid = this.qForm.get('topicId')?.value;
    if (!tid || tid === OTHERS_ID) return [];
    for (const st of this.streams())
      for (const su of st.subjects)
        for (const t of su.topics)
          if (t.id === tid) return t.subTopics;
    return [];
  });

  // ── Live breadcrumb preview while filling form ────────────────────────────
  breadcrumbPreview = computed(() => {
    const crumbs: { label: string; cls: string }[] = [];
    const sid  = this.qForm.get('streamId')?.value;
    const subid = this.qForm.get('subjectId')?.value;
    const tid  = this.qForm.get('topicId')?.value;
    const stid = this.qForm.get('subTopicId')?.value;

    const streamName = sid === OTHERS_ID ? 'Others'
      : this.streams().find(s => s.id === sid)?.name || '';
    if (streamName) crumbs.push({ label: streamName, cls: 'badge-stream badge' });

    const subjectName = subid === OTHERS_ID ? (this.qForm.get('subjectOther')?.value || 'Others')
      : this.availableSubjects().find(s => s.id === subid)?.name || '';
    if (subjectName) crumbs.push({ label: subjectName, cls: 'badge-subject badge' });

    const topicName = tid === OTHERS_ID ? (this.qForm.get('topicOther')?.value || 'Others')
      : this.availableTopics().find(t => t.id === tid)?.name || '';
    if (topicName) crumbs.push({ label: topicName, cls: 'badge-topic badge' });

    const stName = stid === OTHERS_ID ? (this.qForm.get('subTopicOther')?.value || 'Others')
      : this.availableSubTopics().find(s => s.id === stid)?.name || '';
    if (stName) crumbs.push({ label: stName, cls: 'badge-subtopic badge' });

    return crumbs;
  });

  liveTagPreview = computed(() =>
    ((this.qForm.get('tags')?.value as string) || '')
      .split(',').map((t: string) => t.trim()).filter(Boolean)
  );

  // ── Filtered list ─────────────────────────────────────────────────────────
  filteredQuestions = computed(() => {
    let list = this.questions();
    const q = this.searchQuery.toLowerCase();
    if (q) list = list.filter(x =>
      x.questionText.toLowerCase().includes(q) ||
      x.tags.some(t => t.toLowerCase().includes(q))
    );
    if (this.filterDiff === 'easy')   list = list.filter(x => x.difficulty <= 3);
    if (this.filterDiff === 'medium') list = list.filter(x => x.difficulty >= 4 && x.difficulty <= 7);
    if (this.filterDiff === 'hard')   list = list.filter(x => x.difficulty >= 8);
    if (this.filterStatus) list = list.filter(x => String(x.reviewStatus) === this.filterStatus);
    return list;
  });

  optValidMsg = computed(() => {
    const opts = this.optArr.controls;
    const correct = opts.filter(o => o.get('isCorrect')?.value).length;
    if (opts.length < 4)   return `Add ${4 - opts.length} more option(s) — minimum 4 required`;
    if (correct === 0)     return 'Mark exactly one option as the correct answer';
    if (correct > 1)       return `Only one correct answer allowed (${correct} marked)`;
    return null;
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadStreams();
    this.loadQuestions();
  }

  // ── API calls ─────────────────────────────────────────────────────────────
  loadStreams() {
    this.http.get<AcademicStream[]>(`${this.API}/academic/streams`)
      .pipe(catchError(err => { console.error('streams', err); return of([]); }))
      .subscribe(data => this.streams.set(data));
  }

  loadQuestions() {
    this.isLoading.set(true);
    this.http.get<Question[]>(`${this.API}/questions`)
      .pipe(catchError(err => { console.error('questions', err); return of([]); }))
      .subscribe(data => { this.questions.set(data); this.isLoading.set(false); });
  }

  // ── Cascade handlers ──────────────────────────────────────────────────────
  onStreamChange() {
    this.qForm.patchValue({ subjectId: '', topicId: '', subTopicId: '', subjectOther: '', topicOther: '', subTopicOther: '' });
  }
  onSubjectChange() {
    this.qForm.patchValue({ topicId: '', subTopicId: '', topicOther: '', subTopicOther: '' });
  }
  onTopicChange() {
    this.qForm.patchValue({ subTopicId: '', subTopicOther: '' });
  }

  // ── Form helpers ──────────────────────────────────────────────────────────
  mkOpt()  { return this.fb.group({ optionText: ['', Validators.required], isCorrect: [false] }); }
  mkMat()  { return this.fb.group({ title: ['', Validators.required], content: ['', Validators.required], resourceUrl: [''], materialType: ['Text', Validators.required] }); }

  setCorrect(idx: number) {
    this.optArr.controls.forEach((c, i) => c.get('isCorrect')?.setValue(i === idx));
  }
  addOpt()  { if (this.optArr.length < 5) this.optArr.push(this.mkOpt()); }
  removeOpt(i: number) { if (this.optArr.length > 4) this.optArr.removeAt(i); }
  addMat()  { this.matArr.push(this.mkMat()); }
  removeMat(i: number) { this.matArr.removeAt(i); }

  // ── Steps ─────────────────────────────────────────────────────────────────
  canProceed(): boolean {
    if (this.currentStep() === 1) {
      const v = this.qForm.value;
      const streamOk  = !!v.streamId;
      const subjectOk = !!v.subjectId  || (v.streamId  === OTHERS_ID);
      const topicOk   = !!v.topicId    || (v.subjectId === OTHERS_ID) || (v.streamId  === OTHERS_ID);
      const stOk      = !!v.subTopicId || (v.topicId   === OTHERS_ID) || (v.subjectId === OTHERS_ID) || (v.streamId === OTHERS_ID);
      return streamOk && subjectOk && topicOk && stOk && !!v.difficulty && !!v.marks && !!v.bloomLevel;
    }
    if (this.currentStep() === 2) {
      return !!this.qForm.get('questionText')?.value?.trim() && !this.optValidMsg();
    }
    return true;
  }
  nextStep() { if (this.canProceed() && this.currentStep() < 3) this.currentStep.update(s => s + 1); }
  prevStep() { if (this.currentStep() > 1) this.currentStep.update(s => s - 1); }

  // ── Build payload ─────────────────────────────────────────────────────────
  private resolveNames(v: any) {
    const stream  = this.streams().find(s => s.id === v.streamId);
    const subject = stream?.subjects.find(s => s.id === v.subjectId);
    const topic   = subject?.topics.find(t => t.id === v.topicId);
    const subTopic = topic?.subTopics.find(s => s.id === v.subTopicId);
    return {
      streamName:   v.streamId  === OTHERS_ID ? 'Others' : stream?.name   || '',
      subjectName:  v.subjectId === OTHERS_ID ? (v.subjectOther || 'Others')  : subject?.name  || '',
      topicName:    v.topicId   === OTHERS_ID ? (v.topicOther   || 'Others')  : topic?.name    || '',
      subTopicName: v.subTopicId=== OTHERS_ID ? (v.subTopicOther|| 'Others')  : subTopic?.name || '',
    };
  }

  private buildPayload(status: ReviewStatus): any {
    const v = this.qForm.value;
    const names = this.resolveNames(v);
    return {
      paperId:         '',                               // set if paper selection is added later
      subTopicId:      v.subTopicId === OTHERS_ID ? null : v.subTopicId,
      questionText:    v.questionText,
      questionImageUrl: v.questionImageUrl || null,
      difficulty:      v.difficulty,
      marks:           v.marks,
      orderIndex:      v.orderIndex,
      bloomLevel:      Number(v.bloomLevel),
      reviewStatus:    status,
      tags:            ((v.tags as string) || '').split(',').map((t: string) => t.trim()).filter(Boolean).join(','),
      isFlagged:       v.isFlagged,
      flagReason:      v.flagReason || null,
      options:         (v.options as any[]).map(o => ({ optionText: o.optionText, isCorrect: o.isCorrect })),
      explanation:     v.explanation || null,
      reviewMaterials: (v.reviewMaterials as any[]),
      // resolved display names (for local state)
      ...names
    };
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  openForm() {
    this.editingQuestion.set(null);
    this.qForm.reset({ difficulty: 5, marks: 1, orderIndex: 1, bloomLevel: 1, reviewStatus: 1, isFlagged: false });
    while (this.optArr.length > 4) this.optArr.removeAt(4);
    this.optArr.controls.forEach(c => c.reset({ optionText: '', isCorrect: false }));
    this.matArr.clear();
    this.currentStep.set(1);
    this.showForm.set(true);
  }

  editQuestion(q: Question) {
    this.editingQuestion.set(q);

    // Resolve IDs from names (best effort via streams data)
    const stream  = this.streams().find(s => s.name === q.streamName);
    const subject = stream?.subjects.find(s => s.name === q.subjectName);
    const topic   = subject?.topics.find(t => t.name === q.topicName);
    const subTopic = topic?.subTopics.find(s => s.name === q.subTopicName);

    this.qForm.patchValue({
      streamId:    stream?.id    || OTHERS_ID,
      subjectId:   subject?.id   || OTHERS_ID,
      topicId:     topic?.id     || OTHERS_ID,
      subTopicId:  subTopic?.id  || OTHERS_ID,
      subjectOther:  !subject  ? q.subjectName  || '' : '',
      topicOther:    !topic    ? q.topicName    || '' : '',
      subTopicOther: !subTopic ? q.subTopicName || '' : '',
      difficulty:  q.difficulty, marks: q.marks, orderIndex: q.orderIndex,
      bloomLevel:  q.bloomLevel, tags: q.tags.join(', '),
      questionImageUrl: q.questionImageUrl || '',
      questionText: q.questionText, explanation: q.explanation || '',
      reviewStatus: q.reviewStatus, isFlagged: q.isFlagged, flagReason: q.flagReason || ''
    });

    // Rebuild options
    this.optArr.clear();
    q.options.forEach(o => { const g = this.mkOpt(); g.patchValue(o); this.optArr.push(g); });
    while (this.optArr.length < 4) this.optArr.push(this.mkOpt());

    // Rebuild materials
    this.matArr.clear();
    (q.reviewMaterials || []).forEach(m => { const g = this.mkMat(); g.patchValue(m); this.matArr.push(g); });

    this.currentStep.set(1);
    this.showForm.set(true);
  }

  saveQuestion() {
    if (this.qForm.invalid || this.optValidMsg()) return;
    const editing = this.editingQuestion();
    const payload = this.buildPayload(Number(this.qForm.value.reviewStatus) as ReviewStatus);

    const req$ = editing
      ? this.http.put(`${this.API}/questions/${editing.id}`, payload)
      : this.http.post(`${this.API}/questions`, payload);

    req$.pipe(catchError(err => { console.error('save question', err); return of(null); }))
      .subscribe(() => { this.loadQuestions(); this.closeForm(); });
  }

  saveDraft() {
    const payload = this.buildPayload(ReviewStatus.Pending);
    this.http.post(`${this.API}/questions`, payload)
      .pipe(catchError(err => { console.error('draft', err); return of(null); }))
      .subscribe(() => { this.loadQuestions(); this.closeForm(); });
  }

  duplicateQuestion(q: Question) {
    const payload = {
      ...q,
      id: undefined,
      questionText: q.questionText + ' (Copy)',
      reviewStatus: ReviewStatus.Pending,
      createdAt: new Date()
    };
    this.http.post(`${this.API}/questions`, payload)
      .pipe(catchError(err => { console.error('duplicate', err); return of(null); }))
      .subscribe(() => this.loadQuestions());
  }

  deleteQuestion(id: string) {
    if (!confirm('Delete this question? This cannot be undone.')) return;
    this.http.delete(`${this.API}/questions/${id}`)
      .pipe(catchError(err => { console.error('delete', err); return of(null); }))
      .subscribe(() => {
        this.questions.update(list => list.filter(q => q.id !== id));
        if (this.selectedQId() === id) this.selectedQId.set(null);
      });
  }

  closeForm() {
    this.showForm.set(false);
    this.editingQuestion.set(null);
    this.currentStep.set(1);
    this.selectedQId.set(null);
  }

  exportQuestions() { console.log('export', this.filteredQuestions()); }

  toggleExp(id: string) {
    this.expandedExp.has(id) ? this.expandedExp.delete(id) : this.expandedExp.add(id);
  }

  // ── Display helpers ───────────────────────────────────────────────────────
  diffLabel(d: number) { return d <= 3 ? 'Easy' : d <= 7 ? 'Medium' : 'Hard'; }
  diffBadge(d: number) { return d <= 3 ? 'badge badge-easy' : d <= 7 ? 'badge badge-medium' : 'badge badge-hard'; }

  bloomLabel(b: BloomLevel) {
    return (['','Remember','Understand','Apply','Analyze','Evaluate','Create'])[b] || '';
  }

  statusLabel(s: ReviewStatus) {
    return ({1:'Pending',2:'Approved',3:'Needs Revision',4:'Rejected'} as any)[s] || '';
  }
  statusBadge(s: ReviewStatus) {
    return ({1:'badge badge-pending',2:'badge badge-approved',3:'badge badge-revision',4:'badge badge-rejected'} as any)[s] || 'badge';
  }
}





// import { Component, inject, signal, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';

// interface Question {
//   id: string;
//   questionText: string;
//   difficulty: number;
//   marks: number;
//   tags: string[];
//   subject: string;
//   topic: string;
//   subTopic: string;
//   options: Option[];
//   explanation?: string;
//   reviewMaterials?: ReviewMaterial[];
//   createdAt: Date;
//   status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
// }

// interface Option {
//   id: string;
//   optionText: string;
//   isCorrect: boolean;
// }

// interface ReviewMaterial {
//   id: string;
//   title: string;
//   content: string;
//   resourceUrl?: string;
//   materialType: 'Text' | 'Image' | 'Video' | 'Article';
// }

// interface Subject {
//   id: string;
//   name: string;
//   topics: Topic[];
// }

// interface Topic {
//   id: string;
//   name: string;
//   subTopics: SubTopic[];
// }

// interface SubTopic {
//   id: string;
//   name: string;
// }

// @Component({
//   selector: 'app-question-management',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, FormsModule],
//   styles: [`
//     .question-card {
//       @apply bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200;
//     }
    
//     .difficulty-badge {
//       @apply px-2 py-1 rounded-full text-xs font-medium;
//     }
    
//     .difficulty-easy { @apply bg-green-100 text-green-800; }
//     .difficulty-medium { @apply bg-yellow-100 text-yellow-800; }
//     .difficulty-hard { @apply bg-red-100 text-red-800; }
    
//     .status-badge {
//       @apply px-2 py-1 rounded-full text-xs font-medium;
//     }
    
//     .status-draft { @apply bg-gray-100 text-gray-800; }
//     .status-pending { @apply bg-blue-100 text-blue-800; }
//     .status-approved { @apply bg-green-100 text-green-800; }
//     .status-rejected { @apply bg-red-100 text-red-800; }
    
//     .option-input {
//       @apply w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500;
//     }
    
//     .tag-chip {
//       @apply inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 mr-2 mb-2;
//     }
    
//     .form-section {
//       @apply bg-white rounded-lg shadow-md p-6 mb-6;
//     }
    
//     .btn-primary {
//       @apply bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors;
//     }
    
//     .btn-secondary {
//       @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors;
//     }
    
//     .btn-danger {
//       @apply bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors;
//     }
//   `],
//   template: `
//     <div class="min-h-screen bg-gray-50 p-6">
//       <!-- Header -->
//       <div class="max-w-7xl mx-auto mb-8">
//         <div class="flex justify-between items-center">
//           <div>
//             <h1 class="text-3xl font-bold text-gray-800">Question Management</h1>
//             <p class="text-gray-600 mt-1">Create and manage exam questions</p>
//           </div>
//           <button 
//             (click)="showCreateForm.set(true)"
//             class="btn-primary flex items-center"
//           >
//             <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
//             </svg>
//             Add Question
//           </button>
//         </div>
//       </div>

//       <!-- Filters and Search -->
//       <div class="max-w-7xl mx-auto mb-6">
//         <div class="bg-white rounded-lg shadow p-4">
//           <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <input 
//               type="text" 
//               placeholder="Search questions..."
//               class="option-input"
//               [(ngModel)]="searchQuery"
//               (ngModelChange)="filterQuestions()"
//             >
            
//             <select class="option-input" [(ngModel)]="selectedSubject" (ngModelChange)="filterQuestions()">
//               <option value="">All Subjects</option>
//               <option *ngFor="let subject of subjects()" [value]="subject.id">{{ subject.name }}</option>
//             </select>
            
//             <select class="option-input" [(ngModel)]="selectedDifficulty" (ngModelChange)="filterQuestions()">
//               <option value="">All Difficulties</option>
//               <option value="1">Easy</option>
//               <option value="2">Medium</option>
//               <option value="3">Hard</option>
//             </select>
            
//             <select class="option-input" [(ngModel)]="selectedStatus" (ngModelChange)="filterQuestions()">
//               <option value="">All Status</option>
//               <option value="Draft">Draft</option>
//               <option value="Pending">Pending</option>
//               <option value="Approved">Approved</option>
//               <option value="Rejected">Rejected</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       <!-- Create/Edit Form -->
//       <div *ngIf="showCreateForm()" class="max-w-4xl mx-auto">
//         <div class="form-section">
//           <div class="flex justify-between items-center mb-6">
//             <h2 class="text-xl font-bold text-gray-800">{{ editingQuestion() ? 'Edit Question' : 'Create New Question' }}</h2>
//             <button (click)="closeForm()" class="text-gray-500 hover:text-gray-700">
//               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
//               </svg>
//             </button>
//           </div>

//           <form [formGroup]="questionForm" (ngSubmit)="saveQuestion()">
//             <!-- Basic Information -->
//             <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//               <div>
//                 <label class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
//                 <select formControlName="subjectId" class="option-input" required>
//                   <option value="">Select Subject</option>
//                   <option *ngFor="let subject of subjects()" [value]="subject.id">{{ subject.name }}</option>
//                 </select>
//               </div>
              
//               <div>
//                 <label class="block text-sm font-medium text-gray-700 mb-2">Topic</label>
//                 <select formControlName="topicId" class="option-input" required>
//                   <option value="">Select Topic</option>
//                   <option *ngFor="let topic of availableTopics()" [value]="topic.id">{{ topic.name }}</option>
//                 </select>
//               </div>
              
//               <div>
//                 <label class="block text-sm font-medium text-gray-700 mb-2">Sub-Topic</label>
//                 <select formControlName="subTopicId" class="option-input" required>
//                   <option value="">Select Sub-Topic</option>
//                   <option *ngFor="let subTopic of availableSubTopics()" [value]="subTopic.id">{{ subTopic.name }}</option>
//                 </select>
//               </div>
              
//               <div>
//                 <label class="block text-sm font-medium text-gray-700 mb-2">Difficulty (1-10)</label>
//                 <input 
//                   type="number" 
//                   formControlName="difficulty" 
//                   class="option-input" 
//                   min="1" 
//                   max="10" 
//                   required
//                 >
//               </div>
              
//               <div>
//                 <label class="block text-sm font-medium text-gray-700 mb-2">Marks</label>
//                 <input 
//                   type="number" 
//                   formControlName="marks" 
//                   class="option-input" 
//                   min="0.5" 
//                   step="0.5" 
//                   required
//                 >
//               </div>
              
//               <div>
//                 <label class="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
//                 <input 
//                   type="text" 
//                   formControlName="tags" 
//                   class="option-input" 
//                   placeholder="e.g., programming, javascript, basics"
//                 >
//               </div>
//             </div>

//             <!-- Question Text -->
//             <div class="mb-6">
//               <label class="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
//               <textarea 
//                 formControlName="questionText" 
//                 class="option-input" 
//                 rows="4" 
//                 placeholder="Enter your question here..."
//                 required
//               ></textarea>
//             </div>

//             <!-- Options -->
//             <div class="mb-6">
//               <div class="flex justify-between items-center mb-4">
//                 <div>
//                   <label class="block text-sm font-medium text-gray-700">Answer Options</label>
//                   <p class="text-xs text-gray-500 mt-1">
//                     Must have 4-5 options with exactly one correct answer
//                     <span class="ml-2 text-indigo-600">({{ optionsArray.length }}/5 options)</span>
//                   </p>
//                 </div>
//                 <button 
//                   type="button" 
//                   (click)="addOption()" 
//                   class="btn-secondary"
//                   [disabled]="optionsArray.length >= 5"
//                 >
//                   Add Option
//                 </button>
//               </div>
              
//               <div formArrayName="options">
//                 <div 
//                   *ngFor="let option of optionsArray.controls; let i = index" 
//                   [formGroupName]="i" 
//                   class="mb-4 p-4 border border-gray-200 rounded-lg"
//                 >
//                   <div class="flex items-center justify-between mb-2">
//                     <span class="font-medium">Option {{ i + 1 }}</span>
//                     <div class="flex items-center space-x-4">
//                       <label class="flex items-center">
//                         <input 
//                           type="radio" 
//                           [formControlName]="'isCorrect'" 
//                           [value]="true" 
//                           class="mr-2"
//                           (change)="handleCorrectAnswerChange(i)"
//                         >
//                         Correct Answer
//                       </label>
//                       <button 
//                         type="button" 
//                         (click)="removeOption(i)" 
//                         class="text-red-500 hover:text-red-700"
//                         [disabled]="optionsArray.length <= 4"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                   <input 
//                     type="text" 
//                     formControlName="optionText" 
//                     class="option-input" 
//                     placeholder="Enter option text..."
//                     required
//                   >
//                 </div>
//               </div>
              
//               <div *ngIf="getOptionValidationMessage()" class="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <p class="text-sm text-yellow-800">{{ getOptionValidationMessage() }}</p>
//               </div>
//             </div>

//             <!-- Explanation -->
//             <div class="mb-6">
//               <label class="block text-sm font-medium text-gray-700 mb-2">Explanation (Optional)</label>
//               <textarea 
//                 formControlName="explanation" 
//                 class="option-input" 
//                 rows="3" 
//                 placeholder="Explain the correct answer..."
//               ></textarea>
//             </div>

//             <!-- Review Materials -->
//             <div class="mb-6">
//               <div class="flex justify-between items-center mb-4">
//                 <label class="block text-sm font-medium text-gray-700">Review Materials</label>
//                 <button 
//                   type="button" 
//                   (click)="addReviewMaterial()" 
//                   class="btn-secondary"
//                 >
//                   Add Material
//                 </button>
//               </div>
              
//               <div class="space-y-4">
//                 <div 
//                   *ngFor="let material of reviewMaterialsArray.controls; let i = index" 
//                   [formGroupName]="i" 
//                   class="p-4 border border-gray-200 rounded-lg"
//                 >
//                   <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <input 
//                       type="text" 
//                       formControlName="title" 
//                       class="option-input" 
//                       placeholder="Material title..."
//                       required
//                     >
                    
//                     <select formControlName="materialType" class="option-input" required>
//                       <option value="">Select Type</option>
//                       <option value="Text">Text</option>
//                       <option value="Image">Image</option>
//                       <option value="Video">Video</option>
//                       <option value="Article">Article</option>
//                     </select>
//                   </div>
                  
//                   <textarea 
//                     formControlName="content" 
//                     class="option-input" 
//                     rows="2" 
//                     placeholder="Material description..."
//                     required
//                   ></textarea>
                  
//                   <input 
//                     type="url" 
//                     formControlName="resourceUrl" 
//                     class="option-input" 
//                     placeholder="Resource URL (optional)"
//                   >
                  
//                   <button 
//                     type="button" 
//                     (click)="removeReviewMaterial(i)" 
//                     class="btn-danger"
//                   >
//                     Remove Material
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <!-- Form Actions -->
//             <div class="flex justify-end space-x-4">
//               <button 
//                 type="button" 
//                 (click)="saveAsDraft()" 
//                 class="btn-secondary"
//               >
//                 Save as Draft
//               </button>
//               <button 
//                 type="submit" 
//                 class="btn-primary"
//                 [disabled]="questionForm.invalid"
//               >
//                 {{ editingQuestion() ? 'Update Question' : 'Create Question' }}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       <!-- Questions List -->
//       <div class="max-w-7xl mx-auto">
//         <div class="bg-white rounded-lg shadow">
//           <div class="p-4 border-b border-gray-200">
//             <div class="flex justify-between items-center">
//               <h2 class="text-lg font-semibold text-gray-800">Questions ({{ filteredQuestions().length }})</h2>
//               <div class="flex space-x-2">
//                 <button (click)="exportQuestions()" class="btn-secondary">Export</button>
//                 <button (click)="importQuestions()" class="btn-secondary">Import</button>
//               </div>
//             </div>
//           </div>
          
//           <div class="divide-y divide-gray-200">
//             <div 
//               *ngFor="let question of filteredQuestions(); trackBy: trackById" 
//               class="p-6 hover:bg-gray-50 transition-colors"
//             >
//               <div class="flex justify-between items-start">
//                 <div class="flex-1">
//                   <div class="flex items-center space-x-3 mb-2">
//                     <span 
//                       class="difficulty-badge"
//                       [class]="getDifficultyClass(question.difficulty)"
//                     >
//                       {{ getDifficultyLabel(question.difficulty) }}
//                     </span>
//                     <span 
//                       class="status-badge"
//                       [class]="getStatusClass(question.status)"
//                     >
//                       {{ question.status }}
//                     </span>
//                     <span class="text-sm text-gray-500">{{ question.marks }} marks</span>
//                   </div>
                  
//                   <h3 class="text-lg font-medium text-gray-800 mb-2">{{ question.questionText }}</h3>
                  
//                   <div class="text-sm text-gray-600 mb-3">
//                     {{ question.subject }} > {{ question.topic }} > {{ question.subTopic }}
//                   </div>
                  
//                   <div class="mb-3">
//                     <div *ngFor="let option of question.options" class="flex items-center space-x-2">
//                       <span 
//                         class="w-4 h-4 rounded-full"
//                         [class]="option.isCorrect ? 'bg-green-500' : 'bg-gray-300'"
//                       ></span>
//                       <span class="text-sm">{{ option.optionText }}</span>
//                       <span *ngIf="option.isCorrect" class="text-xs text-green-600 font-medium">(Correct)</span>
//                     </div>
//                   </div>
                  
//                   <div *ngIf="question.tags.length > 0" class="mb-3">
//                     <span 
//                       *ngFor="let tag of question.tags" 
//                       class="tag-chip"
//                     >
//                       {{ tag }}
//                     </span>
//                   </div>
                  
//                   <div *ngIf="question.explanation" class="text-sm text-gray-600 mb-3">
//                     <strong>Explanation:</strong> {{ question.explanation }}
//                   </div>
                  
//                   <div *ngIf="question.reviewMaterials && question.reviewMaterials.length > 0" class="text-sm text-blue-600">
//                     <strong>Review Materials:</strong> {{ question.reviewMaterials.length }} items
//                   </div>
//                 </div>
                
//                 <div class="flex space-x-2 ml-4">
//                   <button 
//                     (click)="editQuestion(question)" 
//                     class="text-indigo-600 hover:text-indigo-800"
//                   >
//                     Edit
//                   </button>
//                   <button 
//                     (click)="duplicateQuestion(question)" 
//                     class="text-green-600 hover:text-green-800"
//                   >
//                     Duplicate
//                   </button>
//                   <button 
//                     (click)="deleteQuestion(question.id)" 
//                     class="text-red-600 hover:text-red-800"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   `
// })
// export class QuestionManagementComponent {
//   private fb = inject(FormBuilder);
//   private router = inject(Router);

//   // Signals
//   showCreateForm = signal(false);
//   editingQuestion = signal<Question | null>(null);
//   questions = signal<Question[]>([]);
//   searchQuery = signal('');
//   selectedSubject = signal('');
//   selectedDifficulty = signal('');
//   selectedStatus = signal('');

//   // Mock data
//   subjects = signal<Subject[]>([
//     {
//       id: '1',
//       name: 'Computer Science',
//       topics: [
//         {
//           id: '1',
//           name: 'Programming',
//           subTopics: [
//             { id: '1', name: 'JavaScript' },
//             { id: '2', name: 'Python' },
//             { id: '3', name: 'Java' }
//           ]
//         },
//         {
//           id: '2',
//           name: 'Databases',
//           subTopics: [
//             { id: '4', name: 'SQL' },
//             { id: '5', name: 'NoSQL' }
//           ]
//         }
//       ]
//     }
//   ]);

//   // Form
//   questionForm = this.fb.group({
//     subjectId: ['', Validators.required],
//     topicId: ['', Validators.required],
//     subTopicId: ['', Validators.required],
//     difficulty: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
//     marks: [1, [Validators.required, Validators.min(0.5)]],
//     tags: [''],
//     questionText: ['', Validators.required],
//     options: this.fb.array([
//       this.createOption(),
//       this.createOption(),
//       this.createOption(),
//       this.createOption()
//     ]),
//     explanation: [''],
//     reviewMaterials: this.fb.array([])
//   });

//   get optionsArray() {
//     return this.questionForm.get('options') as FormArray;
//   }

//   get reviewMaterialsArray() {
//     return this.questionForm.get('reviewMaterials') as FormArray;
//   }

//   // Computed properties
//   filteredQuestions = computed(() => {
//     let filtered = this.questions();

//     if (this.searchQuery()) {
//       filtered = filtered.filter(q => 
//         q.questionText.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
//         q.tags.some(tag => tag.toLowerCase().includes(this.searchQuery().toLowerCase()))
//       );
//     }

//     if (this.selectedSubject()) {
//       filtered = filtered.filter(q => q.subject === this.selectedSubject());
//     }

//     if (this.selectedDifficulty()) {
//       filtered = filtered.filter(q => 
//         this.getDifficultyLevel(q.difficulty) === this.selectedDifficulty()
//       );
//     }

//     if (this.selectedStatus()) {
//       filtered = filtered.filter(q => q.status === this.selectedStatus());
//     }

//     return filtered;
//   });

//   availableTopics = computed(() => {
//     const subjectId = this.questionForm.get('subjectId')?.value;
//     if (!subjectId) return [];
    
//     const subject = this.subjects().find(s => s.id === subjectId);
//     return subject?.topics || [];
//   });

//   availableSubTopics = computed(() => {
//     const topicId = this.questionForm.get('topicId')?.value;
//     if (!topicId) return [];
    
//     const topic = this.availableTopics().find(t => t.id === topicId);
//     return topic?.subTopics || [];
//   });

//   ngOnInit() {
//     this.loadMockQuestions();
//   }

//   private loadMockQuestions() {
//     this.questions.set([
//       {
//         id: '1',
//         questionText: 'What is the primary purpose of dependency injection in software development?',
//         difficulty: 3,
//         marks: 2,
//         tags: ['programming', 'architecture', 'design-patterns'],
//         subject: 'Computer Science',
//         topic: 'Programming',
//         subTopic: 'JavaScript',
//         options: [
//           { id: '1', optionText: 'To improve code readability', isCorrect: false },
//           { id: '2', optionText: 'To achieve loose coupling and easier testing', isCorrect: true },
//           { id: '3', optionText: 'To make code run faster', isCorrect: false },
//           { id: '4', optionText: 'To reduce memory usage', isCorrect: false }
//         ],
//         explanation: 'Dependency injection helps achieve loose coupling between components and makes unit testing easier.',
//         status: 'Approved',
//         createdAt: new Date()
//       }
//     ]);
//   }

//   createOption() {
//     return this.fb.group({
//       optionText: ['', Validators.required],
//       isCorrect: [false]
//     });
//   }

//   validateOptions() {
//     const options = this.optionsArray;
//     const correctCount = options.controls.filter(opt => opt.get('isCorrect')?.value).length;
    
//     if (options.length < 4) {
//       return 'Questions must have at least 4 options';
//     }
    
//     if (options.length > 5) {
//       return 'Questions can have maximum 5 options';
//     }
    
//     if (correctCount !== 1) {
//       return 'Questions must have exactly one correct answer';
//     }
    
//     return null;
//   }

//   getOptionValidationMessage() {
//     const options = this.optionsArray;
//     const correctCount = options.controls.filter(opt => opt.get('isCorrect')?.value).length;
    
//     if (options.length < 4) {
//       return 'Add at least ' + (4 - options.length) + ' more option(s)';
//     }
    
//     if (correctCount === 0) {
//       return 'Select exactly one correct answer';
//     }
    
//     if (correctCount > 1) {
//       return 'Select only one correct answer (currently ' + correctCount + ' selected)';
//     }
    
//     return null;
//   }

//   handleCorrectAnswerChange(selectedIndex: number) {
//     // Ensure only one option is marked as correct
//     this.optionsArray.controls.forEach((control, index) => {
//       if (index !== selectedIndex) {
//         control.get('isCorrect')?.setValue(false);
//       }
//     });
//   }

//   createReviewMaterial() {
//     return this.fb.group({
//       title: ['', Validators.required],
//       content: ['', Validators.required],
//       resourceUrl: [''],
//       materialType: ['Text', Validators.required]
//     });
//   }

//   addOption() {
//     if (this.optionsArray.length < 5) {
//       this.optionsArray.push(this.createOption());
//     } else {
//       alert('Maximum 5 options allowed per question');
//     }
//   }

//   removeOption(index: number) {
//     if (this.optionsArray.length > 4) {
//       this.optionsArray.removeAt(index);
//     } else {
//       alert('Questions must have at least 4 options');
//     }
//   }

//   addReviewMaterial() {
//     this.reviewMaterialsArray.push(this.createReviewMaterial());
//   }

//   removeReviewMaterial(index: number) {
//     this.reviewMaterialsArray.removeAt(index);
//   }

//   saveQuestion() {
//     // Validate options before saving
//     const validationError = this.validateOptions();
//     if (validationError) {
//       alert(validationError);
//       return;
//     }

//     const formValue = this.questionForm.value;
    
//     const question: Question = {
//       id: this.editingQuestion()?.id || Date.now().toString(),
//       questionText: formValue.questionText || '',
//       difficulty: formValue.difficulty || 5,
//       marks: formValue.marks || 1,
//       tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [],
//       subject: this.getSubjectName(formValue.subjectId || ''),
//       topic: this.getTopicName(formValue.topicId || ''),
//       subTopic: this.getSubTopicName(formValue.subTopicId || ''),
//       options: (formValue.options || []).map((opt: any) => ({
//         id: Date.now().toString() + Math.random(),
//         optionText: opt.optionText || '',
//         isCorrect: opt.isCorrect || false
//       })),
//       explanation: formValue.explanation || undefined,
//       reviewMaterials: (formValue.reviewMaterials || []).map((mat: any) => ({
//         id: Date.now().toString() + Math.random(),
//         title: mat.title || '',
//         content: mat.content || '',
//         resourceUrl: mat.resourceUrl || undefined,
//         materialType: mat.materialType || 'Text'
//       })),
//       status: 'Pending',
//       createdAt: new Date()
//     };

//     if (this.editingQuestion()) {
//       // Update existing question
//       this.questions.update(questions => 
//         questions.map(q => q.id === question.id ? question : q)
//       );
//     } else {
//       // Add new question
//       this.questions.update(questions => [...questions, question]);
//     }

//     this.closeForm();
//   }

//   saveAsDraft() {
//     // Similar to saveQuestion but with status 'Draft'
//     const question: Question = {
//       id: Date.now().toString(),
//       questionText: this.questionForm.value.questionText || '',
//       difficulty: this.questionForm.value.difficulty || 5,
//       marks: this.questionForm.value.marks || 1,
//       tags: this.questionForm.value.tags ? this.questionForm.value.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [],
//       subject: this.getSubjectName(this.questionForm.value.subjectId || ''),
//       topic: this.getTopicName(this.questionForm.value.topicId || ''),
//       subTopic: this.getSubTopicName(this.questionForm.value.subTopicId || ''),
//       options: (this.questionForm.value.options || []).map((opt: any) => ({
//         id: Date.now().toString() + Math.random(),
//         optionText: opt.optionText || '',
//         isCorrect: opt.isCorrect || false
//       })),
//       explanation: this.questionForm.value.explanation || undefined,
//       reviewMaterials: (this.questionForm.value.reviewMaterials || []).map((mat: any) => ({
//         id: Date.now().toString() + Math.random(),
//         title: mat.title || '',
//         content: mat.content || '',
//         resourceUrl: mat.resourceUrl || undefined,
//         materialType: mat.materialType || 'Text'
//       })),
//       status: 'Draft',
//       createdAt: new Date()
//     };
    
//     this.questions.update(questions => [...questions, question]);
//     this.closeForm();
//   }

//   editQuestion(question: Question) {
//     this.editingQuestion.set(question);
//     this.showCreateForm.set(true);
    
//     // Populate form with question data
//     this.questionForm.patchValue({
//       questionText: question.questionText,
//       difficulty: question.difficulty,
//       marks: question.marks,
//       tags: question.tags.join(', '),
//       explanation: question.explanation
//     });
//   }

//   duplicateQuestion(question: Question) {
//     const duplicated: Question = {
//       ...question,
//       id: Date.now().toString(),
//       questionText: question.questionText + ' (Copy)',
//       status: 'Draft',
//       createdAt: new Date()
//     };
    
//     this.questions.update(questions => [...questions, duplicated]);
//   }

//   deleteQuestion(questionId: string) {
//     if (confirm('Are you sure you want to delete this question?')) {
//       this.questions.update(questions => questions.filter(q => q.id !== questionId));
//     }
//   }

//   closeForm() {
//     this.showCreateForm.set(false);
//     this.editingQuestion.set(null);
//     this.questionForm.reset();
    
//     // Reset form arrays
//     while (this.optionsArray.length > 4) {
//       this.optionsArray.removeAt(4);
//     }
//     this.reviewMaterialsArray.clear();
//   }

//   filterQuestions() {
//     // Filtering is handled by computed property
//   }

//   exportQuestions() {
//     // Implement export functionality
//     console.log('Export questions');
//   }

//   importQuestions() {
//     // Implement import functionality
//     console.log('Import questions');
//   }

//   // Helper methods
//   getDifficultyClass(difficulty: number) {
//     if (difficulty <= 3) return 'difficulty-easy';
//     if (difficulty <= 7) return 'difficulty-medium';
//     return 'difficulty-hard';
//   }

//   getDifficultyLabel(difficulty: number) {
//     if (difficulty <= 3) return 'Easy';
//     if (difficulty <= 7) return 'Medium';
//     return 'Hard';
//   }

//   getDifficultyLevel(difficulty: number) {
//     if (difficulty <= 3) return '1';
//     if (difficulty <= 7) return '2';
//     return '3';
//   }

//   getStatusClass(status: string) {
//     return `status-${status.toLowerCase()}`;
//   }

//   getSubjectName(subjectId: string) {
//     const subject = this.subjects().find(s => s.id === subjectId);
//     return subject?.name || '';
//   }

//   getTopicName(topicId: string) {
//     for (const subject of this.subjects()) {
//       const topic = subject.topics.find(t => t.id === topicId);
//       if (topic) return topic.name;
//     }
//     return '';
//   }

//   getSubTopicName(subTopicId: string) {
//     for (const subject of this.subjects()) {
//       for (const topic of subject.topics) {
//         const subTopic = topic.subTopics.find(st => st.id === subTopicId);
//         if (subTopic) return subTopic.name;
//       }
//     }
//     return '';
//   }

//   trackById(index: number, question: Question) {
//     return question.id;
//   }
// }




