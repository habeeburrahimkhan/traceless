import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { ShieldCheck, Printer, Lock, Key, Terminal, FileText, ShieldAlert } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate, loginAsAdmin, isAdmin } = useSimulation();

  const [animationStep, setAnimationStep] = useState<number>(0);
  const [otpCode, setOtpCode] = useState<string>('739241');

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 5);
    }, 2800); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (animationStep === 1) {
      setOtpCode(Math.floor(100000 + Math.random() * 900000).toString());
    }
  }, [animationStep]);

  const handleAdminLoginClick = () => {
    const passcode = prompt("Enter administrator passcode credentials:");
    if (passcode !== null) {
      const success = loginAsAdmin(passcode);
      if (success) {
        navigate('dashboard');
      }
    }
  };

  const FlowLine = ({ active, isPurging }: { active: boolean; isPurging: boolean }) => (
    <div className="w-3 sm:w-5 shrink-0 h-0.5 bg-zinc-900 relative rounded-full self-center">
      {active && (
        <div
          className={`absolute inset-0 rounded-full transition-all duration-500 origin-left scale-x-100 ${
            isPurging ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
          }`}
        />
      )}
    </div>
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center bg-cyber-bg overflow-hidden py-12 px-4 sm:px-6 lg:px-8 animate-fade-in text-left">
      <style>{`
        @keyframes spinLeftObject {
          0% { transform: rotateX(20deg) rotateY(0deg) rotateZ(0deg); }
          100% { transform: rotateX(20deg) rotateY(360deg) rotateZ(360deg); }
        }
        @keyframes spinRightObject {
          0% { transform: rotateX(70deg) rotateY(360deg) rotateZ(0deg); }
          100% { transform: rotateX(70deg) rotateY(0deg) rotateZ(-360deg); }
        }
        @keyframes spinLeftAlt {
          0% { transform: rotateX(45deg) rotateY(0deg) rotateZ(45deg); }
          100% { transform: rotateX(45deg) rotateY(360deg) rotateZ(45deg); }
        }
        @keyframes spinRightAlt {
          0% { transform: rotateX(30deg) rotateY(360deg) rotateZ(120deg); }
          100% { transform: rotateX(30deg) rotateY(0deg) rotateZ(120deg); }
        }
        .left-3d-prism {
          transform-style: preserve-3d;
          animation: spinLeftObject 25s linear infinite;
        }
        .right-3d-gyro {
          transform-style: preserve-3d;
          animation: spinRightObject 22s linear infinite;
        }
        .left-3d-rings-alt {
          transform-style: preserve-3d;
          animation: spinLeftAlt 19s linear infinite;
        }
        .right-3d-cube-alt {
          transform-style: preserve-3d;
          animation: spinRightAlt 26s linear infinite;
        }
        .prism-face {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 50px solid transparent;
          border-right: 50px solid transparent;
          border-bottom: 90px solid rgba(16, 185, 129, 0.15);
          border-bottom-color: rgba(16, 185, 129, 0.35);
          transform-origin: 50% 100%;
        }
        .prism-face-cyan {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 45px solid transparent;
          border-right: 45px solid transparent;
          border-bottom: 80px solid rgba(6, 182, 212, 0.15);
          border-bottom-color: rgba(6, 182, 212, 0.35);
          transform-origin: 50% 100%;
        }
      `}</style>

      {/* Grid background */}
      <div className="absolute inset-0 cyber-grid opacity-75 pointer-events-none" style={{ mixBlendMode: 'screen' }} />
      <div className="absolute inset-0 radial-glow opacity-90 pointer-events-none" style={{ filter: 'blur(40px)' }} />

      {/* LEFT 3D OBJECT 1: Holographic Security Prism */}
      <div className="absolute left-[8%] top-[25%] w-32 h-32 pointer-events-none hidden 2xl:block" style={{ perspective: '800px' }}>
        <div className="w-full h-full relative left-3d-prism" style={{ filter: 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.45))' }}>
          {/* Upper Pyramid faces */}
          <div className="prism-face" style={{ transform: 'rotateY(0deg) rotateX(30deg) translateZ(0px)' }} />
          <div className="prism-face" style={{ transform: 'rotateY(90deg) rotateX(30deg) translateZ(0px)' }} />
          <div className="prism-face" style={{ transform: 'rotateY(180deg) rotateX(30deg) translateZ(0px)' }} />
          <div className="prism-face" style={{ transform: 'rotateY(270deg) rotateX(30deg) translateZ(0px)' }} />
          {/* Lower Pyramid faces */}
          <div className="prism-face" style={{ transform: 'translateY(90px) scaleY(-1) rotateY(0deg) rotateX(30deg)' }} />
          <div className="prism-face" style={{ transform: 'translateY(90px) scaleY(-1) rotateY(90deg) rotateX(30deg)' }} />
          <div className="prism-face" style={{ transform: 'translateY(90px) scaleY(-1) rotateY(180deg) rotateX(30deg)' }} />
          <div className="prism-face" style={{ transform: 'translateY(90px) scaleY(-1) rotateY(270deg) rotateX(30deg)' }} />
        </div>
      </div>

      {/* LEFT 3D OBJECT 2: Secondary Quantum Ring System */}
      <div className="absolute left-[8%] top-[60%] w-32 h-32 pointer-events-none hidden 2xl:block" style={{ perspective: '800px' }}>
        <div className="w-full h-full relative left-3d-rings-alt">
          <div className="absolute inset-0 border-2 border-cyan-500 rounded-full opacity-60" style={{ filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.4))' }} />
          <div className="absolute inset-3 border border-double border-emerald-500 rounded-full opacity-50" style={{ transform: 'rotateY(90deg)', filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.3))' }} />
          <div className="absolute inset-6 border border-zinc-700 rounded-full" style={{ transform: 'rotateX(90deg)' }} />
          <div className="absolute inset-9 border-2 border-dotted border-cyan-400 rounded-full flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
        </div>
      </div>

      {/* RIGHT 3D OBJECT 1: Quantum Gyroscopic Ring System */}
      <div className="absolute right-[8%] top-[25%] w-36 h-36 pointer-events-none hidden 2xl:block" style={{ perspective: '800px' }}>
        <div className="w-full h-full relative right-3d-gyro">
          <div className="absolute inset-0 border-4 border-double border-cyan-400 rounded-full" style={{ filter: 'drop-shadow(0 0 10px rgba(6,182,212,0.4))' }} />
          <div className="absolute inset-4 border-2 border-dashed border-emerald-500 rounded-full" style={{ transform: 'rotateY(90deg)', filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.4))' }} />
          <div className="absolute inset-8 border border-zinc-700 rounded-full" style={{ transform: 'rotateX(90deg)' }} />
          <div className="absolute inset-12 border-2 border-emerald-500 rounded-full flex items-center justify-center" style={{ transform: 'rotateZ(45deg)' }}>
            <div className="w-4 h-4 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>
      </div>

      {/* RIGHT 3D OBJECT 2: Holographic Security Prism Alt */}
      <div className="absolute right-[8%] top-[60%] w-32 h-32 pointer-events-none hidden 2xl:block" style={{ perspective: '800px' }}>
        <div className="w-full h-full relative right-3d-cube-alt" style={{ filter: 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.4))' }}>
          {/* Upper Pyramid faces */}
          <div className="prism-face-cyan" style={{ transform: 'rotateY(0deg) rotateX(30deg) translateZ(0px)' }} />
          <div className="prism-face-cyan" style={{ transform: 'rotateY(90deg) rotateX(30deg) translateZ(0px)' }} />
          <div className="prism-face-cyan" style={{ transform: 'rotateY(180deg) rotateX(30deg) translateZ(0px)' }} />
          <div className="prism-face-cyan" style={{ transform: 'rotateY(270deg) rotateX(30deg) translateZ(0px)' }} />
          {/* Lower Pyramid faces */}
          <div className="prism-face-cyan" style={{ transform: 'translateY(80px) scaleY(-1) rotateY(0deg) rotateX(30deg)' }} />
          <div className="prism-face-cyan" style={{ transform: 'translateY(80px) scaleY(-1) rotateY(90deg) rotateX(30deg)' }} />
          <div className="prism-face-cyan" style={{ transform: 'translateY(80px) scaleY(-1) rotateY(180deg) rotateX(30deg)' }} />
          <div className="prism-face-cyan" style={{ transform: 'translateY(80px) scaleY(-1) rotateY(270deg) rotateX(30deg)' }} />
        </div>
      </div>

      <div className="max-w-5xl w-full space-y-10 relative z-10">
        {/* Title */}
        <div className="space-y-3 animate-fade-in text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 text-sm font-mono mb-2">
            <Lock className="h-4 w-4" /> Zero-Trust Gateway Established
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
            TraceLess <span className="text-emerald-400">Access Portal</span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto">
            Choose your connection profile to initialize security handshake and decrypt resources.
          </p>
        </div>

        {/* Hero Interactive Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch max-w-4xl mx-auto">
          {/* Interactive Workflow Visualization */}
          <div className="lg:col-span-8 border border-zinc-800 bg-zinc-955/95 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
            <div className="text-left space-y-1 pb-3 border-b border-zinc-900/60">
              <h3 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-emerald-400 animate-pulse" /> Dynamic Protection Flow
              </h3>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                Zero-Trust exfiltration shielding in action: client-encrypted payloads are transiently spooled and instantly purged.
              </p>
            </div>

            <div className="flex overflow-x-auto md:overflow-x-visible flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-2 sm:gap-3 py-8 w-full max-w-full scrollbar-none pb-4">
              {/* PDF Document Node */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 w-28 h-32 shrink-0 relative font-mono transition-all duration-300 animate-workflow-float ${
                  animationStep === 0
                    ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.25)] scale-[1.02]'
                    : animationStep === 4
                    ? 'border-rose-500/45 bg-rose-950/5 text-rose-500/70 scale-95'
                    : 'border-zinc-850 bg-zinc-950/40 text-zinc-500'
                }`}
              >
                <div className={`absolute -top-1.5 -right-1.5 rounded-full p-1 border text-xs shadow-md transition-colors ${
                  animationStep === 0 ? 'bg-zinc-900 border-emerald-500/40 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                }`}>
                  <Lock className="h-3 w-3" />
                </div>
                <FileText className={`h-9 w-9 transition-colors duration-300 ${
                  animationStep === 0 ? 'text-emerald-400' : animationStep === 4 ? 'text-rose-500/60 animate-pulse' : 'text-zinc-500'
                }`} />
                <span className={`text-[10px] uppercase tracking-wider text-center font-bold truncate max-w-[90px] transition-colors duration-300 ${
                  animationStep === 0 ? 'text-zinc-200 font-bold' : animationStep === 4 ? 'text-rose-400/80' : 'text-zinc-500'
                }`}>SECURE_DOC</span>
                <div className="w-14 h-1 bg-zinc-800 rounded-full overflow-hidden mt-1">
                  <div className={`h-full bg-emerald-500 transition-all duration-500 ${animationStep === 0 ? 'w-full' : 'w-1/3'}`} />
                </div>
              </div>

              <FlowLine active={animationStep >= 1} isPurging={animationStep === 4} />

              {/* OTP Key Node */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 w-28 h-32 shrink-0 relative font-mono transition-all duration-300 ${
                  animationStep === 1
                    ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.25)] scale-[1.02]'
                    : 'border-zinc-850 bg-zinc-950/40 text-zinc-500'
                } ${animationStep === 1 ? 'animate-pulse' : ''}`}
              >
                <div className={`w-8 h-6 rounded border flex flex-col gap-0.5 p-0.5 justify-center transition-colors ${
                  animationStep === 1 ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-900'
                }`}>
                  <div className="grid grid-cols-3 gap-0.5 h-full">
                    <div className="bg-zinc-800/80 rounded-[1px]" />
                    <div className="bg-zinc-800/80 rounded-[1px]" />
                    <div className="bg-zinc-800/80 rounded-[1px]" />
                    <div className="bg-zinc-800/80 rounded-[1px]" />
                    <div className="bg-zinc-800/80 rounded-[1px]" />
                    <div className="bg-zinc-800/80 rounded-[1px]" />
                  </div>
                </div>
                <span className="text-[8px] uppercase tracking-widest text-zinc-500">OTP CODE</span>
                <span className={`text-[11px] font-black tracking-wider transition-colors ${animationStep === 1 ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                  {animationStep === 1 ? otpCode : '******'}
                </span>
                <Key className={`h-3.5 w-3.5 transition-colors ${animationStep === 1 ? 'text-emerald-400 animate-pulse' : 'text-zinc-650'}`} />
              </div>

              <FlowLine active={animationStep >= 2} isPurging={animationStep === 4} />

              {/* Secure Viewer Node */}
              <div
                className={`p-2.5 rounded-xl border flex flex-col justify-between w-30 h-32 shrink-0 relative font-mono transition-all duration-300 overflow-hidden ${
                  animationStep === 2
                    ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.25)] scale-[1.02]'
                    : animationStep === 4
                    ? 'border-rose-500/50 bg-rose-950/10 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                    : 'border-zinc-855 bg-zinc-955/40 text-zinc-500'
                }`}
              >
                <div className="flex justify-between items-center text-[8px] border-b border-zinc-900/60 pb-1.5">
                  <span className="text-[7px] tracking-wider text-zinc-500">SANDBOX</span>
                  <ShieldCheck className={`h-3.5 w-3.5 transition-colors ${
                    animationStep === 2 ? 'text-emerald-400' : animationStep === 4 ? 'text-rose-500 animate-pulse' : 'text-zinc-650'
                  }`} />
                </div>
                
                <div className="flex-1 flex flex-col justify-center gap-0.5 text-[7px] text-zinc-600 font-mono mt-1 font-semibold leading-tight">
                  {animationStep === 2 ? (
                    <>
                      <p className="text-emerald-400 animate-pulse">&gt; Decrypted</p>
                      <p className="text-zinc-400">&gt; AES verified</p>
                      <p className="text-zinc-500">&gt; Sandbox active</p>
                    </>
                  ) : animationStep === 4 ? (
                    <>
                      <p className="text-rose-500 animate-pulse font-black">&gt; PURGING MEM</p>
                      <p className="text-rose-400/80">&gt; Decrypter flush</p>
                      <p className="text-rose-500/60">&gt; Buffer zeroed</p>
                    </>
                  ) : (
                    <>
                      <p>&gt; Stream locked</p>
                      <p>&gt; Check signature</p>
                      <p>&gt; Standby...</p>
                    </>
                  )}
                </div>

                <div className="text-[7px] text-center border-t border-zinc-900/60 pt-1 font-bold">
                  {animationStep === 4 ? (
                    <span className="text-rose-500 tracking-tight animate-pulse uppercase">SHREDDED</span>
                  ) : animationStep === 2 ? (
                    <span className="text-emerald-400 tracking-tight uppercase">DECRYPTED</span>
                  ) : (
                    <span className="text-zinc-500 uppercase">STANDBY</span>
                  )}
                </div>
              </div>

              <FlowLine active={animationStep >= 3} isPurging={animationStep === 4} />

              {/* Printer Node */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 w-28 h-32 shrink-0 relative font-mono transition-all duration-300 ${
                  animationStep === 3
                    ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.25)] scale-[1.02]'
                    : 'border-zinc-850 bg-zinc-950/40 text-zinc-500'
                }`}
              >
                <div className="relative h-10 w-12 flex items-center justify-center mt-1">
                  <svg viewBox="0 0 48 40" className={`w-10 h-10 transition-colors ${animationStep === 3 ? 'text-emerald-400' : 'text-zinc-500'}`} fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 12V4H36V12" strokeDasharray={animationStep === 3 ? "2 2" : "none"} className={animationStep === 3 ? "animate-pulse" : ""} />
                    <rect x="4" y="12" width="40" height="20" rx="3" fill="black" />
                    <path d="M10 32H38V38H10V32Z" fill="black" />
                  </svg>
                  
                  {animationStep === 3 ? (
                    <div className="absolute top-[28px] left-[14px] w-5 bg-white border border-zinc-300 rounded-[1px] p-0.5 flex flex-col gap-0.5 justify-center animate-workflow-print-paper">
                      <div className="w-full h-0.5 bg-zinc-850" />
                      <div className="w-3 h-0.5 bg-zinc-850" />
                    </div>
                  ) : null}

                  {animationStep === 3 && (
                    <div className="absolute top-[28px] left-[6px] right-[6px] h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-workflow-laser" />
                  )}
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-bold ${animationStep === 3 ? 'text-emerald-400' : 'text-zinc-500'}`}>SPOOL_PRINT</span>
              </div>

              <FlowLine active={animationStep >= 4} isPurging={animationStep === 4} />

              {/* Destruct Node */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 w-28 h-32 shrink-0 relative font-mono transition-all duration-300 overflow-hidden ${
                  animationStep === 4
                    ? 'border-rose-500 bg-rose-950/10 shadow-[0_0_15px_rgba(244,63,94,0.25)] scale-[1.02]'
                    : 'border-zinc-850 bg-zinc-950/40 text-zinc-500'
                }`}
              >
                {animationStep === 4 ? (
                  <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center text-center p-1 font-mono">
                    <div className="text-rose-500 font-black text-[10px] tracking-tighter uppercase animate-pulse">
                      DATA PURGED
                    </div>
                    
                    <div className="relative w-full h-6 overflow-hidden mt-1.5 opacity-80">
                      <span className="absolute bg-emerald-500 rounded-full h-0.5 w-0.5 left-[15%] top-1 animate-ping" />
                      <span className="absolute bg-rose-500 rounded-full h-0.5 w-0.5 left-[50%] top-2 animate-ping" />
                      <span className="absolute bg-emerald-400 rounded-full h-0.5 w-0.5 left-[75%] top-1.5 animate-ping" />
                    </div>
                    
                    <span className="text-[7px] text-rose-455 font-bold tracking-wide uppercase mt-1">ZERO TRACE</span>
                  </div>
                ) : (
                  <>
                    <ShieldAlert className="h-8 w-8 text-zinc-650" />
                    <span className="text-[10px] uppercase tracking-wider text-center text-zinc-500 font-bold">Auto Burn</span>
                    <span className="text-[8px] text-zinc-600 font-bold bg-zinc-900 border border-zinc-850 px-1 py-0.5 rounded">ARMED</span>
                  </>
                )}
              </div>
            </div>

            <div className="text-xs text-zinc-550 flex justify-between font-mono pt-2 border-t border-zinc-900/60 uppercase">
              <span className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${animationStep === 4 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-ping'}`} /> 
                STAGE: {animationStep + 1}/5
              </span>
              <span>PROTOCOL: TRACELESS_SANDBOX_V1</span>
            </div>
          </div>

          {/* Security Status Panel */}
          <div className="lg:col-span-4 border border-zinc-800 bg-zinc-950/95 rounded-2xl p-5 flex flex-col justify-between font-mono relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
              <span className="text-xs text-zinc-400 flex items-center gap-1.5 uppercase font-bold">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Command Ledger
              </span>
              <span className="text-[10px] bg-zinc-900 text-emerald-400 border border-zinc-800 px-2 py-0.5 rounded uppercase font-bold animate-pulse">
                MONITORING
              </span>
            </div>

            <div className="space-y-2 py-4 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-900/60">
                <span className="text-zinc-500 uppercase font-semibold">ENCRYPTION</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  AES-256 GCM
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-900/60">
                <span className="text-zinc-500 uppercase font-semibold">OTP PROTECTION</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ACTIVE (2FA)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-900/60">
                <span className="text-zinc-500 uppercase font-semibold">DOWNLOAD ACCESS</span>
                <span className="flex items-center gap-1.5 font-bold text-rose-500">
                  <Lock className="h-3 w-3 text-rose-500 animate-pulse" />
                  BLOCKED
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-900/60">
                <span className="text-zinc-500 uppercase font-semibold">LOCAL STORAGE</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  RAM-ONLY
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-900/60">
                <span className="text-zinc-500 uppercase font-semibold">FILE LIFETIME</span>
                <span className="flex items-center gap-1.5 font-bold text-amber-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  15 MIN MAX
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-900/60">
                <span className="text-zinc-500 uppercase font-semibold">AUTO DESTRUCT</span>
                <span className="flex items-center gap-1.5 font-bold text-rose-500 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  ARMED
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-lg text-[10px] text-zinc-500 leading-normal">
              <div className="flex items-center gap-1 text-emerald-400 font-bold mb-0.5 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                SYS STATUS: NOMINAL
              </div>
              <p>&gt; IP logging active (audited)</p>
              <p>&gt; Integrity keys matching 100%</p>
            </div>
          </div>
        </div>

        {/* Roles Grid Selection */}
        <div className="grid md:grid-cols-2 gap-6 mt-8 max-w-4xl mx-auto animate-slide-up">
          {/* Role A: User (Uploader) */}
          <div 
            onClick={() => navigate('upload')}
            className="group relative p-6 rounded-2xl border border-zinc-800 bg-zinc-955/95 hover:bg-zinc-950 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer flex flex-col justify-between text-left shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          >
            <div className="space-y-4">
              <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">Document Uploader (User)</h3>
                <p className="text-zinc-400 text-xs leading-relaxed mt-2 font-mono">
                  Securely upload and encrypt a PDF, document, or picture. Ingest client-side cryptographic keys, and generate OTP delivery constraints with instant burn times.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-500 group-hover:text-emerald-400 transition-colors">
              <span>Upload Document</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* Role B: Print Shop / Recipient */}
          <div 
            onClick={() => navigate('viewer')}
            className="group relative p-6 rounded-2xl border border-zinc-800 bg-zinc-955/95 hover:bg-zinc-950 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer flex flex-col justify-between text-left shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          >
            <div className="space-y-4">
              <div className="h-10 w-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">Print Shop / Receiver</h3>
                <p className="text-zinc-400 text-xs leading-relaxed mt-2 font-mono">
                  Access transient document streams, verify identity credentials, enter single-use multi-factor verification OTPs, and print securely in the protected viewer.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-500 group-hover:text-cyan-400 transition-colors">
              <span>Access Secure Viewer</span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>

        {/* Secure Admin Operations Override Gate */}
        <div className="pt-6 text-center animate-fade-in">
          {isAdmin ? (
            <button
              onClick={() => navigate('dashboard')}
              className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-400 hover:text-emerald-300 px-4.5 py-2 rounded-lg text-sm font-mono transition-all"
            >
              <Terminal className="h-4 w-4" /> Open Operations Dashboard &rarr;
            </button>
          ) : (
            <button
              onClick={handleAdminLoginClick}
              className="text-zinc-650 hover:text-zinc-400 font-mono text-xs tracking-wide transition-all hover:underline"
            >
              Security Operations Console (Passcode Blocked)
            </button>
          )}
        </div>

        {/* Security verification footers */}
        <div className="pt-4 text-xs text-zinc-600 font-mono flex items-center justify-center gap-4">
          <span className="flex items-center gap-1"><Key className="h-3.5 w-3.5" /> E2E Client Crypt</span>
          <span>•</span>
          <span>Zero-Footprint Delivery</span>
        </div>
      </div>
    </div>
  );
};
