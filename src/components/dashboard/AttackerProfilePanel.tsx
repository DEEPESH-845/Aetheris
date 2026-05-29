"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore, AttackerProfile } from '@/store/useSimulationStore';
import { Globe, Cpu, AlertTriangle, ShieldAlert, Clock } from 'lucide-react';

const FLAG_EMOJI: Record<string, string> = {
  RU: '🇷🇺', CN: '🇨🇳', KP: '🇰🇵', IR: '🇮🇷', XX: '🌐',
};

const CONFIDENCE_COLOR = (c: number) =>
  c >= 90 ? 'text-neon-red' : c >= 75 ? 'text-yellow-400' : 'text-neon-cyan';

const CONFIDENCE_BAR_COLOR = (c: number) =>
  c >= 90 ? 'bg-neon-red' : c >= 75 ? 'bg-yellow-400' : 'bg-neon-cyan';

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

interface ProfileCardProps { profile: AttackerProfile; }

function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-black/60 border border-white/10 rounded-sm p-4 space-y-4 hover:border-white/20 transition-colors relative overflow-hidden"
    >
      {/* Ambient glow for high-confidence threats */}
      {profile.confidence >= 85 && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-red/10 rounded-full blur-[40px] pointer-events-none" />
      )}

      {/* Header: Actor + country */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{FLAG_EMOJI[profile.countryCode] ?? '🌐'}</span>
            <span className="font-mono text-xs text-text-muted uppercase tracking-widest">{profile.countryName}</span>
          </div>
          <div className="text-lg font-outfit font-bold text-white">
            {profile.actorName ?? 'Unknown Actor'}
          </div>
          <div className="text-[10px] font-mono text-text-muted mt-0.5">{profile.asnName}</div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-outfit font-bold tabular-nums ${CONFIDENCE_COLOR(profile.confidence)}`}>
            {profile.confidence}<span className="text-sm">%</span>
          </div>
          <div className="text-[9px] font-mono text-text-muted uppercase tracking-widest">Attribution</div>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="space-y-1">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${profile.confidence}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${CONFIDENCE_BAR_COLOR(profile.confidence)}`}
          />
        </div>
      </div>

      {/* Source IP + timestamps */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="space-y-1">
          <div className="text-text-muted uppercase tracking-widest">Source IP</div>
          <div className="text-neon-cyan">{profile.sourceIp}</div>
        </div>
        <div className="space-y-1">
          <div className="text-text-muted uppercase tracking-widest">Kill Chain Stage</div>
          <div className="text-yellow-400">{profile.killChainStage}</div>
        </div>
        <div className="flex items-center gap-1 text-text-muted">
          <Clock className="w-3 h-3" />
          <span>First: {timeAgo(profile.firstSeen)}</span>
        </div>
        <div className="flex items-center gap-1 text-text-muted">
          <Clock className="w-3 h-3" />
          <span>Last: {timeAgo(profile.lastSeen)}</span>
        </div>
      </div>

      {/* Tooling */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest flex items-center gap-1">
          <Cpu className="w-3 h-3" /> Identified Tooling
        </div>
        <div className="flex flex-wrap gap-1">
          {profile.tooling.map(tool => (
            <span key={tool} className="text-[9px] font-mono px-2 py-0.5 bg-neon-red/10 border border-neon-red/20 text-neon-red rounded-sm">
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* TTPs */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Observed TTPs
        </div>
        <div className="space-y-1">
          {profile.ttps.filter(t => t.observed).slice(0, 4).map(ttp => (
            <div key={ttp.technique} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-neon-magenta">{ttp.technique}</span>
                <span className="text-[9px] font-mono text-text-secondary truncate max-w-[120px]">{ttp.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neon-magenta/60 rounded-full"
                    style={{ width: `${ttp.confidence}%` }}
                  />
                </div>
                <span className="text-[9px] text-text-muted tabular-nums w-7 text-right">{ttp.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function AttackerProfilePanel() {
  const { attackerProfiles, activeThreats } = useSimulationStore();
  const profiles = Object.values(attackerProfiles);

  return (
    <div className="h-full flex flex-col font-mono text-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-black/60 flex-shrink-0">
        <Globe className="w-3.5 h-3.5 text-neon-cyan" />
        <span className="uppercase tracking-widest text-neon-cyan">Attacker Profiles</span>
        <span className="ml-auto text-[9px] text-text-muted">{profiles.length} tracked</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <AnimatePresence>
          {profiles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-32 text-text-muted opacity-50"
            >
              <ShieldAlert className="w-8 h-8 mb-2" />
              <p className="text-xs uppercase tracking-widest">Awaiting threat detection…</p>
            </motion.div>
          ) : (
            profiles.map(profile => (
              <ProfileCard key={profile.id} profile={profile} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
