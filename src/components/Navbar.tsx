import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { ShieldAlert, RefreshCw, UploadCloud, Users, Activity, Home, Database, Lock, Terminal } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentPage, navigate, documents, isAdmin, logoutAdmin, loginAsAdmin } = useSimulation();

  const handleReset = () => {
    sessionStorage.removeItem('tl_admin_token');
    window.location.href = '/';
  };

  const isInternalAdmin = isAdmin && currentPage !== 'landing' && currentPage !== 'viewer';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyber-border bg-cyber-bg/85 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Simulation status ribbon */}
      <div className="bg-zinc-950 border-b border-zinc-900/60 px-4 py-2 text-xs text-zinc-400 flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-zinc-300 font-bold tracking-wider">SECURE SHIELD OVERLAY // ACTIVE</span>
          <span className="text-zinc-800 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-zinc-500">Zero-Trust Document Access Platform</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-xs text-zinc-650 bg-zinc-900/40 px-2 py-0.5 rounded border border-zinc-900">LIVE TERMINAL</span>
          <button 
            onClick={handleReset} 
            title="Reset simulation data to initial mocks"
            className="flex items-center gap-1 bg-emerald-950/20 hover:bg-emerald-950/50 border border-emerald-900/20 hover:border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded font-mono text-xs uppercase tracking-wider transition-all"
          >
            <RefreshCw className="h-2.5 w-2.5 text-emerald-400" /> Sync Reset
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => navigate('landing')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-emerald-500/50 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all duration-300">
            <ShieldAlert className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 font-mono flex items-center gap-2">
            TRACELESS <span className="text-xs tracking-normal font-bold text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-sans">ACCESS</span>
          </span>
        </div>

        {/* Dynamic Navigation Options */}
        <nav className="hidden md:flex items-center gap-1">
          {isInternalAdmin ? (
            <div className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-900 rounded-full px-1.5 py-1">
              <button
                onClick={() => navigate('dashboard')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm uppercase tracking-wider font-mono transition-all duration-250 ${
                  currentPage === 'dashboard'
                    ? 'bg-zinc-900 border border-zinc-800 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-250'
                }`}
              >
                <Home className="h-3.5 w-3.5" /> Dashboard
              </button>
              <button
                onClick={() => navigate('upload')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm uppercase tracking-wider font-mono transition-all duration-250 ${
                  currentPage === 'upload'
                    ? 'bg-zinc-900 border border-zinc-800 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-250'
                }`}
              >
                <UploadCloud className="h-3.5 w-3.5" /> Secure Upload
              </button>
              <button
                onClick={() => navigate('vendor-access')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm uppercase tracking-wider font-mono transition-all duration-250 ${
                  currentPage === 'vendor-access'
                    ? 'bg-zinc-900 border border-zinc-800 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-250'
                }`}
              >
                <Users className="h-3.5 w-3.5" /> Vendor Access
              </button>
              <button
                onClick={() => navigate('activity')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm uppercase tracking-wider font-mono transition-all duration-250 ${
                  currentPage === 'activity'
                    ? 'bg-zinc-900 border border-zinc-800 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-250'
                }`}
              >
                <Activity className="h-3.5 w-3.5" /> Audit Ledger
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-900 rounded-full px-1.5 py-1">
              <button 
                onClick={() => navigate('upload')} 
                className={`px-4 py-1.5 text-sm font-mono tracking-wider uppercase rounded-full transition-all hover:bg-zinc-900/60 ${
                  currentPage === 'upload' 
                    ? 'bg-zinc-900 border border-zinc-800 text-emerald-400 font-bold font-semibold' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Secure Uploader
              </button>
              <button 
                onClick={() => navigate('viewer')} 
                className={`px-4 py-1.5 text-sm font-mono tracking-wider uppercase rounded-full transition-all hover:bg-zinc-900/60 ${
                  currentPage === 'viewer' 
                    ? 'bg-zinc-900 border border-zinc-800 text-cyan-400 font-bold font-semibold' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Recipient Decrypter
              </button>
            </div>
          )}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {currentPage === 'landing' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg border border-zinc-855 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 bg-zinc-955 hover:bg-zinc-900 transition-all font-mono flex items-center gap-1.5"
                title="Reset database to initial simulated status"
              >
                <RefreshCw className="h-3.5 w-3.5 text-zinc-550" /> Flush Database
              </button>
              {isAdmin ? (
                <button
                  onClick={() => navigate('dashboard')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-1.5 rounded-lg text-sm font-extrabold font-mono tracking-wider transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
                >
                  <Terminal className="h-3.5 w-3.5" /> DASHBOARD
                </button>
              ) : (
                <button
                  onClick={() => {
                    const passcode = prompt("Enter administrator passcode credentials:");
                    if (passcode !== null) {
                      const success = loginAsAdmin(passcode);
                      if (success) navigate('dashboard');
                    }
                  }}
                  className="bg-zinc-900 hover:bg-zinc-850 text-zinc-350 border border-zinc-800 hover:border-zinc-750 px-4 py-1.5 rounded-lg text-sm font-semibold font-mono tracking-wide transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5 text-zinc-550" /> ADMIN LOGIN
                </button>
              )}
            </div>
          ) : isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="hidden lg:flex items-center gap-1.5 border border-zinc-800 rounded-lg px-2.5 py-1.5 bg-black/40 text-xs font-mono text-zinc-500">
                <Database className="h-3.5 w-3.5 text-emerald-500/80" />
                Registry: {documents.length} files
              </span>
              <button
                onClick={logoutAdmin}
                className="px-3.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-800/80 rounded-lg transition-all font-mono"
              >
                Sign Out Admin
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('landing')}
              className="px-3.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 border border-cyber-border rounded-lg transition-all font-mono"
            >
              Portal Home
            </button>
          )}
        </div>
      </div>

      {/* Mobile sub navigation bar - ONLY SHOWN FOR ADMINS */}
      {isInternalAdmin && (
        <div className="md:hidden flex items-center justify-around border-t border-cyber-border/40 py-2.5 px-2 bg-zinc-950/80 backdrop-blur-sm">
          <button
            onClick={() => navigate('dashboard')}
            className={`flex flex-col items-center gap-1 text-xs transition-colors ${
              currentPage === 'dashboard' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Home className="h-4.5 w-4.5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => navigate('upload')}
            className={`flex flex-col items-center gap-1 text-xs transition-colors ${
              currentPage === 'upload' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <UploadCloud className="h-4.5 w-4.5" />
            <span>Upload</span>
          </button>
          <button
            onClick={() => navigate('vendor-access')}
            className={`flex flex-col items-center gap-1 text-xs transition-colors ${
              currentPage === 'vendor-access' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            <span>Access</span>
          </button>
          <button
            onClick={() => navigate('activity')}
            className={`flex flex-col items-center gap-1 text-xs transition-colors ${
              currentPage === 'activity' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Activity className="h-4.5 w-4.5" />
            <span>Audit</span>
          </button>
        </div>
      )}
    </header>
  );
};
