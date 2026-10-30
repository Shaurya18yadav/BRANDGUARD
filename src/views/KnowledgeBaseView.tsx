import React, { useState, useMemo } from 'react';
import { useBrand } from '../context/BrandContext';
import { BrandRule, ApprovedFactSource, TerminologyItem } from '../types';
import {
  Database,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  History,
  Lock,
  Edit2,
  FileText,
  Search,
  Filter,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const { rules, facts, terminology, currentRole, addRuleVersion, addFact, addTerminology, showToast } =
    useBrand();

  const [activeTab, setActiveTab] = useState<'rules' | 'facts' | 'terminology' | 'sources'>('rules');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingRule, setEditingRule] = useState<BrandRule | null>(null);
  const [ruleEditReason, setRuleEditReason] = useState<string>('');
  const [ruleEditDesc, setRuleEditDesc] = useState<string>('');

  const handleSaveRuleVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    if (!ruleEditReason.trim()) {
      showToast('Version bump requires a change reason for governance audit.');
      return;
    }

    addRuleVersion(
      editingRule.id,
      {
        description: ruleEditDesc || editingRule.description,
      },
      ruleEditReason
    );

    setEditingRule(null);
    setRuleEditReason('');
    setRuleEditDesc('');
    showToast(`Bumped ${editingRule.id} to new version.`);
  };

  const isBrandManager = currentRole === 'brand_manager' || currentRole === 'legal';

  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (categoryFilter !== 'all' && r.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        const matchesId = r.id.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesId) return false;
      }
      return true;
    });
  }, [rules, categoryFilter, searchQuery]);

  const filteredFacts = useMemo(() => {
    return facts.filter((f) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesFact = f.fact.toLowerCase().includes(q);
        const matchesSource = f.sourceTitle.toLowerCase().includes(q);
        const matchesId = f.id.toLowerCase().includes(q);
        if (!matchesFact && !matchesSource && !matchesId) return false;
      }
      return true;
    });
  }, [facts, searchQuery]);

  const filteredTerminology = useMemo(() => {
    return terminology.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesForbidden = t.forbidden.toLowerCase().includes(q);
        const matchesPreferred = t.preferred.toLowerCase().includes(q);
        const matchesCategory = t.category.toLowerCase().includes(q);
        if (!matchesForbidden && !matchesPreferred && !matchesCategory) return false;
      }
      return true;
    });
  }, [terminology, searchQuery]);

  return (
    <div className="space-y-6 max-w-[1750px] mx-auto">
      {/* Knowledge Base Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading font-extrabold text-2xl text-navy-900">Brand Knowledge Base</h1>
            <span className="text-[10px] font-black bg-navy-100 text-navy-900 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Immutable Versioning
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Version-controlled repository of governance rules, verified evidence facts, terminology, and legal sources.
            Edits always create an explicit new version (v1 → v2); records are never silently overwritten.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'rules' ? 'bg-[#14284B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Brand Rules ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('facts')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'facts' ? 'bg-[#14284B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved Facts ({facts.length})
          </button>
          <button
            onClick={() => setActiveTab('terminology')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'terminology' ? 'bg-[#14284B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Terminology ({terminology.length})
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'sources' ? 'bg-[#14284B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sources & Audits
          </button>
        </div>
      </div>

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter rules by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-[#14284B] bg-white"
                />
              </div>

              {/* Category selector */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Trademarks">Trademarks</option>
                <option value="Superlatives & Claims">Superlatives & Claims</option>
                <option value="Tone & Voice">Tone & Voice</option>
                <option value="Regional & Legal">Regional & Legal</option>
                <option value="Accessibility">Accessibility</option>
              </select>
            </div>

            {!isBrandManager ? (
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-slate-200">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Read-only (Switch to Brand Manager / Legal to bump versions)
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Authorized to bump rule versions
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            {filteredRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] font-bold text-slate-500">{rule.id}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                        {rule.version}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          rule.severity === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : rule.severity === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {rule.severity}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-heading font-extrabold text-base text-navy-900 mb-1">{rule.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-2">
                    {rule.category}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{rule.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Owner: {rule.owner}</span>
                  {isBrandManager && (
                    <button
                      onClick={() => {
                        setEditingRule(rule);
                        setRuleEditDesc(rule.description);
                      }}
                      className="text-navy-900 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Edit2 className="w-3 h-3" /> Bump Version
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facts Tab */}
      {activeTab === 'facts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Approved factual statements and certified metrics with explicit validity periods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {filteredFacts.map((fact) => (
              <div
                key={fact.id}
                className={`bg-white rounded-3xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
                  fact.status === 'Expired' ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200/90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] font-bold text-slate-500">{fact.id}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        fact.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800 animate-pulse'
                      }`}
                    >
                      {fact.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-navy-900 leading-snug mb-2">"{fact.fact}"</p>
                  <p className="text-[11px] text-slate-600 mb-1">
                    <strong>Source:</strong> {fact.sourceTitle} ({fact.version})
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">Ref: {fact.sourceRef}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Expires: {fact.expiryDate}</span>
                  {fact.status === 'Expired' && (
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Excluded
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terminology Tab */}
      {activeTab === 'terminology' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200/90">
            <h3 className="font-heading font-extrabold text-base text-navy-900">Official Terminology Register</h3>
            <p className="text-xs text-slate-500">Standardized product naming, trademarks, and disallowed terms.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredTerminology.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-700 line-through text-sm">{item.forbidden}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-bold text-emerald-800 text-sm">{item.preferred}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">{item.rationale}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.version}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources Tab */}
      {activeTab === 'sources' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="font-heading font-extrabold text-base text-navy-900">Certified Governance Source References</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All rule boundaries and factual statements link back to legal filings, benchmark studies, and marketing kits.
          </p>
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-navy-900">Nimbus Analytics Q4 Rebrand Guidebook (v2.1)</p>
                <p className="text-[11px] text-slate-500">Ref: LEGAL-DOC-2024-Q4 • Signed by Chief Marketing Officer</p>
              </div>
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                Active Source
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-navy-900">TechValidate Cloud Query Benchmark (2024)</p>
                <p className="text-[11px] text-slate-500">Ref: TECHVALIDATE-BM-2024 • Third-party lab audit</p>
              </div>
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                Active Source
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-navy-900">Gartner Magic Quadrant Leader Badge (2022)</p>
                <p className="text-[11px] text-slate-500">Ref: GARTNER-MQ-2022 • Expired on Dec 31, 2023</p>
              </div>
              <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
                Expired Source
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bump Version Modal */}
      {editingRule && (
        <div className="fixed inset-0 bg-[#08101e]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveRuleVersion}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-navy-900">
                Bump Rule Version: {editingRule.id} (v{editingRule.version} → v{(parseFloat(editingRule.version.replace('v', '')) + 0.1).toFixed(1)})
              </h3>
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Rule Description</label>
              <textarea
                rows={3}
                value={ruleEditDesc}
                onChange={(e) => setRuleEditDesc(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#14284B] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Version Bump Rationale <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Added exception for approved executive quotes."
                value={ruleEditReason}
                onChange={(e) => setRuleEditReason(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#14284B] focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-extrabold bg-[#14284B] text-white rounded-xl shadow-md hover:bg-navy-950 transition-all"
              >
                Save Immutable Version
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
