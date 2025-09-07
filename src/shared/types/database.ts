// Database types for pushup tracking
export interface PushupLog {
  id: number;
  date: string; // ISO date string YYYY-MM-DD
  pushup_count: number;
  duration: number; // duration in seconds
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface DatabaseStats {
  totalPushups: number;
  totalSessions: number;
  averagePerSession: number;
  longestSession: number;
  currentStreak: number;
  longestStreak: number;
}

export interface PushupSummary {
  date: string;
  totalCount: number;
  totalDuration: number;
  sessionCount: number;
}