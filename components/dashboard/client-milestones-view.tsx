"use client"

import { useState } from 'react'
import Link from 'next/link'
import { MilestoneManager } from '@/components/dashboard/milestone-manager'
import { Button } from '@/components/ui/button'

interface ProjectOption {
  id: string
  title: string
}

interface ClientMilestonesViewProps {
  clientId: string
  projects: ProjectOption[]
}

export function ClientMilestonesView({ clientId, projects }: ClientMilestonesViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? '')

  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-outline-variant/20 bg-white p-8 shadow-sm">
          <h1 className="text-lg font-semibold">Milestones</h1>
          <p className="mt-3 text-sm text-on-surface-variant">
            Add a project first and then you can create milestones for that project here.
          </p>
          <Link href={`/dashboard/clients/${clientId}`}>
            <Button className="mt-4">Back to client overview</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-outline-variant/20 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold">Milestones</h1>
            <p className="text-sm text-on-surface-variant mt-1">Pick a project to manage milestones for it.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor="project-select" className="text-sm font-medium text-on-surface">Project</label>
            <select
              id="project-select"
              value={selectedProjectId}
              onChange={event => setSelectedProjectId(event.target.value)}
              className="rounded-lg border border-outline-variant/60 bg-surface px-3 py-2 text-sm text-on-surface focus:border-ds-secondary focus:ring-2 focus:ring-ds-secondary/20"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <MilestoneManager projectId={selectedProjectId} />
    </div>
  )
}
