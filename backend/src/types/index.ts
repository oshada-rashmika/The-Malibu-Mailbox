export interface Letter {
  id: string;
  created_at: string;
  scheduled_for: string; // ISO Date string (YYYY-MM-DD)
  title: string;
  content: string;
  is_opened: boolean;
}

export interface Voucher {
  id: string;
  created_at: string;
  title: string;
  description: string;
  is_redeemed: boolean;
  redeemed_at?: string;
}
