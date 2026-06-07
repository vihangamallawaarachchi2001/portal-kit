export type Plan = 'free' | 'pro' | 'business'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'
export type ClientStatus = 'active' | 'archived'
export type ProjectStatus = 'briefing' | 'in_progress' | 'review' | 'done'
export type FileStatus = 'pending' | 'approved' | 'changes_requested'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'
export type SenderType = 'freelancer' | 'client'

export interface BankDetails {
  bank_name: string
  account_holder: string
  account_number: string
  routing_number: string
  country: string
  currency: string
}

export interface NotificationPreferences {
  messages: boolean
  file_review: boolean
  invoice_paid: boolean
  status_change: boolean
  weekly_digest?: boolean
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  messages: true,
  file_review: true,
  invoice_paid: true,
  status_change: false,
  weekly_digest: false,
}

export interface Profile {
  id: string
  full_name: string | null
  business_name: string | null
  avatar_url: string | null
  tagline: string | null
  plan: Plan
  base_currency: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: SubscriptionStatus | null
  stripe_connect_account_id: string | null
  stripe_connect_onboarded: boolean
  bank_details: BankDetails | null
  notification_preferences: NotificationPreferences
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  freelancer_id: string
  name: string
  email: string
  portal_slug: string
  portal_pin: string | null
  status: ClientStatus
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  client_id: string
  freelancer_id: string
  title: string
  description: string | null
  status: ProjectStatus
  due_date: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface File {
  id: string
  project_id: string
  freelancer_id: string
  filename: string
  storage_path: string
  file_size: number
  mime_type: string
  version: number
  status: FileStatus
  client_comment: string | null
  reviewed_at: string | null
  parent_file_id: string | null
  deleted_at: string | null
  created_at: string
}

export interface LineItem {
  description: string
  quantity: number
  unit_price: number
}

export interface Invoice {
  id: string
  client_id: string
  project_id: string | null
  freelancer_id: string
  invoice_number: string
  line_items: LineItem[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  currency: string
  status: InvoiceStatus
  due_date: string | null
  stripe_payment_intent_id: string | null
  paid_at: string | null
  notes: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  project_id: string
  sender_type: SenderType
  sender_id: string | null
  content: string
  read_at: string | null
  created_at: string
}

export interface PortalSession {
  id: string
  client_id: string
  token_hash: string
  expires_at: string
  used_at: string | null
  created_at: string
}

// ── Joined / enriched types ──────────────────────────────────────────────────

export interface ClientWithStats extends Client {
  projects: ProjectWithStats[]
  outstanding_amount: number
  pending_files_count: number
  unread_messages_count: number
}

export interface ProjectWithStats extends Project {
  files_count: number
  pending_files_count: number
  approved_files_count: number
  unread_messages_count: number
}

export interface FileWithProject extends File {
  project: Pick<Project, 'id' | 'title' | 'client_id'>
}

export interface InvoiceWithClient extends Invoice {
  client: Pick<Client, 'id' | 'name' | 'email' | 'portal_slug'>
}

export interface MessageWithSender extends Message {
  sender?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

// ── Dashboard KPIs ───────────────────────────────────────────────────────────

export interface DashboardStats {
  total_outstanding: number
  total_overdue: number
  pending_approvals: number
  unread_messages: number
  active_clients: number
  active_projects: number
}
