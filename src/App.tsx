import React, { useState } from 'react';
import { BrandProvider, useBrand } from './context/BrandContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GuidedDemoModal } from './components/GuidedDemoModal';
import { DashboardView } from './views/DashboardView';
import { ReviewWorkspaceView } from './views/ReviewWorkspaceView';
import { SubmitView } from './views/SubmitView';
import { KnowledgeBaseView } from './views/KnowledgeBaseView';
import { ApprovalsAuditView } from './views/ApprovalsAuditView';
import { GovernanceInsightsView } from './views/GovernanceInsightsView';
import { RoadmapResponsibleView } from './views/RoadmapResponsibleView';
import { Bell, Info } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const { toastMessage } = useBrand();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentView} />;
      case 'workspace':
        return <ReviewWorkspaceView onNavigate={setCurrentView} />;
      case 'submit':
        return <SubmitView onNavigate={setCurrentView} />;
      case 'knowledge':
        return <KnowledgeBaseView />;
      case 'approvals':
        return <ApprovalsAuditView onNavigate={setCurrentView} />;
      case 'insights':
        return <GovernanceInsightsView />;
      case 'roadmap':
        return <RoadmapResponsibleView />;
      default:
        return <DashboardView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#DCE6F0] flex flex-col font-sans">
      <Header currentView={currentView} onNavigate={setCurrentView} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentView={currentView} onNavigate={setCurrentView} />

        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-65px)]">
          {renderCurrentView()}

          <footer className="mt-12 pt-6 pb-4 border-t border-slate-300 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-navy-900">
              BrandGuard AI — "Every content decision. Backed by evidence."
            </p>
            <p className="text-[11px]">
              Design approach and prototype. No compliance certification or production readiness is claimed.
            </p>
          </footer>
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#14284B] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#FFD60A] flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-2 duration-150">
          <Info className="w-4 h-4 text-[#FFD60A] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Guided Demo Interactive Overlay */}
      <GuidedDemoModal onNavigate={setCurrentView} />
    </div>
  );
};

export default function App() {
  return (
    <BrandProvider>
      <MainLayout />
    </BrandProvider>
  );
}
