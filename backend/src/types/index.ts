export interface Letter {
  id: string;
  created_at: string;
  scheduled_for: string; // ISO Date string (YYYY-MM-DD)
  title: string;
  content: string;
}

export interface Voucher {
  id: string;
  created_at: string;
  title: string;
  description: string;
  is_redeemed: boolean;
  redeemed_at?: string;
}

export interface Flower {
  id: string;
  created_at: string;
  sent_at: string;
  flower_type: string;
  meaning: string;
  color_hex: string;
  recipient_id: string;
}
