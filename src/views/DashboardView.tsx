import React, { useState, useMemo } from 'react';
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
  Search,
  Filter,
  Check,
  Zap,
} from 'lucide-react';

export const DashboardView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { submissions, setActiveSubmissionId, startGuidedTour, rules, facts } = useBrand();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_review' | 'approved' | 'needs_evidence'>('all');

  const totalSubmissions = submissions.length;
  const inReviewCount = submissions.filter((s) => s.status === 'In review' || s.status === 'Reopened').length;
  const approvedCount = submissions.filter((s) => s.status === 'Approved').length;
  const needsEvidenceCount = submissions.filter((s) => s.status === 'Needs evidence').length;
  const expiredFactsCount = facts.filter((f) => f.status === 'Expired').length;

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // Status filter
      if (statusFilter === 'in_review' && sub.status !== 'In review' && sub.status !== 'Reopened') return false;
      if (statusFilter === 'approved' && sub.status !== 'Approved') return false;
      if (statusFilter === 'needs_evidence' && sub.status !== 'Needs evidence') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = sub.title.toLowerCase().includes(q);
        const matchesChannel = sub.channel.toLowerCase().includes(q);
        const matchesSubmitter = sub.submittedBy.toLowerCase().includes(q);
        const matchesId = sub.id.toLowerCase().includes(q);
        if (!matchesTitle && !matchesChannel && !matchesSubmitter && !matchesId) return false;
      }

      return true;
    });
  }, [submissions, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-[1750px] mx-auto">
      {/* Top Banner & Value Proposition — Deep Executive Navy with Amber Accents */}
      <div className="bg-gradient-to-r from-[#14284B] via-[#1a3461] to-[#1e3865] rounded-3xl p-7 text-white shadow-xl relative overflow-hidden border border-[#23467e]">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-[#FFD60A]/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#FFD60A] text-[#14284B] text-[11px] font-black uppercase px-3 py-1 rounded-full mb-3 tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-[#14284B]" />
            Enterprise Brand Control Layer
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight mb-2.5">
            Governance Before Publication. Evidence-Backed Decisions.
          </h1>
          <p className="text-slate-200 text-sm leading-relaxed mb-5">
            BrandGuard AI sits between creator evidence and public distribution—halting obsolete product names,
            unapproved taglines, unsupported superlatives, expired badges, and unvetted claims before they hit market.
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            <button
              onClick={() => {
                setActiveSubmissionId('SUB-DEMO-001');
                onNavigate('workspace');
                startGuidedTour();
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-[#FFD60A] to-[#FBBF24] hover:from-[#ffe043] hover:to-[#fcd34d] text-[#14284B] font-extrabold text-xs px-4.5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all"
              id="dashboard-try-demo"
            >
              <Sparkles className="w-4 h-4 fill-[#14284B]" />
              <span>Launch 60-Second Guided Tour</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('submit')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span>+ Submit New Copy</span>
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

      {/* KPI Cards — Tactile with Subtle Elevation and Sparkline Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <div
          onClick={() => setStatusFilter(statusFilter === 'in_review' ? 'all' : 'in_review')}
          className={`bg-white rounded-2xl p-5 border shadow-sm flex items-center justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
            statusFilter === 'in_review' ? 'border-[#14284B] ring-2 ring-[#14284B]/20' : 'border-slate-200/90'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submissions Queue</p>
            <p className="text-2xl font-black text-navy-900 mt-1">{totalSubmissions}</p>
            <p className="text-[11px] text-amber-700 font-bold mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {inReviewCount} pending review
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-navy-800 flex items-center justify-center shadow-xs">
            <FileText className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}
          className={`bg-white rounded-2xl p-5 border shadow-sm flex items-center justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
            statusFilter === 'approved' ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-slate-200/90'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved & Sealed</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{approvedCount}</p>
            <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Cryptographic seal active
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'needs_evidence' ? 'all' : 'needs_evidence')}
          className={`bg-white rounded-2xl p-5 border shadow-sm flex items-center justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
            statusFilter === 'needs_evidence' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200/90'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Needs Evidence / Flagged</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{needsEvidenceCount}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Requires source grounding</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('knowledge')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md group"
          title="Inspect expired fact sources in Knowledge Base"
        >
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expired Fact Sources</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{expiredFactsCount}</p>
            <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Excluded from claims
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Submissions Queue Table & Controls — Spacious & Deeply Interactive */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Header & Filter Controls Bar */}
        <div className="p-6 border-b border-slate-200/90 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="font-heading font-extrabold text-xl text-navy-900">Governance Submissions Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every draft is deterministically verified against active brand rules and approved fact sources.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Real-time Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search draft title, channel, author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-[#14284B] transition-all bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white text-navy-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({submissions.length})
              </button>
              <button
                onClick={() => setStatusFilter('in_review')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  statusFilter === 'in_review'
                    ? 'bg-white text-navy-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Review ({inReviewCount})
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  statusFilter === 'approved'
                    ? 'bg-white text-navy-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setStatusFilter('needs_evidence')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  statusFilter === 'needs_evidence'
                    ? 'bg-white text-navy-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Flagged ({needsEvidenceCount})
              </button>
            </div>

            <button
              onClick={() => onNavigate('submit')}
              className="flex items-center gap-1.5 text-xs font-extrabold bg-[#14284B] hover:bg-navy-950 text-white px-4 py-2 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span>+ Submit Draft</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200/90 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Submission & Context</th>
                <th className="py-3.5 px-4">Channel / Market</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Publication Readiness</th>
                <th className="py-3.5 px-4">Findings Breakdown</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">No submissions matching your filter.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                      }}
                      className="mt-2 text-xs font-bold text-navy-900 hover:underline"
                    >
                      Clear search filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const openCount = sub.findings.filter(
                    (f) => !f.humanDecision || f.humanDecision.status === 'open' || f.humanDecision.status === 'disputed'
                  ).length;
                  const criticalCount = sub.findings.filter((f) => f.severity === 'Critical').length;
                  const highCount = sub.findings.filter((f) => f.severity === 'High').length;

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => {
                        setActiveSubmissionId(sub.id);
                        onNavigate('workspace');
                      }}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-5">
                        <div className="font-bold text-navy-900 text-sm line-clamp-1 group-hover:text-blue-900">
                          {sub.title}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-slate-600 font-semibold">{sub.id}</span>
                          <span>•</span>
                          <span>By {sub.submittedBy}</span>
                          <span>•</span>
                          <span>{sub.updatedAt}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                            {sub.channel}
                          </span>
                          <span className="text-blue-900 bg-blue-50 font-bold px-2 py-0.5 rounded-lg border border-blue-200/50">
                            {sub.market}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black ${
                            sub.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : sub.status === 'Reopened'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                              : sub.status === 'Needs evidence'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {sub.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {sub.status === 'Reopened' && <AlertTriangle className="w-3.5 h-3.5" />}
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-36">
                          <div className="flex justify-between text-[11px] font-bold mb-1">
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
                            <span className="text-slate-700">{sub.readinessScore}%</span>
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
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {sub.findings.length === 0 ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> No findings
                            </span>
                          ) : (
                            <>
                              {criticalCount > 0 && (
                                <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-md border border-red-200">
                                  {criticalCount} Critical
                                </span>
                              )}
                              {highCount > 0 && (
                                <span className="bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-md border border-orange-200">
                                  {highCount} High
                                </span>
                              )}
                              <span className="text-slate-500 font-medium">({openCount} open)</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSubmissionId(sub.id);
                            onNavigate('workspace');
                          }}
                          className="inline-flex items-center gap-1.5 bg-[#14284B] hover:bg-navy-950 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition-all hover:translate-x-0.5"
                        >
                          <span>Open Workspace</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
