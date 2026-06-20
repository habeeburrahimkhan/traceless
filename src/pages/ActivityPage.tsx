import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Activity, Terminal, Search, Trash2, Download } from 'lucide-react';

export const ActivityPage: React.FC = () => {
  const { activityLogs, clearAllLogs, triggerToast } = useSimulation();

  // Filter/search states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  // Search & Filter computation
  const filteredLogs = activityLogs.filter((log) => {
    // Search matching
    const searchString = `${log.documentName} ${log.ipAddress} ${log.details} ${log.location}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());

    // Severity matching
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;

    // Action matching
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesSeverity && matchesAction;
  });

  const handleExportCSV = () => {
    if (activityLogs.length === 0) {
      triggerToast('Audit vault is empty. Nothing to export.', 'error');
      return;
    }

    // Simulate compiling CSV file
    triggerToast('Generating signed audit ledger bundle. Please wait...', 'info');
    
    setTimeout(() => {
      const csvHeader = 'ID,Timestamp,Document,Action,IP Address,Location,Details,Severity\n';
      const csvRows = activityLogs.map(log => 
        `"${log.id}","${log.timestamp}","${log.documentName}","${log.action}","${log.ipAddress}","${log.location}","${log.details.replace(/"/g, '""')}","${log.severity}"`
      ).join('\n');
      
      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `traceless_audit_trail_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerToast('Signed CSV audit ledger exported successfully.', 'success');
    }, 1000);
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'warning':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-zinc-400 bg-zinc-900 border-zinc-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-400" /> Security Audit Ledger
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Immutable cryptographic timeline of sharing actions and intrusion mitigations.</p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg font-semibold transition-all active:scale-95"
          >
            <Download className="h-4 w-4" /> Export Ledger
          </button>
          <button
            onClick={clearAllLogs}
            className="flex items-center gap-1.5 border border-rose-950 bg-rose-950/10 text-rose-400 hover:bg-rose-500 hover:text-black px-4 py-2 rounded-lg font-semibold transition-all"
          >
            <Trash2 className="h-4 w-4" /> Purge Logs
          </button>
        </div>
      </div>

      {/* Search and Filters panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-zinc-950/40 p-4 border border-zinc-800 rounded-xl items-center">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by file name, operator IP, details..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-zinc-300 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Severity filter */}
        <div className="md:col-span-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-400 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Action filter */}
        <div className="md:col-span-3">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-400 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Action Types</option>
            <option value="UPLOADED">Uploaded</option>
            <option value="OTP_REQUESTED">OTP Dispatched</option>
            <option value="OTP_VERIFIED">OTP Approved</option>
            <option value="VIEWED">Viewed</option>
            <option value="BURNED">Burned (Shredded)</option>
            <option value="REVOKED">Manually Revoked</option>
            <option value="ATTACK_PREVENTED">Attack Blocked</option>
          </select>
        </div>
      </div>

      {/* Audit ledger listings */}
      <div className="border border-zinc-800 bg-zinc-950/20 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 bg-zinc-950 border-b border-zinc-900 p-4 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
          <div className="col-span-3">Timestamp / Node</div>
          <div className="col-span-2 text-center">Action</div>
          <div className="col-span-5">Audit Details</div>
          <div className="col-span-2 text-right">Severity / IP</div>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-zinc-900/60 max-h-[500px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-zinc-600">
              No audit logs match your search and filter parameters.
            </div>
          ) : (
            filteredLogs.map((log) => {
              let actionBadge = 'bg-zinc-900 text-zinc-400';
              if (log.action === 'UPLOADED') actionBadge = 'bg-emerald-950/40 text-emerald-400';
              if (log.action === 'OTP_REQUESTED') actionBadge = 'bg-cyan-950/30 text-cyan-400';
              if (log.action === 'OTP_VERIFIED') actionBadge = 'bg-cyan-950/60 text-cyan-200 border border-cyan-500/20';
              if (log.action === 'VIEWED') actionBadge = 'bg-zinc-900 text-zinc-200';
              if (log.action === 'BURNED') actionBadge = 'bg-rose-950/40 text-rose-400';
              if (log.action === 'REVOKED') actionBadge = 'bg-rose-900/10 text-rose-400';
              if (log.action === 'ATTACK_PREVENTED') actionBadge = 'bg-rose-500 text-black font-bold border border-rose-500/20 animate-pulse';

              return (
                <div 
                  key={log.id} 
                  className="grid grid-cols-1 sm:grid-cols-12 p-4 gap-4 items-center hover:bg-zinc-900/20 transition-colors"
                >
                  {/* Timestamp */}
                  <div className="sm:col-span-3 text-zinc-500 flex flex-col gap-0.5">
                    <span>{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                      <Terminal className="h-3 w-3" /> trace-sec-ops-daemon
                    </span>
                  </div>

                  {/* Action */}
                  <div className="sm:col-span-2 flex justify-start sm:justify-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${actionBadge}`}>
                      {log.action}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="sm:col-span-5 text-left">
                    <p className="text-zinc-200 font-semibold">{log.documentName}</p>
                    <p className="text-zinc-400 mt-1 leading-relaxed">{log.details}</p>
                  </div>

                  {/* Severity & IP */}
                  <div className="sm:col-span-2 text-left sm:text-right flex flex-col gap-1 sm:items-end">
                    <span className={`inline-block px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getSeverityStyle(log.severity)}`}>
                      {log.severity}
                    </span>
                    <span className="text-zinc-500 text-[10px]">{log.ipAddress}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
