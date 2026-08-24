'use client'

import { useEffect, useState } from 'react'
import { Camera, ImagePlus, LockKeyhole, Save, Trash2, UserRound } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'

const countries = ['United States', 'Pakistan', 'United Kingdom', 'Canada', 'Australia', 'United Arab Emirates']

type Tab = 'details' | 'security'

export function ProfileSettingsPage() {
  const { user, updateProfile, changePassword } = useAuth()
  const [tab, setTab] = useState<Tab>('details')
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', country: 'United States', photo: '' })
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    if (!user) return
    setProfile({ name: user.userName, email: user.email, phone: user.phoneNumber ?? '', address: user.address ?? '', country: user.country ?? 'United States', photo: user.profilePhoto ?? '' })
  }, [user])

  const updateField = (field: keyof typeof profile, value: string) => setProfile((current) => ({ ...current, [field]: value }))
  const handlePhoto = (file?: File) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return toast.error('Use a JPG, PNG, or WebP image.')
    if (file.size > 2 * 1024 * 1024) return toast.error('Profile photo must be smaller than 2MB.')
    const reader = new FileReader()
    reader.onload = () => updateField('photo', typeof reader.result === 'string' ? reader.result : '')
    reader.readAsDataURL(file)
  }
  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    if ([profile.name, profile.email, profile.phone, profile.address, profile.country].some((value) => !value.trim())) return toast.error('Complete all required profile fields.')
    setSavingProfile(true)
    try { await updateProfile({ userName: profile.name.trim(), email: profile.email.trim(), phoneNumber: profile.phone.trim(), address: profile.address.trim(), country: profile.country, profilePhoto: profile.photo || null }); toast.success('Profile information updated.') } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to update your profile.') } finally { setSavingProfile(false) }
  }
  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!password.current || !password.next || !password.confirm) return toast.error('Complete all password fields.')
    if (password.next.length < 8) return toast.error('New password must be at least 8 characters.')
    if (password.next !== password.confirm) return toast.error('New passwords do not match.')
    setSavingPassword(true)
    try { await changePassword(password.current, password.next); setPassword({ current: '', next: '', confirm: '' }); toast.success('Password updated successfully.') } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to update your password.') } finally { setSavingPassword(false) }
  }

  return <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div className="mb-5"><p className="text-sm font-medium text-primary">Account</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Account Settings</h1><p className="mt-2 text-sm text-muted-foreground">Manage your profile details, personal contact information, and account credentials.</p></div>
    <div className="mb-6 inline-flex rounded-lg border border-border bg-muted/30 p-1"><button type="button" onClick={() => setTab('details')} className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${tab === 'details' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><UserRound className="size-4" /> Profile Details</button><button type="button" onClick={() => setTab('security')} className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${tab === 'security' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><LockKeyhole className="size-4" /> Security &amp; Password</button></div>
    {tab === 'details' ? <form onSubmit={saveProfile} className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm"><div className="border-b border-border pb-4"><h2 className="font-semibold">Profile Picture</h2><p className="mt-1 text-xs text-muted-foreground">Upload a JPG, PNG, or WebP image up to 2MB.</p></div><label className="mt-6 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-primary/[0.03] px-4 text-center hover:bg-primary/[0.06]" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handlePhoto(event.dataTransfer.files[0]) }}><div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-primary/40 bg-primary/10 text-primary">{profile.photo ? <img src={profile.photo} alt="Profile preview" className="size-full object-cover" /> : <Camera className="size-8" />}</div><span className="mt-4 text-xs font-semibold text-foreground">Click or drag to upload</span><span className="mt-1 text-[11px] text-muted-foreground">JPG, PNG, or WebP up to 2MB</span><input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => handlePhoto(event.target.files?.[0])} /></label>{profile.photo && <Button type="button" variant="ghost" size="sm" className="mx-auto mt-3 flex" onClick={() => updateField('photo', '')}><Trash2 className="size-4" /> Remove photo</Button>}<div className="mt-5 text-center"><p className="font-semibold">{profile.name || 'Your name'}</p><p className="mt-1 truncate text-xs text-muted-foreground">{profile.email || 'your@email.com'}</p></div></section>
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="border-b border-border pb-4"><h2 className="flex items-center gap-2 font-semibold"><ImagePlus className="size-5 text-primary" /> Personal &amp; Contact Details</h2><p className="mt-1 text-xs text-muted-foreground">Update your general display profile and personal identifiers.</p></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-name">Display / Full Name *</Label><Input id="profile-name" value={profile.name} onChange={(event) => updateField('name', event.target.value)} required /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-email">Email Address</Label><Input id="profile-email" type="email" value={profile.email} readOnly className="bg-muted/50" /></div><div className="space-y-2"><Label htmlFor="profile-phone">Phone Number *</Label><Input id="profile-phone" type="tel" value={profile.phone} onChange={(event) => updateField('phone', event.target.value)} required /></div><div className="space-y-2"><Label htmlFor="profile-country">Country *</Label><select id="profile-country" value={profile.country} onChange={(event) => updateField('country', event.target.value)} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" required>{countries.map((item) => <option key={item}>{item}</option>)}</select></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-address">Address *</Label><Input id="profile-address" value={profile.address} onChange={(event) => updateField('address', event.target.value)} required /></div></div><div className="mt-6 flex justify-end gap-2 border-t border-border pt-4"><Button type="button" variant="outline" onClick={() => setTab('details')}>Cancel</Button><Button type="submit" disabled={savingProfile}><Save className="size-4" /> {savingProfile ? 'Saving...' : 'Save Changes'}</Button></div></section>
    </form> : <form onSubmit={savePassword} className="max-w-4xl rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="border-b border-border pb-4"><h2 className="flex items-center gap-2 font-semibold"><LockKeyhole className="size-5 text-primary" /> Change Password</h2><p className="mt-1 text-xs text-muted-foreground">Verify your current password before setting a new one.</p></div><div className="mt-6 grid gap-4 sm:grid-cols-3"><div className="space-y-2"><Label htmlFor="current-password">Current password *</Label><Input id="current-password" type="password" value={password.current} onChange={(event) => setPassword((current) => ({ ...current, current: event.target.value }))} required /></div><div className="space-y-2"><Label htmlFor="new-password">New password *</Label><Input id="new-password" type="password" minLength={8} value={password.next} onChange={(event) => setPassword((current) => ({ ...current, next: event.target.value }))} required /></div><div className="space-y-2"><Label htmlFor="confirm-password">Confirm new password *</Label><Input id="confirm-password" type="password" minLength={8} value={password.confirm} onChange={(event) => setPassword((current) => ({ ...current, confirm: event.target.value }))} required /></div></div><div className="mt-6 flex justify-end gap-2 border-t border-border pt-4"><Button type="button" variant="outline" onClick={() => setTab('details')}>Cancel</Button><Button type="submit" disabled={savingPassword}>{savingPassword ? 'Updating...' : 'Save Changes'}</Button></div></form>}
  </div>
}
