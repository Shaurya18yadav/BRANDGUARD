import React from 'react';
import { useBrand } from '../context/BrandContext';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const DashboardView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { submissions, setActiveSubmissionId, startGuidedTour, rules, facts } = useBrand();

  const totalSubmissions = submissions.length;
  const inReviewCount = submissions.filter((s) => s.status === 'In review' || s.status === 'Reopened').length;
  const approvedCount = submissions.filter((s) => s.status === 'Approved').length;
  const needsEvidenceCount = submissions.filter((s) => s.status === 'Needs evidence').length;
  const expiredFactsCount = facts.filter((f) => f.status === 'Expired').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Value Proposition */}
      <div className="bg-gradient-to-r from-[#14284B] to-[#1e3865] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-[#FFD60A]/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 bg-[#FFD60A] text-[#14284B] text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full mb-3 tracking-wider">
            <Sparkles className="w-3.5 h-3.5 fill-[#14284B]" />
            Enterprise Brand Control Layer
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Governance Before Publication. Evidence-Backed Decisions.
          </h1>
          <p className="text-slate-200 text-sm leading-relaxed mb-4">
            BrandGuard AI sits between creator evidence and audience publication—halting obsolete names, unapproved
            taglines, unsupported claims, expired badges, and unvetted superlatives before they hit the market.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setActiveSubmissionId('SUB-DEMO-001');
                onNavigate('workspace');
                startGuidedTour();
              }}
              className="flex items-center gap-2 bg-[#FFD60A] hover:bg-[#ffe043] text-[#14284B] font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
              id="dashboard-try-demo"
            >
              <Sparkles className="w-4 h-4 fill-[#14284B]" />
              <span>Launch 60-Second Guided Tour</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('submit')}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs px-3.5 py-2.5 rounded-xl transition-colors"
            >
              <span>Submit New Copy</span>
            </button>
            <button
              onClick={() => onNavigate('knowledge')}
              className="flex items-center gap-1.5 text-blue-200 hover:text-white text-xs px-3 py-2 transition-colors underline-offset-4 hover:underline"
            >
              <span>Explore Knowledge Base ({rules.length} active rules)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submissions Queue</p>
            <p className="text-2xl font-bold text-navy-900 mt-1">{totalSubmissions}</p>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">{inReviewCount} pending review</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-navy-800 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved & Sealed</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{approvedCount}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Version-bound signoffs</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Needs Evidence / Flagged</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{needsEvidenceCount}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Requires source grounding</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expired Evidence Sources</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{expiredFactsCount}</p>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5">Excluded from claims</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Submissions Queue Table with Publication Readiness Meter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-heading font-bold text-lg text-navy-900">Governance Submissions Queue</h2>
            <p className="text-xs text-slate-500">
              Each draft is evaluated deterministically against brand rules and versioned fact sources.
            </p>
          </div>
          <button
            onClick={() => onNavigate('submit')}
            className="flex items-center gap-1.5 text-xs font-bold bg-[#14284B] hover:bg-navy-800 text-white px-3.5 py-2 rounded-xl shadow-sm self-start sm:self-auto"
          >
            <span>+ Submit Draft</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Submission & Context</th>
                <th className="py-3 px-4">Channel / Market</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Publication Readiness</th>
                <th className="py-3 px-4">Findings Breakdown</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((sub) => {
                const openCount = sub.findings.filter(
                  (f) => !f.humanDecision || f.humanDecision.status === 'open' || f.humanDecision.status === 'disputed'
                ).length;
                const criticalCount = sub.findings.filter((f) => f.severity === 'Critical').length;
                const highCount = sub.findings.filter((f) => f.severity === 'High').length;

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-navy-900 text-sm line-clamp-1">{sub.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>ID: {sub.id}</span>
                        <span>•</span>
                        <span>By {sub.submittedBy}</span>
                        <span>•</span>
                        <span>{sub.updatedAt}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {sub.channel}
                        </span>
                        <span className="text-slate-500 bg-blue-50 text-blue-800 font-semibold px-2 py-0.5 rounded">
                          {sub.market}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          sub.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : sub.status === 'Reopened'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                            : sub.status === 'Needs evidence'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {sub.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                        {sub.status === 'Reopened' && <AlertTriangle className="w-3 h-3" />}
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-36">
                        <div className="flex justify-between text-[11px] font-semibold mb-1">
                          <span
                            className={
                              sub.readinessStatus === 'Ready to publish'
                                ? 'text-emerald-700'
                                : sub.readinessStatus === 'Blocked'
                                ? 'text-rose-700'
                                : 'text-amber-700'
                            }
                          >
                            {sub.readinessStatus}
                          </span>
                          <span className="text-slate-600">{sub.readinessScore}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              sub.readinessScore >= 90
                                ? 'bg-emerald-500'
                                : sub.readinessScore >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${sub.readinessScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        {sub.findings.length === 0 ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> No findings
                          </span>
                        ) : (
                          <>
                            {criticalCount > 0 && (
                              <span className="bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">
                                {criticalCount} Critical
                              </span>
                            )}
                            {highCount > 0 && (
                              <span className="bg-orange-100 text-orange-800 font-bold px-1.5 py-0.5 rounded">
                                {highCount} High
                              </span>
                            )}
                            <span className="text-slate-500">({openCount} open)</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setActiveSubmissionId(sub.id);
                          onNavigate('workspace');
                        }}
                        className="inline-flex items-center gap-1 bg-[#14284B] hover:bg-navy-800 text-white font-medium px-3 py-1.5 rounded-lg text-xs shadow-sm transition-colors"
                      >
                        <span>Open Workspace</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
