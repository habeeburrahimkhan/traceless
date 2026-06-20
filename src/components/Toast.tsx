import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { AlertCircle, CheckCircle, Info, XCircle, Key, Copy, Check } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useSimulation();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyOTP = (code: string, toastId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(toastId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 sm:px-0">
      {toasts.map(toast => {
        let Icon = Info;
        let colorClasses = 'border-zinc-800 bg-zinc-950/90 text-zinc-300';
        let glowClass = '';

        switch (toast.type) {
          case 'success':
            Icon = CheckCircle;
            colorClasses = 'border-emerald-900/50 bg-emerald-950/20 text-emerald-300';
            glowClass = 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]';
            break;
          case 'warning':
            Icon = AlertCircle;
            colorClasses = 'border-amber-900/50 bg-amber-950/20 text-amber-300';
            glowClass = 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]';
            break;
          case 'error':
            Icon = XCircle;
            colorClasses = 'border-rose-900/50 bg-rose-950/20 text-rose-300';
            glowClass = 'shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]';
            break;
          default:
            Icon = Info;
            colorClasses = 'border-zinc-800 bg-zinc-950/85 text-zinc-300';
            break;
        }

        return (
          <div
            key={toast.id}
            className={`flex flex-col p-4 rounded-xl border backdrop-blur-md transition-all duration-300 animate-slide-in-right ${colorClasses} ${glowClass}`}
            role="alert"
          >
            <div className="flex items-start gap-3">
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm font-medium">
                {toast.message}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
              >
                <XCircle className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Special simulation helper: visual email OTP box */}
            {toast.otpCode && (
              <div className="mt-3 bg-black/40 border border-emerald-900/30 rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                    <Key className="h-3.5 w-3.5" /> Simulation Sandbox Mail
                  </span>
                  <span>Recipient Mailbox</span>
                </div>
                <div className="flex items-center justify-between gap-4 mt-1 bg-zinc-900/60 p-2 rounded border border-zinc-800">
                  <div className="font-mono text-lg font-bold tracking-widest text-zinc-100">
                    {toast.otpCode}
                  </div>
                  <button
                    onClick={() => handleCopyOTP(toast.otpCode!, toast.id)}
                    className="flex items-center gap-1 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2 py-1.5 rounded transition-all active:scale-95"
                  >
                    {copiedId === toast.id ? (
                      <>
                        <Check className="h-3 w-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy OTP
                      </>
                    )}
                  </button>
                </div>
                <div className="text-[10px] text-zinc-500">
                  Click 'Copy OTP' and paste it into the Secure Viewer code prompt.
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
