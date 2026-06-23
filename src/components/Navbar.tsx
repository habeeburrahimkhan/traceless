import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { ShieldAlert, UploadCloud, Users, Activity, Home, Database, Lock, Terminal, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentPage, navigate, documents, isAdmin, logoutAdmin, loginAsAdmin, theme, toggleTheme } = useSimulation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passcode, setPasscode] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAsAdmin(passcode);
    if (success) {
      setShowLoginModal(false);
      setPasscode('');
      navigate('dashboard');
    }
  };

  const isInternalAdmin = isAdmin && currentPage !== 'landing' && currentPage !== 'viewer';

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b border-cyber-border bg-[var(--cyber-bg-header)] backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
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
          <span className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 font-mono flex items-center gap-2">
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
              {isAdmin ? (
                <button
                  onClick={() => navigate('dashboard')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-1.5 rounded-lg text-sm font-extrabold font-mono tracking-wider transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
                >
                  <Terminal className="h-3.5 w-3.5" /> DASHBOARD
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
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

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 transition-all flex items-center justify-center"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400 animate-pulse-slow" /> : <Moon className="h-4 w-4 text-cyan-400" />}
          </button>
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

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl relative overflow-hidden font-mono text-xs text-zinc-400">
            <div className="absolute top-0 right-0 p-2 opacity-5">
              <Lock className="h-24 w-24 text-emerald-450" />
            </div>

            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Lock className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Admin Verification</h3>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest block">Security Passcode</label>
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setPasscode('');
                  }}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border border-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-450 text-black px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
