import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="size-14 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
        <Icon className="size-6 text-on-surface-variant" />
      </div>
      <h3 className="text-base font-semibold text-on-surface mb-1">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed mb-6">{description}</p>
      {action}
    </div>
  )
}
