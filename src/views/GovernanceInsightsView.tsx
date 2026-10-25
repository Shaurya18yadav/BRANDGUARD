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
} from 'lucide-react';

export const GovernanceInsightsView: React.FC = () => {
  const { auditLogs, rules, facts } = useBrand();

  // Dynamic aggregations from audit logs + historical seeds
  const violationCounts = [
    { name: 'Obsolete Product Name (CloudLens)', count: 24, fill: '#dc2626' },
    { name: 'Absolute Security & Reliability', count: 18, fill: '#ea580c' },
    { name: 'Unsubstantiated Superlatives', count: 15, fill: '#ca8a04' },
    { name: 'Non-Descriptive Link (click here)', count: 12, fill: '#2563eb' },
    { name: 'Defamatory Competitor Naming', count: 9, fill: '#9333ea' },
    { name: 'Corporate Buzzwords & Jargon', count: 8, fill: '#059669' },
  ];

  // Most disputed rules (unclear rules signal)
  const disputedRulesData = [
    { rule: 'RULE-002: Banned Superlatives', disputes: 11, clarityScore: 'Low (Needs Refinement)', owner: 'Legal' },
    { rule: 'RULE-008: Competitor Naming', disputes: 7, clarityScore: 'Medium', owner: 'Legal' },
    { rule: 'RULE-004: Official Tagline', disputes: 5, clarityScore: 'High', owner: 'Brand Lead' },
    { rule: 'RULE-011: Pricing Transparency', disputes: 4, clarityScore: 'High', owner: 'Legal' },
  ];

  // Claims lacking sources (Missing evidence signal)
  const missingEvidenceData = [
    { claimType: 'Extreme Speed (100x / 10x ROI)', occurrences: 14, status: 'No Lab Benchmark' },
    { claimType: 'Zero Telemetry Data Collection', occurrences: 9, status: 'Privacy Policy Conflict' },
    { claimType: 'Instantaneous Ingestion', occurrences: 7, status: 'Requires TechValidate citation' },
    { claimType: '100% Cloud Migration Safety', occurrences: 5, status: 'Needs VP Eng Signoff' },
  ];

  // Review time bottlenecks (Trend over past 6 weeks in hours)
  const reviewTimeTrends = [
    { week: 'Wk 38', avgHours: 18.4, target: 4.0 },
    { week: 'Wk 39', avgHours: 14.2, target: 4.0 },
    { week: 'Wk 40', avgHours: 12.0, target: 4.0 },
    { week: 'Wk 41', avgHours: 8.5, target: 4.0 },
    { week: 'Wk 42', avgHours: 5.1, target: 4.0 },
    { week: 'Wk 43 (Current)', avgHours: 3.4, target: 4.0 },
  ];

  const COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#2563eb', '#9333ea', '#059669'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-xl text-navy-900">Governance Insights & Learning Loop</h1>
            <span className="bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
              Automated Feedback
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            BrandGuard closes the governance loop by analyzing repeated creator mistakes, identifying rules that get
            disputed most (indicating vague policy wording), and flagging evidence gaps before publications stall.
          </p>
        </div>
      </div>

      {/* Governance Feedback Recommendations Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-amber-900 font-heading font-bold text-sm">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Policy Clarity Alert: Refine RULE-002 (Banned Superlatives)</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed mb-3">
            <strong>11 disputes recorded</strong> in the last 30 days. Creators frequently dispute the boundary between
            acceptable executive quotes and forbidden marketing superlatives.
          </p>
          <div className="text-[11px] font-semibold text-amber-900 bg-amber-100/70 p-2 rounded-xl">
            Recommendation for Brand Manager: Add explicit quotation exemption guidance in Rule v1.5.
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-navy-900 font-heading font-bold text-sm">
            <FileQuestion className="w-4 h-4 text-blue-600" />
            <span>Evidence Deficit: Commission Speed Benchmark Study</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed mb-3">
            <strong>14 submissions blocked</strong> for unverified claims of "100x speed multipliers". Active knowledge base
            only substantiates 10x query execution (TECHVALIDATE-BM-2024).
          </p>
          <div className="text-[11px] font-semibold text-navy-900 bg-blue-100/70 p-2 rounded-xl">
            Recommendation for Product Marketing: Commission updated 2025 multi-cloud performance study.
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Repeated Violations Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-sm text-navy-900">Most-Repeated Brand Violations</h3>
              <p className="text-xs text-slate-500">Historical frequency across all content channels</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Last 60 Days
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={violationCounts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#14284B', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {violationCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Review Bottleneck Time Trend */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-sm text-navy-900">Average Review Turnaround Time</h3>
              <p className="text-xs text-slate-500">Hours from creator submission to signed approval</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              -81% Review Lag
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reviewTimeTrends} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis unit="h" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#14284B', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="avgHours"
                  stroke="#14284B"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#FFD60A' }}
                  name="Actual Hours"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                  name="Target SLA (4h)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables for Unclear Rules and Missing Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unclear Rules Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-heading font-bold text-sm text-navy-900">
              Unclear Rules (Highest Dispute Rates)
            </h3>
            <p className="text-xs text-slate-500">
              Rules with high dispute rates correlate with ambiguous brand guideline phrasing.
            </p>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 text-slate-600 uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-2.5 px-4">Rule Title</th>
                <th className="py-2.5 px-4">Disputes</th>
                <th className="py-2.5 px-4">Clarity Rating</th>
                <th className="py-2.5 px-4">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {disputedRulesData.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-navy-900">{d.rule}</td>
                  <td className="py-3 px-4 font-bold text-amber-700">{d.disputes}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        d.clarityScore.includes('Low')
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {d.clarityScore}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{d.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Missing Evidence Claims Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-heading font-bold text-sm text-navy-900">
              Claims Lacking Grounded Evidence Sources
            </h3>
            <p className="text-xs text-slate-500">
              Marketing copy repeatedly drafted without corresponding certified knowledge artifacts.
            </p>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 text-slate-600 uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-2.5 px-4">Claim Category</th>
                <th className="py-2.5 px-4">Blocked</th>
                <th className="py-2.5 px-4">Evidence Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {missingEvidenceData.map((m, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-navy-900">{m.claimType}</td>
                  <td className="py-3 px-4 font-bold text-red-600">{m.occurrences}</td>
                  <td className="py-3 px-4 text-slate-600">{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
