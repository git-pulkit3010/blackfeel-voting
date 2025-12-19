export interface Category {
  id: string;
  name: string;
  gradient: string;
}

export interface Trend {
  id: string;
  category: string;
  option_a: string;
  option_b: string;
  option_a_image_url: string | null;
  option_b_image_url: string | null;
  votes_a: number;
  votes_b: number;
  created_at: string;
  active: boolean;
}

export interface HistoryItem {
  id: string;
  category: string;
  design_text: string;
  created_at: string;
}