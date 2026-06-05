export default function NotificationsPage() {
  return (
    <div className="max-w-2xl flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Notifications</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">Control what emails you receive from PortalKit.</p>
      </div>
      <div className="bg-white rounded-xl border border-outline-variant p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-on-surface">Email notifications</h2>
        <p className="text-sm text-on-surface-variant">
          You currently receive emails for: file approvals, invoice payments, new messages, and status changes.
          Advanced notification controls are coming in a future release.
        </p>
        <p className="text-xs text-on-surface-variant">
          To unsubscribe from all emails, contact support or use the unsubscribe link at the bottom of any email.
        </p>
      </div>
    </div>
  )
}
