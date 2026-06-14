import { z } from 'zod'

// ── Client ───────────────────────────────────────────────────────────────────

export const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  portal_slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
})

export const portalFeaturesSchema = z.object({
  files:      z.boolean(),
  invoices:   z.boolean(),
  messages:   z.boolean(),
  milestones: z.boolean(),
  meetings:   z.boolean(),
}).partial()

export const updateClientSchema = createClientSchema.partial().extend({
  status:          z.enum(['active', 'archived']).optional(),
  portal_features: portalFeaturesSchema.optional(),
  portal_closed:   z.boolean().optional(),
})

export type PortalFeatures = z.infer<typeof portalFeaturesSchema>
export const DEFAULT_PORTAL_FEATURES: Required<z.infer<typeof portalFeaturesSchema>> = {
  files: true, invoices: true, messages: true, milestones: true, meetings: true,
}

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>

// ── Project ──────────────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  client_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['briefing', 'in_progress', 'review', 'done']).default('briefing'),
  due_date: z.string().nullable().optional(),
})

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['briefing', 'in_progress', 'review', 'done']).optional(),
  due_date: z.string().nullable().optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>

// ── File ─────────────────────────────────────────────────────────────────────

export const registerFileSchema = z.object({
  project_id: z.string().uuid(),
  filename: z.string().min(1).max(500),
  storage_path: z.string().min(1),
  file_size: z.number().int().positive(),
  mime_type: z.string().min(1),
  version: z.number().int().positive().default(1),
})

export const reviewFileSchema = z.object({
  status: z.enum(['approved', 'changes_requested']),
  client_comment: z.string().max(2000).optional().nullable(),
})

export type RegisterFileInput = z.infer<typeof registerFileSchema>
export type ReviewFileInput = z.infer<typeof reviewFileSchema>

// ── Invoice ──────────────────────────────────────────────────────────────────

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description required').max(500),
  quantity: z.number().positive().max(10000),
  unit_price: z.number().positive().max(1_000_000),
})

export const createInvoiceSchema = z.object({
  client_id: z.string().uuid(),
  project_id: z.string().uuid().optional().nullable(),
  line_items: z.array(lineItemSchema).min(1, 'At least one line item required'),
  tax_rate: z.number().min(0).max(100).default(0),
  currency: z.string().length(3).default('USD'),
  due_date: z.string().nullable().optional(),
  notes: z.string().max(2000).optional().nullable(),
})

export const updateInvoiceSchema = createInvoiceSchema.partial().omit({ client_id: true })

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>
export type LineItemInput = z.infer<typeof lineItemSchema>

// ── Message ──────────────────────────────────────────────────────────────────

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(4000),
  sender_type: z.enum(['freelancer', 'client']),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>

// ── Profile ──────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  business_name: z.string().max(100).optional().nullable(),
  tagline: z.string().max(200).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// ── Upload ───────────────────────────────────────────────────────────────────

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/quicktime',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/octet-stream', // Figma, AI, PSD
  'application/illustrator',
  'application/postscript',
] as const

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export const requestUploadSchema = z.object({
  project_id: z.string().uuid(),
  filename: z.string().min(1).max(500),
  file_size: z.number().int().positive().max(MAX_FILE_SIZE),
  mime_type: z.string().min(1),
  version: z.number().int().positive().optional(),
})

export type RequestUploadInput = z.infer<typeof requestUploadSchema>
