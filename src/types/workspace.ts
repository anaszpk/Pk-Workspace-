export interface VaultDocument {
  id: number;
  name: string;
  number: string;
  image: string | null;
}

export interface UserProfile {
  fullName: string;
  dob: string;
  phone: string;
  bloodGroup: string;
  address: string;
  photo: string;
  signature: string;
  documents: VaultDocument[];
}

export interface StudyModule {
  id: number;
  trackId: number;
  title: string;
  category?: string;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  remarks?: string;
}

export interface StudyTrack {
  id: number;
  name: string;
  degree?: string;
  duration?: string;
  completed?: boolean;
  completedAt?: string;
  progressPercentage?: number;
  modules?: StudyModule[];
}

export interface ExamAssessment {
  id: number;
  course: string;
  name: string;
  date: string;
  status: 'Upcoming' | 'Completed';
}

export interface PastQualification {
  id: number;
  course: string;
  institution: string;
}

export interface CompletedStudyArea {
  id: number;
  area: string;
  completedAt?: string;
}

export interface TaskItem {
  id: number;
  task: string;
  date?: string;
  time?: string;
  priority?: 'High' | 'Medium' | 'Low';
  completed: boolean;
  completedAt?: string;
  completedRemarks?: string;
  alerted?: boolean;
  completedDates?: string[]; // Array of YYYY-MM-DD dates completed
}

export interface CallLogRecord {
  id: number;
  contactId: number;
  relation: string;
  phone: string;
  date: string;
  time: string;
  remarks: string;
}

export interface MeetingItem {
  id: number;
  person: string;
  purpose: string;
  date: string;
  time: string;
  completed?: boolean;
  completedAt?: string;
  remarks?: string;
  alerted?: boolean;
}

export interface BookItem {
  id: number;
  title: string;
  totalPages: number;
  pagesRead?: number;
  completed?: boolean;
  completedAt?: string;
}

export interface ProjectItem {
  id: number;
  title: string;
  type: 'Academic' | 'Creative' | 'Social';
  deadline: string;
  status?: string;
}

export interface ReelItem {
  id: number;
  idea: string;
  status?: string;
}

export interface TrainingClassItem {
  id: number;
  topic: string;
  audience: string;
}

export interface DesignProject {
  id: number;
  title: string;
  client: string;
  date: string;
  time: string;
  status: 'Pending' | 'Designing' | 'Review' | 'Completed';
  notes?: string;
  alerted?: boolean;
}

export interface DesignClient {
  id: number;
  name: string;
  phone: string;
  notes: string;
}

export interface FinanceEntry {
  id: number;
  name: string;
  amount: number;
  date?: string;
  completed?: boolean;
}

export interface BankDetails {
  bankName: string;
  accName: string;
  accNumber: string;
  ifsc: string;
  gpayNumber: string;
  gpayName: string;
  upiId: string;
  qrCode: string;
}

export interface FinanceState {
  receivables: FinanceEntry[];
  payables: FinanceEntry[];
  savings: FinanceEntry[];
  needs: FinanceEntry[];
  bankDetails: BankDetails;
}

export interface TravelExpense {
  id: number;
  desc: string;
  amount: number;
}

export interface TravelPlan {
  id: number;
  destination: string;
  date: string;
  budget: number;
  expenses: TravelExpense[];
  completed?: boolean;
  completedAt?: string;
  remarks?: string;
}

export interface EventDetail {
  id: number;
  desc: string;
  amount: number;
}

export interface EventProgram {
  id: number;
  title: string;
  concept: string;
  date: string;
  income: EventDetail[];
  expense: EventDetail[];
  completed?: boolean;
  completedAt?: string;
  remarks?: string;
}

export interface FamilyOrbitContact {
  id: number;
  relation: string;
  phone: string;
  freq: 'Daily' | 'Weekly' | 'Fortnightly' | 'Anytime';
  lastCalled: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface GeminiSession {
  id: number;
  title: string;
  messages: ChatMessage[];
}

export interface JournalEntry {
  id: number;
  date: string;
  time?: string;
  title: string;
  content: string;
  mood?: 'Happy' | 'Productive' | 'Calm' | 'Reflective' | 'Tired' | 'Grateful' | 'Peaceful';
  tags?: string[];
  photos?: string[];
  location?: string;
  createdAt: string;
}

export interface WorkspaceState {
  dob: string;
  myself: UserProfile;
  studyTracks: StudyTrack[];
  exams: ExamAssessment[];
  pastQualifications: PastQualification[];
  completedStudyAreas: CompletedStudyArea[];
  todos: TaskItem[];
  finishingTodos: TaskItem[];
  generalTodos: TaskItem[];
  books: BookItem[];
  meetings: MeetingItem[];
  reels: ReelItem[];
  trainingClasses: TrainingClassItem[];
  projects: ProjectItem[];
  designProjects: DesignProject[];
  designClients: DesignClient[];
  finance: FinanceState;
  travels: TravelPlan[];
  events: EventProgram[];
  family: FamilyOrbitContact[];
  callLogs: CallLogRecord[];
  geminiSessions: GeminiSession[];
  journalEntries: JournalEntry[];
}
