export type PromotionStatus = 'pending_approval' | 'active' | 'paused' | 'completed' | 'cancelled' | 'rejected';

export interface Promotion {
  id: number;
  vendor_id: string;
  product_id: number;
  placement: 'featured' | 'new_arrivals' | 'sponsored';
  duration_days: number;
  start_date: string | null;
  end_date: string | null;
  amount_paid: number;
  status: PromotionStatus;
  views: number;
  clicks: number;
  conversions: number;
  payment_reference: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  vendor_gifts?: {
    id: number;
    name: string;
    price: number;
    image_url: string;
    vendor_id: string;
  };
  profiles?: {
    business_name: string;
    display_name: string;
  };
}
