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
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'workspace',
      label: 'Review Workspace',
      icon: ShieldAlert,
      badge: unresolvedFindingsCount > 0 ? `${unresolvedFindingsCount} findings` : 'Clean',
      badgeColor: unresolvedFindingsCount > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800',
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
      badgeColor: 'bg-rose-100 text-rose-800',
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
      label: 'Roadmap & Responsible AI',
      icon: Compass,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-sm min-h-[calc(100vh-65px)]">
      <div className="py-4 px-3">
        {/* Active Context Banner */}
        <div className="mb-4 px-3 py-2.5 bg-[#14284B]/5 rounded-xl border border-[#14284B]/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-navy-900 uppercase tracking-wider">
              Nimbus Analytics
            </span>
          </div>
          <p className="text-xs text-slate-600 line-clamp-1">
            {activeSubmission ? activeSubmission.title : 'No active draft'}
          </p>
          {activeSubmission && (
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="font-semibold text-navy-800">{activeSubmission.channel}</span>
              <span>•</span>
              <span className="font-semibold text-navy-800">{activeSubmission.market}</span>
              <span>•</span>
              <span
                className={`font-semibold px-1.5 py-0.2 rounded ${
                  activeSubmission.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : activeSubmission.status === 'Reopened'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {activeSubmission.status}
              </span>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#14284B] text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#FFD60A]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
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

      {/* Footer Info & Guarantees */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 m-2 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold mb-1">
          <FileCheck2 className="w-4 h-4 text-emerald-600" />
          <span>Evidence-Linked Engine</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          All findings cite versioned company records. AI findings never grant publication permission.
        </p>
      </div>
    </aside>
  );
};
