export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  image_url?: string | null;
  category?: string | null;
  marketplace_tag?: 'TCGPlayer' | 'Cardmarket' | 'TradingCardMint' | 'Local Wijutopia';
  release_status?: 'catalogo' | 'lanzamiento';
  preorder_available?: boolean;
  created_at?: string;
};

export type Metric = {
  element_identifier: string;
  element_description: string;
  accumulated_clicks: number;
  last_triggered: string;
};

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store'
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'La solicitud no pudo completarse.');
  }
  return payload as T;
}


export type BusinessInsights = {
  currentSeason: string;
  seasonEndsAt: string;
  restockRequests: Array<{ id: number; product_id: number; product_name: string; customer_email?: string | null; requested_quantity: number; season_key: string; source: string; status: string; waiting_message?: string | null; threshold_snapshot: number; interest_snapshot: number; cancelled_at?: string | null; created_at: string; updated_at: string }>;
  productInterest: Array<{ product_id: number; product_name: string; season_key: string; product_views: number; product_clicks: number; whatsapp_messages: number; restock_threshold: number; total_interest: number; recommendation: string }>;
  launchRequests: Array<{ id: number; product_name: string; franchise: string; customer_email?: string | null; requested_quantity: number; notes?: string | null; status: string; created_at: string }>;
  researchResponses: Array<{ id: number; customer_email?: string | null; favorite_franchise: string; satisfaction_score: number; preferred_budget?: number | null; play_style: string; trivia_answer?: string | null; comments?: string | null; created_at: string }>;
  franchiseSummary: Array<{ favorite_franchise: string; responses: number; avg_satisfaction: number }>;
  playStyleSummary: Array<{ play_style: string; responses: number; avg_budget: number | null }>;
};
