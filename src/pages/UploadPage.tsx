import React, { useState, useRef } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { getShareUrl } from '../lib/api';
import { 
  UploadCloud, Mail, Eye, ShieldAlert, Key, 
  Lock, CheckCircle, FileText, ArrowRight, Settings, RefreshCw, X, File, LockKeyhole,
  ChevronDown
} from 'lucide-react';



export const UploadPage: React.FC = () => {
  const { addDocument, navigate } = useSimulation();

  // Form states
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [targetEmail, setTargetEmail] = useState<string>('partner@external-audit.com');
  const [maxViews, setMaxViews] = useState<number>(5); // default standard 5 views
  const [expiryMinutes, setExpiryMinutes] = useState<number>(30); // default standard 30 minutes
  const [requireWatermark, setRequireWatermark] = useState<boolean>(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState<boolean>(false);

  // Accordion state
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Simulation status states
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [generatedDoc, setGeneratedDoc] = useState<any | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCustomFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setCustomFile(file);
    }
  };

  const handleRemoveFile = () => {
    setCustomFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requireEmailVerification && !targetEmail) {
      alert('Error: Please enter a recipient email.');
      return;
    }
    if (!customFile) {
      alert('Error: Please upload a PDF, image, document, or text file.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      setUploadProgress(Math.min(progress, 90));
    }, 50);

    const processDocument = async (fileContent: string, fileType: string) => {
      try {
        let expiresAt: string | null = null;
        if (expiryMinutes > 0) {
          expiresAt = new Date(Date.now() + expiryMinutes * 60000).toISOString();
        }

        const name = customFile.name;
        const size = `${(customFile.size / 1024).toFixed(1)} KB`;

        const newDoc = await addDocument({
          name,
          size,
          type: fileType,
          otpEmail: requireEmailVerification ? targetEmail : '',
          maxViews,
          expiresAt,
          requireWatermark,
          content: fileContent,
          requireEmailVerification,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);
        setGeneratedDoc(newDoc);
      } catch (error) {
        clearInterval(progressInterval);
        alert(error instanceof Error ? error.message : 'Upload failed');
      } finally {
        setIsUploading(false);
      }
    };

    const reader = new FileReader();
    const isImage = customFile.type.startsWith('image/');
    const isText = customFile.type === 'text/plain' || customFile.name.endsWith('.txt') || customFile.name.endsWith('.json') || customFile.name.endsWith('.ts');
    const isPdf = customFile.type === 'application/pdf' || customFile.name.endsWith('.pdf');

    reader.onload = () => {
      const result = reader.result as string;
      void processDocument(result, isImage ? 'image' : isPdf ? 'pdf' : isText ? 'text' : 'pdf');
    };

    reader.onerror = () => {
      clearInterval(progressInterval);
      setIsUploading(false);
      alert('Failed to read file');
    };

    if (isImage || isPdf) {
      reader.readAsDataURL(customFile);
    } else {
      reader.readAsText(customFile);
    }
  };

  const handleCopyLink = () => {
    if (!generatedDoc) return;
    const link = getShareUrl(generatedDoc.id);
    navigator.clipboard.writeText(link);
    alert('Sharing link copied!');
  };

  const handleCopyOTP = () => {
    if (!generatedDoc) return;
    navigator.clipboard.writeText(generatedDoc.otpCode);
    alert('OTP code copied!');
  };

  const handleResetForm = () => {
    setGeneratedDoc(null);
    setCustomFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-center">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2 justify-center">
          <UploadCloud className="h-6 w-6 text-emerald-400" /> Secure Zero-Trust Uploader
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Encrypt documents client-side and generate decryption access OTPs.</p>
      </div>

      {!generatedDoc ? (
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          {/* File select & drag zone */}
          <div className="space-y-3">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
              Upload PDF, Picture, or Document
            </label>
            
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".pdf,image/*,.docx,.txt,.json,.ts" 
              onChange={handleFileChange}
              className="hidden" 
              id="pdf-upload-input"
            />

            {customFile ? (
              <div className="p-5 rounded-2xl border border-emerald-500/30 bg-zinc-900/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center justify-center text-emerald-400">
                    <File className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-semibold text-zinc-200 truncate max-w-[200px] sm:max-w-xs">{customFile.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1 font-semibold">
                      Size: {(customFile.size / 1024).toFixed(1)} KB • {customFile.type || 'Document'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="p-4 sm:p-8 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-emerald-500/30 bg-zinc-950/40 hover:bg-zinc-950/80 transition-all duration-300 text-center cursor-pointer space-y-3 group"
              >
                <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-250">
                    Drag and drop file here, or <span className="text-emerald-400 hover:underline">browse files</span>
                  </p>
                  <p className="text-[10px] text-zinc-655 font-mono">
                    PDF, PNG, JPG, WebP, TXT, JSON, DOCX (Max 20MB)
                  </p>
                </div>
              </div>
            )}
          </div>



          {/* Advanced accordion */}
          <div className="border border-zinc-850 bg-zinc-950/20 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-4 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors bg-zinc-950/60"
            >
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-zinc-500" /> Advanced Security Options
              </span>
              <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            {showAdvanced && (
              <div className="p-4 border-t border-zinc-900 bg-zinc-950/40 space-y-5 animate-slide-down">
                {/* Email Verification Checkbox Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-zinc-850">
                  <div className="text-left pr-4">
                    <p className="text-xs font-semibold text-zinc-300">Highly Confidential Mode</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Requires recipient to enter verified email + OTP</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={requireEmailVerification}
                    onChange={(e) => setRequireEmailVerification(e.target.checked)}
                    disabled={isUploading}
                    className="h-4.5 w-4.5 rounded accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Optional Email Input */}
                {requireEmailVerification && (
                  <div className="space-y-2 text-left animate-fade-in">
                    <label className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-zinc-500" /> Recipient Work Email
                    </label>
                    <input
                      type="email"
                      required={requireEmailVerification}
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      placeholder="partner@external-audit.com"
                      disabled={isUploading}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                )}

                {/* Limit views rule */}
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-zinc-500" /> Maximum View Limit
                  </label>
                  <select
                    value={maxViews}
                    onChange={(e) => setMaxViews(Number(e.target.value))}
                    disabled={isUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none"
                  >
                    <option value={1}>1 View (Single opening, burns instantly)</option>
                    <option value={2}>2 Views</option>
                    <option value={3}>3 Views</option>
                    <option value={5}>5 Views</option>
                    <option value={10}>10 Views</option>
                  </select>
                </div>

                {/* Lifespan Timer */}
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-zinc-500" /> Lifespan Expire Timer
                  </label>
                  <select
                    value={expiryMinutes}
                    onChange={(e) => setExpiryMinutes(Number(e.target.value))}
                    disabled={isUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none"
                  >
                    <option value={1}>1 Minute (Fast burn test)</option>
                    <option value={5}>5 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>1 Hour</option>
                    <option value={1440}>24 Hours</option>
                    <option value={0}>Unlimited (Views limit only)</option>
                  </select>
                </div>

                {/* Watermark toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-zinc-850">
                  <div className="text-left pr-4">
                    <p className="text-xs font-semibold text-zinc-300">Exfiltration Mitigation</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Locks printing & injects moving watermark</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={requireWatermark}
                    onChange={(e) => setRequireWatermark(e.target.checked)}
                    disabled={isUploading}
                    className="h-4.5 w-4.5 rounded accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cryptographic telemetry simulation panel */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 border-b border-zinc-900 pb-2">
              <Lock className="h-4 w-4 text-emerald-400" /> Local Encryptor Simulation
            </div>
            <div className="space-y-1.5 font-mono text-[10px] text-zinc-500">
              <p>CIPHER: <span className="text-zinc-300">AES-256-GCM</span></p>
              <p>KEY DERIVATION: <span className="text-zinc-300">PBKDF2 (SHA-256, 10,000 iterations)</span></p>
              <p>TARGET ENTROPY: <span className="text-emerald-500 font-bold">256-bit client-bound</span></p>
            </div>

            {isUploading && (
              <div className="space-y-2 mt-4 pt-2 border-t border-zinc-900 animate-fade-in">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span className="flex items-center gap-1.5"><RefreshCw className="h-3 w-3 animate-spin text-emerald-400" /> Compiling Cryptographic Envelope...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 rounded-lg text-xs font-semibold font-mono tracking-wider uppercase transition-all duration-200 disabled:opacity-50"
          >
            {isUploading ? 'Securing Package...' : 'Generate Decryption OTP'}
          </button>
        </form>
      ) : (
        /* Success screen showing the link */
        <div className="max-w-xl mx-auto border border-emerald-500/30 bg-emerald-950/5 rounded-2xl p-6 sm:p-8 space-y-6 text-center shadow-[0_0_40px_-10px_rgba(16,185,129,0.1)] font-mono text-xs">
          <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto font-mono">
            <CheckCircle className="h-7 w-7 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white font-mono">Zero-Trust Envelope Generated</h2>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto">
              Your document has been encrypted client-side. Keep this OTP code ready to tell the print shop receiver.
            </p>
          </div>

          {/* Generated OTP Success Card */}
          <div className="bg-zinc-950 border border-emerald-500/40 rounded-xl p-5 text-center space-y-3 shadow-[0_0_15px_rgba(16,185,129,0.08)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-15">
              <LockKeyhole className="h-16 w-16 text-emerald-400" />
            </div>

            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-emerald-400" /> Decryption OTP Key
            </p>
            <div className="flex items-center justify-center gap-4 bg-zinc-900/80 p-3 rounded-lg border border-zinc-800">
              <div className="text-3xl font-black font-mono tracking-widest text-emerald-400 select-all">
                {generatedDoc.otpCode}
              </div>
              <button
                onClick={handleCopyOTP}
                className="bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1.5 rounded border border-zinc-800 font-mono transition-colors active:scale-95 text-[10px]"
              >
                Copy Key
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 leading-normal max-w-sm mx-auto">
              The recipient print shop must enter this 6-digit code to decrypt and view the document stream.
            </p>
          </div>

          {/* Code telemetry banner */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-left font-mono text-[10px] text-zinc-400 space-y-1.5">
            <p className="flex items-center gap-1.5 text-zinc-300 font-semibold border-b border-zinc-900 pb-1.5 mb-1.5 uppercase tracking-wider text-[9px]">
              <FileText className="h-3.5 w-3.5 text-emerald-400" /> Encryptor Metadata Receipt
            </p>
            <p>FILE NAME: <span className="text-zinc-100">{generatedDoc.name}</span></p>
            <p>UPLOAD TIME: <span className="text-zinc-300">{new Date(generatedDoc.uploadedAt).toLocaleString()}</span></p>
            {generatedDoc.requireEmailVerification && (
              <p>RECIPIENT: <span className="text-emerald-400">{generatedDoc.otpEmail}</span></p>
            )}
            <p>DOCUMENT ID: <span className="text-zinc-300 font-bold">{generatedDoc.id}</span></p>
            <p>CIPHER KEY: <span className="text-zinc-500">{generatedDoc.decryptionKey}</span></p>
            <p>STATUS: <span className="text-emerald-400 font-bold uppercase">ACTIVE</span></p>
            <p>DESTRUCT: <span className="text-rose-400">{generatedDoc.maxViews} Views / {expiryMinutes > 0 ? `${expiryMinutes} Mins` : 'Manual'}</span></p>
          </div>

          {/* Virtual Clipboard Link */}
          {generatedDoc.requireEmailVerification && (
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Access Token URL</label>
              <div className="flex bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 items-center justify-between gap-4">
                <span className="font-mono text-xs text-zinc-400 truncate select-all">
                  {getShareUrl(generatedDoc.id)}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded border border-zinc-850 font-mono transition-colors active:scale-95 shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Action portals */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-zinc-900/60 justify-center">
            {generatedDoc.requireEmailVerification ? (
              <button
                onClick={() => navigate('viewer', generatedDoc.id)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 rounded-lg text-xs font-semibold font-mono transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.25)] animate-pulse"
              >
                Go to Secure Viewer <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="flex-1 bg-zinc-900/40 border border-zinc-850 p-3 rounded-lg text-zinc-400 text-[10px] font-mono flex items-center justify-center text-center">
                OTP Key Ready • Give this 6-digit PIN code to the Print Shop recipient.
              </div>
            )}
            <button
              onClick={handleResetForm}
              className="bg-zinc-950 border border-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 px-6 py-2.5 rounded-lg text-xs font-semibold font-mono transition-all duration-200"
            >
              Share Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
