import { useState } from 'react';
import { Lock, UserCircle2, Mail, Palette } from 'lucide-react';
import ModuleHeader from '../components/modules/ModuleHeader';
import ToggleSwitch from '../components/modules/ToggleSwitch';
import AnnouncementBanner from '../components/modules/AnnouncementBanner';

function SectionCard({ title, subtitle, children }) {
  return (
    <section className="card-premium p-5 sm:p-6 space-y-4">
      <div>
        <h3 className="heading-medium">{title}</h3>
        <p className="text-sub mt-1">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Settings"
        subtitle="Manage your account preferences and workspace behavior."
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard
          title="Profile Info"
          subtitle="Update your account details shown across the dashboard."
        >
          <div className="space-y-4">
            <label className="block">
              <span className="label flex items-center gap-1">
                <UserCircle2 size={13} />
                Name
              </span>
              <input
                type="text"
                defaultValue="CleanQ Admin"
                className="input-premium h-11 w-full rounded-2xl bg-slate-50"
              />
            </label>
            <label className="block">
              <span className="label flex items-center gap-1">
                <Mail size={13} />
                Email
              </span>
              <input
                type="email"
                defaultValue="admin@cleanq.io"
                className="input-premium h-11 w-full rounded-2xl bg-slate-50"
              />
            </label>
            <button type="button" className="btn-premium btn-premium-primary">
              Save Profile
            </button>
          </div>
        </SectionCard>

        <SectionCard
          title="Change Password"
          subtitle="For security, use a strong and unique password."
        >
          <div className="space-y-4">
            <label className="block">
              <span className="label flex items-center gap-1">
                <Lock size={13} />
                Current Password
              </span>
              <input type="password" className="input-premium h-11 w-full rounded-2xl bg-slate-50" />
            </label>
            <label className="block">
              <span className="label">New Password</span>
              <input type="password" className="input-premium h-11 w-full rounded-2xl bg-slate-50" />
            </label>
            <label className="block">
              <span className="label">Confirm Password</span>
              <input type="password" className="input-premium h-11 w-full rounded-2xl bg-slate-50" />
            </label>
            <button type="button" className="btn-premium btn-premium-secondary">
              Update Password
            </button>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Preferences" subtitle="Control notifications and dashboard look and feel.">
        <div className="divide-y divide-slate-100">
          <ToggleSwitch
            enabled={notificationsEnabled}
            onChange={setNotificationsEnabled}
            label="Notifications"
            hint="Get updates about order status changes and daily summaries."
          />
          <ToggleSwitch
            enabled={darkModeEnabled}
            onChange={setDarkModeEnabled}
            label="Theme"
            hint={`Current mode: ${darkModeEnabled ? 'Dark' : 'Light'} (visual toggle only)`}
          />
        </div>
        <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Palette size={14} />
          Theme switch is UI-only for now and can be wired to global styles later.
        </div>
      </SectionCard>

      <AnnouncementBanner message="Advanced configurations and AI automation settings coming soon" />
    </div>
  );
}
