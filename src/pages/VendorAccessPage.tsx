import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { getShareUrl } from '../lib/api';
import { 
  Users, Key, Calendar, Eye, 
  ExternalLink, Copy, Ban, ShieldAlert, X
} from 'lucide-react';

export const VendorAccessPage: React.FC = () => {
  const { documents, activityLogs, revokeDocument, navigate } = useSimulation();

  // Navigation / panel states
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const selectedDoc = documents.find(doc => doc.id === selectedDocId);
  const selectedDocLogs = activityLogs.filter(log => log.documentId === selectedDocId);

  // Filter logic
  const filteredDocs = documents.filter(doc => {
    if (filterStatus === 'all') return true;
    return doc.status === filterStatus;
  });

  const handleCopyLink = (id: string) => {
    const url = getShareUrl(id);
    navigator.clipboard.writeText(url);
    alert('Secure link copied to clipboard!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-400" /> Vendor Link Controller
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Manage active tokens and audit access history for external vendors.</p>
        </div>
        
        {/* Status Filter Tabs */}
        <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-1 font-mono text-xs">
          {['all', 'active', 'burned', 'expired', 'revoked'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded transition-all capitalize ${
                filterStatus === status
                  ? 'bg-zinc-900 text-white font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Links Table (Left) */}
        <div className="lg:col-span-12 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/40">
          <table className="min-w-full divide-y divide-zinc-900 font-mono text-xs text-left">
            <thead className="bg-zinc-950/80 text-zinc-500 text-[10px] uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4">Document / Code Signature</th>
                <th scope="col" className="px-6 py-4">Target Vendor</th>
                <th scope="col" className="px-6 py-4 text-center">Status</th>
                <th scope="col" className="px-6 py-4">Views Log</th>
                <th scope="col" className="px-6 py-4">Created Date</th>
                <th scope="col" className="px-6 py-4 text-right">Audits / Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60 bg-transparent text-zinc-300">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-600">
                    No documents found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  let statusBadge = 'bg-zinc-900 text-zinc-400 border-zinc-800';
                  if (doc.status === 'active') statusBadge = 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40';
                  if (doc.status === 'expired') statusBadge = 'bg-amber-950/40 text-amber-400 border-amber-900/40';
                  if (doc.status === 'burned') statusBadge = 'bg-rose-950/40 text-rose-400 border-rose-900/40';
                  if (doc.status === 'revoked') statusBadge = 'bg-rose-900/20 text-rose-500 border-rose-900/20';

                  // Views progression calculation
                  const progressPercentage = (doc.viewsCount / doc.maxViews) * 100;

                  return (
                    <tr 
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)} 
                      className={`hover:bg-zinc-900/40 cursor-pointer transition-colors ${
                        selectedDocId === doc.id ? 'bg-zinc-900/70 border-l-2 border-l-emerald-500' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-zinc-100 truncate max-w-[200px]">{doc.name}</span>
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                            <Key className="h-3 w-3 text-emerald-500/80" /> {doc.decryptionKey}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle select-all">
                        {doc.requireEmailVerification ? (
                          <span className="text-zinc-400">{doc.otpEmail}</span>
                        ) : (
                          <span className="text-zinc-600 italic">OTP Only (Standard)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${statusBadge}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex flex-col gap-1.5 max-w-[120px]">
                          <span className="text-zinc-400">{doc.viewsCount} of {doc.maxViews} views</span>
                          <div className="h-1.5 w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                doc.status === 'burned' 
                                  ? 'bg-rose-500' 
                                  : doc.viewsCount >= doc.maxViews - 1 
                                    ? 'bg-amber-500' 
                                    : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle text-zinc-500 flex items-center gap-1 mt-2.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleCopyLink(doc.id)}
                            className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                            title="Copy link"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          
                          {doc.status === 'active' ? (
                            <>
                              <button
                                onClick={() => navigate('viewer', doc.id)}
                                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                                title="Open simulated recipient portal"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => revokeDocument(doc.id)}
                                className="p-1.5 rounded bg-rose-950/30 hover:bg-rose-500 border border-rose-900/30 text-rose-400 hover:text-black transition-all"
                                title="Revoke access instantly"
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              disabled
                              className="p-1.5 rounded bg-zinc-900/30 border border-zinc-900/50 text-zinc-700 cursor-not-allowed"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over detailed audit panel */}
      {selectedDocId && selectedDoc && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col justify-between animate-slide-in-right">
          {/* Panel Header */}
          <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
            <div className="font-mono">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="h-4.5 w-4.5 text-emerald-400" /> Token Audit Inspect
              </h2>
              <p className="text-[10px] text-zinc-500 mt-1">{selectedDoc.id}</p>
            </div>
            <button
              onClick={() => setSelectedDocId(null)}
              className="text-zinc-400 hover:text-zinc-200 transition-colors bg-zinc-900 p-1.5 rounded border border-zinc-850"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Panel Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-[11px]">
            {/* File Parameters */}
            <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
              <h4 className="text-xs text-zinc-300 font-bold uppercase tracking-wider">Sharing Constraints</h4>
              <div className="space-y-2 text-zinc-400">
                <p>NAME: <span className="text-zinc-200 font-semibold break-all">{selectedDoc.name}</span></p>
                <p>SIZE: <span className="text-zinc-200">{selectedDoc.size}</span></p>
                <p>CONFIDENTIALITY: <span className={selectedDoc.requireEmailVerification ? 'text-amber-400 font-bold' : 'text-zinc-200'}>
                  {selectedDoc.requireEmailVerification ? 'HIGH (Email + OTP)' : 'STANDARD (OTP Only)'}
                </span></p>
                {selectedDoc.requireEmailVerification && (
                  <p>VERIFICATION EMAIL: <span className="text-emerald-400 font-semibold">{selectedDoc.otpEmail}</span></p>
                )}
                <p>VIEWS ALLOWED: <span className="text-zinc-200">{selectedDoc.viewsCount} of {selectedDoc.maxViews}</span></p>
                <p>EXPIRATION TERM: <span className="text-zinc-200">
                  {selectedDoc.expiresAt ? new Date(selectedDoc.expiresAt).toLocaleString() : 'Manual Burn Only'}
                </span></p>
                <p>EXFILTRATION SHIELD: <span className="text-zinc-200">
                  {selectedDoc.requireWatermark ? 'ENABLED (DYNAMIC WATERMARK)' : 'DISABLED'}
                </span></p>
              </div>
            </div>

            {/* Access Logs */}
            <div className="space-y-3">
              <h4 className="text-xs text-zinc-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-cyan-400" /> Event Ledger ({selectedDocLogs.length})
              </h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {selectedDocLogs.length === 0 ? (
                  <p className="text-zinc-600 italic">No access logs registered for this path.</p>
                ) : (
                  selectedDocLogs.map((log) => {
                    let actionColor = 'text-zinc-400';
                    if (log.action === 'UPLOADED') actionColor = 'text-emerald-400';
                    if (log.action === 'OTP_VERIFIED') actionColor = 'text-cyan-400';
                    if (log.action === 'BURNED') actionColor = 'text-rose-400';
                    if (log.action === 'ATTACK_PREVENTED') actionColor = 'text-rose-500 font-bold';

                    return (
                      <div key={log.id} className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg">
                        <div className="flex justify-between items-center text-[10px] pb-1 border-b border-zinc-900/60">
                          <span className={`font-bold ${actionColor}`}>{log.action}</span>
                          <span className="text-zinc-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-zinc-300 mt-2 leading-relaxed">{log.details}</p>
                        <div className="flex justify-between items-center text-[9px] text-zinc-500 mt-2">
                          <span>IP: {log.ipAddress}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Panel Footer */}
          <div className="p-6 border-t border-zinc-900 bg-zinc-950/80 flex gap-2">
            <button
              onClick={() => { setSelectedDocId(null); navigate('viewer', selectedDoc.id); }}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 rounded-lg text-xs font-semibold font-mono text-center transition-all duration-200"
            >
              Simulate Recipient Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
