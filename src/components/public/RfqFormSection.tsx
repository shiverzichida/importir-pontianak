'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  FileText,
  ImagePlus,
  Loader2,
  MessageCircle,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { formatIdr } from '@/lib/format';
import { formatDestinationLabel } from '@/lib/i18n/dictionaries';
import type {
  CalculatorPrefill,
  CargoCategory,
  CurrencyCode,
  KalbarDestination,
  OriginCountry,
  RfqOrder,
  RfqShippingMethod,
  ServiceType,
} from '@/lib/types';
import { useLanguage } from './LanguageProvider';

interface RfqFormSectionProps {
  destinations: KalbarDestination[];
  prefill: CalculatorPrefill | null;
  serviceTrigger: { service: ServiceType; nonce: number } | null;
  onClearPrefill: () => void;
}

export default function RfqFormSection({
  destinations,
  prefill,
  serviceTrigger,
  onClearPrefill,
}: RfqFormSectionProps) {
  const { locale, dict } = useLanguage();
  const [serviceType, setServiceType] = useState<ServiceType>('titip_beli');
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [destinationCity, setDestinationCity] = useState(
    destinations[0]?.city_name || 'Pontianak (Ambil di Gudang)'
  );
  const [originCountry, setOriginCountry] = useState<OriginCountry>('china');
  const [shippingMethod, setShippingMethod] = useState<RfqShippingMethod>('laut');
  const [cargoCategory, setCargoCategory] = useState<CargoCategory>('general');
  const [productUrl, setProductUrl] = useState('');
  const [productName, setProductName] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('RMB');
  const [estimatedGoodsValue, setEstimatedGoodsValue] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [estimatedWeightKg, setEstimatedWeightKg] = useState('');
  const [estimatedCbm, setEstimatedCbm] = useState('');
  const [estimatedTotalIdr, setEstimatedTotalIdr] = useState<number | null>(null);
  const [customerNotes, setCustomerNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    order: RfqOrder;
    whatsapp_url: string;
  } | null>(null);
  const [copiedRfqCode, setCopiedRfqCode] = useState(false);

  useEffect(() => {
    if (!serviceTrigger) return;
    setServiceType(serviceTrigger.service);
    setShippingMethod((prev) => {
      if (serviceTrigger.service === 'transfer_valas') return 'transfer_only';
      return prev === 'transfer_only' ? 'laut' : prev;
    });
  }, [serviceTrigger]);

  useEffect(() => {
    if (!prefill) return;
    if (prefill.service_type) {
      setServiceType(prefill.service_type);
    }
    setOriginCountry(prefill.origin_country);
    setShippingMethod(prefill.shipping_method);
    setCargoCategory(prefill.cargo_category);
    setDestinationCity(prefill.destination_city);
    setCurrency(prefill.currency);
    if (prefill.product_name) {
      setProductName(prefill.product_name);
    }
    if (prefill.product_url) {
      setProductUrl(prefill.product_url);
    }
    if (prefill.estimated_goods_value !== undefined) {
      setEstimatedGoodsValue(String(prefill.estimated_goods_value));
    }
    if (prefill.quantity !== undefined) {
      setQuantity(String(prefill.quantity));
    }
    if (prefill.estimated_weight_kg !== undefined) {
      setEstimatedWeightKg(String(prefill.estimated_weight_kg));
    }
    if (prefill.estimated_cbm !== undefined) {
      setEstimatedCbm(String(prefill.estimated_cbm));
    }
    setEstimatedTotalIdr(
      prefill.estimated_total_idr > 0 ? prefill.estimated_total_idr : null
    );
    setCustomerNotes((prev) => (prev ? prev : prefill.summary_note));
  }, [prefill]);

  const handleOriginChange = (origin: OriginCountry) => {
    setOriginCountry(origin);
    setCurrency(
      origin === 'china' ? 'RMB' : origin === 'malaysia' ? 'MYR' : 'SGD'
    );
    if (origin === 'malaysia' && shippingMethod === 'laut') {
      setShippingMethod('darat');
    } else if (origin !== 'malaysia' && shippingMethod === 'darat') {
      setShippingMethod('laut');
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setErrorMsg(data.error || dict.rfq.errors.uploadFail);
      } else {
        setPhotoUrl(data.url);
      }
    } catch {
      setErrorMsg(dict.rfq.errors.uploadFail);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          service_type: serviceType,
          customer_name: customerName,
          customer_whatsapp: customerWhatsapp,
          company_name: companyName || null,
          destination_city: destinationCity,
          origin_country: originCountry,
          shipping_method:
            serviceType === 'transfer_valas' ? 'transfer_only' : shippingMethod,
          cargo_category: cargoCategory,
          product_url: productUrl || null,
          product_name: productName,
          product_photo_url: photoUrl,
          currency,
          estimated_goods_value: estimatedGoodsValue
            ? Number(estimatedGoodsValue)
            : null,
          quantity: quantity ? Number(quantity) : 1,
          estimated_weight_kg: estimatedWeightKg
            ? Number(estimatedWeightKg)
            : null,
          estimated_cbm: estimatedCbm ? Number(estimatedCbm) : null,
          estimated_total_idr: estimatedTotalIdr,
          customer_notes: customerNotes || null,
        }),
      });

      const data = (await res.json()) as {
        order?: RfqOrder;
        whatsapp_url?: string;
        error?: string;
      };

      if (!res.ok || !data.order || !data.whatsapp_url) {
        setErrorMsg(data.error || dict.rfq.errors.submitFail);
      } else {
        setSubmittedResult({
          order: data.order,
          whatsapp_url: data.whatsapp_url,
        });
      }
    } catch {
      setErrorMsg(dict.rfq.errors.networkFail);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedResult(null);
    setProductUrl('');
    setProductName('');
    setPhotoUrl(null);
    setCustomerNotes('');
    setEstimatedTotalIdr(null);
    onClearPrefill();
  };

  return (
    <section
      id="rfq"
      className="py-14 lg:py-16 bg-white border-b border-[#E2EAF6]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-brand mb-1">
            <span
              className="w-6 h-0.5 bg-brand rounded-full"
              aria-hidden="true"
            />
            {dict.rfq.eyebrow}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            {dict.rfq.heading}
          </h2>
          <p className="mt-2 text-slate-700 text-sm sm:text-base">
            {dict.rfq.subtitle}
          </p>
        </div>

        {submittedResult ? (
          <div className="rounded-2xl border-2 border-wa bg-ice p-6 sm:p-10 text-center space-y-5 shadow-sm">
            <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 text-wa flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold text-wa">
                {dict.rfq.success.badge}
              </span>
              <h3 className="text-2xl font-extrabold text-ink mt-1">
                {dict.rfq.success.thankYou(submittedResult.order.customer_name)}
              </h3>
              <p className="text-sm text-slate-700 mt-1">
                {dict.rfq.success.desc}
              </p>
            </div>

            <div className="inline-flex items-center gap-3 rounded-xl bg-white border border-[#DCE6F5] px-5 py-3 shadow-sm">
              <span className="text-xs text-slate-700 font-semibold">
                {dict.rfq.success.codeLabel}
              </span>
              <span className="font-mono font-extrabold text-lg text-ink">
                {submittedResult.order.rfq_code}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(submittedResult.order.rfq_code);
                  setCopiedRfqCode(true);
                  setTimeout(() => setCopiedRfqCode(false), 2000);
                }}
                className="min-h-[36px] px-2 text-xs font-bold text-brand hover:underline inline-flex items-center gap-1"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                {copiedRfqCode
                  ? dict.rfq.success.copied
                  : dict.rfq.success.copy}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={submittedResult.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-wa hover:bg-wa-dark text-white font-bold px-6 text-sm shadow-sm transition-colors"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                {dict.rfq.success.sendWaBtn}
              </a>
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto min-h-[48px] rounded-full border border-[#DCE6F5] bg-white hover:bg-ice text-ink font-semibold px-5 text-sm transition-colors"
              >
                {dict.rfq.success.newOrderBtn}
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-[#DCE6F5] shadow-md overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#0C2B6B] to-[#1748A8] text-white px-6 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center">
                  <FileText
                    className="h-4 w-4 text-white"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <div className="font-bold text-sm">
                    {dict.rfq.formHeader.title}
                  </div>
                  <div className="text-xs text-blue-100">
                    {dict.rfq.formHeader.subtitle}
                  </div>
                </div>
              </div>
              <span className="hidden sm:inline-block rounded-full bg-gold text-ink px-3 py-1 text-xs font-extrabold">
                {dict.rfq.formHeader.fastReplyBadge}
              </span>
            </div>

            <div className="p-5 sm:p-8 space-y-6">
              <div>
                <p className="block text-sm font-bold text-ink mb-2.5">
                  {dict.rfq.serviceSelector.label}
                </p>
                <div
                  role="radiogroup"
                  aria-label={dict.rfq.serviceSelector.ariaLabel}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  {(['titip_beli', 'forwarder', 'transfer_valas'] as const).map(
                    (tabId) => {
                      const active = serviceType === tabId;
                      const tabCopy = dict.rfq.serviceSelector.items[tabId];
                      return (
                        <button
                          key={tabId}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => {
                            setServiceType(tabId);
                            if (tabId === 'transfer_valas') {
                              setShippingMethod('transfer_only');
                            } else if (shippingMethod === 'transfer_only') {
                              setShippingMethod(
                                originCountry === 'malaysia' ? 'darat' : 'laut'
                              );
                            }
                          }}
                          className={`text-left min-h-[72px] p-4 rounded-xl border transition-colors ${
                            active
                              ? 'bg-brand text-white border-brand shadow-sm'
                              : 'bg-ice text-ink border-[#DCE6F5] hover:border-brand'
                          }`}
                        >
                          <div className="font-bold text-sm">{tabCopy.title}</div>
                          <div
                            className={`text-xs mt-1 ${
                              active ? 'text-blue-100' : 'text-slate-600'
                            }`}
                          >
                            {tabCopy.desc}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {prefill && (
                <div className="flex items-start justify-between gap-3 rounded-xl bg-[#EEF5FF] border border-[#BBD2F8] px-4 py-3 text-xs text-ink">
                  <div>
                    <strong className="block text-brand">
                      {dict.rfq.prefillBanner.title}
                    </strong>
                    <span>
                      {prefill.summary_note}
                      {prefill.estimated_total_idr > 0 && (
                        <>
                          {' '}
                          ({dict.rfq.prefillBanner.estimateTotalLabel}{' '}
                          <strong>{formatIdr(prefill.estimated_total_idr)}</strong>
                          )
                        </>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClearPrefill();
                      setEstimatedTotalIdr(null);
                    }}
                    className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg text-brand hover:bg-white shrink-0"
                    aria-label={dict.rfq.prefillBanner.removeAria}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="rfq-customer-name"
                    className="block text-xs font-bold text-ink mb-1.5"
                  >
                    {dict.rfq.fields.fullNameLabel}
                  </label>
                  <input
                    id="rfq-customer-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={dict.rfq.fields.fullNamePlaceholder}
                    className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3.5 py-2 text-sm text-ink"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rfq-whatsapp"
                    className="block text-xs font-bold text-ink mb-1.5"
                  >
                    {dict.rfq.fields.whatsappLabel}
                  </label>
                  <input
                    id="rfq-whatsapp"
                    type="tel"
                    required
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    placeholder={dict.rfq.fields.whatsappPlaceholder}
                    className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3.5 py-2 text-sm font-mono text-ink"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rfq-company"
                    className="block text-xs font-bold text-ink mb-1.5"
                  >
                    {dict.rfq.fields.companyLabel}
                  </label>
                  <input
                    id="rfq-company"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={dict.rfq.fields.companyPlaceholder}
                    className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3.5 py-2 text-sm text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor="rfq-origin"
                    className="block text-xs font-bold text-ink mb-1.5"
                  >
                    {dict.rfq.fields.originLabel}
                  </label>
                  <select
                    id="rfq-origin"
                    value={originCountry}
                    onChange={(e) =>
                      handleOriginChange(e.target.value as OriginCountry)
                    }
                    className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3 py-2 text-sm text-ink"
                  >
                    <option value="china">
                      {dict.rfq.fields.originOptions.china}
                    </option>
                    <option value="malaysia">
                      {dict.rfq.fields.originOptions.malaysia}
                    </option>
                    <option value="singapura">
                      {dict.rfq.fields.originOptions.singapura}
                    </option>
                  </select>
                </div>

                {serviceType !== 'transfer_valas' && (
                  <div>
                    <label
                      htmlFor="rfq-method"
                      className="block text-xs font-bold text-ink mb-1.5"
                    >
                      {dict.rfq.fields.methodLabel}
                    </label>
                    <select
                      id="rfq-method"
                      value={shippingMethod}
                      onChange={(e) =>
                        setShippingMethod(e.target.value as RfqShippingMethod)
                      }
                      className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3 py-2 text-sm text-ink"
                    >
                      <option value="udara">
                        {dict.rfq.fields.methodOptions.udara}
                      </option>
                      <option value="laut">
                        {dict.rfq.fields.methodOptions.laut}
                      </option>
                      {originCountry === 'malaysia' && (
                        <option value="darat">
                          {dict.rfq.fields.methodOptions.darat}
                        </option>
                      )}
                    </select>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="rfq-category"
                    className="block text-xs font-bold text-ink mb-1.5"
                  >
                    {dict.rfq.fields.categoryLabel}
                  </label>
                  <select
                    id="rfq-category"
                    value={cargoCategory}
                    onChange={(e) =>
                      setCargoCategory(e.target.value as CargoCategory)
                    }
                    className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3 py-2 text-sm text-ink"
                  >
                    <option value="general">
                      {dict.rfq.fields.categoryOptions.general}
                    </option>
                    <option value="fashion">
                      {dict.rfq.fields.categoryOptions.fashion}
                    </option>
                    <option value="elektronik">
                      {dict.rfq.fields.categoryOptions.elektronik}
                    </option>
                    <option value="khusus">
                      {dict.rfq.fields.categoryOptions.khusus}
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="rfq-destination"
                    className="block text-xs font-bold text-ink mb-1.5"
                  >
                    {dict.rfq.fields.destinationLabel}
                  </label>
                  <select
                    id="rfq-destination"
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3 py-2 text-sm text-ink"
                  >
                    {destinations.map((d) => (
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
                    htmlFor="rfq-product-name"
                    className="block text-xs font-bold text-ink mb-1.5"
                  >
                    {dict.rfq.fields.productNameLabel}
                  </label>
                  <input
                    id="rfq-product-name"
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder={dict.rfq.fields.productNamePlaceholder}
                    className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3.5 py-2 text-sm text-ink"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rfq-product-url"
                    className="block text-xs font-bold text-ink mb-1.5"
                  >
                    {dict.rfq.fields.productUrlLabel}
                  </label>
                  <input
                    id="rfq-product-url"
                    type="url"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder={dict.rfq.fields.productUrlPlaceholder}
                    className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3.5 py-2 text-sm text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label
                    htmlFor="rfq-currency"
                    className="block text-xs font-bold text-ink mb-1.5"
                  >
                    {dict.rfq.fields.currencyLabel}
                  </label>
                  <select
                    id="rfq-currency"
                    value={currency}
                    onChange={(e) =>
                      setCurrency(e.target.value as CurrencyCode)
                    }
                    className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3 py-2 text-sm font-mono text-ink"
                  >
                    <option value="RMB">
                      {dict.rfq.fields.currencyOptions.RMB}
                    </option>
                    <option value="MYR">
                      {dict.rfq.fields.currencyOptions.MYR}
                    </option>
                    <option value="SGD">
                      {dict.rfq.fields.currencyOptions.SGD}
                    </option>
                    <option value="IDR">
                      {dict.rfq.fields.currencyOptions.IDR}
                    </option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="rfq-goods-value"
                    className="block text-xs font-bold text-ink mb-1.5"
                  >
                    {dict.rfq.fields.goodsValueLabel}
                  </label>
                  <input
                    id="rfq-goods-value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={estimatedGoodsValue}
                    onChange={(e) => setEstimatedGoodsValue(e.target.value)}
                    placeholder={dict.rfq.fields.goodsValuePlaceholder}
                    className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3 py-2 text-sm font-mono text-ink"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rfq-quantity"
                    className="block text-xs font-bold text-ink mb-1.5"
                  >
                    {dict.rfq.fields.qtyLabel}
                  </label>
                  <input
                    id="rfq-quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3 py-2 text-sm font-mono text-ink"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rfq-weight"
                    className="block text-xs font-bold text-ink mb-1.5"
                  >
                    {dict.rfq.fields.weightLabel}
                  </label>
                  <input
                    id="rfq-weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={estimatedWeightKg}
                    onChange={(e) => setEstimatedWeightKg(e.target.value)}
                    placeholder={dict.rfq.fields.optionalPlaceholder}
                    className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3 py-2 text-sm font-mono text-ink"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rfq-cbm"
                    className="block text-xs font-bold text-ink mb-1.5"
                  >
                    {dict.rfq.fields.cbmLabel}
                  </label>
                  <input
                    id="rfq-cbm"
                    type="number"
                    step="0.01"
                    min="0"
                    value={estimatedCbm}
                    onChange={(e) => setEstimatedCbm(e.target.value)}
                    placeholder={dict.rfq.fields.optionalPlaceholder}
                    className="w-full min-h-[44px] rounded-xl border border-[#D4E2F6] bg-white px-3 py-2 text-sm font-mono text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="rfq-photo-input"
                    className="block text-xs font-bold text-ink mb-1.5"
                  >
                    {dict.rfq.fields.photoLabel}
                  </label>
                  {photoUrl ? (
                    <div className="rounded-xl border border-[#D4E2F6] bg-ice p-2.5 flex items-center gap-3">
                      <img
                        src={photoUrl}
                        alt={dict.rfq.fields.photoAlt}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-lg object-cover border border-[#DCE6F5] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-wa">
                          {dict.rfq.fields.photoUploaded}
                        </div>
                        <div className="text-xs text-slate-600 truncate">
                          {photoUrl}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPhotoUrl(null)}
                        className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-rose-700 hover:bg-rose-50 rounded-lg"
                        aria-label={dict.rfq.fields.photoDeleteAria}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="rfq-photo-input"
                      className="flex items-center justify-center gap-2 min-h-[76px] rounded-xl border-2 border-dashed border-[#C2D5F2] bg-ice hover:border-brand px-4 py-5 transition-colors"
                    >
                      {uploadingPhoto ? (
                        <>
                          <Loader2
                            className="h-5 w-5 animate-spin text-brand"
                            aria-hidden="true"
                          />
                          <span className="text-xs font-semibold text-ink">
                            {dict.rfq.fields.photoUploading}
                          </span>
                        </>
                      ) : (
                        <>
                          <ImagePlus
                            className="h-5 w-5 text-brand"
                            aria-hidden="true"
                          />
                          <span className="text-xs font-semibold text-ink">
                            {dict.rfq.fields.photoPick}
                          </span>
                        </>
                      )}
                      <input
                        id="rfq-photo-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoSelect}
                        className="sr-only"
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="rfq-notes"
                    className="block text-xs font-bold text-ink mb-1.5"
                  >
                    {dict.rfq.fields.notesLabel}
                  </label>
                  <textarea
                    id="rfq-notes"
                    rows={3}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder={dict.rfq.fields.notesPlaceholder}
                    className="w-full rounded-xl border border-[#D4E2F6] bg-white px-3.5 py-2.5 text-sm text-ink"
                  />
                </div>
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="rounded-xl bg-rose-50 border border-rose-300 px-4 py-3 text-sm text-rose-800 font-medium"
                >
                  {errorMsg}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-xs text-slate-600">
                  {dict.rfq.footerDisclaimer}
                </p>
                <button
                  type="submit"
                  disabled={submitting || uploadingPhoto}
                  className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-ink font-extrabold px-7 text-sm shadow-sm transition-colors shrink-0"
                >
                  {submitting ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      {dict.rfq.submitLoading}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" aria-hidden="true" />
                      {dict.rfq.submitIdle}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
