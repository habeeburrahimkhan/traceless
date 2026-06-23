import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../lib/api';
import { decryptFileKeyWithOtp, importKey, decryptData } from '../lib/crypto';

export interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  expiresAt: string | null;
  maxViews: number;
  viewsCount: number;
  otpEmail: string;
  requireWatermark: boolean;
  status: 'active' | 'expired' | 'burned' | 'revoked';
  content: string;
  otpCode?: string | null;
  decryptionKey?: string;
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
  otpCode?: string;
}

interface SimulationContextType {
  documents: Document[];
  activityLogs: ActivityLog[];
  viewerDoc: Document | null;
  currentPage: string;
  activeViewerDocId: string | null;
  viewerEmailEntered: string;
  viewerAuthenticated: boolean;
  toasts: Toast[];
  isAdmin: boolean;
  isLoading: boolean;
  loginAsAdmin: (passcode: string) => boolean;
  logoutAdmin: () => void;
  navigate: (page: string, docId?: string | null) => void;
  refreshData: () => Promise<void>;
  loadViewerDocument: (docId: string) => Promise<Document | null>;
  lookupByOtp: (code: string) => Promise<Document | null>;
  addDocument: (
    doc: Omit<Document, 'id' | 'uploadedAt' | 'viewsCount' | 'status' | 'otpCode' | 'decryptionKey'> & {
      id?: string;
      otpCode?: string;
      decryptionKey?: string;
    }
  ) => Promise<Document>;
  revokeDocument: (id: string) => Promise<void>;
  requestOTP: (docId: string, email: string) => Promise<boolean>;
  verifyOTP: (docId: string, code: string) => Promise<boolean>;
  burnDocument: (docId: string, actionType: 'burned' | 'expired' | 'revoked') => Promise<void>;
  triggerToast: (message: string, type: 'info' | 'success' | 'warning' | 'error', otpCode?: string) => void;
  dismissToast: (id: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  clearAllLogs: () => Promise<void>;
  extendExpiry: (docId: string, minutes: number) => Promise<void>;
  simulateAttack: (docId?: string) => Promise<void>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [viewerDoc, setViewerDoc] = useState<Document | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [activeViewerDocId, setActiveViewerDocId] = useState<string | null>(null);
  const [viewerEmailEntered, setViewerEmailEntered] = useState<string>('');
  const [viewerAuthenticated, setViewerAuthenticated] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => api.getAdminToken().length > 0);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const triggerToast = useCallback(
    (message: string, type: 'info' | 'success' | 'warning' | 'error', otpCode?: string) => {
      const id = `toast-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: Toast = { id, message, type, otpCode };
      setToasts((prev) => [...prev, newToast]);

      const duration = otpCode ? 15000 : 5000;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    if (!api.getAdminToken()) return;

    setIsLoading(true);
    try {
      const data = await api.fetchDashboardData();
      setDocuments(data.documents);
      setActivityLogs(data.activityLogs);
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Failed to load dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [triggerToast]);

  const loginAsAdmin = (passcode: string) => {
    if (passcode === (import.meta.env.VITE_ADMIN_PASSCODE || 'admin123')) {
      api.setAdminToken(passcode);
      setIsAdmin(true);
      triggerToast('Administrator validation aligned. Access granted.', 'success');
      void refreshData();
      return true;
    }
    triggerToast('Access Denied: Invalid administrator signature passcode.', 'error');
    return false;
  };

  const logoutAdmin = () => {
    api.clearAdminToken();
    setIsAdmin(false);
    setDocuments([]);
    setActivityLogs([]);
    triggerToast('Logged out of operations terminal.', 'info');
    setCurrentPage('landing');
  };

  const navigate = (page: string, docId?: string | null) => {
    const adminPages = ['dashboard', 'vendor-access', 'activity'];
    const checkAdmin = isAdmin || api.getAdminToken().length > 0;
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
      setViewerDoc(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadViewerDocument = useCallback(
    async (docId: string) => {
      try {
        const doc = await api.fetchDocumentMetadata(docId);
        setViewerDoc(doc);
        return doc;
      } catch (error) {
        triggerToast(error instanceof Error ? error.message : 'Document not found', 'error');
        setViewerDoc(null);
        return null;
      }
    },
    [triggerToast]
  );

  const lookupByOtp = useCallback(
    async (code: string) => {
      try {
        const doc = await api.lookupDocumentByOtp(code);
        setViewerDoc(doc);
        setActiveViewerDocId(doc.id);
        return doc;
      } catch (error) {
        triggerToast(error instanceof Error ? error.message : 'Invalid OTP key', 'error');
        return null;
      }
    },
    [triggerToast]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const docId = params.get('docId');
    if (page === 'viewer' && docId) {
      setCurrentPage('viewer');
      setActiveViewerDocId(docId);
    }
  }, []);

  useEffect(() => {
    if (activeViewerDocId) {
      void loadViewerDocument(activeViewerDocId);
    } else {
      setViewerDoc(null);
    }
  }, [activeViewerDocId, loadViewerDocument]);

  useEffect(() => {
    if (isAdmin && ['dashboard', 'vendor-access', 'activity', 'upload'].includes(currentPage)) {
      void refreshData();
    }
  }, [isAdmin, currentPage, refreshData]);

  const addDocument = async (
    doc: Omit<Document, 'id' | 'uploadedAt' | 'viewsCount' | 'status' | 'otpCode' | 'decryptionKey'> & {
      id?: string;
      otpCode?: string;
      decryptionKey?: string;
    }
  ) => {
    const uploaded = await api.uploadDocument({
      id: doc.id,
      name: doc.name,
      size: doc.size,
      type: doc.type,
      requireEmailVerification: doc.requireEmailVerification ?? false,
      otpEmail: doc.otpEmail,
      requireWatermark: doc.requireWatermark,
      maxViews: doc.maxViews,
      expiresAt: doc.expiresAt,
      content: doc.content,
      otpCode: doc.otpCode,
      decryptionKey: doc.decryptionKey,
    });

    setDocuments((prev) => [uploaded, ...prev]);
    triggerToast(`Document "${doc.name}" securely locked & published.`, 'success');
    return uploaded;
  };

  const revokeDocument = async (id: string) => {
    try {
      await api.burnDocumentApi(id, 'revoked');
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? {
                ...doc,
                status: 'revoked',
                content: '',
                otpCode: null,
                decryptionKey: '0x0000...0000 (REVOKED)',
              }
            : doc
        )
      );
      if (activeViewerDocId === id) {
        setViewerAuthenticated(false);
        setViewerDoc((prev) => (prev ? { ...prev, status: 'revoked' } : prev));
      }
      triggerToast('Access token revoked. Link destroyed.', 'warning');
      await refreshData();
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Failed to revoke document', 'error');
    }
  };

  const burnDocument = async (docId: string, actionType: 'burned' | 'expired') => {
    try {
      await api.burnDocumentApi(docId, actionType);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === docId
            ? {
                ...doc,
                status: actionType === 'expired' ? 'expired' : 'burned',
                content: '',
                otpCode: null,
                decryptionKey: '0x0000...0000 (PURGED)',
              }
            : doc
        )
      );
      if (activeViewerDocId === docId) {
        setViewerAuthenticated(false);
        setViewerDoc((prev) =>
          prev ? { ...prev, status: actionType === 'expired' ? 'expired' : 'burned', content: '' } : prev
        );
      }
      triggerToast(actionType === 'expired' ? 'Document has expired' : 'Document has self-destructed', 'error');
      await refreshData();
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Failed to burn document', 'error');
    }
  };

  const requestOTP = async (docId: string, email: string) => {
    try {
      const result = await api.requestOtp(docId, email);
      setViewerEmailEntered(email);

      if (result.devOtp) {
        triggerToast(
          `Zero-Trust OTP sent to ${email}. Email delivery unavailable — code shown below.`,
          'info',
          result.devOtp
        );
      } else {
        triggerToast(`Zero-Trust OTP sent to ${email}. Check your inbox.`, 'info');
      }

      await refreshData();
      return true;
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'OTP request failed', 'error');
      await refreshData();
      return false;
    }
  };

  const verifyOTP = async (docId: string, code: string) => {
    try {
      const unlocked = await api.verifyOtp(docId, code);

      try {
        if (unlocked.decryptionKey && unlocked.content && unlocked.id) {
          const rawKeyB64 = await decryptFileKeyWithOtp(unlocked.decryptionKey, code, unlocked.id);
          const aesKey = await importKey(rawKeyB64);
          
          let encryptedData = unlocked.content;
          if (encryptedData.startsWith('data:')) {
            encryptedData = encryptedData.split(',')[1];
          }

          const decryptedContent = await decryptData(encryptedData, aesKey);
          unlocked.content = decryptedContent;
          unlocked.decryptionKey = '0x' + rawKeyB64.slice(0, 8) + '...';
        }
      } catch (cryptoErr) {
        console.error("Client decryption failed:", cryptoErr);
        triggerToast("Decryption Error: Failed to cryptographically unlock document payload.", "error");
        return false;
      }

      setViewerDoc(unlocked);
      setViewerAuthenticated(true);
      triggerToast('Access granted. Document decrypted.', 'success');
      await refreshData();
      return true;
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Invalid verification code', 'error');
      await refreshData();
      return false;
    }
  };

  const clearAllLogs = async () => {
    try {
      await api.clearLogsApi();
      await refreshData();
      triggerToast('Audit trail successfully purged.', 'info');
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Failed to clear logs', 'error');
    }
  };

  const extendExpiry = async (docId: string, minutes: number) => {
    try {
      const updated = await api.extendExpiryApi(docId, minutes);
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === docId ? { ...doc, expiresAt: updated.expiresAt } : doc))
      );
      triggerToast(`Document lifespan extended by ${minutes} minutes.`, 'success');
      await refreshData();
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Failed to extend document lifespan', 'error');
    }
  };

  const simulateAttack = async (docId?: string) => {
    try {
      await api.simulateAttackApi(docId);
      triggerToast('Intrusion attempt simulated and logged.', 'warning');
      await refreshData();
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Failed to simulate intrusion', 'error');
    }
  };

  return (
    <SimulationContext.Provider
      value={{
        documents,
        activityLogs,
        viewerDoc,
        currentPage,
        activeViewerDocId,
        viewerEmailEntered,
        viewerAuthenticated,
        toasts,
        isAdmin,
        isLoading,
        loginAsAdmin,
        logoutAdmin,
        navigate,
        refreshData,
        loadViewerDocument,
        lookupByOtp,
        addDocument,
        revokeDocument,
        requestOTP,
        verifyOTP,
        burnDocument,
        triggerToast,
        dismissToast,
        clearAllLogs,
        theme,
        toggleTheme,
        extendExpiry,
        simulateAttack,
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
