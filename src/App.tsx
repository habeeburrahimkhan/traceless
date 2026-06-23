import React from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { VendorAccessPage } from './pages/VendorAccessPage';
import { SecureViewerPage } from './pages/SecureViewerPage';
import { ActivityPage } from './pages/ActivityPage';

// Ambient 3D background visualizer component
const Background3DEffect: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
      <style>{`
        @keyframes rotateRing1 {
          0% { transform: rotateX(35deg) rotateY(45deg) rotateZ(0deg); }
          100% { transform: rotateX(35deg) rotateY(45deg) rotateZ(360deg); }
        }
        @keyframes rotateRing2 {
          0% { transform: rotateX(60deg) rotateY(-30deg) rotateZ(360deg); }
          100% { transform: rotateX(60deg) rotateY(-30deg) rotateZ(0deg); }
        }
        @keyframes drift {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          10% { opacity: 0.65; }
          90% { opacity: 0.65; }
          100% { transform: translateY(-150px) translateX(30px); opacity: 0; }
        }
      `}</style>

      {/* 3D Gyroscopic Rings (Left Center) */}
      <div className="absolute top-[20%] left-[-80px] sm:left-10 w-80 h-80 opacity-[0.06] hidden sm:block" style={{ perspective: '1000px' }}>
        <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
          <div className="absolute inset-0 border-4 border-dashed border-emerald-500 rounded-full" style={{ animation: 'rotateRing1 40s linear infinite', filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.3))' }} />
          <div className="absolute inset-10 border border-double border-cyan-450 rounded-full" style={{ animation: 'rotateRing2 30s linear infinite', filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.3))' }} />
          <div className="absolute inset-20 border border-zinc-800 rounded-full" style={{ transform: 'rotateX(90deg)' }} />
        </div>
      </div>

      {/* Cryptographic floating dust particles */}
      <div className="absolute top-1/2 left-[15%] w-3 h-3 rounded-full bg-emerald-400 opacity-0" style={{ animation: 'drift 8s infinite linear', filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.8))' }}></div>
      <div className="absolute top-1/3 right-[25%] w-2 h-2 rounded-full bg-cyan-400 opacity-0" style={{ animation: 'drift 12s infinite linear 3s', filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.8))' }}></div>
      <div className="absolute bottom-1/3 left-1/3 w-3.5 h-3.5 rounded-full bg-zinc-650 opacity-0" style={{ animation: 'drift 10s infinite linear 6s', filter: 'drop-shadow(0 0 4px rgba(113,113,122,0.4))' }}></div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { currentPage } = useSimulation();

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'upload':
        return <UploadPage />;
      case 'vendor-access':
        return <VendorAccessPage />;
      case 'viewer':
        return <SecureViewerPage />;
      case 'activity':
        return <ActivityPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cyber-bg text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-300 relative">
      {/* 3D Background Objects */}
      <Background3DEffect />

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar />
        {currentPage === 'landing' ? (
          <div className="flex-1 w-full">
            {renderPage()}
          </div>
        ) : (
          <main className="flex-1 w-full py-6">
            {renderPage()}
          </main>
        )}
        <ToastContainer />
      </div>
    </div>
  );
};

function App() {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
}

export default App;
