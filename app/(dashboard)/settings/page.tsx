'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { Bell, Lock, Palette, Building2, Users, CreditCard, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [companySettings, setCompanySettings] = useState({
    companyName: 'Smith Auto Garage',
    email: 'contact@smithgarage.com',
    phone: '555-123-4567',
    address: '123 Main Street, Springfield, IL 62701',
    website: 'www.smithgarage.com',
    taxId: '12-3456789',
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailOnNewJob: true,
    emailOnPayment: true,
    emailOnAppointment: true,
    smsReminders: false,
    dailyDigest: true,
    reportingAlerts: true,
  })

  const [userPreferences, setUserPreferences] = useState({
    theme: 'light',
    language: 'en',
    timeFormat: '24h',
    currency: 'USD',
    autoSave: true,
    showNotifications: true,
  })

  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [tempSettings, setTempSettings] = useState({ ...companySettings })

  const handleSaveCompanySettings = () => {
    setCompanySettings(tempSettings)
    setEditingSection(null)
    toast.success('Company settings updated successfully')
  }

  const handleCancelEdit = () => {
    setTempSettings(companySettings)
    setEditingSection(null)
  }

  const toggleNotification = (key: keyof typeof notificationSettings) => {
    const updated = { ...notificationSettings, [key]: !notificationSettings[key] }
    setNotificationSettings(updated)
    toast.success('Notification settings updated')
  }

  const handlePreferenceChange = (key: keyof typeof userPreferences, value: any) => {
    const updated = { ...userPreferences, [key]: value }
    setUserPreferences(updated)
    toast.success('Preference updated')
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Settings" />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your garage, notifications, and preferences
              </p>
            </div>

            {/* Company Settings */}
            <div className="border border-border rounded-lg bg-card p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Company Information</h2>
              </div>

              {editingSection === 'company' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={tempSettings.companyName}
                      onChange={(e) => setTempSettings({ ...tempSettings, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={tempSettings.email}
                        onChange={(e) => setTempSettings({ ...tempSettings, email: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={tempSettings.phone}
                        onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={tempSettings.address}
                      onChange={(e) => setTempSettings({ ...tempSettings, address: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        value={tempSettings.website}
                        onChange={(e) => setTempSettings({ ...tempSettings, website: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1">
                        Tax ID
                      </label>
                      <input
                        type="text"
                        value={tempSettings.taxId}
                        onChange={(e) => setTempSettings({ ...tempSettings, taxId: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveCompanySettings}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Company Name</p>
                      <p className="text-foreground font-medium">{companySettings.companyName}</p>
                    </div>
                    <button
                      onClick={() => {
                        setTempSettings(companySettings)
                        setEditingSection('company')
                      }}
                      className="px-3 py-1 border border-border rounded text-primary hover:bg-muted transition-colors text-sm"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="text-foreground">{companySettings.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="text-foreground">{companySettings.phone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="text-foreground">{companySettings.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Settings */}
            <div className="border border-border rounded-lg bg-card p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'emailOnNewJob', label: 'Email notifications for new jobs' },
                  { key: 'emailOnPayment', label: 'Email notifications for payments' },
                  { key: 'emailOnAppointment', label: 'Email notifications for appointments' },
                  { key: 'smsReminders', label: 'SMS appointment reminders' },
                  { key: 'dailyDigest', label: 'Daily summary email' },
                  { key: 'reportingAlerts', label: 'Alert me on critical reporting issues' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={notificationSettings[key as keyof typeof notificationSettings]}
                      onChange={() => toggleNotification(key as keyof typeof notificationSettings)}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-foreground font-medium flex-1">{label}</span>
                    {notificationSettings[key as keyof typeof notificationSettings] && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* User Preferences */}
            <div className="border border-border rounded-lg bg-card p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <Palette className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Preferences</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Theme
                  </label>
                  <select
                    value={userPreferences.theme}
                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">System</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Language
                  </label>
                  <select
                    value={userPreferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Time Format
                  </label>
                  <select
                    value={userPreferences.timeFormat}
                    onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="12h">12 Hour</option>
                    <option value="24h">24 Hour</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Currency
                  </label>
                  <select
                    value={userPreferences.currency}
                    onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                {[
                  { key: 'autoSave', label: 'Auto-save draft changes' },
                  { key: 'showNotifications', label: 'Show in-app notifications' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={userPreferences[key as keyof typeof userPreferences] as boolean}
                      onChange={(e) => handlePreferenceChange(key as keyof typeof userPreferences, e.target.checked)}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-foreground font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-destructive/20 rounded-lg bg-destructive/5 p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-destructive/20">
                <Lock className="h-5 w-5 text-destructive" />
                <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
              </div>

              <button className="w-full px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors font-medium">
                Delete All Data
              </button>
              <p className="text-xs text-muted-foreground">
                This action will permanently delete all your garage data including customers, vehicles, and job cards. This cannot be undone.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
