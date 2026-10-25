import React, { useState } from 'react';
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
} from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const { rules, facts, terminology, currentRole, addRuleVersion, addFact, addTerminology, showToast } =
    useBrand();

  const [activeTab, setActiveTab] = useState<'rules' | 'facts' | 'terminology' | 'sources'>('rules');
  const [searchQuery, setSearchQuery] = useState<string>('');
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
  };

  const isBrandManager = currentRole === 'brand_manager' || currentRole === 'legal';

  return (
    <div className="space-y-6">
      {/* Knowledge Base Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-xl text-navy-900">Brand Knowledge Base</h1>
            <span className="text-[11px] font-bold bg-navy-100 text-navy-800 px-2.5 py-0.5 rounded-full">
              Immutable Versioning
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Version-controlled repository of governance rules, verified evidence facts, terminology, and legal sources.
            Edits always create a new version (v1 → v2); records are never overwritten.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'rules' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Brand Rules ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('facts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'facts' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved Facts ({facts.length})
          </button>
          <button
            onClick={() => setActiveTab('terminology')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'terminology' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Terminology ({terminology.length})
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sources' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sources & Audits
          </button>
        </div>
      </div>

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Showing active brand governance rules. Only Brand Managers can publish new versions.
            </div>
            {!isBrandManager && (
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" /> Read-only (Creator View)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-bold text-navy-900 bg-navy-50 px-2 py-0.5 rounded border border-navy-100">
                      {rule.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {rule.version}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          rule.severity === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : rule.severity === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : rule.severity === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {rule.severity}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-sm text-navy-900 mb-1">{rule.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{rule.description}</p>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs mb-3">
                    <span className="font-bold text-slate-700 text-[11px] uppercase block mb-0.5">
                      Target Pattern / Restriction:
                    </span>
                    <code className="text-slate-900 font-mono text-[11px]">{rule.patternSummary}</code>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <div>
                    <span>Owner: {rule.owner}</span>
                    <span className="mx-1.5">•</span>
                    <span>Eff: {rule.effectiveDate}</span>
                  </div>

                  {isBrandManager && (
                    <button
                      onClick={() => {
                        setEditingRule(rule);
                        setRuleEditDesc(rule.description);
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-[#14284B] hover:text-navy-950 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Bump Version</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Facts Tab (With Expired and Conflict surfacing) */}
      {activeTab === 'facts' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Time-Aware & Conflict-Surfacing Fact Repository</span>
              <p className="mt-0.5 text-amber-800">
                Notice that FACT-003 is marked <strong>Expired</strong> (and thus rejected as current evidence), while
                FACT-004 and FACT-005 contain a verified telemetry metric conflict that flags human review.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facts.map((fact) => (
              <div
                key={fact.id}
                className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between ${
                  fact.status === 'Expired'
                    ? 'border-red-300 bg-red-50/20'
                    : fact.conflictWithId
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] font-bold text-navy-900 bg-navy-50 px-2 py-0.5 rounded border border-navy-100">
                      {fact.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {fact.version}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          fact.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {fact.status}
                      </span>
                    </div>
                  </div>

                  <p className="font-medium text-xs text-navy-950 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                    "{fact.fact}"
                  </p>

                  <div className="space-y-1 text-xs mb-3">
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-800">Source:</span> {fact.sourceTitle}
                    </div>
                    <div className="text-slate-500 font-mono text-[11px]">
                      <span className="font-sans font-semibold text-slate-700">Ref ID:</span> {fact.sourceRef}
                    </div>
                  </div>

                  {/* Conflict warning */}
                  {fact.conflictWithId && (
                    <div className="bg-amber-100 text-amber-900 p-2.5 rounded-xl text-xs mb-3 border border-amber-300">
                      <span className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Conflict Detected:
                      </span>
                      <p className="text-[11px] mt-0.5">{fact.conflictReason}</p>
                    </div>
                  )}

                  {/* Expired warning */}
                  {fact.status === 'Expired' && (
                    <div className="bg-rose-100 text-rose-900 p-2.5 rounded-xl text-xs mb-3 border border-rose-300">
                      <span className="font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Expired Attribution:
                      </span>
                      <p className="text-[11px] mt-0.5">
                        Expired on {fact.expiryDate}. Claims citing this badge will be blocked until recertified.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Owner: {fact.owner}</span>
                  <span>Expires: {fact.expiryDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terminology Tab */}
      {activeTab === 'terminology' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-heading font-bold text-sm text-navy-900">Brand Lexicon & Terminology Mapping</h3>
            <p className="text-xs text-slate-500">
              Approved corporate terminology and explicitly banned or deprecated vocabulary.
            </p>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Forbidden / Deprecated Term</th>
                <th className="py-3 px-4">Approved Replacement</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Rationale</th>
                <th className="py-3 px-4">Version</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {terminology.map((term) => (
                <tr key={term.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-red-600 bg-red-50/50">
                    "{term.forbidden}"
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-700 bg-emerald-50/30">
                    "{term.preferred}"
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{term.category}</td>
                  <td className="py-3 px-4 text-slate-600">{term.rationale}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{term.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sources & Audits Tab */}
      {activeTab === 'sources' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-base text-navy-900">Third-Party Evidence Registries</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            BrandGuard connects each claim to an auditable enterprise artifact. If an audit is challenged by regulators
            or media, every publication decision maps directly back to the active source file version.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-navy-900 block mb-1">SOC 2 Type II Compliance Report</span>
              <p className="text-slate-600 text-[11px] mb-2">Audited by Ernst & Young LLP • Effective: April 2024</p>
              <span className="text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                Valid & Verified
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-navy-900 block mb-1">Forrester TEI™ Customer Study</span>
              <p className="text-slate-600 text-[11px] mb-2">Forrester Research Inc. • Effective: March 2024</p>
              <span className="text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                Internal Conflict Noted
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-navy-900 block mb-1">Gartner Peer Insights 2022</span>
              <p className="text-slate-600 text-[11px] mb-2">Customer Choice Badging • Expired Dec 2023</p>
              <span className="text-rose-700 font-semibold bg-rose-100 px-2 py-0.5 rounded text-[10px]">
                Expired / Prohibited
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Version Edit Modal */}
      {editingRule && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-heading font-bold text-lg text-navy-900 mb-1">
              Increment Rule Version ({editingRule.id})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Current version {editingRule.version} will be sealed into historical records. A new minor version will be
              published.
            </p>

            <form onSubmit={handleSaveRuleVersion} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Updated Rule Description</label>
                <textarea
                  rows={3}
                  value={ruleEditDesc}
                  onChange={(e) => setRuleEditDesc(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Change Log Rationale <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Expanded FTC substantiation clause to include European DMA regulations."
                  value={ruleEditReason}
                  onChange={(e) => setRuleEditReason(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-navy-900 hover:bg-navy-800 text-white font-bold px-4 py-2 rounded-xl"
                >
                  Publish New Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
