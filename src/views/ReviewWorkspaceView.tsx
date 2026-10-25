import React, { useState, useMemo } from 'react';
import { useBrand } from '../context/BrandContext';
import { Finding, FindingStatus, Severity } from '../types';
import { DiffViewer } from '../components/DiffViewer';
import {
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  CheckCheck,
  Send,
  FileCheck,
  UserCheck,
  Lock,
  MessageSquare,
  HelpCircle,
  Eye,
  Edit3,
} from 'lucide-react';

export const ReviewWorkspaceView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const {
    activeSubmission,
    updateFindingDecision,
    applyAllAcceptedFixes,
    approveSubmission,
    rejectSubmission,
    currentRole,
    currentUser,
    runReviewOnSubmission,
    showToast,
  } = useBrand();

  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [decisionReason, setDecisionReason] = useState<string>('');
  const [customCorrection, setCustomCorrection] = useState<string>('');
  const [showEditInput, setShowEditInput] = useState<boolean>(false);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  if (!activeSubmission) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-navy-900">No active submission selected</h3>
        <p className="text-xs text-slate-500 mb-4">Select a submission from the Dashboard to begin review.</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="bg-navy-900 text-white text-xs px-4 py-2 rounded-xl font-semibold"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const findings = activeSubmission.findings;

  // Selected finding
  const selectedFinding =
    findings.find((f) => f.id === selectedFindingId) || findings[0] || null;

  // Filtered list
  const filteredFindings = useMemo(() => {
    if (filterSeverity === 'all') return findings;
    return findings.filter((f) => f.severity.toLowerCase() === filterSeverity.toLowerCase());
  }, [findings, filterSeverity]);

  // Handle human decision submit
  const handleDecision = (status: FindingStatus) => {
    if (!selectedFinding) return;
    if (!decisionReason.trim()) {
      showToast('⚠️ A recorded justification/reason is REQUIRED for every human governance decision.');
      return;
    }

    updateFindingDecision(
      activeSubmission.id,
      selectedFinding.id,
      status,
      decisionReason.trim(),
      showEditInput && customCorrection ? customCorrection : undefined
    );

    setDecisionReason('');
    setShowEditInput(false);
    setCustomCorrection('');
  };

  const handleRunFreshReview = async () => {
    setIsReviewing(true);
    await runReviewOnSubmission(activeSubmission.id);
    setIsReviewing(false);
  };

  // Render highlighted content spans
  const renderHighlightedContent = () => {
    const text = activeSubmission.content;
    if (!findings || findings.length === 0) {
      return <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">{text}</div>;
    }

    // Sort findings by start index
    const sorted = [...findings].sort((a, b) => a.startIndex - b.startIndex);
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((finding, index) => {
      // Catch occurrences even if indices shifted
      let start = finding.startIndex;
      let end = finding.endIndex;

      if (start < lastIndex || text.substring(start, end) !== finding.targetText) {
        const found = text.indexOf(finding.targetText, lastIndex);
        if (found !== -1) {
          start = found;
          end = found + finding.targetText.length;
        } else {
          return;
        }
      }

      // Add text prior to match
      if (start > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>{text.substring(lastIndex, start)}</span>
        );
      }

      const isSelected = selectedFinding?.id === finding.id;
      const isResolved =
        finding.humanDecision &&
        (finding.humanDecision.status === 'accepted' || finding.humanDecision.status === 'edited');

      let markClass = 'mark-medium';
      if (finding.severity === 'Critical') markClass = 'mark-critical';
      else if (finding.severity === 'High') markClass = 'mark-high';
      else if (finding.severity === 'Low') markClass = 'mark-low';

      elements.push(
        <span
          key={`finding-${finding.id}-${index}`}
          onClick={() => setSelectedFindingId(finding.id)}
          className={`${markClass} ${isSelected ? 'selected ring-2 ring-navy-900 font-semibold' : ''} ${
            isResolved ? 'opacity-50 line-through' : ''
          }`}
          title={`${finding.ruleName} (${finding.severity}) - Click to inspect reasoning`}
        >
          {text.substring(start, end)}
        </span>
      );

      lastIndex = end;
    });

    if (lastIndex < text.length) {
      elements.push(<span key="text-end">{text.substring(lastIndex)}</span>);
    }

    return (
      <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800 selection:bg-yellow-200">
        {elements}
      </div>
    );
  };

  const acceptedCount = findings.filter((f) => f.humanDecision?.status === 'accepted').length;

  return (
    <div className="space-y-4">
      {/* Top Banner if Reopened or Approved */}
      {activeSubmission.status === 'Reopened' && (
        <div className="bg-red-50 border-2 border-red-400 p-4 rounded-2xl flex items-start gap-3 shadow-md">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-red-900 text-sm">
              Approval Invalidated: Material edit detected post-approval.
            </span>
            <p className="text-red-700 mt-0.5">
              {activeSubmission.reopenReason ||
                'The content cryptographic hash no longer matches the signed approval seal. The approval was automatically revoked.'}
            </p>
          </div>
        </div>
      )}

      {activeSubmission.status === 'Approved' && (
        <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-900">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">
              Officially Approved for Publication by {activeSubmission.approvedBy} ({activeSubmission.approvalRole})
            </span>
            <span className="font-mono text-[11px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-800">
              Seal: {activeSubmission.approvedContentHash?.slice(0, 16)}...
            </span>
          </div>
          <span className="text-emerald-700 font-semibold">{activeSubmission.approvedAt}</span>
        </div>
      )}

      {/* Hero Workspace Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-heading font-bold text-lg text-navy-900">{activeSubmission.title}</span>
            <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded">
              {activeSubmission.channel}
            </span>
            <span className="bg-blue-50 text-blue-800 text-[11px] font-semibold px-2 py-0.5 rounded">
              {activeSubmission.market}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>By {activeSubmission.submittedBy}</span>
            <span>•</span>
            <span>Last reviewed: {activeSubmission.updatedAt}</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400">
              Initial Hash: {activeSubmission.initialContentHash.slice(0, 12)}
            </span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {acceptedCount > 0 && (
            <button
              onClick={() => applyAllAcceptedFixes(activeSubmission.id)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all transform hover:scale-[1.02]"
              id="btn-apply-fixes"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Apply All Accepted Corrections ({acceptedCount})</span>
            </button>
          )}

          <button
            onClick={handleRunFreshReview}
            disabled={isReviewing}
            className="flex items-center gap-1.5 bg-navy-800 hover:bg-navy-900 text-white text-xs px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isReviewing ? 'animate-spin' : ''}`} />
            <span>{isReviewing ? 'Reviewing...' : 'Re-run Review'}</span>
          </button>

          {/* Publication Approval Action */}
          {currentRole !== 'creator' ? (
            <button
              onClick={() => {
                const reason = prompt(
                  'Enter approval compliance rationale (Required for legal audit trail):',
                  'Verified against Q4 Brand Guidelines and GDPR compliance documents.'
                );
                if (reason) approveSubmission(activeSubmission.id, reason);
              }}
              className="flex items-center gap-1.5 bg-[#FFD60A] hover:bg-[#ffe043] text-[#14284B] font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all"
              id="btn-approve-draft"
            >
              <FileCheck className="w-3.5 h-3.5 text-[#14284B]" />
              <span>Approve Draft (Sign Off)</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Creator View (Approval requires Brand Manager / Legal role)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Draft Content with Color Highlighted Spans */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-xs text-navy-900 uppercase tracking-wider">
                  Draft Content Inspection
                </span>
                <span className="text-[11px] text-slate-500">
                  (Click any highlight to focus its reasoning chain)
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Critical
                </span>
                <span className="flex items-center gap-1 ml-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> High
                </span>
                <span className="flex items-center gap-1 ml-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" /> Med
                </span>
              </div>
            </div>

            <div className="p-5 min-h-[360px] bg-white leading-relaxed select-text">
              {renderHighlightedContent()}
            </div>

            <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>{findings.length} total findings detected</span>
              <span className="italic text-[11px]">
                "AI findings never grant publication permission."
              </span>
            </div>
          </div>

          {/* Readiness Meter for this Submission */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Publication Readiness Score:
                </span>
                <span
                  className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    activeSubmission.readinessStatus === 'Ready to publish'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeSubmission.readinessStatus === 'Blocked'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {activeSubmission.readinessStatus} ({activeSubmission.readinessScore}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Computed dynamically from open findings, severity weighting, and unverified claims.
              </p>
            </div>
            <div className="w-48 bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-300 ${
                  activeSubmission.readinessScore >= 90
                    ? 'bg-emerald-500'
                    : activeSubmission.readinessScore >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${activeSubmission.readinessScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Reasoning Chain Hero Panel */}
        <div className="lg:col-span-5 space-y-3">
          {/* Severity Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filterSeverity === sev
                    ? 'bg-[#14284B] text-white font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {selectedFinding ? (
            <div className="bg-white rounded-2xl border-2 border-navy-900/15 shadow-lg overflow-hidden">
              {/* Finding Header */}
              <div className="p-4 bg-gradient-to-r from-navy-900 to-navy-800 text-white">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {/* SEPARATE SEVERITY BADGE */}
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider ${
                        selectedFinding.severity === 'Critical'
                          ? 'bg-red-500 text-white shadow-sm'
                          : selectedFinding.severity === 'High'
                          ? 'bg-orange-500 text-white shadow-sm'
                          : selectedFinding.severity === 'Medium'
                          ? 'bg-yellow-400 text-navy-900 shadow-sm'
                          : 'bg-blue-400 text-white shadow-sm'
                      }`}
                    >
                      Severity: {selectedFinding.severity}
                    </span>

                    {/* SEPARATE CONFIDENCE BADGE */}
                    <span className="text-[10px] font-bold bg-white/20 text-blue-100 px-2 py-0.5 rounded-full">
                      Confidence: {selectedFinding.confidence}%
                    </span>

                    {/* ORIGIN BADGE */}
                    <span className="text-[10px] font-medium bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30">
                      {selectedFinding.origin}
                    </span>
                  </div>

                  {/* Auto-routed escalation tag if critical or high */}
                  {(selectedFinding.severity === 'Critical' || selectedFinding.severity === 'High') && (
                    <span className="text-[10px] font-extrabold bg-amber-400 text-navy-950 px-2 py-0.5 rounded uppercase">
                      Escalated to Human
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-bold text-sm leading-snug">
                  {selectedFinding.ruleName}
                </h3>
              </div>

              {/* Exact Reasoning Chain */}
              <div className="p-4 space-y-3.5 text-xs max-h-[580px] overflow-y-auto">
                {/* 1. Original Claim */}
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    1. Original Claim
                  </span>
                  <div className="p-2.5 bg-slate-100 rounded-xl font-medium text-slate-900 border border-slate-200">
                    "{selectedFinding.reasoning.originalClaim}"
                  </div>
                </div>

                {/* 2. Applicable Rule */}
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    2. Applicable Rule
                  </span>
                  <div className="p-2.5 bg-blue-50/70 text-navy-900 rounded-xl border border-blue-100 font-semibold">
                    {selectedFinding.reasoning.applicableRule}
                  </div>
                </div>

                {/* 3. Evidence (source + version) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    3. Grounded Evidence Source
                  </span>
                  {selectedFinding.reasoning.evidence ? (
                    <div
                      className={`p-2.5 rounded-xl border text-xs ${
                        selectedFinding.reasoning.evidence.isExpired
                          ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : selectedFinding.reasoning.evidence.hasConflict
                          ? 'bg-amber-50 border-amber-300 text-amber-900'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{selectedFinding.reasoning.evidence.sourceTitle}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/70">
                          {selectedFinding.reasoning.evidence.version}
                        </span>
                      </div>
                      <div className="text-[11px] mt-0.5 text-slate-600">
                        Source Ref ID: {selectedFinding.reasoning.evidence.sourceId}
                      </div>

                      {/* Expired warning */}
                      {selectedFinding.reasoning.evidence.isExpired && (
                        <div className="mt-1.5 text-[11px] font-bold text-red-700 bg-red-100 p-1.5 rounded flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>EXPIRED SOURCE: Excluded from publication claims.</span>
                        </div>
                      )}

                      {/* Conflict warning */}
                      {selectedFinding.reasoning.evidence.hasConflict && (
                        <div className="mt-1.5 text-[11px] font-semibold text-amber-800 bg-amber-100 p-1.5 rounded">
                          {selectedFinding.reasoning.evidence.conflictNote}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-800">
                      <span className="font-semibold">No approved evidence on file.</span>
                      <p className="text-[11px] mt-0.5 italic">
                        "Missing evidence is not proof the claim is false."
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Explanation */}
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    4. Governance Explanation
                  </span>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {selectedFinding.reasoning.explanation}
                  </p>
                </div>

                {/* 5. Suggested Correction Diff (minimal change) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    5. Suggested Minimal-Change Correction
                  </span>
                  <DiffViewer
                    original={selectedFinding.targetText}
                    suggested={selectedFinding.reasoning.suggestedCorrection}
                  />
                </div>

                {/* 6. Human Decision Chain */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-navy-900 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-navy-800" />
                      6. Human Decision Record (Required)
                    </span>
                    {selectedFinding.humanDecision && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Decided: {selectedFinding.humanDecision.status}
                      </span>
                    )}
                  </div>

                  {selectedFinding.humanDecision ? (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                        <span>By {selectedFinding.humanDecision.decidedBy} ({selectedFinding.humanDecision.role})</span>
                        <span className="text-slate-400">{selectedFinding.humanDecision.timestamp}</span>
                      </div>
                      <p className="text-slate-800 italic text-xs">
                        "{selectedFinding.humanDecision.reason}"
                      </p>
                      {selectedFinding.humanDecision.customReplacement && (
                        <p className="text-emerald-700 font-semibold text-[11px]">
                          Custom Replacement: "{selectedFinding.humanDecision.customReplacement}"
                        </p>
                      )}
                      <button
                        onClick={() => {
                          setDecisionReason(selectedFinding.humanDecision?.reason || '');
                          selectedFinding.humanDecision = undefined;
                        }}
                        className="text-[11px] text-blue-600 hover:underline pt-1 block"
                      >
                        Change this decision
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {/* Reason input (Mandatory) */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Recorded Justification <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={decisionReason}
                          onChange={(e) => setDecisionReason(e.target.value)}
                          placeholder="e.g. Approved rebrand replacement per Q1 Brand Kit."
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-none"
                        />
                      </div>

                      {/* Custom correction toggle */}
                      {showEditInput && (
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Custom Replacement Text
                          </label>
                          <input
                            type="text"
                            value={customCorrection}
                            onChange={(e) => setCustomCorrection(e.target.value)}
                            placeholder={selectedFinding.reasoning.suggestedCorrection}
                            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Decision buttons */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          onClick={() => handleDecision('accepted')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-lg text-xs shadow-sm transition-colors flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Accept Fix
                        </button>

                        <button
                          onClick={() => {
                            setShowEditInput(!showEditInput);
                            if (showEditInput && customCorrection) {
                              handleDecision('edited');
                            }
                          }}
                          className="bg-navy-800 hover:bg-navy-900 text-white font-bold py-1.5 px-2 rounded-lg text-xs shadow-sm transition-colors flex items-center justify-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> {showEditInput ? 'Save Custom' : 'Edit Fix'}
                        </button>

                        <button
                          onClick={() => handleDecision('disputed')}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-1.5 px-2 rounded-lg text-xs transition-colors"
                        >
                          Dispute Finding
                        </button>

                        <button
                          onClick={() => handleDecision('escalated')}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-1.5 px-2 rounded-lg text-xs transition-colors border border-amber-300"
                        >
                          Escalate to Legal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-navy-900">All findings reviewed</p>
              <p className="text-xs text-slate-500">Draft is clean or all corrections applied.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
