
export interface AnalysisResult {
  id: string;
  imageUrl: string;
  name: string;
  score: number; // 1-10
  isAiGenerated: boolean;
  confidence: number;
  reasoning: string;
  technicalDetails: string[];
  timestamp: number;
  status: 'pending' | 'success' | 'error';
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  points: number;
  avatar: string;
}

export interface GeminiResponse {
  score: number;
  isAiGenerated: boolean;
  confidence: number;
  reasoning: string;
  technicalDetails: string[];
}
