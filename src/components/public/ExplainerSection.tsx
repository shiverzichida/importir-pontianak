'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Container,
  Download,
  FileText,
  Film,
  Link2,
  MessageCircle,
  PackageCheck,
  Pause,
  Play,
  RotateCcw,
  Share2,
  ShoppingBag,
  Sparkles,
  UserPlus,
  Volume2,
  VolumeX,
} from 'lucide-react';
import timingsData from '@/lib/explainer-timings.json';
import { formatNumberId } from '@/lib/format';
import { getExplainerDictionary } from '@/lib/i18n/explainer-dictionaries';
import { useCustomerAuth } from './CustomerAuthProvider';
import { useLanguage } from './LanguageProvider';

interface ExplainerSectionProps {
  playTriggerNonce?: number;
}

const STEP_ICONS = [UserPlus, Link2, PackageCheck, CheckCircle2] as const;

function formatClock(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const mm = String(Math.floor(safe / 60)).padStart(2, '0');
  const ss = String(safe % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function ExplainerSection({
  playTriggerNonce = 0,
}: ExplainerSectionProps) {
  const { locale, dict } = useLanguage();
  const { customer } = useCustomerAuth();
  const exp = getExplainerDictionary(locale);

  const scenes = timingsData.scenes;
  const totalDuration = timingsData.totalDurationSec;

  const [viewMode, setViewMode] = useState<'interactive' | 'mp4'>('interactive');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState<1 | 1.25>(1);
  const [currentSec, setCurrentSec] = useState(0);
  const [hasStartedOnce, setHasStartedOnce] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  const activeSceneIdx = useMemo(() => {
    for (let i = 0; i < scenes.length; i++) {
      if (currentSec >= scenes[i].startSec && currentSec < scenes[i].endSec) {
        return i;
      }
    }
    return currentSec >= totalDuration ? scenes.length - 1 : 0;
  }, [currentSec, scenes, totalDuration]);

  const activeSceneMeta = scenes[activeSceneIdx] || scenes[0];
  const activeSceneCopy = exp.scenes[activeSceneIdx] || exp.scenes[0];
  const localProgress = Math.max(
    0,
    Math.min(
      1,
      (currentSec - activeSceneMeta.startSec) /
        Math.max(0.01, activeSceneMeta.durationSec)
    )
  );
  const totalProgress = Math.max(
    0,
    Math.min(1, currentSec / Math.max(0.01, totalDuration))
  );

  // Sync audio playbackRate & mute state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted || locale !== 'id';
    audio.playbackRate = speed;
  }, [isMuted, speed, locale]);

  const stopTimer = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTickRef.current = null;
  }, []);

  // Main animation & audio sync loop
  useEffect(() => {
    if (!isPlaying || viewMode !== 'interactive') {
      stopTimer();
      return;
    }

    lastTickRef.current = performance.now();

    const tick = (now: number) => {
      const audio = audioRef.current;
      const dt = ((now - (lastTickRef.current ?? now)) / 1000) * speed;
      lastTickRef.current = now;

      setCurrentSec((prev) => {
        if (
          audio &&
          !audio.paused &&
          !audio.ended &&
          Number.isFinite(audio.currentTime)
        ) {
          return Math.min(totalDuration, audio.currentTime);
        }
        const next = prev + dt;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopTimer();
  }, [isPlaying, viewMode, speed, totalDuration, stopTimer]);

  const startPlaybackAt = useCallback(
    async (sec: number) => {
      setViewMode('interactive');
      setHasStartedOnce(true);
      setCurrentSec(sec);
      setIsPlaying(true);

      const audio = audioRef.current;
      if (audio) {
        try {
          audio.currentTime = Math.min(
            Math.max(0, sec),
            Math.max(0, totalDuration - 0.1)
          );
          audio.playbackRate = speed;
          audio.muted = isMuted || locale !== 'id';
          await audio.play();
        } catch {
          // Browser may block unmuted play on non-gesture transitions; RAF continues cleanly
        }
      }
    },
    [isMuted, locale, speed, totalDuration]
  );

  const togglePlay = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current?.pause();
      return;
    }
    const startAt = currentSec >= totalDuration - 0.15 ? 0 : currentSec;
    await startPlaybackAt(startAt);
  };

  const handleRestart = async () => {
    await startPlaybackAt(0);
  };

  const handleJumpScene = async (sceneIndex: number) => {
    const target = scenes[sceneIndex]?.startSec ?? 0;
    await startPlaybackAt(target);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextSec = Number(e.target.value);
    setCurrentSec(nextSec);
    setHasStartedOnce(true);
    if (audioRef.current) {
      audioRef.current.currentTime = nextSec;
    }
  };

  useEffect(() => {
    if (playTriggerNonce <= 0) return;
    startPlaybackAt(0);
  }, [playTriggerNonce, startPlaybackAt]);

  const siteUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://importir-pontianak.43-173-33-53.sslip.io';
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(
    exp.shareWaMessage(siteUrl)
  )}`;

  const activeWorkflowIdx = activeSceneIdx === 0 ? 0 : Math.min(3, activeSceneIdx - 1);

  return (
    <section
      id="alur-kerja"
      className="py-12 lg:py-16 bg-ice border-b border-[#E2EAF6]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Heading + Mode Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand mb-1">
              <span
                className="w-6 h-0.5 bg-brand rounded-full"
                aria-hidden="true"
              />
              {dict.workflow.eyebrow}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              {dict.workflow.heading}
            </h2>
            <p className="mt-2 text-slate-700 text-sm sm:text-base">
              {exp.subtitleIntro}
            </p>
          </div>

          <div
            role="group"
            aria-label="Player mode"
            className="inline-flex items-center rounded-full bg-white border border-[#DCE6F5] p-1 shadow-sm self-start lg:self-auto"
          >
            <button
              type="button"
              onClick={() => {
                setViewMode('interactive');
              }}
              className={`min-h-[38px] inline-flex items-center gap-1.5 px-4 rounded-full text-xs font-bold transition-colors ${
                viewMode === 'interactive'
                  ? 'bg-navy text-gold shadow-sm'
                  : 'text-slate-600 hover:text-ink'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {exp.modeInteractive}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                audioRef.current?.pause();
                setViewMode('mp4');
              }}
              className={`min-h-[38px] inline-flex items-center gap-1.5 px-4 rounded-full text-xs font-bold transition-colors ${
                viewMode === 'mp4'
                  ? 'bg-navy text-gold shadow-sm'
                  : 'text-slate-600 hover:text-ink'
              }`}
            >
              <Film className="h-3.5 w-3.5" aria-hidden="true" />
              {exp.modeMp4}
            </button>
          </div>
        </div>

        {/* Hidden Synced Audio Track (Indonesian Neural TTS) */}
        <audio
          ref={audioRef}
          src="/audio/explainer-cara-kerja-id.mp3"
          preload="metadata"
          onEnded={() => {
            setIsPlaying(false);
            setCurrentSec(totalDuration);
          }}
        />

        {/* MAIN EXPLAINER PLAYER CONTAINER */}
        <div className="rounded-3xl bg-white border border-[#DCE6F5] shadow-lg overflow-hidden">
          {viewMode === 'mp4' ? (
            <div className="bg-navy">
              <video
                controls
                playsInline
                preload="metadata"
                poster="/images/hero-port-pontianak.jpg"
                className="w-full aspect-video max-h-[540px] mx-auto bg-black"
                src="/videos/explainer-cara-kerja-importir-pontianak.mp4"
              />
            </div>
          ) : (
            <>
              {/* Top Mini Progress Header inside Interactive Player */}
              <div className="bg-navy text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-7 w-7 rounded-lg bg-brand text-gold font-extrabold text-xs inline-flex items-center justify-center">
                    IP
                  </span>
                  <span className="text-xs font-bold tracking-wide text-blue-100">
                    IMPORTIR PONTIANAK · {formatClock(currentSec)} /{' '}
                    {formatClock(totalDuration)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {exp.scenes.map((sc, idx) => {
                    const active = idx === activeSceneIdx;
                    const done = idx < activeSceneIdx;
                    return (
                      <button
                        key={sc.pillLabel}
                        type="button"
                        onClick={() => handleJumpScene(idx)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                          active
                            ? 'bg-gold text-ink shadow-sm'
                            : done
                              ? 'bg-brand text-white'
                              : 'bg-white/10 text-blue-100 hover:bg-white/20'
                        }`}
                      >
                        {sc.pillLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Animated Stage */}
              <div className="relative bg-gradient-to-br from-[#F4F9FF] via-white to-[#EAF2FF] px-5 sm:px-10 py-8 sm:py-10 min-h-[380px] lg:min-h-[420px] flex flex-col justify-between overflow-hidden">
                {/* Click-to-play initial overlay */}
                {!hasStartedOnce && !isPlaying && (
                  <button
                    type="button"
                    onClick={() => startPlaybackAt(0)}
                    className="group absolute inset-0 z-20 bg-navy/25 backdrop-blur-[1px] hover:bg-navy/35 transition-colors flex flex-col items-center justify-center gap-3 p-4"
                  >
                    <span className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gold group-hover:scale-110 transition-transform text-ink shadow-xl flex items-center justify-center">
                      <Play className="h-8 w-8 sm:h-9 sm:w-9 ml-1" aria-hidden="true" />
                    </span>
                    <span className="rounded-full bg-navy text-white px-5 py-2 text-xs sm:text-sm font-extrabold shadow-md">
                      {exp.tapToPlayOverlay}
                    </span>
                  </button>
                )}

                {/* Scene Content Grid */}
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-7 items-center my-auto">
                  {/* Left 5 cols: Scene Headline + Subline */}
                  <div className="lg:col-span-5 space-y-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft border border-[#BFD6F9] px-3 py-1 text-[11px] font-extrabold text-brand">
                      {activeSceneCopy.badge}
                    </span>

                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-ink leading-tight">
                      {activeSceneCopy.headline}
                    </h3>

                    <p className="text-sm text-slate-700 leading-relaxed">
                      {activeSceneCopy.subline}
                    </p>
                  </div>

                  {/* Right 7 cols: Rich Animated Motion Graphics per Scene */}
                  <div className="lg:col-span-7">
                    {activeSceneIdx === 0 && (
                      <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden border border-[#DCE6F5] shadow-md aspect-[16/9] max-h-[260px]">
                          <img
                            src="/images/hero-port-pontianak.jpg"
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-x-3 bottom-3 rounded-xl bg-navy/95 border border-gold/70 px-4 py-3 text-white shadow-lg">
                            <div className="text-xs sm:text-sm font-extrabold text-gold">
                              {exp.visuals.scene1FloatTitle}
                            </div>
                            <div className="text-[11px] text-blue-100 mt-0.5">
                              {exp.visuals.scene1FloatDesc}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                          {exp.visuals.scene1Pills.map((pill) => (
                            <div
                              key={pill}
                              className="rounded-xl bg-white border border-[#DCE6F5] px-3 py-2.5 text-center text-xs font-extrabold text-brand shadow-sm"
                            >
                              {pill}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeSceneIdx === 1 && (
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
                        <div className="sm:col-span-5 rounded-2xl bg-navy text-white p-5 border border-brand flex flex-col justify-between space-y-4 shadow-md">
                          <div>
                            <div className="text-[10px] font-extrabold tracking-wider text-gold">
                              {exp.visuals.scene2CardHeader}
                            </div>
                            <div className="text-base font-extrabold mt-1">
                              Hendra Wijaya
                            </div>
                            <div className="text-xs text-blue-200">
                              Toko Cahaya Pontianak
                            </div>
                          </div>
                          <div className="rounded-xl bg-white/10 border border-white/20 p-3">
                            <div className="text-[10px] text-blue-200">
                              {exp.visuals.scene2MemberLabel}
                            </div>
                            <div className="font-mono font-extrabold text-sm text-gold mt-0.5">
                              MBR-PNK-2611-8421
                            </div>
                          </div>
                          <div className="text-[11px] text-blue-100 leading-snug">
                            {exp.visuals.scene2SyncNote}
                          </div>
                        </div>

                        <div className="sm:col-span-7 space-y-2.5 flex flex-col justify-center">
                          {[
                            {
                              hub: 'Guangzhou, China',
                              code: 'PNK-CN-CAHAY842',
                              threshold: 0.1,
                            },
                            {
                              hub: 'Kuching, Malaysia',
                              code: 'PNK-MY-CAHAY842',
                              threshold: 0.32,
                            },
                            {
                              hub: 'Tuas, Singapura',
                              code: 'PNK-SG-CAHAY842',
                              threshold: 0.55,
                            },
                          ].map((item) => {
                            const revealed =
                              !isPlaying || localProgress >= item.threshold;
                            return (
                              <div
                                key={item.code}
                                className={`rounded-xl bg-white border p-3.5 flex items-center justify-between gap-2 transition-all duration-500 ${
                                  revealed
                                    ? 'opacity-100 translate-x-0 border-brand/50 shadow-sm'
                                    : 'opacity-40 translate-x-3 border-[#DCE6F5]'
                                }`}
                              >
                                <span className="text-xs font-bold text-ink">
                                  {item.hub}
                                </span>
                                <span className="font-mono text-xs font-extrabold text-brand bg-brand-soft border border-[#BFD6F9] px-2.5 py-1 rounded-lg">
                                  {item.code}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {activeSceneIdx === 2 && (
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-6 space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              {
                                img: '/images/catalog/coffee-barista-set.jpg',
                                title: 'Barista Set',
                                sub: '+150%',
                              },
                              {
                                img: '/images/catalog/walet-mist-tweeter.jpg',
                                title: 'Walet Kit',
                                sub: '+180%',
                              },
                              {
                                img: '/images/catalog/wpc-wall-panel.jpg',
                                title: 'WPC Panel',
                                sub: 'LCL/FCL',
                              },
                            ].map((c) => (
                              <div
                                key={c.title}
                                className="rounded-xl bg-white border border-[#DCE6F5] p-2 shadow-sm space-y-1.5"
                              >
                                <img
                                  src={c.img}
                                  alt={c.title}
                                  className="w-full aspect-square object-cover rounded-lg"
                                />
                                <div className="text-[11px] font-bold text-ink truncate">
                                  {c.title}
                                </div>
                                <div className="text-[10px] font-extrabold text-wa">
                                  {c.sub}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="rounded-xl bg-white border border-brand/40 p-3 text-[11px]">
                            <div className="font-bold text-slate-600">
                              {exp.visuals.scene3CustomUrlLabel}
                            </div>
                            <div className="font-mono text-brand truncate mt-0.5">
                              https://detail.1688.com/offer/782910384712.html
                            </div>
                          </div>
                        </div>

                        <div className="sm:col-span-6 rounded-2xl bg-white border border-[#DCE6F5] shadow-md overflow-hidden flex flex-col justify-between">
                          <div className="bg-navy text-gold px-4 py-2.5 text-[11px] font-extrabold">
                            {exp.visuals.scene3QuoteHeader}
                          </div>
                          <div className="p-4 space-y-3">
                            <div>
                              <div className="text-sm font-extrabold text-ink">
                                {exp.visuals.scene3QuoteItem}
                              </div>
                              <div className="text-[11px] text-slate-600 mt-0.5">
                                {exp.visuals.scene3QuoteSpec}
                              </div>
                            </div>

                            <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-3">
                              <div className="text-[11px] font-bold text-emerald-800">
                                {exp.visuals.scene3QuoteTotalLabel}
                              </div>
                              <div className="font-mono text-lg font-extrabold text-wa mt-0.5">
                                Rp 10.150.000
                              </div>
                            </div>

                            <div
                              className={`rounded-full py-2 px-3 text-center text-xs font-extrabold transition-colors duration-300 ${
                                localProgress > 0.45
                                  ? 'bg-wa text-white'
                                  : 'bg-gold text-ink'
                              }`}
                            >
                              {localProgress > 0.45
                                ? exp.visuals.scene3QuoteApproved
                                : exp.visuals.scene3QuotePending}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSceneIdx === 3 && (
                      <div className="rounded-2xl bg-white border border-[#DCE6F5] shadow-md overflow-hidden">
                        <div className="bg-navy text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-mono text-sm font-extrabold text-gold flex items-center gap-1.5">
                              <Container className="h-4 w-4" aria-hidden="true" />
                              {exp.visuals.scene4BatchHeader}
                            </div>
                            <div className="text-[11px] text-blue-100 mt-0.5">
                              {exp.visuals.scene4BatchSub}
                            </div>
                          </div>
                          <span className="rounded-full bg-wa px-3 py-1 text-[10px] font-extrabold text-white">
                            {exp.visuals.scene4AllInBadge}
                          </span>
                        </div>

                        <div className="p-5 space-y-4">
                          {(() => {
                            const animatedPct = isPlaying
                              ? Math.round(35 + localProgress * 49)
                              : 84;
                            const filled = Number(((28 * animatedPct) / 100).toFixed(1));
                            const remain = Number((28 - filled).toFixed(1));
                            return (
                              <>
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <span className="text-ink">
                                    {exp.visuals.scene4FilledLabel}:{' '}
                                    <span className="font-mono text-brand">
                                      {formatNumberId(filled, 1)} / 28 CBM ({animatedPct}%)
                                    </span>
                                  </span>
                                  <span className="font-mono text-wa">
                                    {exp.visuals.scene4RemainLabel}:{' '}
                                    {formatNumberId(remain, 1)} CBM
                                  </span>
                                </div>

                                <div className="h-4 w-full rounded-full bg-slate-200 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-brand transition-all duration-150"
                                    style={{ width: `${animatedPct}%` }}
                                  />
                                </div>
                              </>
                            );
                          })()}

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                            {[
                              {
                                name: 'Kopi PNK',
                                cbm: '0,5 CBM',
                                cls: 'bg-ice border-[#DCE6F5] text-brand',
                              },
                              {
                                name: 'Oto Singkawang',
                                cbm: '1,2 CBM',
                                cls: 'bg-amber-50 border-amber-200 text-amber-900',
                              },
                              {
                                name: 'Bahan Sintang',
                                cbm: '2,0 CBM',
                                cls: 'bg-emerald-50 border-emerald-200 text-emerald-900',
                              },
                              {
                                name: exp.visuals.scene4MemberSlot,
                                cbm: '0,35 CBM',
                                cls: 'bg-gold border-gold-dark text-ink shadow-sm',
                              },
                            ].map((slot) => (
                              <div
                                key={slot.name}
                                className={`rounded-xl border p-3 ${slot.cls}`}
                              >
                                <div className="text-[11px] font-bold truncate">
                                  {slot.name}
                                </div>
                                <div className="font-mono font-extrabold text-sm mt-1">
                                  {slot.cbm}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSceneIdx === 4 && (
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
                        <div className="sm:col-span-7 rounded-2xl bg-white border border-[#DCE6F5] p-4 shadow-md space-y-3">
                          <div className="font-mono text-xs font-extrabold text-brand">
                            {exp.visuals.scene5ResiHeader}
                          </div>
                          <ol className="relative border-l-2 border-[#DCE6F5] ml-2 space-y-3 pl-4">
                            {exp.visuals.scene5Milestones.map((ms, idx) => {
                              const reached =
                                !isPlaying || localProgress * 4 >= idx * 0.85;
                              return (
                                <li key={ms} className="relative">
                                  <span
                                    className={`absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-white ${
                                      reached ? 'bg-wa' : 'bg-slate-300'
                                    }`}
                                    aria-hidden="true"
                                  />
                                  <div
                                    className={`text-xs font-bold ${
                                      reached ? 'text-ink' : 'text-slate-400'
                                    }`}
                                  >
                                    {ms}
                                  </div>
                                </li>
                              );
                            })}
                          </ol>
                        </div>

                        <div className="sm:col-span-5 rounded-2xl overflow-hidden bg-navy text-white border border-gold/60 flex flex-col justify-between shadow-md">
                          <img
                            src="/images/tracking-ship-banner.jpg"
                            alt=""
                            className="w-full h-24 object-cover"
                          />
                          <div className="p-4 space-y-2.5">
                            <div className="text-sm font-extrabold text-gold leading-snug">
                              {exp.visuals.scene5CtaTitle}
                            </div>
                            <p className="text-[11px] text-blue-100 leading-relaxed">
                              {exp.visuals.scene5CtaDesc}
                            </p>
                            <Link
                              href={customer ? '/dashboard/orders/new' : '/register'}
                              className="w-full min-h-[38px] inline-flex items-center justify-center gap-1.5 rounded-full bg-gold hover:bg-gold-dark text-ink text-xs font-extrabold transition-colors"
                            >
                              {customer ? exp.ctaNewOrder : exp.ctaRegister}
                              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Subtitle Caption Strip */}
                <div className="relative z-10 mt-6 rounded-xl bg-navy text-white px-4 py-2.5 text-center text-xs sm:text-sm font-semibold shadow-sm">
                  {activeSceneCopy.subtitle}
                </div>
              </div>

              {/* Scrubber & Controls Toolbar */}
              <div className="bg-[#F8FAFD] border-t border-[#DCE6F5] px-4 sm:px-6 py-3.5 space-y-2.5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] font-bold text-slate-600 w-10">
                    {formatClock(currentSec)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={totalDuration}
                    step={0.1}
                    value={currentSec}
                    onChange={handleScrub}
                    aria-label="Explainer progress timeline"
                    className="flex-1 h-2 rounded-full accent-brand cursor-pointer"
                  />
                  <span className="font-mono text-[11px] font-bold text-slate-600 w-10 text-right">
                    {formatClock(totalDuration)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="min-h-[40px] inline-flex items-center gap-1.5 rounded-full bg-brand hover:bg-brand-dark text-white font-bold px-4 text-xs transition-colors"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                          {exp.pauseBtn}
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5" aria-hidden="true" />
                          {exp.playBtn}
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleRestart}
                      className="min-h-[40px] inline-flex items-center gap-1 rounded-full border border-[#DCE6F5] bg-white hover:bg-ice text-ink font-semibold px-3.5 text-xs transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      {exp.restartBtn}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMuted((m) => !m)}
                      className="min-h-[40px] inline-flex items-center gap-1 rounded-full border border-[#DCE6F5] bg-white hover:bg-ice text-ink font-semibold px-3.5 text-xs transition-colors"
                    >
                      {isMuted || locale !== 'id' ? (
                        <>
                          <VolumeX className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                          {exp.unmuteBtn}
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                          {exp.muteBtn}
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSpeed((s) => (s === 1 ? 1.25 : 1))}
                      className="min-h-[40px] inline-flex items-center gap-1 rounded-full border border-[#DCE6F5] bg-white hover:bg-ice text-ink font-mono font-bold px-3 text-xs transition-colors"
                    >
                      {speed}x
                    </button>
                  </div>

                  {/* Subtle progress badge */}
                  <div className="text-[11px] font-semibold text-slate-600 hidden md:block">
                    {Math.round(totalProgress * 100)}%
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Persistent Bottom Action Bar: Download MP4, Share WA, Register / Catalog */}
          <div className="bg-white border-t border-[#E6EEF9] px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="/videos/explainer-cara-kerja-importir-pontianak.mp4"
                download="cara-kerja-importir-pontianak.mp4"
                className="min-h-[42px] inline-flex items-center gap-1.5 rounded-full border border-[#BFD6F9] bg-ice hover:bg-brand-soft text-brand font-bold px-4 text-xs transition-colors"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                {exp.downloadMp4Btn}
              </a>

              <a
                href={waShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[42px] inline-flex items-center gap-1.5 rounded-full bg-wa hover:bg-wa-dark text-white font-bold px-4 text-xs transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                {exp.shareWaBtn}
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/katalog"
                className="min-h-[42px] inline-flex items-center gap-1.5 rounded-full border border-[#DCE6F5] bg-white hover:bg-ice text-ink font-bold px-4 text-xs transition-colors"
              >
                <ShoppingBag className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                {exp.ctaCatalog}
              </Link>
              <Link
                href={customer ? '/dashboard/orders/new' : '/register'}
                className="min-h-[42px] inline-flex items-center gap-1.5 rounded-full bg-gold hover:bg-gold-dark text-ink font-extrabold px-5 text-xs shadow-sm transition-colors"
              >
                {customer ? exp.ctaNewOrder : exp.ctaRegister}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Synced 4-Step Alur Kerja Interactive Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {dict.workflow.steps.map((step, idx) => {
            const Icon = STEP_ICONS[idx] || FileText;
            const active = activeWorkflowIdx === idx && hasStartedOnce;
            return (
              <button
                key={step.title}
                type="button"
                onClick={() => handleJumpScene(idx + 1)}
                className={`text-left rounded-2xl p-5 border transition-all space-y-3 ${
                  active
                    ? 'bg-white border-brand ring-2 ring-brand/20 shadow-md'
                    : 'bg-white/90 border-[#DCE6F5] hover:border-brand/60 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${
                      active
                        ? 'bg-brand text-white'
                        : 'bg-brand-soft text-brand'
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span
                    className={`font-mono text-xs font-extrabold px-2.5 py-1 rounded-full ${
                      active
                        ? 'bg-gold text-ink'
                        : 'bg-ice text-slate-500 border border-[#DCE6F5]'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                </div>
                <h3 className="font-bold text-ink text-sm">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
