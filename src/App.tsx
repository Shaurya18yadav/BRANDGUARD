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
import { Bell, Info, Shield } from 'lucide-react';

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
    <div className="min-h-screen bg-[#DCE6F0] flex flex-col font-sans text-slate-900 selection:bg-amber-200 selection:text-navy-950">
      <Header currentView={currentView} onNavigate={setCurrentView} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentView={currentView} onNavigate={setCurrentView} />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-81px)]">
          {renderCurrentView()}

          <footer className="mt-14 pt-8 pb-6 border-t border-slate-300/80 text-center text-xs text-slate-500 space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-[#14284B] text-[#FFD60A] flex items-center justify-center font-bold">
                <Shield className="w-3 h-3" />
              </div>
              <p className="font-extrabold text-navy-900">
                BrandGuard AI — "Every content decision. Backed by evidence."
              </p>
            </div>
            <p className="text-[11px] text-slate-500">
              Deterministic Rules Engine • Immutable Version-Bound Approvals • Multimodal Intake • Autonomous Webhooks • Drift Crawler
            </p>
          </footer>
        </main>
      </div>

      {/* Toast Notification — Premium Glass Pill */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#14284B] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#FFD60A] flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
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
