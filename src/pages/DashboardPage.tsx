import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  ShieldAlert, ShieldCheck, FileText, Activity, 
  Trash2, Eye, Clock, ExternalLink
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { documents, activityLogs, navigate, revokeDocument } = useSimulation();

  // Metrics calculations
  const activeShares = documents.filter(d => d.status === 'active').length;
  const burnedCount = documents.filter(d => d.status === 'burned').length;
  const expiredCount = documents.filter(d => d.status === 'expired').length;
  const totalViews = documents.reduce((sum, doc) => sum + doc.viewsCount, 0);

  // Critical alerts (unauthorized intrusion logs)
  const intrusionAlerts = activityLogs.filter(log => log.action === 'ATTACK_PREVENTED');

  // Filter active logs for display
  const recentLogs = activityLogs.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-emerald-400" /> Platform Overview
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Zero-Trust document control board and cryptographic status.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('upload')}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all active:scale-95"
          >
            + Secure Upload
          </button>
          <button
            onClick={() => navigate('activity')}
            className="border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-900 px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all"
          >
            Audit Trail
          </button>
        </div>
      </div>

      {/* Grid of Key Performance Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Shares */}
        <div className="p-4 sm:p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-emerald-500/20">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <p className="text-[11px] font-mono text-zinc-500 uppercase">Active Links</p>
          <p className="text-2xl font-bold text-white mt-2 font-mono">{activeShares}</p>
          <p className="text-[10px] text-zinc-400 mt-1">Ready for OTP access</p>
        </div>

        {/* Burned */}
        <div className="p-4 sm:p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-rose-500/20">
            <Trash2 className="h-10 w-10" />
          </div>
          <p className="text-[11px] font-mono text-zinc-500 uppercase">Self-Destructed</p>
          <p className="text-2xl font-bold text-white mt-2 font-mono">{burnedCount}</p>
          <p className="text-[10px] text-zinc-400 mt-1">Purged from storage</p>
        </div>

        {/* Total Views */}
        <div className="p-4 sm:p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-cyan-500/20">
            <Eye className="h-10 w-10" />
          </div>
          <p className="text-[11px] font-mono text-zinc-500 uppercase">Total Access Hits</p>
          <p className="text-2xl font-bold text-white mt-2 font-mono">{totalViews}</p>
          <p className="text-[10px] text-zinc-400 mt-1">Across all shared tokens</p>
        </div>

        {/* Expired shares */}
        <div className="p-4 sm:p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-amber-500/20">
            <Clock className="h-10 w-10" />
          </div>
          <p className="text-[11px] font-mono text-zinc-500 uppercase">Expired Links</p>
          <p className="text-2xl font-bold text-white mt-2 font-mono">{expiredCount}</p>
          <p className="text-[10px] text-zinc-400 mt-1">Terminated by lifespan rules</p>
        </div>
      </div>

      {/* Critical Security Alerts */}
      {intrusionAlerts.length > 0 && (
        <div className="border border-rose-900/40 bg-rose-950/10 rounded-xl p-4 flex gap-3 items-start animate-pulse">
          <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-rose-400 font-mono">Intrusion Prevention Alert</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              TraceLess Zero-Trust block has intercepted {intrusionAlerts.length} unauthorized access attempt(s) from unregistered external workspace emails. Detailed IP footprints have been registered in the audit vault.
            </p>
            <button
              onClick={() => navigate('activity')}
              className="mt-2 text-[10px] font-mono font-bold text-rose-500 hover:text-rose-400 transition-colors uppercase"
            >
              Analyze Threat Log &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main Section Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Active Documents List (Left) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-md font-semibold text-white font-mono flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-emerald-400" /> Active Shared Paths
            </h2>
            <button
              onClick={() => navigate('vendor-access')}
              className="text-xs text-zinc-500 hover:text-zinc-300 font-mono transition-colors"
            >
              Manage all &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {documents.filter(doc => doc.status === 'active').length === 0 ? (
              <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-8 text-center text-zinc-500 text-xs">
                No active document paths found. Click "+ Secure Upload" to share a document.
              </div>
            ) : (
              documents
                .filter(doc => doc.status === 'active')
                .map(doc => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-950 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center shrink-0">
                        <FileText className="h-4.5 w-4.5 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-zinc-200 truncate max-w-[200px] sm:max-w-xs font-mono">
                          {doc.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500 font-mono">
                          <span>Target: {doc.otpEmail}</span>
                          <span>•</span>
                          <span>Views: {doc.viewsCount}/{doc.maxViews}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end sm:justify-start">
                      <button
                        onClick={() => navigate('viewer', doc.id)}
                        className="flex items-center gap-1 text-[10px] bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 px-2 py-1 rounded transition-colors font-mono"
                        title="Simulate recipient access flow"
                      >
                        <ExternalLink className="h-3 w-3" /> Test Viewer
                      </button>
                      <button
                        onClick={() => revokeDocument(doc.id)}
                        className="text-[10px] border border-rose-950 bg-rose-950/10 text-rose-400 hover:bg-rose-500 hover:text-black px-2 py-1 rounded transition-all font-mono"
                        title="Instantly revoke key"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Telemetry log summaries (Right) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-md font-semibold text-white font-mono flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-cyan-400" /> Security Log
            </h2>
            <button
              onClick={() => navigate('activity')}
              className="text-xs text-zinc-500 hover:text-zinc-300 font-mono transition-colors"
            >
              Analyze ledger &rarr;
            </button>
          </div>

          <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl overflow-hidden divide-y divide-zinc-900/60 font-mono">
            {recentLogs.length === 0 ? (
              <div className="p-8 text-center text-zinc-650 text-xs">
                No security logs recorded yet.
              </div>
            ) : (
              recentLogs.map((log) => {
                let actionBadge = 'bg-zinc-900 text-zinc-400';
                if (log.action === 'UPLOADED') actionBadge = 'bg-emerald-950/40 text-emerald-400';
                if (log.action === 'OTP_VERIFIED') actionBadge = 'bg-cyan-950/40 text-cyan-400';
                if (log.action === 'BURNED') actionBadge = 'bg-rose-950/40 text-rose-400';
                if (log.action === 'ATTACK_PREVENTED') actionBadge = 'bg-rose-500/20 text-rose-500 border border-rose-500/20 animate-pulse';

                return (
                  <div key={log.id} className="p-3 hover:bg-zinc-950 transition-colors text-[10px]">
                    <div className="flex items-center justify-between gap-4">
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${actionBadge}`}>
                        {log.action}
                      </span>
                      <span className="text-zinc-600 text-[9px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-zinc-300 mt-2 line-clamp-2">
                      {log.details}
                    </p>
                      <div className="flex items-center gap-2 mt-1.5 text-zinc-500 text-[9px]">
                      <span>IP: {log.ipAddress}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
