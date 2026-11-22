'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2, Save, UserCheck } from 'lucide-react';
import { useCustomerAuth } from '@/components/public/CustomerAuthProvider';
import { useLanguage } from '@/components/public/LanguageProvider';
import { formatDestinationLabel } from '@/lib/i18n/dictionaries';
import { getPortalDictionary } from '@/lib/i18n/portal-dictionaries';
import type {
  CustomerProfile,
  CustomerSessionUser,
  KalbarDestination,
} from '@/lib/types';
import MemberShell from './MemberShell';

interface MemberProfileClientProps {
  profile: CustomerProfile;
  destinations: KalbarDestination[];
}

export default function MemberProfileClient({
  profile: initialProfile,
  destinations,
}: MemberProfileClientProps) {
  const { locale } = useLanguage();
  const { setCustomer } = useCustomerAuth();
  const router = useRouter();
  const portal = getPortalDictionary(locale);

  const [profile, setProfile] = useState<CustomerProfile>(initialProfile);
  const [fullName, setFullName] = useState(initialProfile.full_name);
  const [whatsapp, setWhatsapp] = useState(initialProfile.whatsapp);
  const [companyName, setCompanyName] = useState(
    initialProfile.company_name || ''
  );
  const [defaultDestinationCity, setDefaultDestinationCity] = useState(
    initialProfile.default_destination_city
  );
  const [addressDetail, setAddressDetail] = useState(
    initialProfile.address_detail || ''
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{
    type: 'ok' | 'err';
    msg: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'ok' | 'err';
    msg: string;
  } | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFeedback(null);
    setSavingProfile(true);
    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          whatsapp,
          company_name: companyName || null,
          default_destination_city: defaultDestinationCity,
          address_detail: addressDetail || null,
        }),
      });
      const data = (await res.json()) as {
        customer?: CustomerSessionUser;
        profile?: CustomerProfile;
        error?: string;
      };
      if (!res.ok || !data.customer || !data.profile) {
        setProfileFeedback({
          type: 'err',
          msg: data.error || portal.profile.profileErrorMsg,
        });
      } else {
        setProfile(data.profile);
        setCustomer(data.customer);
        setProfileFeedback({
          type: 'ok',
          msg: portal.profile.profileSavedMsg,
        });
        router.refresh();
      }
    } catch {
      setProfileFeedback({ type: 'err', msg: portal.auth.errors.networkError });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword.length < 6) {
      setPasswordFeedback({
        type: 'err',
        msg: portal.profile.passwordTooShortMsg,
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordFeedback({
        type: 'err',
        msg: portal.profile.passwordMismatchMsg,
      });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/customer/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setPasswordFeedback({
          type: 'err',
          msg: data.error || portal.profile.passwordErrorMsg,
        });
      } else {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setPasswordFeedback({
          type: 'ok',
          msg: portal.profile.passwordSavedMsg,
        });
      }
    } catch {
      setPasswordFeedback({
        type: 'err',
        msg: portal.auth.errors.networkError,
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <MemberShell profile={profile}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            {portal.profile.title}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {portal.profile.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Profile Form */}
          <form
            onSubmit={handleSaveProfile}
            className="lg:col-span-7 bg-white rounded-2xl border border-[#DCE6F5] p-6 space-y-5 shadow-sm"
          >
            <div className="flex items-center gap-2 text-base font-extrabold text-ink border-b border-[#E6EEF9] pb-3">
              <UserCheck className="h-5 w-5 text-brand" aria-hidden="true" />
              {portal.profile.accountInfoTitle}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl bg-ice border border-[#DCE6F5] p-4 text-xs">
              <div>
                <div className="text-slate-500 font-semibold">
                  {portal.profile.memberCodeLabel}
                </div>
                <div className="font-mono font-extrabold text-brand mt-0.5">
                  {profile.member_code}
                </div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold">
                  {portal.profile.markingBaseLabel}
                </div>
                <div className="font-mono font-extrabold text-navy mt-0.5">
                  {profile.marking_code_base}
                </div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold">
                  {portal.profile.emailLabel}
                </div>
                <div className="font-semibold text-ink truncate mt-0.5">
                  {profile.email}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="profile-full-name"
                  className="block text-xs font-bold text-ink mb-1.5"
                >
                  {portal.profile.fullNameLabel}
                </label>
                <input
                  id="profile-full-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3.5 py-2 text-sm text-ink"
                />
              </div>
              <div>
                <label
                  htmlFor="profile-whatsapp"
                  className="block text-xs font-bold text-ink mb-1.5"
                >
                  {portal.profile.whatsappLabel}
                </label>
                <input
                  id="profile-whatsapp"
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3.5 py-2 text-sm font-mono text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="profile-company"
                  className="block text-xs font-bold text-ink mb-1.5"
                >
                  {portal.profile.companyLabel}
                </label>
                <input
                  id="profile-company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3.5 py-2 text-sm text-ink"
                />
              </div>
              <div>
                <label
                  htmlFor="profile-destination"
                  className="block text-xs font-bold text-ink mb-1.5"
                >
                  {portal.profile.destinationLabel}
                </label>
                <select
                  id="profile-destination"
                  value={defaultDestinationCity}
                  onChange={(e) => setDefaultDestinationCity(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3.5 py-2 text-sm text-ink"
                >
                  {destinations.map((d) => (
                    <option key={d.id} value={d.city_name}>
                      {formatDestinationLabel(d.city_name, locale)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-address"
                className="block text-xs font-bold text-ink mb-1.5"
              >
                {portal.profile.addressLabel}
              </label>
              <textarea
                id="profile-address"
                rows={3}
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                placeholder={portal.profile.addressPlaceholder}
                className="w-full rounded-xl border border-[#D4E2F6] bg-white px-3.5 py-2.5 text-sm text-ink"
              />
            </div>

            {profileFeedback && (
              <div
                role="status"
                className={`rounded-xl px-4 py-3 text-xs font-semibold ${
                  profileFeedback.type === 'ok'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border border-rose-300'
                }`}
              >
                {profileFeedback.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="min-h-[46px] inline-flex items-center gap-2 rounded-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-bold px-6 text-xs sm:text-sm transition-colors"
            >
              {savingProfile ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4" aria-hidden="true" />
              )}
              {savingProfile
                ? portal.profile.savingProfileBtn
                : portal.profile.saveProfileBtn}
            </button>
          </form>

          {/* Password Form */}
          <form
            onSubmit={handleChangePassword}
            className="lg:col-span-5 bg-white rounded-2xl border border-[#DCE6F5] p-6 space-y-5 shadow-sm h-fit"
          >
            <div className="flex items-center gap-2 text-base font-extrabold text-ink border-b border-[#E6EEF9] pb-3">
              <KeyRound className="h-5 w-5 text-brand" aria-hidden="true" />
              {portal.profile.passwordTitle}
            </div>

            <div>
              <label
                htmlFor="current-password"
                className="block text-xs font-bold text-ink mb-1.5"
              >
                {portal.profile.currentPasswordLabel}
              </label>
              <input
                id="current-password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3.5 py-2 text-sm text-ink"
              />
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-bold text-ink mb-1.5"
              >
                {portal.profile.newPasswordLabel}
              </label>
              <input
                id="new-password"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3.5 py-2 text-sm text-ink"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-new-password"
                className="block text-xs font-bold text-ink mb-1.5"
              >
                {portal.profile.confirmNewPasswordLabel}
              </label>
              <input
                id="confirm-new-password"
                type="password"
                required
                minLength={6}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3.5 py-2 text-sm text-ink"
              />
            </div>

            {passwordFeedback && (
              <div
                role="status"
                className={`rounded-xl px-4 py-3 text-xs font-semibold ${
                  passwordFeedback.type === 'ok'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border border-rose-300'
                }`}
              >
                {passwordFeedback.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-full bg-navy hover:bg-navy-light disabled:opacity-60 text-white font-bold px-6 text-xs sm:text-sm transition-colors"
            >
              {savingPassword ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <KeyRound className="h-4 w-4 text-gold" aria-hidden="true" />
              )}
              {savingPassword
                ? portal.profile.savingPasswordBtn
                : portal.profile.savePasswordBtn}
            </button>
          </form>
        </div>
      </div>
    </MemberShell>
  );
}
