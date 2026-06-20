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
    <div className="min-h-screen flex flex-col bg-cyber-bg text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-300">
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
