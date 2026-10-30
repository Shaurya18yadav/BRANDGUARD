import React from 'react';
import { useBrand } from '../context/BrandContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  FileQuestion,
  Layers,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export const GovernanceInsightsView: React.FC = () => {
  const { auditLogs, rules, facts } = useBrand();

  const violationCounts = [
    { name: 'Obsolete Product Name (CloudLens)', count: 24, fill: '#dc2626' },
    { name: 'Absolute Security & Reliability', count: 18, fill: '#ea580c' },
    { name: 'Unsubstantiated Superlatives', count: 15, fill: '#ca8a04' },
    { name: 'Non-Descriptive Link (click here)', count: 12, fill: '#2563eb' },
    { name: 'Defamatory Competitor Naming', count: 9, fill: '#9333ea' },
    { name: 'Corporate Buzzwords & Jargon', count: 8, fill: '#059669' },
  ];

  const disputedRulesData = [
    { rule: 'RULE-002: Banned Superlatives', disputes: 11, clarityScore: 'Low (Needs Refinement)', owner: 'Legal' },
    { rule: 'RULE-008: Competitor Naming', disputes: 7, clarityScore: 'Medium', owner: 'Legal' },
    { rule: 'RULE-004: Official Tagline', disputes: 5, clarityScore: 'High', owner: 'Brand Lead' },
    { rule: 'RULE-011: Pricing Transparency', disputes: 4, clarityScore: 'High', owner: 'Legal' },
  ];

  const reviewTimeTrends = [
    { week: 'Wk 38', avgHours: 18.4, target: 4.0 },
    { week: 'Wk 39', avgHours: 14.2, target: 4.0 },
    { week: 'Wk 40', avgHours: 12.0, target: 4.0 },
    { week: 'Wk 41', avgHours: 8.5, target: 4.0 },
    { week: 'Wk 42', avgHours: 5.1, target: 4.0 },
    { week: 'Wk 43 (Current)', avgHours: 3.4, target: 4.0 },
  ];

  return (
    <div className="space-y-6 max-w-[1750px] mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading font-extrabold text-2xl text-navy-900">Governance Insights & Learning Loop</h1>
            <span className="bg-[#FFD60A] text-[#14284B] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-xs">
              Continuous Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            BrandGuard closes the loop by analyzing repeated creator mistakes, surfacing rules that get disputed most
            (indicating vague policy wording), and flagging evidence deficits before release dates stall.
          </p>
        </div>
      </div>

      {/* Actionable Feedback Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-amber-950 font-heading font-bold text-sm">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Policy Clarity Alert: Refine RULE-002 (Banned Superlatives)</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>11 disputes recorded</strong> in the last 30 days. Creators frequently dispute the boundary between
            acceptable executive quotations and forbidden marketing superlatives.
          </p>
          <div className="text-[11px] font-bold text-amber-950 bg-amber-100/80 p-2.5 rounded-xl border border-amber-200">
            Recommendation for Brand Lead: Add explicit quotation exemption guidance in Rule v1.5.
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-navy-950 font-heading font-bold text-sm">
            <FileQuestion className="w-4 h-4 text-blue-600" />
            <span>Evidence Deficit: Commission Speed Benchmark Study</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            <strong>14 submissions blocked</strong> for unverified claims of "100x speed multipliers". Active knowledge base
            only substantiates 10x query execution (TECHVALIDATE-BM-2024).
          </p>
          <div className="text-[11px] font-bold text-navy-950 bg-blue-100/80 p-2.5 rounded-xl border border-blue-200">
            Recommendation for Product Marketing: Commission updated 2025 multi-cloud benchmark study.
          </div>
        </div>
      </div>

      {/* KPI Velocity Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Review Turnaround</p>
          <p className="text-2xl font-black text-navy-900 mt-1">3.4 Hours</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">↓ 81% reduction from 18.4h baseline</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Automated Pre-Screen Coverage</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">100%</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">All text evaluated before publication</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Post-Approval Hash Tampering</p>
          <p className="text-2xl font-black text-navy-900 mt-1">0 Released</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">100% caught by automatic seal listener</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Frequent Brand Findings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <h3 className="font-heading font-extrabold text-base text-navy-900 mb-1">
            Most Frequent Brand Policy Findings
          </h3>
          <p className="text-xs text-slate-500 mb-4">Historical distribution across all inspected drafts.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={violationCounts} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {violationCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Turnaround Time Trend */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <h3 className="font-heading font-extrabold text-base text-navy-900 mb-1">
            Review Cycle Turnaround Time (Hours)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Steady reduction as creators leverage pre-screen checks.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reviewTimeTrends} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="avgHours" stroke="#14284B" strokeWidth={3} dot={{ r: 4 }} name="Avg Hours" />
                <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="SLA Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
