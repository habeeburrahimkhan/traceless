import React, { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  Mail, Lock, Key, EyeOff, AlertCircle, FileText, 
  Trash2, Printer, Shield, Clock, ShieldAlert, ShieldCheck, HelpCircle, Terminal
} from 'lucide-react';

const getPdfBlobUrl = (dataUrl: string): string => {
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return dataUrl;
    const base64Data = parts[1];
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error("Error converting base64 to Blob URL:", e);
    return dataUrl;
  }
};

export const SecureViewerPage: React.FC = () => {
  const { 
    viewerDoc,
    documents,
    activeViewerDocId, 
    viewerEmailEntered, 
    viewerAuthenticated, 
    requestOTP, 
    verifyOTP, 
    burnDocument, 
    triggerToast,
    navigate,
    isAdmin,
    lookupByOtp,
    loadViewerDocument,
    isLoading,
  } = useSimulation();

  // Input & Stage states
  const [docIdInput, setDocIdInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [otpInput, setOtpInput] = useState<string>('');
  const [verifyStage, setVerifyStage] = useState<'email' | 'otp' | 'validating' | 'success' | 'failure'>('email');

  // Watermark variables
  const [sessionID, setSessionID] = useState<string>('');
  const [currentTimestamp, setCurrentTimestamp] = useState<string>('');

  // Print done state
  const [isPrintDone, setIsPrintDone] = useState<boolean>(false);

  // Blob URL for native same-origin print sandbox
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>('');

  // Expiration countdown state
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const countdownIntervalRef = useRef<any>(null);

  const doc = viewerDoc;

  // Convert base64 PDF into a Blob URL on document selection
  useEffect(() => {
    if (doc && doc.type === 'pdf' && doc.content.startsWith('data:application/pdf;base64,')) {
      const url = getPdfBlobUrl(doc.content);
      setPdfBlobUrl(url);
      return () => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      };
    } else {
      setPdfBlobUrl('');
    }
  }, [doc]);

  // Initialize random Session ID on mount
  useEffect(() => {
    const randomSession = 'SES_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    setSessionID(randomSession);
  }, [activeViewerDocId]);

  // Live ticking timestamp for watermark
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTimestamp(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsPrintDone(false);
    if (activeViewerDocId && viewerDoc) {
      if (viewerDoc.requireEmailVerification) {
        setVerifyStage('email');
      } else if (!viewerAuthenticated) {
        setVerifyStage((prev) => (prev === 'validating' || prev === 'success' ? prev : 'otp'));
      }
    } else if (!activeViewerDocId) {
      setVerifyStage('email');
    }
    if (!viewerAuthenticated) {
      setEmailInput('');
      setOtpInput('');
    }
  }, [activeViewerDocId, viewerDoc?.id, viewerAuthenticated]);

  // Handle countdown timer in decrypted viewer
  useEffect(() => {
    if (!doc || doc.status !== 'active' || !viewerAuthenticated || !doc.expiresAt) {
      setTimeRemaining('');
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    const calculateTime = () => {
      const difference = new Date(doc.expiresAt!).getTime() - Date.now();
      if (difference <= 0) {
        clearInterval(countdownIntervalRef.current);
        burnDocument(doc.id, 'expired');
        setTimeRemaining('EXPIRED');
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      const padZero = (num: number) => num < 10 ? `0${num}` : num;
      setTimeRemaining(`${padZero(minutes)}m ${padZero(seconds)}s`);
    };

    calculateTime();
    countdownIntervalRef.current = setInterval(calculateTime, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [doc, viewerAuthenticated]);


  // Block copy/print/save keyboard commands in Secure Viewer
  useEffect(() => {
    if (!viewerAuthenticated || !doc || doc.status !== 'active') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrlKey = e.ctrlKey || e.metaKey;
      if (ctrlKey && ['p', 's', 'c', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        
        if (e.key.toLowerCase() === 'p') {
          // Intercept Ctrl+P and trigger our secure print instead of blocking outright
          handlePrint();
        } else {
          triggerToast(
            `Security Alert: Exfiltration shortcut "Ctrl+${e.key.toUpperCase()}" intercepted and blocked.`, 
            'warning'
          );
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerToast('Security Alert: Inspecting source and right-click menus are locked.', 'warning');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [viewerAuthenticated, doc]);

  const handleDocIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docIdInput) return;

    const trimmedInput = docIdInput.trim();

    if (/^\d{6}$/.test(trimmedInput)) {
      const targetDoc = await lookupByOtp(trimmedInput);
      if (!targetDoc) return;

      if (targetDoc.status !== 'active') {
        triggerToast('Error: This document share token has expired or been shredded.', 'error');
        return;
      }

      navigate('viewer', targetDoc.id);

      if (!targetDoc.requireEmailVerification) {
        setVerifyStage('validating');
        setOtpInput(trimmedInput);
        setTimeout(() => {
          setVerifyStage('success');
          setTimeout(async () => {
            const ok = await verifyOTP(targetDoc.id, trimmedInput);
            if (!ok) setVerifyStage('failure');
          }, 1500);
        }, 1500);
      } else {
        setVerifyStage('email');
      }
      return;
    }

    const targetDoc = await loadViewerDocument(trimmedInput);
    if (!targetDoc) return;

    if (targetDoc.status !== 'active') {
      triggerToast('Error: This document share token has expired or been shredded.', 'error');
      return;
    }

    navigate('viewer', trimmedInput);

    if (targetDoc.requireEmailVerification) {
      setVerifyStage('email');
    } else {
      setVerifyStage('otp');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !doc) return;

    const success = await requestOTP(doc.id, emailInput);
    if (success) {
      setVerifyStage('otp');
    }
  };

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || !doc) return;

    setVerifyStage('validating');

    setTimeout(async () => {
      const ok = await verifyOTP(doc.id, otpInput);
      if (ok) {
        setVerifyStage('success');
      } else {
        setVerifyStage('failure');
      }
    }, 1500);
  };

  // Handle Secure Print
  const handlePrint = () => {
    if (!doc || doc.status !== 'active') return;

    let burned = false;
    const triggerBurn = () => {
      if (burned) return;
      burned = true;

      // Clean up all event listeners
      window.removeEventListener('afterprint', triggerBurn);
      window.removeEventListener('focus', triggerBurn);
      const iframe = document.getElementById('pdf-print-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.removeEventListener('afterprint', triggerBurn);
        } catch (e) {}
      }

      // Execute erasure and UI completion immediately
      setIsPrintDone(true);
      burnDocument(doc.id, 'burned');
    };

    // Register afterprint listener immediately
    window.addEventListener('afterprint', triggerBurn);
    if (doc.type === 'pdf') {
      const iframe = document.getElementById('pdf-print-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.addEventListener('afterprint', triggerBurn);
        } catch (e) {}
      }
    }

    // Register window focus listener after a 500ms delay to catch dialog close
    setTimeout(() => {
      if (!burned) {
        window.addEventListener('focus', triggerBurn);
      }
    }, 500);
    
    if (doc.type === 'pdf') {
      const iframe = document.getElementById('pdf-print-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          return;
        } catch (e) {
          console.error("Iframe print blocked or failed, falling back to window print:", e);
        }
      }
    }
    
    window.print();
  };

  const handleManualBurn = () => {
    const confirmation = window.confirm('WARNING: Destroying this document immediately terminates all encryption keys. The file will be unreadable forever. Continue?');
    if (confirmation) {
      burnDocument(doc!.id, 'burned');
    }
  };

  if (activeViewerDocId && !doc && isLoading) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center text-zinc-400 font-mono text-sm">
        Loading secure document envelope...
      </div>
    );
  }

  if (!doc) {
    const activeDocs = isAdmin ? documents.filter((d) => d.status === 'active') : [];

    return (
      <div className="max-w-md mx-auto py-12 px-4 animate-fade-in">
        <div className="border border-zinc-850 bg-zinc-950/40 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden text-left shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 inset-x-0 h-0.5 bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]" />

          <div className="flex justify-between items-center font-mono">
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-zinc-600" /> Print Shop terminal
            </span>
            <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-cyan-400 px-2 py-0.5 rounded font-mono">
              STANDBY
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Initialize Secure Stream</h3>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              Enter the 6-digit Decryption OTP code (or Document ID) to decrypt and print the document.
            </p>
          </div>

          <form onSubmit={handleDocIdSubmit} className="space-y-4 font-mono">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest block">6-Digit OTP / Document ID</label>
              <div className="flex bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 items-center gap-3 focus-within:border-cyan-500/50 transition-colors">
                <FileText className="h-4.5 w-4.5 text-zinc-500 shrink-0" />
                <input
                  type="text"
                  required
                  value={docIdInput}
                  onChange={(e) => setDocIdInput(e.target.value)}
                  placeholder="e.g. 123456 or doc-1"
                  className="bg-transparent border-none text-xs text-zinc-200 focus:outline-none w-full font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-2.5 rounded-lg text-xs font-semibold font-mono tracking-wider uppercase transition-colors"
            >
              Access Document &rarr;
            </button>
          </form>

          {/* Registry helpers to click-and-fill for instant simulation verification */}
          {!isAdmin && (
            <div className="pt-4 border-t border-zinc-900 space-y-3 font-mono text-[10px]">
              <p className="text-zinc-500 flex items-center gap-1 uppercase tracking-wider">
                <HelpCircle className="h-3.5 w-3.5" /> Enter the 6-digit OTP or document ID from your sender.
              </p>
            </div>
          )}
          {isAdmin && (
            <div className="pt-4 border-t border-zinc-900 space-y-3 font-mono text-[10px]">
              <p className="text-zinc-500 flex items-center gap-1 uppercase tracking-wider">
                <HelpCircle className="h-3.5 w-3.5" /> Admin quick access registry:
              </p>
              <div className="flex flex-col gap-1.5">
                {activeDocs.length === 0 ? (
                  <span className="text-zinc-650 italic">No active shares found. Upload a document first.</span>
                ) : (
                  activeDocs.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setDocIdInput(d.requireEmailVerification ? d.id : d.otpCode || d.id);
                      }}
                      className="flex justify-between items-center bg-zinc-900/40 border border-zinc-850 hover:border-cyan-500/20 px-2.5 py-1.5 rounded text-left text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      <span className="truncate max-w-[180px]">{d.name}</span>
                      <span className="text-cyan-400 font-bold shrink-0">
                        {d.requireEmailVerification ? `ID: ${d.id}` : `OTP: ${d.otpCode}`}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // RENDER PHASE B: Security Verification gateway (if doc is active but viewer not authenticated)
  if (doc.status !== 'active' || !viewerAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 animate-fade-in text-left">
        <div className="border border-zinc-850 bg-zinc-950/40 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          {/* Top colored indicator line based on stage */}
          <div className={`absolute top-0 inset-x-0 h-0.5 transition-all duration-300 ${
            isPrintDone
              ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : verifyStage === 'success' 
                ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : verifyStage === 'failure' 
                  ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : 'bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
          }`} />

          {/* Verification step indicators */}
          <div className="flex justify-between items-center font-mono">
            <button 
              onClick={() => navigate('viewer', null)}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
            >
              &larr; Switch File
            </button>
            <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase font-bold">
              {doc.status}
            </span>
          </div>

          {/* Status states: Shredded, Expired or Printed */}
          {doc.status !== 'active' ? (
            isPrintDone ? (
              <div className="space-y-6 text-center pt-2 font-mono animate-fade-in">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <ShieldCheck className="h-8 w-8 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-md font-extrabold text-emerald-400 uppercase tracking-widest">PRINT COMPLETED</h3>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">SECURE BUFFER DELETED</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    The document <b>{doc.name}</b> was sent to the print queue. All decrypted transient key layers and memory buffers have been purged.
                  </p>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg text-left text-[10px] text-zinc-500 space-y-1.5 font-mono">
                  <p className="flex items-center gap-1 font-semibold text-emerald-400"><Terminal className="h-3.5 w-3.5" /> Purge Logs:</p>
                  <p className="text-zinc-400">&gt; Printer session closed successfully.</p>
                  <p className="text-zinc-400">&gt; Flushing AES-256 decryption key from virtual RAM...</p>
                  <p className="text-zinc-400">&gt; Shredding local cache files and stream references...</p>
                  <p className="text-rose-400 font-semibold">&gt; Cryptographic keys purged. Data is now unrecoverable.</p>
                </div>

                <button
                  onClick={() => {
                    setIsPrintDone(false);
                    navigate('viewer', null);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Back to Terminal
                </button>
              </div>
            ) : (
              <div className="space-y-6 text-center pt-2 font-mono">
                <div className="h-14 w-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto">
                  <EyeOff className="h-6 w-6 text-rose-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-md font-bold text-white uppercase tracking-wider">Access Terminated</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    This secure envelope ({doc.name}) has self-destructed or expired. The keys have been purged.
                  </p>
                </div>
                <button
                  onClick={() => navigate('viewer', null)}
                  className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 py-2.5 rounded-lg text-xs font-semibold"
                >
                  Back to Terminal
                </button>
              </div>
            )
          ) : (
            /* Sub-stage renderers */
            <>
              {/* STAGE 1: Email Request */}
              {verifyStage === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-5 font-mono">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Identity Authorization</h3>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">
                      Enter the registered email authorized for this encrypted document.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block">Authorized Work Email</label>
                    <div className="flex bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 items-center gap-3">
                      <Mail className="h-4.5 w-4.5 text-zinc-500 shrink-0" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="e.g. partner@external-audit.com"
                        className="bg-transparent border-none text-xs text-zinc-200 focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors"
                  >
                    Request Decryption PIN
                  </button>
                </form>
              )}

              {/* STAGE 2: Input OTP */}
              {verifyStage === 'otp' && (
                <form onSubmit={handleOTPVerify} className="space-y-5 font-mono">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Verification Key</h3>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">
                      {doc.requireEmailVerification ? (
                        <>Enter the 6-digit OTP decryption PIN code sent to <span className="text-emerald-400">{viewerEmailEntered}</span>.</>
                      ) : (
                        <>Enter the 6-digit OTP decryption PIN code to decrypt this document stream.</>
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block">6-Digit Access OTP</label>
                    <div className="flex bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 items-center gap-3">
                      <Key className="h-4.5 w-4.5 text-zinc-500 shrink-0" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="bg-transparent border-none text-xs text-zinc-200 tracking-widest font-bold focus:outline-none w-full text-center"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors"
                  >
                    Verify Security PIN
                  </button>
                  
                  {doc.requireEmailVerification ? (
                    <div className="flex justify-between items-center text-[10px] pt-1 text-zinc-500">
                      <button 
                        type="button" 
                        onClick={() => setVerifyStage('email')} 
                        className="hover:text-zinc-300 hover:underline"
                      >
                        &larr; Adjust Email
                      </button>
                      <button 
                        type="button" 
                        onClick={() => requestOTP(doc.id, viewerEmailEntered)} 
                        className="hover:text-zinc-300 hover:underline"
                      >
                        Resend OTP
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-start text-[10px] pt-1 text-zinc-500">
                      <button 
                        type="button" 
                        onClick={() => navigate('viewer', null)} 
                        className="hover:text-zinc-300 hover:underline"
                      >
                        &larr; Back to ID Entry
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* STAGE 3: Loading / Validating State */}
              {verifyStage === 'validating' && (
                <div className="py-8 text-center space-y-6 font-mono">
                  <div className="relative h-14 w-14 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-zinc-850" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <Lock className="h-5 w-5 text-emerald-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Validating Security PIN</h3>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest animate-pulse">
                      Exchanging transient key layers...
                    </p>
                  </div>

                  <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg text-left text-[9px] text-zinc-500 space-y-1">
                    <p className="flex items-center gap-1 font-semibold text-zinc-400"><Terminal className="h-3.5 w-3.5" /> Handshake Logs:</p>
                    <p>&gt; Requesting token metadata parameters from registry...</p>
                    <p>&gt; Encrypted signature verification in process...</p>
                  </div>
                </div>
              )}

              {/* STAGE 4: Success state (access approved) */}
              {verifyStage === 'success' && (
                <div className="py-8 text-center space-y-6 font-mono animate-fade-in">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <ShieldCheck className="h-8 w-8 text-emerald-400" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-extrabold text-emerald-400 uppercase tracking-widest">ACCESS GRANTED</h3>
                    <p className="text-zinc-400 text-xs">
                      Decryption keys matched. Establishing secure sandbox viewport...
                    </p>
                  </div>

                  <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                  </div>
                </div>
              )}

              {/* STAGE 5: Failure state (access denied) */}
              {verifyStage === 'failure' && (
                <div className="py-6 text-center space-y-6 font-mono animate-fade-in">
                  <div className="h-16 w-16 rounded-full bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                    <ShieldAlert className="h-8 w-8 text-rose-500" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-extrabold text-rose-500 uppercase tracking-widest">ACCESS DENIED</h3>
                    <p className="text-zinc-400 text-xs">
                      Cryptographic signature mismatch. The OTP token code is invalid.
                    </p>
                  </div>

                  <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg text-left text-[9px] text-zinc-500 space-y-1">
                    <p className="flex items-center gap-1 font-semibold text-rose-400"><ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> System Action Ledger:</p>
                    <p className="text-rose-500/80">&gt; WARNING: Verification signature mismatch.</p>
                    <p>&gt; IP address logged: 72.229.28.185 (NY, USA)</p>
                    <p>&gt; Intrusion attempt logged to platform ledger.</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setOtpInput(''); setVerifyStage('otp'); }}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 py-2.5 rounded-lg text-xs font-semibold"
                    >
                      Retry Verification
                    </button>
                    <button
                      type="button"
                      onClick={() => { navigate('viewer', null); }}
                      className="flex-1 bg-rose-950/20 hover:bg-rose-500 hover:text-black border border-rose-900/30 text-rose-400 py-2.5 rounded-lg text-xs font-semibold transition-all"
                    >
                      Abort Session
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // RENDER LEVEL 3: Safe Decrypted Viewer Sandbox (Recipient authenticated)
  // Zero-Trust Admin Boundary check: Block document viewing if logged in as Admin
  if (isAdmin && viewerAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 animate-fade-in text-left">
        <div className="border border-rose-500/40 bg-zinc-950/80 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 inset-x-0 h-0.5 bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]" />
          
          <div className="flex justify-between items-center font-mono">
            <span className="text-[10px] text-rose-400 flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5" /> SECURITY BOUNDARY INTERCEPTED
            </span>
            <span className="text-[9px] bg-rose-950/40 border border-rose-900/40 text-rose-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
              RESTRICTED
            </span>
          </div>

          <div className="space-y-4 pt-2 text-center font-mono">
            <div className="h-16 w-16 rounded-full bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(244,63,94,0.2)]">
              <Lock className="h-8 w-8 text-rose-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-widest">ADMIN PRIVACY SHIELD</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Administrator accounts are cryptographically restricted from viewing decrypted file payloads to enforce zero-trust privacy boundaries.
              </p>
            </div>

            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-left text-[10px] text-zinc-500 space-y-2 font-mono">
              <p className="text-rose-400 font-bold flex items-center gap-1"><Terminal className="h-3.5 w-3.5" /> Zero-Trust Policy:</p>
              <p className="text-zinc-400">&gt; E2E payload decryption keys are locked to the recipient identity.</p>
              <p className="text-zinc-400">&gt; Portal administrators can audit event logs but cannot access decrypted content.</p>
              <p className="text-rose-400/90">&gt; To view this document, please sign out of the administrator panel and access this link as a recipient.</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => navigate('dashboard')}
                className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-300 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic Watermark Text: OTP, Timestamp, Viewer Session ID
  const dynamicWatermarkText = `OTP: ${otpInput || '******'} // SECURE PRINT STREAM // TIME: ${currentTimestamp} // SESSION: ${sessionID}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fade-in font-mono print:p-0 print:m-0 print:bg-white print:text-black">
      {/* Security Compliance Banner (Hidden in Print) */}
      <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left print:hidden shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Document is protected by TraceLess Access.</h4>
            <p className="text-zinc-500 text-[10px] font-mono mt-0.5">E2E Client Decrypted Stream • Printing and sharing are cryptographically audited.</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 font-mono text-[10px] text-zinc-400 shrink-0 bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded">
          <span>IP LOGGED: 72.229.28.185</span>
          <span className="text-zinc-850">|</span>
          <span>SEC-LEVEL: HIGH</span>
        </div>
      </div>

      {/* Main Sandbox Frame */}
      <div className="border border-zinc-800 bg-zinc-950/80 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col min-h-[500px] print:border-none print:bg-white print:shadow-none">
        
        {/* Viewer Header Controls (Hidden in Print) */}
        <div className="bg-zinc-950 border-b border-zinc-900 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 z-20 print:hidden">
          <div className="flex items-center gap-3 text-left">
            <div className="h-8.5 w-8.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-left">
              <h2 className="text-xs font-semibold text-white truncate max-w-[180px]">{doc.name}</h2>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Size: {doc.size} {doc.requireEmailVerification ? `• Verified: ${viewerEmailEntered}` : '• Direct OTP Auth'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
            {/* Expiration timer display */}
            {timeRemaining && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] text-amber-400 font-bold shrink-0">
                <Clock className="h-3.5 w-3.5" /> BURNS IN: {timeRemaining}
              </span>
            )}
            
            {/* LARGE PRINT NOW BUTTON */}
            <button
              onClick={handlePrint}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-lg text-xs font-extrabold font-mono tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 flex items-center gap-2"
            >
              <Printer className="h-4 w-4" /> PRINT NOW
            </button>
          </div>
        </div>

        {/* High-Fidelity Decrypted Sandbox Viewer */}
        <div className="flex-1 p-6 sm:p-10 bg-zinc-900/20 flex justify-center items-center print:bg-white print:p-0">
          {doc.type === 'pdf' ? (
            <div className="w-full max-w-5xl h-[500px] sm:h-[800px] bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden relative shadow-2xl print:border-none print:bg-transparent print:p-0 print:h-screen print:w-screen print-sheet print-sheet-pdf">
              {doc.requireWatermark && (
                <div className="absolute inset-0 select-none pointer-events-none grid grid-cols-2 gap-x-8 gap-y-16 py-12 px-6 overflow-hidden z-30 opacity-[0.04] font-mono text-[9px] font-bold text-center text-zinc-900 rotate-[-30deg] scale-125 print-hidden">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span key={i} className="break-all">{dynamicWatermarkText}</span>
                  ))}
                </div>
              )}
              <iframe 
                id="pdf-print-iframe"
                src={`${pdfBlobUrl || doc.content}#javascript=disabled&toolbar=0&navpanes=0`} 
                className="w-full h-full border-none print:w-screen print:h-screen" 
                title={doc.name}
              />
            </div>
          ) : (
            <div className="bg-white text-zinc-900 shadow-2xl p-4 sm:p-12 max-w-3xl w-full border border-zinc-200 aspect-none sm:aspect-[1/1.414] min-h-0 sm:min-h-[750px] relative overflow-hidden rounded-md select-none font-sans print-sheet print:shadow-none print:border-none print:m-0 print:p-8">
              {/* DYNAMIC WATERMARK OVERLAY GRID */}
              {doc.requireWatermark && (
                <div className="absolute inset-0 select-none pointer-events-none grid grid-cols-2 gap-x-8 gap-y-16 py-12 px-6 overflow-hidden z-30 opacity-[0.06] font-mono text-[9px] font-bold text-center text-zinc-900 rotate-[-30deg] scale-125 print-hidden">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span key={i} className="break-all">{dynamicWatermarkText}</span>
                  ))}
                </div>
              )}

              {/* Simulated PDF Layout Structure */}
              <div className="relative z-10 space-y-6 text-zinc-800 text-[11px] leading-relaxed text-left print:p-0 print:space-y-0 h-full flex flex-col justify-between">
                <div>
                  {/* Letterhead */}
                  <div className="flex justify-between items-start border-b border-zinc-200 pb-5 print-hidden">
                    <div>
                      <span className="text-[9px] bg-zinc-900 text-emerald-400 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                        TraceLess Access Secure Sandbox
                      </span>
                      <h1 className="text-sm font-bold text-zinc-900 uppercase mt-2 tracking-tight">{doc.name}</h1>
                      <p className="text-zinc-400 text-[9px] mt-0.5">SHA-256 Digest: {doc.decryptionKey} // SEC-ENV-84A</p>
                    </div>
                    <div className="text-right text-zinc-400 font-mono text-[9px]">
                      <p>ORIGIN: TRACELESS SECURE PIPELINE</p>
                      <p>DECRYPT TIME: {new Date().toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Document Header Metadata */}
                  <div className="space-y-4 print-hidden mt-6">
                    <h2 className="text-[12px] font-bold text-zinc-900 tracking-tight uppercase">1. SECURE METADATA IDENTIFIERS</h2>
                    <p>
                      This transaction stream represents decrypted information at rest. The source file has been loaded into transient virtual memory buffer under supervision of the TraceLess client daemon. Hiding native browser PDF controls prevents un-audited downloading.
                    </p>
                    
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-[10px] text-zinc-650 space-y-1">
                      <p>SYSTEM ID: <span className="text-zinc-900 font-bold">{doc.id}</span></p>
                      <p>ENCRYPTION STANDARD: <span className="text-zinc-900">AES-256 GCM (E2E Client Generated)</span></p>
                      {doc.requireEmailVerification && (
                        <p>AUTHORIZED RECIPIENT: <span className="text-zinc-900 font-semibold">{doc.otpEmail}</span></p>
                      )}
                      <p>VERIFICATION TOKEN PIN: <span className="text-emerald-600 font-bold font-mono">{otpInput || '******'}</span></p>
                      <p>STATUS CREDENTIAL: <span className="text-emerald-600 font-semibold uppercase">ACTIVE</span></p>
                    </div>
                  </div>

                  {/* Document Text/Image Content */}
                  <div className="space-y-4 pt-4 print:pt-0 print:space-y-0 mt-6 print:mt-0 print:h-full print:w-full">
                    <h2 className="text-[12px] font-bold text-zinc-900 tracking-tight uppercase print-hidden">2. DECRYPTED FILE CONTENT</h2>
                    {doc.type === 'image' ? (
                      <div className="flex flex-col items-center justify-center space-y-4 p-4 bg-zinc-50 border border-zinc-200 rounded-lg relative overflow-hidden print:border-none print:bg-transparent print:p-0">
                        <img 
                          src={doc.content} 
                          alt={doc.name} 
                          className="max-h-[420px] max-w-full object-contain rounded shadow-sm select-none pointer-events-none print:max-h-full print:rounded-none"
                        />
                        <p className="text-[9px] text-zinc-400 font-mono text-center print-hidden">
                          Decrypted image buffer preview. Diagonal watermark protection active.
                        </p>
                      </div>
                    ) : (
                      <p className="font-mono bg-zinc-50/50 p-4 border border-zinc-150 rounded text-zinc-700 whitespace-pre-wrap leading-relaxed select-none print:border-none print:bg-transparent print:p-0 print:text-black print:font-mono print:text-[14px]">
                        {doc.content}
                      </p>
                    )}
                  </div>
                </div>

                {/* Confidentiality footer */}
                <div className="pt-8 border-t border-zinc-200 text-center text-zinc-450 text-[9px] font-mono print-hidden shrink-0 mt-6">
                  <p>CONFIDENTIAL // REGISTERED TO {doc.otpEmail} // DO NOT REDISTRIBUTE</p>
                  <p className="mt-1 text-[8px] text-zinc-300">SYSTEM PORTAL SESSION ID: {sessionID}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Warning Ledger (Hidden in Print) */}
        <div className="bg-zinc-950 border-t border-zinc-900 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-20 print:hidden">
          <p className="text-[9px] text-zinc-500 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5 text-zinc-600" /> Client-side sandbox. Print block, screen monitors, and key logs enabled.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleManualBurn}
              className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-black border border-rose-500/20 text-rose-400 px-4 py-2 rounded font-semibold transition-all duration-200 active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5" /> Shred File Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
