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
              @if (isExpanded(stream.id) && stream.subjects?.length) {
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