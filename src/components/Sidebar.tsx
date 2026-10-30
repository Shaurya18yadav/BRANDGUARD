import React from 'react';
import { useBrand } from '../context/BrandContext';
import {
  LayoutDashboard,
  ShieldAlert,
  FileEdit,
  Database,
  History,
  BarChart3,
  Compass,
  FileCheck2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { submissions, activeSubmission, rules, facts } = useBrand();

  const unresolvedFindingsCount = activeSubmission
    ? activeSubmission.findings.filter(
        (f) => !f.humanDecision || f.humanDecision.status === 'open' || f.humanDecision.status === 'disputed'
      ).length
    : 0;

  const expiredSourcesCount = facts.filter((f) => f.status === 'Expired').length;
  const inReviewCount = submissions.filter((s) => s.status === 'In review' || s.status === 'Reopened').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: inReviewCount > 0 ? `${inReviewCount} pending` : undefined,
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
    },
    {
      id: 'workspace',
      label: 'Review Workspace',
      icon: ShieldAlert,
      badge: unresolvedFindingsCount > 0 ? `${unresolvedFindingsCount} findings` : 'Clean',
      badgeColor: unresolvedFindingsCount > 0 ? 'bg-red-100 text-red-900 border border-red-300 font-bold' : 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold',
    },
    {
      id: 'submit',
      label: 'Submit Content',
      icon: FileEdit,
    },
    {
      id: 'knowledge',
      label: 'Brand Knowledge Base',
      icon: Database,
      badge: expiredSourcesCount > 0 ? `${expiredSourcesCount} expired` : undefined,
      badgeColor: 'bg-rose-100 text-rose-900 border border-rose-300 font-bold',
    },
    {
      id: 'approvals',
      label: 'Approvals & Audit',
      icon: History,
    },
    {
      id: 'insights',
      label: 'Governance Insights',
      icon: BarChart3,
    },
    {
      id: 'roadmap',
      label: 'Roadmap & Principles',
      icon: Compass,
    },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 shadow-sm min-h-[calc(100vh-77px)] select-none">
      <div className="py-5 px-4 space-y-4">
        {/* Active Context Card — Spacious, Tactile & Clickable */}
        <div
          onClick={() => onNavigate('workspace')}
          className="p-4 bg-gradient-to-br from-[#14284B]/5 to-blue-50/50 hover:bg-[#14284B]/10 rounded-2xl border border-[#14284B]/15 shadow-xs space-y-2 cursor-pointer transition-all duration-150 hover:shadow-sm group"
          title="Click to open this draft in Review Workspace"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
              <span className="text-[11px] font-extrabold text-[#14284B] uppercase tracking-wider">
                Nimbus Analytics
              </span>
            </div>
            <span className="text-[10px] font-black bg-[#14284B] text-white px-2 py-0.5 rounded-full">
              Enterprise
            </span>
          </div>

          <p className="text-xs font-bold text-slate-800 line-clamp-1 leading-snug group-hover:text-navy-900">
            {activeSubmission ? activeSubmission.title : 'No active draft'}
          </p>

          {activeSubmission && (
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/80">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span>{activeSubmission.channel}</span>
                <span>•</span>
                <span>{activeSubmission.market}</span>
              </div>
              <span
                className={`font-black px-2 py-0.5 rounded-full text-[10px] ${
                  activeSubmission.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : activeSubmission.status === 'Reopened'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}
              >
                {activeSubmission.status}
              </span>
            </div>
          )}
        </div>

        {/* Navigation list with generous spacing and tactile interaction */}
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-3 block mb-2">
            Navigation Menu
          </span>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#14284B] text-white shadow-md shadow-navy-900/15 font-bold border-l-4 border-[#FFD60A] -translate-x-0.5'
                      : 'text-slate-700 hover:text-navy-950 hover:bg-slate-100/90 hover:translate-x-0.5 active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-[#FFD60A]' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Guarantees Banner */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/80 m-3 rounded-2xl text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <FileCheck2 className="w-4 h-4 text-emerald-600" />
          <span>Evidence-Linked Engine</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">
          All findings cite versioned company records. AI findings never grant publication permission.
        </p>
      </div>
    </aside>
  );
};
