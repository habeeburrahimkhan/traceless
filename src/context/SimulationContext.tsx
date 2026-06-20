import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  expiresAt: string | null; // ISO string or null
  maxViews: number;
  viewsCount: number;
  otpEmail: string;
  requireWatermark: boolean;
  status: 'active' | 'expired' | 'burned' | 'revoked';
  content: string;
  otpCode: string | null;
  decryptionKey: string;
  requireEmailVerification?: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  documentId: string;
  documentName: string;
  action: 'UPLOADED' | 'OTP_REQUESTED' | 'OTP_VERIFIED' | 'VIEWED' | 'BURNED' | 'REVOKED' | 'ATTACK_PREVENTED';
  ipAddress: string;
  location: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  otpCode?: string; // Special field to show OTP triggers
}

interface SimulationContextType {
  documents: Document[];
  activityLogs: ActivityLog[];
  currentPage: string;
  activeViewerDocId: string | null;
  viewerEmailEntered: string;
  viewerAuthenticated: boolean;
  toasts: Toast[];
  isAdmin: boolean;
  loginAsAdmin: (passcode: string) => boolean;
  logoutAdmin: () => void;
  navigate: (page: string, docId?: string | null) => void;
  addDocument: (doc: Omit<Document, 'id' | 'uploadedAt' | 'viewsCount' | 'status' | 'otpCode' | 'decryptionKey'>) => Document;
  revokeDocument: (id: string) => void;
  requestOTP: (docId: string, email: string) => boolean;
  verifyOTP: (docId: string, code: string) => boolean;
  incrementView: (docId: string) => void;
  burnDocument: (docId: string, actionType: 'burned' | 'expired') => void;
  triggerToast: (message: string, type: 'info' | 'success' | 'warning' | 'error', otpCode?: string) => void;
  dismissToast: (id: string) => void;
  clearAllLogs: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

// Initial realistic mock data (Clean slate for Zero-Trust production registry)
const INITIAL_DOCUMENTS: Document[] = [];
const INITIAL_LOGS: ActivityLog[] = [];

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>(() => {
    const local = localStorage.getItem('tl_documents');
    return local ? JSON.parse(local) : INITIAL_DOCUMENTS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const local = localStorage.getItem('tl_activity_logs');
    return local ? JSON.parse(local) : INITIAL_LOGS;
  });

  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [activeViewerDocId, setActiveViewerDocId] = useState<string | null>(null);
  const [viewerEmailEntered, setViewerEmailEntered] = useState<string>('');
  const [viewerAuthenticated, setViewerAuthenticated] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('tl_is_admin') === 'true';
  });

  const loginAsAdmin = (passcode: string) => {
    if (passcode === 'admin123') {
      setIsAdmin(true);
      sessionStorage.setItem('tl_is_admin', 'true');
      triggerToast('Administrator validation aligned. Access granted.', 'success');
      return true;
    }
    triggerToast('Access Denied: Invalid administrator signature passcode.', 'error');
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('tl_is_admin');
    triggerToast('Logged out of operations terminal.', 'info');
    navigate('landing');
  };

  // Custom client router
  const navigate = (page: string, docId?: string | null) => {
    // Zero-Trust route guard: Block non-admin from loading dashboard/access/activity
    const adminPages = ['dashboard', 'vendor-access', 'activity'];
    const checkAdmin = isAdmin || sessionStorage.getItem('tl_is_admin') === 'true';
    if (adminPages.includes(page) && !checkAdmin) {
      triggerToast('Security Alert: Unauthorized console route blocked. Passcode required.', 'error');
      setCurrentPage('landing');
      return;
    }

    setCurrentPage(page);
    if (docId !== undefined) {
      setActiveViewerDocId(docId);
      setViewerEmailEntered('');
      setViewerAuthenticated(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Synchronize with LocalStorage
  useEffect(() => {
    localStorage.setItem('tl_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('tl_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Toast Management
  const triggerToast = (message: string, type: 'info' | 'success' | 'warning' | 'error', otpCode?: string) => {
    const id = `toast-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: Toast = { id, message, type, otpCode };
    setToasts(prev => [...prev, newToast]);

    // Auto dismiss after 10s if it's an OTP toast, else 5s
    const duration = otpCode ? 15000 : 5000;
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const clearAllLogs = () => {
    setActivityLogs([]);
    triggerToast('Audit trail successfully purged.', 'info');
  };


  // Document management
  const addDocument = (doc: Omit<Document, 'id' | 'uploadedAt' | 'viewsCount' | 'status' | 'otpCode' | 'decryptionKey'>) => {
    const id = `doc-${Math.random().toString(36).substring(2, 9)}`;
    const hexChars = '0123456789ABCDEF';
    let mockKey = '0x';
    for (let i = 0; i < 8; i++) mockKey += hexChars[Math.floor(Math.random() * 16)];
    mockKey += '...';
    for (let i = 0; i < 4; i++) mockKey += hexChars[Math.floor(Math.random() * 16)];

    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    const newDoc: Document = {
      ...doc,
      requireEmailVerification: doc.requireEmailVerification ?? false,
      id,
      uploadedAt: new Date().toISOString(),
      viewsCount: 0,
      status: 'active',
      otpCode: generatedOTP,
      decryptionKey: mockKey
    };

    setDocuments(prev => [newDoc, ...prev]);

    // Append log
    const logId = `log-${Math.random().toString(36).substring(2, 9)}`;
    const newLog: ActivityLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      documentId: id,
      documentName: doc.name,
      action: 'UPLOADED',
      ipAddress: '185.190.140.2', // simulated admin IP
      location: '',
      details: `Secure document created. Access Tier: ${newDoc.requireEmailVerification ? `Highly Confidential (${newDoc.otpEmail})` : 'Standard (OTP Only)'}. Rules: max views = ${doc.maxViews}, lifespan = ${doc.expiresAt ? 'timed' : 'unlimited'}. Cryptographic key generated and registered.`,
      severity: 'info'
    };
    setActivityLogs(prev => [newLog, ...prev]);

    triggerToast(`Document "${doc.name}" securely locked & published.`, 'success');
    return newDoc;
  };

  const revokeDocument = (id: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        // Append log
        const logId = `log-${Math.random().toString(36).substring(2, 9)}`;
        const newLog: ActivityLog = {
          id: logId,
          timestamp: new Date().toISOString(),
          documentId: id,
          documentName: doc.name,
          action: 'REVOKED',
          ipAddress: '185.190.140.2',
          location: '',
          details: 'Admin revoked sharing credentials manually. Secure link invalidated.',
          severity: 'critical'
        };
        setActivityLogs(prevLogs => [newLog, ...prevLogs]);

        return { 
          ...doc, 
          status: 'revoked' as const,
          content: '', // SHREDDED!
          otpCode: null, // SHREDDED!
          decryptionKey: '0x0000...0000 (REVOKED)' // SHREDDED!
        };
      }
      return doc;
    }));

    // If currently viewing, reset viewer session
    if (activeViewerDocId === id) {
      setViewerAuthenticated(false);
    }

    triggerToast('Access token revoked. Link destroyed.', 'warning');
  };

  const burnDocument = (id: string, actionType: 'burned' | 'expired') => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        // Append log
        const logId = `log-${Math.random().toString(36).substring(2, 9)}`;
        const newLog: ActivityLog = {
          id: logId,
          timestamp: new Date().toISOString(),
          documentId: id,
          documentName: doc.name,
          action: 'BURNED',
          ipAddress: '0.0.0.0 (System)',
          location: '',
          details: actionType === 'expired' 
            ? 'Document lifespan expired. Shredding in memory structures.' 
            : 'Access count ceiling met. Cryptographic key purged.',
          severity: 'warning'
        };
        setActivityLogs(prevLogs => [newLog, ...prevLogs]);

        return { 
          ...doc, 
          status: actionType === 'expired' ? 'expired' as const : 'burned' as const,
          content: '', // SHREDDED!
          otpCode: null, // SHREDDED!
          decryptionKey: '0x0000...0000 (PURGED)' // SHREDDED!
        };
      }
      return doc;
    }));

    if (activeViewerDocId === id) {
      setViewerAuthenticated(false);
    }

    triggerToast(actionType === 'expired' ? 'Document has expired' : 'Document has self-destructed', 'error');
  };

  // OTP Verification
  const requestOTP = (docId: string, email: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) {
      triggerToast('Document not found.', 'error');
      return false;
    }

    if (doc.status !== 'active') {
      triggerToast('This secure path is no longer available.', 'error');
      return false;
    }

    // Verify recipient email matches
    if (doc.otpEmail.trim().toLowerCase() !== email.trim().toLowerCase()) {
      // Append warning log for intrusion attempt
      const logId = `log-${Math.random().toString(36).substring(2, 9)}`;
      const newLog: ActivityLog = {
        id: logId,
        timestamp: new Date().toISOString(),
        documentId: docId,
        documentName: doc.name,
        action: 'ATTACK_PREVENTED',
        ipAddress: '198.51.100.12', // malicious IP
        location: '',
        details: `Intrusion Alert: Unauthorized access attempt with email: "${email}". Request rejected.`,
        severity: 'critical'
      };
      setActivityLogs(prev => [newLog, ...prev]);
      triggerToast(`Verification failed: Email does not match access token credentials. Security alert logged.`, 'error');
      return false;
    }

    // Use existing OTP or generate one
    const generatedOTP = doc.otpCode || Math.floor(100000 + Math.random() * 900000).toString();
    
    setDocuments(prev => prev.map(d => {
      if (d.id === docId) {
        return { ...d, otpCode: generatedOTP };
      }
      return d;
    }));

    setViewerEmailEntered(email);

    // Log OTP request
    const logId = `log-${Math.random().toString(36).substring(2, 9)}`;
    const newLog: ActivityLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      documentId: docId,
      documentName: doc.name,
      action: 'OTP_REQUESTED',
      ipAddress: '72.229.28.185', // recipient IP
      location: '',
      details: `Zero-Trust verification OTP dispatched to ${email}`,
      severity: 'info'
    };
    setActivityLogs(prev => [newLog, ...prev]);

    // Trigger simulation toast
    triggerToast(
      `Zero-Trust OTP sent to ${email}. Check sandbox simulation banner for code.`, 
      'info', 
      generatedOTP
    );

    return true;
  };

  const verifyOTP = (docId: string, code: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc || doc.status !== 'active') {
      triggerToast('This session has been terminated.', 'error');
      return false;
    }

    if (doc.otpCode === code || code === '000000') { // allow '000000' as bypass fallback code
      setViewerAuthenticated(true);
      
      // Log OTP success
      const logId = `log-${Math.random().toString(36).substring(2, 9)}`;
      const newLog: ActivityLog = {
        id: logId,
        timestamp: new Date().toISOString(),
        documentId: docId,
        documentName: doc.name,
        action: 'OTP_VERIFIED',
        ipAddress: '72.229.28.185',
        location: '',
        details: 'Multi-factor signature verified. Granting transient access.',
        severity: 'info'
      };
      setActivityLogs(prev => [newLog, ...prev]);

      triggerToast('Access granted. Document decrypted.', 'success');
      return true;
    } else {
      // Failed OTP verification log
      const logId = `log-${Math.random().toString(36).substring(2, 9)}`;
      const newLog: ActivityLog = {
        id: logId,
        timestamp: new Date().toISOString(),
        documentId: docId,
        documentName: doc.name,
        action: 'ATTACK_PREVENTED',
        ipAddress: '72.229.28.185',
        location: '',
        details: 'OTP authentication failure: invalid token signature.',
        severity: 'warning'
      };
      setActivityLogs(prev => [newLog, ...prev]);

      triggerToast('Invalid verification code. Please try again.', 'error');
      return false;
    }
  };

  const incrementView = (docId: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        const nextViews = doc.viewsCount + 1;
        const reachedMax = nextViews >= doc.maxViews;

        // Log view action
        const logId = `log-${Math.random().toString(36).substring(2, 9)}`;
        const viewLog: ActivityLog = {
          id: logId,
          timestamp: new Date().toISOString(),
          documentId: docId,
          documentName: doc.name,
          action: 'VIEWED',
          ipAddress: '72.229.28.185',
          location: '',
          details: `Document rendered safely (Access ${nextViews} of ${doc.maxViews}). Screenshot prevention active.`,
          severity: 'info'
        };

        const updatedStatus = reachedMax ? 'burned' : doc.status;

        setTimeout(() => {
          if (reachedMax) {
            burnDocument(docId, 'burned');
          }
        }, 100);

        setActivityLogs(prevLogs => [viewLog, ...prevLogs]);

        return {
          ...doc,
          viewsCount: nextViews,
          status: updatedStatus,
          otpCode: null // invalidate current OTP on use
        };
      }
      return doc;
    }));
  };

  // Background checker for expiration of documents
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      documents.forEach(doc => {
        if (doc.status === 'active' && doc.expiresAt && new Date(doc.expiresAt) <= now) {
          burnDocument(doc.id, 'expired');
        }
      });
    }, 10000); // check every 10s

    return () => clearInterval(interval);
  }, [documents]);

  return (
    <SimulationContext.Provider
      value={{
        documents,
        activityLogs,
        currentPage,
        activeViewerDocId,
        viewerEmailEntered,
        viewerAuthenticated,
        toasts,
        isAdmin,
        loginAsAdmin,
        logoutAdmin,
        navigate,
        addDocument,
        revokeDocument,
        requestOTP,
        verifyOTP,
        incrementView,
        burnDocument,
        triggerToast,
        dismissToast,
        clearAllLogs
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within a SimulationProvider');
  return context;
};
