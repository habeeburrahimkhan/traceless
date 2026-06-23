import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import type { Document } from '../context/SimulationContext';
import { 
  ShieldAlert, ShieldCheck, FileText, Activity, 
  Trash2, Eye, Clock, ExternalLink, Settings, 
  ArrowUpDown, Filter, Sparkles, X, ChevronRight,
  TrendingUp, Calendar, Zap, AlertTriangle
} from 'lucide-react';

// Pure React + CSS Mouse-Interactive 3D Card Tilt Component
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = '', glowColor = 'rgba(16, 185, 129, 0.3)' }) => {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glow, setGlow] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * 7; 
    const rotateY = ((x - centerX) / centerX) * 7;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`);
    
    const glowX = (x / rect.width) * 100;
    const glowY = (y / rect.height) * 100;
    setGlow({ x: glowX, y: glowY, opacity: 0.15 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlow(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        transform, 
        transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
        transformStyle: 'preserve-3d'
      }}
      className={`relative overflow-hidden transition-all duration-300 shadow-lg ${className}`}
    >
      {/* Holographic light reflection overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
        style={{
          background: `radial-gradient(circle 150px at ${glow.x}% ${glow.y}%, ${glowColor}, transparent)`,
          opacity: glow.opacity,
          mixBlendMode: 'screen'
        }}
      />
      {/* 3D Depth Wrapper */}
      <div style={{ transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }} className="h-full w-full">
        {children}
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { 
    documents, 
    activityLogs, 
    navigate, 
    revokeDocument, 
    extendExpiry, 
    simulateAttack 
  } = useSimulation();

  // Interactive UI states
  const [sortBy, setSortBy] = useState<'uploadedAt' | 'viewsCount' | 'name'>('uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [extendingDocId, setExtendingDocId] = useState<string | null>(null);
  const [extendMinutes, setExtendMinutes] = useState<number>(30);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Metrics calculations
  const activeShares = documents.filter(d => d.status === 'active').length;
  const burnedCount = documents.filter(d => d.status === 'burned').length;
  const expiredCount = documents.filter(d => d.status === 'expired').length;
  const revokedCount = documents.filter(d => d.status === 'revoked').length;
  const totalViews = documents.reduce((sum, doc) => sum + doc.viewsCount, 0);

  // Critical alerts (unauthorized intrusion logs)
  const intrusionAlerts = activityLogs.filter(log => log.action === 'ATTACK_PREVENTED');

  // Interactive Sorting & Filtering of active documents
  const activeDocs = documents
    .filter(doc => doc.status === 'active')
    .filter(doc => filterType === 'all' || doc.type === filterType)
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'uploadedAt') {
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      } else if (sortBy === 'viewsCount') {
        comparison = a.viewsCount - b.viewsCount;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const toggleSort = (field: 'uploadedAt' | 'viewsCount' | 'name') => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSimulateAttack = async () => {
    setIsSimulating(true);
    const targetDoc = activeDocs[0]?.id || '';
    await simulateAttack(targetDoc);
    setTimeout(() => setIsSimulating(false), 800);
  };

  const handleExtendExpiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendingDocId) return;
    await extendExpiry(extendingDocId, extendMinutes);
    
    if (selectedDoc?.id === extendingDocId) {
      const updatedDoc = documents.find(d => d.id === extendingDocId);
      if (updatedDoc) {
        setSelectedDoc({
          ...updatedDoc,
          expiresAt: new Date(new Date(updatedDoc.expiresAt || '').getTime() + extendMinutes * 60000).toISOString()
        });
      }
    }
    
    setExtendingDocId(null);
  };

  const totalSharesCount = documents.length;
  const activePercent = totalSharesCount ? (activeShares / totalSharesCount) * 100 : 0;
  const burnedPercent = totalSharesCount ? (burnedCount / totalSharesCount) * 100 : 0;
  const expiredPercent = totalSharesCount ? (expiredCount / totalSharesCount) * 100 : 0;
  const revokedPercent = totalSharesCount ? (revokedCount / totalSharesCount) * 100 : 0;

  const donutStrokeDash = (percent: number) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    return `${(percent / 100) * circumference} ${circumference}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-left">
      {/* 3D background grids logic / perspective overlays */}
      <style>{`
        .cyber-perspective-grid {
          background-image: 
            linear-gradient(to right, rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
          background-size: 24px 24px;
          perspective: 300px;
          transform: rotateX(60deg);
          transform-origin: top;
        }
        .cyber-grid-red {
          background-image: 
            linear-gradient(to right, rgba(239, 68, 68, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(239, 68, 68, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
          perspective: 250px;
          transform: rotateX(55deg);
          transform-origin: top;
        }
        .tilt-card-3d {
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.7), inset 0 1px 0 0 rgba(255,255,255,0.05);
        }
      `}</style>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-emerald-400" /> Security Operations Control
          </h1>
          <p className="text-zinc-400 text-sm mt-1 font-mono">Real-time telemetry, E2EE key tracking, and intrusion mitigation.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('upload')}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all active:scale-95 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          >
            <Sparkles className="h-3.5 w-3.5" /> + Secure Upload
          </button>
          <button
            onClick={() => navigate('activity')}
            className="border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-900 px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all"
          >
            Full Audit Ledger
          </button>
        </div>
      </div>

      {/* Grid of Key Metrics (Wrapped in 3D Tilt Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <TiltCard className="tilt-card-3d rounded-xl border border-zinc-800 bg-zinc-950/40 relative">
          <div className="p-4 sm:p-5">
            <div className="absolute top-0 right-0 p-3 text-emerald-500/10">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Active Secure Links</p>
            <p className="text-3xl font-black text-white mt-1.5 font-mono">{activeShares}</p>
            <p className="text-[10px] text-zinc-400 mt-1 font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live & accessible
            </p>
          </div>
        </TiltCard>

        <TiltCard className="tilt-card-3d rounded-xl border border-zinc-800 bg-zinc-950/40 relative" glowColor="rgba(244, 63, 94, 0.25)">
          <div className="p-4 sm:p-5">
            <div className="absolute top-0 right-0 p-3 text-rose-500/10">
              <Trash2 className="h-10 w-10" />
            </div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Self-Destructed (Burned)</p>
            <p className="text-3xl font-black text-white mt-1.5 font-mono">{burnedCount}</p>
            <p className="text-[10px] text-zinc-400 mt-1 font-mono">Wiped from storage buckets</p>
          </div>
        </TiltCard>

        <TiltCard className="tilt-card-3d rounded-xl border border-zinc-800 bg-zinc-950/40 relative" glowColor="rgba(6, 182, 212, 0.25)">
          <div className="p-4 sm:p-5">
            <div className="absolute top-0 right-0 p-3 text-cyan-500/10">
              <Eye className="h-10 w-10" />
            </div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Total OTP Access Audits</p>
            <p className="text-3xl font-black text-white mt-1.5 font-mono">{totalViews}</p>
            <p className="text-[10px] text-zinc-400 mt-1 font-mono">Successful handshakes</p>
          </div>
        </TiltCard>

        <TiltCard className="tilt-card-3d rounded-xl border border-zinc-800 bg-zinc-950/40 relative" glowColor="rgba(245, 158, 11, 0.25)">
          <div className="p-4 sm:p-5">
            <div className="absolute top-0 right-0 p-3 text-amber-500/10">
              <Clock className="h-10 w-10" />
            </div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Expired / Revoked</p>
            <p className="text-3xl font-black text-white mt-1.5 font-mono">{expiredCount + revokedCount}</p>
            <p className="text-[10px] text-zinc-400 mt-1 font-mono">Lifespan timers purges</p>
          </div>
        </TiltCard>
      </div>

      {/* Critical Security Alerts */}
      {intrusionAlerts.length > 0 && (
        <div className="border border-rose-500/30 bg-rose-950/15 rounded-xl p-4 flex gap-4 items-start shadow-[0_0_20px_rgba(239,68,68,0.05)] animate-slide-down">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-rose-400 font-mono flex items-center gap-2">
              Intrusion Prevention System active
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-mono">
              TraceLess has blocked **{intrusionAlerts.length} unauthorized access signature request(s)**. Threat telemetry, browser footprints, and origin IP logs have been preserved in the secure ledger.
            </p>
            <div className="flex gap-4 pt-1.5">
              <button
                onClick={() => navigate('activity')}
                className="text-[10px] font-mono font-bold text-rose-500 hover:text-rose-400 transition-colors uppercase tracking-wider flex items-center gap-1"
              >
                Inspect Threat Details <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Interactive Charts & Document Management */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Document list (Left Column - 8 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/20 border border-zinc-900 p-3 rounded-xl font-mono text-xs">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold text-zinc-200">Active Shared Tracks ({activeDocs.length})</span>
            </div>
            
            {/* Filters and Sorting controls */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-1 border border-zinc-800 bg-zinc-900/50 rounded px-2 py-1 text-zinc-400">
                <Filter className="h-3 w-3 text-zinc-500" />
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent focus:outline-none text-[10px] cursor-pointer text-zinc-300"
                >
                  <option value="all">All Types</option>
                  <option value="pdf">PDFs</option>
                  <option value="image">Images</option>
                  <option value="text">Plain Text</option>
                </select>
              </div>

              {/* Sort By buttons */}
              <div className="flex items-center gap-1 border border-zinc-800 bg-zinc-900/50 rounded px-2 py-1 text-zinc-400">
                <span className="text-[9px] text-zinc-500 uppercase font-bold mr-1">Sort:</span>
                <button 
                  onClick={() => toggleSort('uploadedAt')} 
                  className={`text-[10px] px-1 hover:text-white transition-colors ${sortBy === 'uploadedAt' ? 'text-emerald-400 font-bold' : ''}`}
                >
                  Date
                </button>
                <span className="text-zinc-700">|</span>
                <button 
                  onClick={() => toggleSort('viewsCount')} 
                  className={`text-[10px] px-1 hover:text-white transition-colors ${sortBy === 'viewsCount' ? 'text-emerald-400 font-bold' : ''}`}
                >
                  Views
                </button>
                <span className="text-zinc-700">|</span>
                <button 
                  onClick={() => toggleSort('name')} 
                  className={`text-[10px] px-1 hover:text-white transition-colors ${sortBy === 'name' ? 'text-emerald-400 font-bold' : ''}`}
                >
                  Name
                </button>
                <ArrowUpDown className="h-3 w-3 text-zinc-500 ml-1" />
              </div>
            </div>
          </div>

          {/* Active Documents List */}
          <div className="space-y-3">
            {activeDocs.length === 0 ? (
              <div className="border border-dashed border-zinc-850 bg-zinc-950/10 rounded-2xl p-12 text-center text-zinc-500 font-mono text-xs">
                No active secure document paths found matching criteria.
              </div>
            ) : (
              activeDocs.map(doc => {
                const isNearingExpiry = doc.expiresAt && new Date(doc.expiresAt).getTime() - Date.now() < 300000;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-950/80 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-105 transition-transform">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-zinc-200 truncate max-w-[200px] sm:max-w-xs font-mono">
                            {doc.name}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase shrink-0">
                            {doc.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500 font-mono">
                          <span>Recipient: {doc.otpEmail || 'Public OTP Link'}</span>
                          <span>•</span>
                          <span>Views: {doc.viewsCount}/{doc.maxViews}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end sm:justify-start" onClick={(e) => e.stopPropagation()}>
                      {doc.expiresAt ? (
                        <div className={`flex items-center gap-1 text-[10px] font-mono border px-2 py-1 rounded-md bg-zinc-900/50 ${isNearingExpiry ? 'border-amber-500/30 text-amber-400 animate-pulse' : 'border-zinc-800 text-zinc-400'}`}>
                          <Clock className="h-3 w-3" />
                          <span>
                            {isNearingExpiry ? 'Expiring Soon' : new Date(doc.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[9px] font-mono border border-zinc-850 px-2 py-1 rounded bg-zinc-900/20 text-zinc-500">
                          No Timer Limit
                        </div>
                      )}

                      <button
                        onClick={() => setExtendingDocId(doc.id)}
                        className="flex items-center gap-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black text-emerald-400 px-2.5 py-1.5 rounded transition-all font-mono font-bold"
                      >
                        Extend
                      </button>
                      <button
                        onClick={() => revokeDocument(doc.id)}
                        className="text-[10px] border border-rose-950 bg-rose-950/10 text-rose-400 hover:bg-rose-500 hover:text-black px-2.5 py-1.5 rounded transition-all font-mono"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Charts & Threat Panel (Right Column - 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SVG Telemetry 3D Donut Chart */}
          <TiltCard className="tilt-card-3d rounded-2xl border border-zinc-800 bg-zinc-950/40 relative" glowColor="rgba(6, 182, 212, 0.2)">
            <div className="p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-2 border-b border-zinc-900 pb-2">
                <Activity className="h-4 w-4 text-cyan-400" /> Share Lifecycle Analytics
              </h3>
              
              {totalSharesCount === 0 ? (
                <div className="h-40 flex items-center justify-center text-zinc-650 font-mono text-[10px]">
                  No document data available.
                </div>
              ) : (
                <div className="flex items-center gap-6 justify-center py-2" style={{ transformStyle: 'preserve-3d' }}>
                  {/* Rotated 3D SVG Donut */}
                  <div className="relative h-24 w-24" style={{ transform: 'rotateX(24deg) rotateY(-10deg)', transformStyle: 'preserve-3d' }}>
                    <div className="absolute inset-0 rounded-full border-4 border-zinc-900/50 shadow-[0_4px_12px_rgba(0,0,0,0.6)]" style={{ transform: 'translateZ(-5px)' }}></div>
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="35" stroke="#18181b" strokeWidth="12" fill="transparent" />
                      
                      {activeShares > 0 && (
                        <circle cx="50" cy="50" r="35" stroke="#10b981" strokeWidth="12" fill="transparent"
                          strokeDasharray={donutStrokeDash(activePercent)}
                          strokeDashoffset="0"
                          style={{ filter: 'drop-shadow(0 0 3px rgba(16,185,129,0.3))' }}
                        />
                      )}
                      
                      {burnedCount > 0 && (
                        <circle cx="50" cy="50" r="35" stroke="#f43f5e" strokeWidth="12" fill="transparent"
                          strokeDasharray={donutStrokeDash(burnedPercent)}
                          strokeDashoffset={-((activePercent / 100) * 2 * Math.PI * 35)}
                        />
                      )}
                      
                      {expiredCount > 0 && (
                        <circle cx="50" cy="50" r="35" stroke="#f59e0b" strokeWidth="12" fill="transparent"
                          strokeDasharray={donutStrokeDash(expiredPercent)}
                          strokeDashoffset={-(((activePercent + burnedPercent) / 100) * 2 * Math.PI * 35)}
                        />
                      )}
                      
                      {revokedCount > 0 && (
                        <circle cx="50" cy="50" r="35" stroke="#71717a" strokeWidth="12" fill="transparent"
                          strokeDasharray={donutStrokeDash(revokedPercent)}
                          strokeDashoffset={-(((activePercent + burnedPercent + expiredPercent) / 100) * 2 * Math.PI * 35)}
                        />
                      )}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono" style={{ transform: 'translateZ(10px)' }}>
                      <span className="text-lg font-black text-zinc-100">{totalSharesCount}</span>
                      <span className="text-[8px] text-zinc-500 uppercase tracking-widest">Total</span>
                    </div>
                  </div>

                  {/* Donut Legend */}
                  <div className="flex flex-col gap-2 font-mono text-[10px] text-zinc-400" style={{ transform: 'translateZ(5px)' }}>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span>Active ({activeShares})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                      <span>Burned ({burnedCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                      <span>Expired ({expiredCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-zinc-500"></span>
                      <span>Revoked ({revokedCount})</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TiltCard>

          {/* Interactive 3D Threat Simulation Card */}
          <TiltCard className="tilt-card-3d rounded-2xl border border-rose-950 bg-zinc-950/60 relative overflow-hidden" glowColor="rgba(239, 68, 68, 0.25)">
            {/* Cyberperspective grid design */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              <div className="absolute inset-0 cyber-grid-red h-[120%] -top-[10%]"></div>
            </div>
            
            <div className="p-5 space-y-4 relative z-10" style={{ transformStyle: 'preserve-3d' }}>
              <h3 className="text-xs font-mono font-bold text-rose-400 flex items-center gap-2 border-b border-rose-950/60 pb-2">
                <AlertTriangle className="h-4 w-4" /> Incident Threat Simulation
              </h3>
              
              <p className="text-[10px] font-mono text-zinc-400 leading-relaxed mt-2" style={{ transform: 'translateZ(5px)' }}>
                Manually dispatch a mock access signature anomaly to test E2EE intrusion ledger state and threat triggers.
              </p>
              
              <button
                onClick={handleSimulateAttack}
                disabled={isSimulating}
                style={{ transform: 'translateZ(10px)' }}
                className="mt-4 w-full bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:text-black text-rose-400 font-mono py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              >
                {isSimulating ? (
                  <>
                    <Activity className="h-3.5 w-3.5 animate-spin" /> DISPATCHING INCIDENT...
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5" /> Trigger Simulated Incident
                  </>
                )}
              </button>
            </div>
          </TiltCard>

          {/* Security Log Summary */}
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/40 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <h3 className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" /> Recent Security Timelines
              </h3>
              <button
                onClick={() => navigate('activity')}
                className="text-[9px] text-zinc-500 hover:text-zinc-300 font-mono uppercase font-bold"
              >
                Ledger &rarr;
              </button>
            </div>

            <div className="space-y-3 font-mono">
              {activityLogs.slice(0, 3).length === 0 ? (
                <div className="text-center text-zinc-650 text-[10px] py-4">
                  No log footprints preserved.
                </div>
              ) : (
                activityLogs.slice(0, 3).map((log) => {
                  let actionStyle = 'text-zinc-500 border-zinc-850 bg-zinc-900/40';
                  if (log.action === 'UPLOADED') actionStyle = 'text-emerald-400 border-emerald-500/15 bg-emerald-500/5';
                  if (log.action === 'OTP_VERIFIED') actionStyle = 'text-cyan-400 border-cyan-500/15 bg-cyan-500/5';
                  if (log.action === 'ATTACK_PREVENTED') actionStyle = 'text-rose-400 border-rose-500/20 bg-rose-500/5 animate-pulse';

                  return (
                    <div key={log.id} className="p-2.5 rounded-lg border border-zinc-900 bg-zinc-950/40 text-[9px] flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className={`px-1.5 py-0.5 rounded border text-[8px] font-bold ${actionStyle}`}>
                          {log.action}
                        </span>
                        <span className="text-zinc-650 text-[8px]">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-zinc-400 line-clamp-1 mt-1">{log.details}</p>
                      <span className="text-zinc-600 text-[8px]">IP: {log.ipAddress}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Expiry Extension Modal */}
      {extendingDocId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <form onSubmit={handleExtendExpiry} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] font-mono text-left">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-emerald-400" /> Extend Shared Lifespan
              </h3>
              <button 
                type="button" 
                onClick={() => setExtendingDocId(null)}
                className="p-1 rounded bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] text-zinc-400 leading-normal">
                Choose extension duration. This adds minutes to the current active lifespan, keeping E2EE credentials functional.
              </p>
              
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Extension Duration</label>
                <select
                  value={extendMinutes}
                  onChange={(e) => setExtendMinutes(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                >
                  <option value={5}>5 Minutes (Short test)</option>
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={1440}>24 Hours</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-zinc-900">
              <button
                type="button"
                onClick={() => setExtendingDocId(null)}
                className="flex-1 bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 text-zinc-400 py-2 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-2 rounded-lg text-xs font-semibold transition-all active:scale-95"
              >
                Save Extension
              </button>
            </div>
          </form>
        </div>
      )}

      {/* active Document Detailed Inspector Drawer */}
      {selectedDoc && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in" onClick={() => setSelectedDoc(null)}>
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-zinc-950 border-l border-zinc-900 h-full p-6 space-y-6 overflow-y-auto font-mono text-left flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <div>
                  <h3 className="text-sm font-black text-zinc-100 flex items-center gap-1.5">
                    <FileText className="h-4.5 w-4.5 text-emerald-400" /> Share inspector
                  </h3>
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest mt-1 block">ID: {selectedDoc.id}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedDoc(null)}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Inspector Content Grid */}
              <div className="space-y-5 text-[10px]">
                <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-900 space-y-2">
                  <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block">Document Details</span>
                  <p className="text-zinc-200 font-bold text-xs">{selectedDoc.name}</p>
                  <p className="text-zinc-400 font-mono">Size: {selectedDoc.size} • Type: <span className="text-emerald-400 uppercase font-bold text-[9px]">{selectedDoc.type}</span></p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-900 space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-5 text-emerald-400">
                    <Settings className="h-12 w-12" />
                  </div>
                  <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block">Cryptographic Metadata</span>
                  <p className="text-zinc-400">Cipher Algorithm: <span className="text-zinc-200">AES-256-GCM (Web Crypto API)</span></p>
                  
                  {selectedDoc.otpCode && (
                    <div className="pt-1">
                      <p className="text-zinc-400">Decryption Access OTP:</p>
                      <span className="mt-1 inline-block text-sm font-black text-emerald-400 bg-zinc-950 px-2 py-1 rounded border border-emerald-500/20 tracking-wider">
                        {selectedDoc.otpCode}
                      </span>
                    </div>
                  )}
                  {selectedDoc.decryptionKey && (
                    <div className="pt-1">
                      <p className="text-zinc-400">Encrypted Wrapped Key:</p>
                      <code className="text-[8px] text-zinc-500 block bg-zinc-950 p-2 rounded border border-zinc-900 truncate max-w-full">
                        {selectedDoc.decryptionKey}
                      </code>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-900 space-y-2">
                  <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block">Rules & Lifespan</span>
                  <p className="text-zinc-400">Views threshold: <span className="text-zinc-200 font-bold">{selectedDoc.viewsCount} / {selectedDoc.maxViews} openings</span></p>
                  <p className="text-zinc-400 flex items-center gap-1">
                    Expiration: 
                    <span className="text-zinc-200">
                      {selectedDoc.expiresAt ? new Date(selectedDoc.expiresAt).toLocaleString() : 'Unlimited lifespan'}
                    </span>
                  </p>
                  <p className="text-zinc-400">Watermark injected: <span className="text-zinc-200">{selectedDoc.requireWatermark ? 'Yes' : 'No'}</span></p>
                  <p className="text-zinc-400">Recipient validation: <span className="text-zinc-200">{selectedDoc.requireEmailVerification ? `Yes (${selectedDoc.otpEmail})` : 'OTP Only'}</span></p>
                </div>
              </div>
            </div>

            {/* Actions block at bottom of drawer */}
            <div className="flex gap-2 pt-4 border-t border-zinc-900">
              <button
                onClick={() => {
                  navigate('viewer', selectedDoc.id);
                  setSelectedDoc(null);
                }}
                className="flex-1 flex items-center justify-center gap-1 text-[10px] bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 py-2.5 rounded-lg transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Simulate Access
              </button>
              <button
                onClick={() => {
                  revokeDocument(selectedDoc.id);
                  setSelectedDoc(null);
                }}
                className="flex-1 text-[10px] border border-rose-950 bg-rose-950/10 text-rose-400 hover:bg-rose-500 hover:text-black py-2.5 rounded-lg transition-all"
              >
                Revoke Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
