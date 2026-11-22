'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Ship,
  User,
  UserPlus,
} from 'lucide-react';
import { useCustomerAuth } from '@/components/public/CustomerAuthProvider';
import { useLanguage } from '@/components/public/LanguageProvider';
import Navbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/PublicFooter';
import { formatDestinationLabel } from '@/lib/i18n/dictionaries';
import { getPortalDictionary } from '@/lib/i18n/portal-dictionaries';
import type { CustomerSessionUser, PublicConfig } from '@/lib/types';

interface RegisterClientProps {
  config: PublicConfig;
  nextPath: string;
}

export default function RegisterClient({
  config,
  nextPath,
}: RegisterClientProps) {
  const { locale } = useLanguage();
  const portal = getPortalDictionary(locale);
  const { setCustomer } = useCustomerAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [destinationCity, setDestinationCity] = useState(
    config.destinations[0]?.city_name || 'Pontianak (Ambil di Gudang)'
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loginHref =
    nextPath && nextPath !== '/dashboard'
      ? `/login?next=${encodeURIComponent(nextPath)}`
      : '/login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg(portal.auth.errors.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(portal.auth.errors.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          whatsapp,
          company_name: companyName || null,
          default_destination_city: destinationCity,
          password,
          confirm_password: confirmPassword,
        }),
      });
      const data = (await res.json()) as {
        customer?: CustomerSessionUser;
        error?: string;
      };
      if (!res.ok || !data.customer) {
        setErrorMsg(data.error || portal.auth.errors.genericRegisterFail);
      } else {
        setCustomer(data.customer);
        router.push(nextPath || '/dashboard');
        router.refresh();
      }
    } catch {
      setErrorMsg(portal.auth.errors.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFD]">
      <Navbar settings={config.settings} />

      <main
        id="main-content"
        className="flex-1 py-10 lg:py-14 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
      >
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-[#DCE6F5] bg-white shadow-lg">
          {/* Left Benefit Panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#071838] via-[#0C2B6B] to-[#1748A8] text-white p-7 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1.5 text-xs font-bold text-gold">
                <Ship className="h-4 w-4" aria-hidden="true" />
                <span>{config.settings.company_name}</span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
                  {portal.auth.benefitsTitle}
                </h1>
                <p className="mt-3 text-sm text-blue-100 leading-relaxed">
                  {portal.auth.benefitsSubtitle}
                </p>
              </div>

              <ul className="space-y-3 pt-2">
                {portal.auth.benefits.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-blue-50"
                  >
                    <CheckCircle2
                      className="h-4 w-4 text-gold shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-200 hover:text-gold transition-colors w-fit"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {portal.auth.backToHome}
            </Link>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            <div className="max-w-lg w-full mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-ink tracking-tight">
                  {portal.auth.registerTitle}
                </h2>
                <p className="mt-1.5 text-sm text-slate-600">
                  {portal.auth.registerSubtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="reg-full-name"
                      className="block text-xs font-bold text-ink mb-1.5"
                    >
                      {portal.auth.fullNameLabel}
                    </label>
                    <div className="relative">
                      <User
                        className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
                        aria-hidden="true"
                      />
                      <input
                        id="reg-full-name"
                        type="text"
                        required
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={portal.auth.fullNamePlaceholder}
                        className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white pl-10 pr-3.5 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-whatsapp"
                      className="block text-xs font-bold text-ink mb-1.5"
                    >
                      {portal.auth.whatsappLabel}
                    </label>
                    <div className="relative">
                      <Phone
                        className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
                        aria-hidden="true"
                      />
                      <input
                        id="reg-whatsapp"
                        type="tel"
                        required
                        autoComplete="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder={portal.auth.whatsappPlaceholder}
                        className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white pl-10 pr-3.5 py-2 text-sm font-mono text-ink focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="reg-email"
                      className="block text-xs font-bold text-ink mb-1.5"
                    >
                      {portal.auth.emailLabel}
                    </label>
                    <div className="relative">
                      <Mail
                        className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
                        aria-hidden="true"
                      />
                      <input
                        id="reg-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={portal.auth.emailPlaceholder}
                        className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white pl-10 pr-3.5 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-company"
                      className="block text-xs font-bold text-ink mb-1.5"
                    >
                      {portal.auth.companyLabel}
                    </label>
                    <div className="relative">
                      <Building2
                        className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
                        aria-hidden="true"
                      />
                      <input
                        id="reg-company"
                        type="text"
                        autoComplete="organization"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder={portal.auth.companyPlaceholder}
                        className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white pl-10 pr-3.5 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reg-destination"
                    className="block text-xs font-bold text-ink mb-1.5"
                  >
                    {portal.auth.destinationLabel}
                  </label>
                  <div className="relative">
                    <MapPin
                      className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
                      aria-hidden="true"
                    />
                    <select
                      id="reg-destination"
                      value={destinationCity}
                      onChange={(e) => setDestinationCity(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white pl-10 pr-3.5 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                    >
                      {config.destinations.map((d) => (
                        <option key={d.id} value={d.city_name}>
                          {formatDestinationLabel(d.city_name, locale)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="reg-password"
                      className="block text-xs font-bold text-ink mb-1.5"
                    >
                      {portal.auth.passwordLabel}
                    </label>
                    <div className="relative">
                      <Lock
                        className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
                        aria-hidden="true"
                      />
                      <input
                        id="reg-password"
                        type="password"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={portal.auth.passwordHint}
                        className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white pl-10 pr-3.5 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-confirm-password"
                      className="block text-xs font-bold text-ink mb-1.5"
                    >
                      {portal.auth.confirmPasswordLabel}
                    </label>
                    <div className="relative">
                      <Lock
                        className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5"
                        aria-hidden="true"
                      />
                      <input
                        id="reg-confirm-password"
                        type="password"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={portal.auth.confirmPasswordPlaceholder}
                        className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white pl-10 pr-3.5 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div
                    role="alert"
                    className="rounded-xl bg-rose-50 border border-rose-300 px-4 py-3 text-xs font-semibold text-rose-800"
                  >
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-ink font-extrabold text-sm shadow-sm transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      {portal.auth.registeringBtn}
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                      {portal.auth.registerBtn}
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-[#E6EEF9] text-center text-xs sm:text-sm text-slate-600">
                {portal.auth.haveAccountText}{' '}
                <Link
                  href={loginHref}
                  className="font-extrabold text-brand hover:underline"
                >
                  {portal.auth.goToLogin}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter settings={config.settings} />
    </div>
  );
}
