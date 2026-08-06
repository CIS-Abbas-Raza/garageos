'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default function ProfilePage() {
  const [name, setName] = useState('Garage Administrator')
  const [email, setEmail] = useState('admin@garageos.com')

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader title="Profile Settings" />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight">Profile Settings</h1>
            <p className="mt-2 text-muted-foreground">Manage your personal details and password.</p>
            <div className="mt-8 space-y-6">
              <form onSubmit={(event) => { event.preventDefault(); toast.success('Profile updated') }} className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-semibold">Personal details</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-medium">
                    Display name
                    <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2.5 font-normal" />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium">
                    Email
                    <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2.5 font-normal" />
                  </label>
                </div>
                <button className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Save profile</button>
              </form>
              <form onSubmit={(event) => { event.preventDefault(); toast.success('Password change saved') }} className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-semibold">Change password</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <input type="password" placeholder="Current password" className="rounded-lg border border-border bg-background px-3 py-2.5" />
                  <input type="password" placeholder="New password" className="rounded-lg border border-border bg-background px-3 py-2.5" />
                </div>
                <button className="mt-5 rounded-lg border border-border px-4 py-2 text-sm font-semibold">Update password</button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
