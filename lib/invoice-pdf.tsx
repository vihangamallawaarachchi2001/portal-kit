import {
  Document, Page, Text, View, StyleSheet, Font,
} from '@react-pdf/renderer'

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a202c',
    backgroundColor: '#ffffff',
    padding: 48,
  },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 },
  brandBlock: { flexDirection: 'column', gap: 2 },
  businessName: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#0051d5' },
  tagline: { fontSize: 9, color: '#6b7280', marginTop: 2 },
  invoiceLabelBlock: { flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  invoiceLabel: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#111827', letterSpacing: 1 },
  invoiceNumber: { fontSize: 10, color: '#6b7280' },

  // Meta row
  metaRow: { flexDirection: 'row', gap: 24, marginBottom: 32 },
  metaBlock: { flexDirection: 'column', gap: 3, flex: 1 },
  metaLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue: { fontSize: 10, color: '#111827' },

  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginVertical: 16 },

  // Table
  tableHeader: { flexDirection: 'row', backgroundColor: '#f9fafb', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 4, marginBottom: 2 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  colDesc: { flex: 1 },
  colQty: { width: 50, textAlign: 'center' },
  colUnit: { width: 80, textAlign: 'right' },
  colTotal: { width: 80, textAlign: 'right' },
  th: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#6b7280', textTransform: 'uppercase' },
  td: { fontSize: 10, color: '#111827' },
  tdMuted: { fontSize: 10, color: '#6b7280' },

  // Totals
  totalsBlock: { flexDirection: 'column', alignItems: 'flex-end', marginTop: 12, gap: 4 },
  totalRow: { flexDirection: 'row', gap: 24, justifyContent: 'flex-end', width: 200 },
  totalLabel: { fontSize: 10, color: '#6b7280', flex: 1 },
  totalValue: { fontSize: 10, color: '#111827', textAlign: 'right' },
  grandTotalRow: { flexDirection: 'row', gap: 24, justifyContent: 'flex-end', width: 200, backgroundColor: '#0051d5', borderRadius: 4, paddingVertical: 6, paddingHorizontal: 10, marginTop: 4 },
  grandTotalLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#ffffff', flex: 1 },
  grandTotalValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#ffffff', textAlign: 'right' },

  // Notes
  notesBlock: { marginTop: 32, backgroundColor: '#f9fafb', borderRadius: 6, padding: 14 },
  notesLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 },
  notesText: { fontSize: 10, color: '#4b5563', lineHeight: 1.5 },

  // Status badge
  badge: { borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8, alignSelf: 'flex-end' },
  badgePaid: { backgroundColor: '#dcfce7' },
  badgeSent: { backgroundColor: '#dbeafe' },
  badgeOverdue: { backgroundColor: '#fee2e2' },
  badgeText: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  badgeTextPaid: { color: '#15803d' },
  badgeTextSent: { color: '#1d4ed8' },
  badgeTextOverdue: { color: '#b91c1c' },

  // Footer
  footer: { position: 'absolute', bottom: 32, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#9ca3af' },
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

function fmtDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface InvoicePDFProps {
  invoiceNumber: string
  status: string
  currency: string
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  dueDate: string | null
  paidAt: string | null
  createdAt: string
  notes: string | null
  lineItems: { description: string; quantity: number; unit_price: number }[]
  businessName: string
  tagline?: string | null
  freelancerName: string
  clientName: string
  clientEmail: string
  hideBranding?: boolean
}

// ── Document ──────────────────────────────────────────────────────────────────

export function InvoicePDF({
  invoiceNumber, status, currency, subtotal, taxRate, taxAmount, total,
  dueDate, paidAt, createdAt, notes, lineItems,
  businessName, tagline, freelancerName, clientName, clientEmail,
  hideBranding = false,
}: InvoicePDFProps) {
  const badgeStyle = status === 'paid' ? s.badgePaid : status === 'overdue' ? s.badgeOverdue : s.badgeSent
  const badgeTextStyle = status === 'paid' ? s.badgeTextPaid : status === 'overdue' ? s.badgeTextOverdue : s.badgeTextSent
  const badgeLabel = status === 'paid' ? 'PAID' : status === 'overdue' ? 'OVERDUE' : 'DUE'

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.brandBlock}>
            <Text style={s.businessName}>{businessName}</Text>
            {tagline ? <Text style={s.tagline}>{tagline}</Text> : null}
            <Text style={[s.metaValue, { marginTop: 8 }]}>{freelancerName}</Text>
          </View>
          <View style={s.invoiceLabelBlock}>
            <Text style={s.invoiceLabel}>INVOICE</Text>
            <Text style={s.invoiceNumber}>{invoiceNumber}</Text>
            <View style={[s.badge, badgeStyle, { marginTop: 6 }]}>
              <Text style={[s.badgeText, badgeTextStyle]}>{badgeLabel}</Text>
            </View>
          </View>
        </View>

        {/* ── Meta ── */}
        <View style={s.metaRow}>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Billed To</Text>
            <Text style={s.metaValue}>{clientName}</Text>
            <Text style={s.tdMuted}>{clientEmail}</Text>
          </View>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Issue Date</Text>
            <Text style={s.metaValue}>{fmtDate(createdAt)}</Text>
          </View>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>{status === 'paid' ? 'Paid On' : 'Due Date'}</Text>
            <Text style={s.metaValue}>{fmtDate(status === 'paid' ? paidAt : dueDate) || 'Upon receipt'}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* ── Line Items Table ── */}
        <View style={s.tableHeader}>
          <Text style={[s.th, s.colDesc]}>Description</Text>
          <Text style={[s.th, s.colQty]}>Qty</Text>
          <Text style={[s.th, s.colUnit]}>Unit Price</Text>
          <Text style={[s.th, s.colTotal]}>Total</Text>
        </View>

        {lineItems.map((item, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={[s.td, s.colDesc]}>{item.description}</Text>
            <Text style={[s.tdMuted, s.colQty]}>{item.quantity}</Text>
            <Text style={[s.tdMuted, s.colUnit]}>{fmtCurrency(item.unit_price, currency)}</Text>
            <Text style={[s.td, s.colTotal]}>{fmtCurrency(item.quantity * item.unit_price, currency)}</Text>
          </View>
        ))}

        {/* ── Totals ── */}
        <View style={s.totalsBlock}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalValue}>{fmtCurrency(subtotal, currency)}</Text>
          </View>
          {taxRate > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Tax ({taxRate}%)</Text>
              <Text style={s.totalValue}>{fmtCurrency(taxAmount, currency)}</Text>
            </View>
          )}
          <View style={s.grandTotalRow}>
            <Text style={s.grandTotalLabel}>Total</Text>
            <Text style={s.grandTotalValue}>{fmtCurrency(total, currency)}</Text>
          </View>
        </View>

        {/* ── Notes ── */}
        {notes && (
          <View style={s.notesBlock}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        )}

        {/* ── Footer ── */}
        <View style={s.footer}>
          {!hideBranding && <Text style={s.footerText}>Generated by PortalKit</Text>}
          <Text style={s.footerText}>Payment processed securely via Stripe</Text>
        </View>

      </Page>
    </Document>
  )
}
