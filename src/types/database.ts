// Database types for Guardianship App

export type ReferralStatus = 'submitted' | 'contacted' | 'quoted' | 'sold';
export type RepRole = 'rep' | 'admin';

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface Rep {
  id: string;
  name: string;
  email: string;
  role: RepRole;
  avatar_url: string | null;
  active: boolean;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referee_name: string;
  referee_phone: string | null;
  referee_email: string | null;
  status: ReferralStatus;
  value: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RepCustomer {
  rep_id: string;
  customer_id: string;
  assigned_at: string;
}

// Extended types with relations
export interface CustomerWithReferrals extends Customer {
  referrals: Referral[];
}

export interface ReferralWithReferrer extends Referral {
  referrer: Customer;
}

export interface RepWithStats extends Rep {
  total_referrals: number;
  total_sold: number;
  total_earnings: number;
  pending_earnings: number;
}

export interface RepWithCustomers extends Rep {
  customers: Customer[];
}

// Input types for creating/updating
export interface CreateCustomerInput {
  name: string;
  phone?: string;
  email?: string;
}

export interface CreateReferralInput {
  referrer_id: string;
  referee_name: string;
  referee_phone?: string;
  referee_email?: string;
  notes?: string;
}

export interface UpdateReferralInput {
  status?: ReferralStatus;
  referee_name?: string;
  referee_phone?: string;
  referee_email?: string;
  notes?: string;
}

export interface CreateRepInput {
  name: string;
  email: string;
  role?: RepRole;
  avatar_url?: string;
}

export interface UpdateRepInput {
  name?: string;
  email?: string;
  role?: RepRole;
  avatar_url?: string;
  active?: boolean;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
}

export interface Session {
  user: AuthUser;
  rep: Rep;
}

// Stats types
export interface DashboardStats {
  total_referrals: number;
  submitted: number;
  contacted: number;
  quoted: number;
  sold: number;
  total_earnings: number;
  pending_earnings: number;
}

export interface AdminStats extends DashboardStats {
  total_reps: number;
  active_reps: number;
  conversion_rate: number;
  total_paid_out: number;
}

// Activity types
export interface Activity {
  id: string;
  type: 'referral_created' | 'status_changed' | 'referral_sold';
  description: string;
  referral_id?: string;
  customer_name?: string;
  rep_name?: string;
  timestamp: string;
}
