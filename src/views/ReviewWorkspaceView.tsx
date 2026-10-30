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
  ChevronLeft,
  ChevronRight,
  Check,
  ShieldCheck,
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
  const [showApproveModal, setShowApproveModal] = useState<boolean>(false);
  const [approvalJustification, setApprovalJustification] = useState<string>(
    'Verified against Q4 Brand Guidelines and GDPR compliance documents.'
  );

  if (!activeSubmission) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-sm max-w-xl mx-auto my-12">
        <ShieldAlert className="w-14 h-14 text-slate-400 mx-auto mb-3" />
        <h3 className="text-xl font-heading font-extrabold text-navy-900">No active submission selected</h3>
        <p className="text-xs text-slate-500 mb-5">Select a submission from the Dashboard to begin review.</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="bg-[#14284B] hover:bg-navy-950 text-white text-xs px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all"
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

  // Quick preset reasons for effortless governance decisions
  const QUICK_REASONS = [
    'Approved rebrand per Q1 Brand Kit.',
    'Disputed: Direct executive quote in context.',
    'Escalated to legal: Requires regulatory counsel review.',
    'Accepted minimal correction per brand standards.',
  ];

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
          className={`${markClass} ${isSelected ? 'selected ring-2 ring-[#14284B] font-bold' : ''} ${
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
  const wordCount = activeSubmission.content.split(/\s+/).filter(Boolean).length;
  const charCount = activeSubmission.content.length;

  const currentFindingIndex = findings.findIndex((f) => f.id === selectedFinding?.id);

  const navigateFinding = (direction: 'prev' | 'next') => {
    if (findings.length === 0) return;
    let nextIndex = direction === 'next' ? currentFindingIndex + 1 : currentFindingIndex - 1;
    if (nextIndex >= findings.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = findings.length - 1;
    setSelectedFindingId(findings[nextIndex].id);
  };

  return (
    <div className="space-y-5 max-w-[1750px] mx-auto">
      {/* Top Banner if Reopened or Approved */}
      {activeSubmission.status === 'Reopened' && (
        <div className="bg-rose-50 border-2 border-rose-400 p-4.5 rounded-2xl flex items-start gap-3.5 shadow-md animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-extrabold text-rose-950 text-sm">
              Approval Invalidated: Material edit detected post-approval.
            </span>
            <p className="text-rose-800 mt-0.5">
              {activeSubmission.reopenReason ||
                'The content cryptographic hash no longer matches the signed approval seal. The approval was automatically revoked.'}
            </p>
          </div>
        </div>
      )}

      {activeSubmission.status === 'Approved' && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center gap-2.5 text-emerald-950">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="font-extrabold text-sm">
              Officially Approved for Publication by {activeSubmission.approvedBy} ({activeSubmission.approvalRole})
            </span>
            <span className="font-mono text-[11px] bg-emerald-100/80 px-2.5 py-0.5 rounded-lg text-emerald-800 font-bold border border-emerald-300/50">
              Seal: {activeSubmission.approvedContentHash?.slice(0, 16)}...
            </span>
          </div>
          <span className="text-emerald-700 font-bold">{activeSubmission.approvedAt}</span>
        </div>
      )}

      {/* Hero Workspace Header — Clean, Spacious & Authoritative */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="font-heading font-extrabold text-xl text-navy-900">{activeSubmission.title}</span>
            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-lg">
              {activeSubmission.channel}
            </span>
            <span className="bg-blue-50 text-blue-900 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-blue-200/60">
              {activeSubmission.market}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>By <strong className="text-slate-700">{activeSubmission.submittedBy}</strong></span>
            <span>•</span>
            <span>Last reviewed: {activeSubmission.updatedAt}</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400">
              Initial Hash: {activeSubmission.initialContentHash.slice(0, 12)}
            </span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {acceptedCount > 0 && (
            <button
              onClick={() => applyAllAcceptedFixes(activeSubmission.id)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all hover:-translate-y-0.5"
              id="btn-apply-fixes"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Apply All Accepted Corrections ({acceptedCount})</span>
            </button>
          )}

          <button
            onClick={handleRunFreshReview}
            disabled={isReviewing}
            className="flex items-center gap-1.5 bg-[#14284B] hover:bg-navy-950 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all disabled:opacity-50 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isReviewing ? 'animate-spin' : ''}`} />
            <span>{isReviewing ? 'Reviewing...' : 'Re-run Review'}</span>
          </button>

          {/* Publication Approval Action */}
          {currentRole !== 'creator' ? (
            <button
              onClick={() => setShowApproveModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#FFD60A] to-[#FBBF24] hover:from-[#ffe043] hover:to-[#fcd34d] text-[#14284B] font-extrabold text-xs px-4.5 py-2.5 rounded-xl shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
              id="btn-approve-draft"
            >
              <FileCheck className="w-4 h-4 fill-[#14284B]/20" />
              <span>Approve Draft (Sign Off)</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Creator View (Approval requires Brand Manager / Legal role)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Draft Content with Color Highlighted Spans */}
        <div className="lg:col-span-7 space-y-4">
          {/* Manuscript Sheet */}
          <div className="paper-sheet rounded-3xl overflow-hidden flex flex-col">
            {/* Document Header Bar */}
            <div className="p-4 bg-slate-50/90 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xs text-navy-900 uppercase tracking-wider">
                  Draft Content Inspection
                </span>
                <span className="text-[11px] text-slate-500">
                  (Click any highlight to focus its reasoning chain)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{charCount} chars</span>
              </div>
            </div>

            {/* Severity Legend Filter Bar */}
            <div className="px-4 py-2.5 bg-slate-100/60 border-b border-slate-200/60 flex items-center justify-between text-[11px] overflow-x-auto">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Findings Filter:</span>
                <button
                  onClick={() => setFilterSeverity('all')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    filterSeverity === 'all' ? 'bg-[#14284B] text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({findings.length})
                </button>
                <button
                  onClick={() => setFilterSeverity('critical')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-bold transition-all ${
                    filterSeverity === 'critical' ? 'bg-red-600 text-white' : 'text-red-700 hover:bg-red-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical
                </button>
                <button
                  onClick={() => setFilterSeverity('high')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-bold transition-all ${
                    filterSeverity === 'high' ? 'bg-orange-600 text-white' : 'text-orange-700 hover:bg-orange-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> High
                </button>
                <button
                  onClick={() => setFilterSeverity('medium')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-bold transition-all ${
                    filterSeverity === 'medium' ? 'bg-yellow-500 text-navy-950' : 'text-yellow-800 hover:bg-yellow-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Med
                </button>
              </div>

              {/* Prev / Next Nav */}
              {findings.length > 0 && (
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <span className="text-slate-500 text-[10px] mr-1">
                    {currentFindingIndex + 1} of {findings.length}
                  </span>
                  <button
                    onClick={() => navigateFinding('prev')}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600"
                    title="Previous finding"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => navigateFinding('next')}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600"
                    title="Next finding"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Document Body */}
            <div className="p-6 md:p-8 min-h-[380px] bg-white leading-relaxed select-text font-serif text-[15px]">
              {renderHighlightedContent()}
            </div>

            {/* Document Footer Bar */}
            <div className="p-3.5 bg-slate-50/90 border-t border-slate-200/90 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">{findings.length} total findings detected</span>
              <span className="italic text-[11px] text-slate-400 font-sans">
                "AI findings never grant publication permission."
              </span>
            </div>
          </div>

          {/* Readiness Meter for this Submission */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black text-navy-900 uppercase tracking-wider">
                  Publication Readiness Score:
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    activeSubmission.readinessStatus === 'Ready to publish'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : activeSubmission.readinessStatus === 'Blocked'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
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
        <div className="lg:col-span-5 space-y-3.5">
          {selectedFinding ? (
            <div className="bg-white rounded-3xl border-2 border-navy-900/15 shadow-xl overflow-hidden">
              {/* Finding Header */}
              <div className="p-5 bg-gradient-to-r from-navy-900 to-navy-800 text-white">
                <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    {/* SEVERITY BADGE */}
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider ${
                        selectedFinding.severity === 'Critical'
                          ? 'bg-red-500 text-white shadow-sm'
                          : selectedFinding.severity === 'High'
                          ? 'bg-orange-500 text-white shadow-sm'
                          : selectedFinding.severity === 'Medium'
                          ? 'bg-yellow-400 text-navy-950 shadow-sm'
                          : 'bg-blue-400 text-white shadow-sm'
                      }`}
                    >
                      Severity: {selectedFinding.severity}
                    </span>

                    {/* CONFIDENCE BADGE */}
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
                    <span className="text-[10px] font-black bg-amber-400 text-navy-950 px-2.5 py-0.5 rounded-md uppercase">
                      Escalated to Human
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-extrabold text-base leading-snug">
                  {selectedFinding.ruleName}
                </h3>
              </div>

              {/* Exact 6-Step Reasoning Chain */}
              <div className="p-5 space-y-4 text-xs max-h-[600px] overflow-y-auto">
                {/* 1. Original Claim */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    1. Original Claim
                  </span>
                  <div className="p-3 bg-slate-100 rounded-xl font-medium text-slate-900 border border-slate-200">
                    "{selectedFinding.reasoning.originalClaim}"
                  </div>
                </div>

                {/* 2. Applicable Rule */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    2. Applicable Rule
                  </span>
                  <div className="p-3 bg-blue-50/70 text-navy-900 rounded-xl border border-blue-100 font-bold">
                    {selectedFinding.reasoning.applicableRule}
                  </div>
                </div>

                {/* 3. Evidence (source + version) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    3. Grounded Evidence Source
                  </span>
                  {selectedFinding.reasoning.evidence ? (
                    <div
                      className={`p-3 rounded-xl border text-xs ${
                        selectedFinding.reasoning.evidence.isExpired
                          ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : selectedFinding.reasoning.evidence.hasConflict
                          ? 'bg-amber-50 border-amber-300 text-amber-900'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{selectedFinding.reasoning.evidence.sourceTitle}</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/70 font-bold">
                          {selectedFinding.reasoning.evidence.version}
                        </span>
                      </div>
                      <div className="text-[11px] mt-0.5 text-slate-600">
                        Source Ref ID: {selectedFinding.reasoning.evidence.sourceId}
                      </div>

                      {/* Expired warning */}
                      {selectedFinding.reasoning.evidence.isExpired && (
                        <div className="mt-2 text-[11px] font-bold text-red-700 bg-red-100 p-2 rounded-lg flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>EXPIRED SOURCE: Excluded from publication claims.</span>
                        </div>
                      )}

                      {/* Conflict warning */}
                      {selectedFinding.reasoning.evidence.hasConflict && (
                        <div className="mt-2 text-[11px] font-semibold text-amber-800 bg-amber-100 p-2 rounded-lg">
                          {selectedFinding.reasoning.evidence.conflictNote}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-800">
                      <span className="font-bold">No approved evidence on file.</span>
                      <p className="text-[11px] mt-0.5 italic">
                        "Missing evidence is not proof the claim is false."
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Explanation */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    4. Governance Explanation
                  </span>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {selectedFinding.reasoning.explanation}
                  </p>
                </div>

                {/* 5. Suggested Correction Diff (minimal change) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    5. Suggested Minimal-Change Correction
                  </span>
                  <DiffViewer
                    original={selectedFinding.targetText}
                    suggested={selectedFinding.reasoning.suggestedCorrection}
                  />
                </div>

                {/* 6. Human Decision Chain */}
                <div className="pt-3 border-t border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-navy-900 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-navy-800" />
                      6. Human Decision Record (Required)
                    </span>
                    {selectedFinding.humanDecision && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                        Decided: {selectedFinding.humanDecision.status}
                      </span>
                    )}
                  </div>

                  {selectedFinding.humanDecision ? (
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>By {selectedFinding.humanDecision.decidedBy} ({selectedFinding.humanDecision.role})</span>
                        <span className="text-slate-400">{selectedFinding.humanDecision.timestamp}</span>
                      </div>
                      <p className="text-slate-800 italic text-xs">
                        "{selectedFinding.humanDecision.reason}"
                      </p>
                      {selectedFinding.humanDecision.customReplacement && (
                        <p className="text-emerald-700 font-bold text-[11px]">
                          Custom Replacement: "{selectedFinding.humanDecision.customReplacement}"
                        </p>
                      )}
                      <button
                        onClick={() => {
                          setDecisionReason(selectedFinding.humanDecision?.reason || '');
                          selectedFinding.humanDecision = undefined;
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:underline pt-1 block"
                      >
                        Change this decision
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                      {/* 1-Click Reason Presets */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Quick Justification Presets:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_REASONS.map((reason, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setDecisionReason(reason)}
                              className="text-[10px] font-medium bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors text-left"
                            >
                              {reason}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reason input (Mandatory) */}
                      <div>
                        <label className="text-[11px] font-black text-slate-700 block mb-1">
                          Recorded Justification <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={decisionReason}
                          onChange={(e) => setDecisionReason(e.target.value)}
                          placeholder="e.g. Approved rebrand replacement per Q1 Brand Kit."
                          className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-900 focus:outline-none bg-white"
                        />
                      </div>

                      {/* Custom correction toggle */}
                      {showEditInput && (
                        <div>
                          <label className="text-[11px] font-black text-slate-700 block mb-1">
                            Custom Replacement Text
                          </label>
                          <input
                            type="text"
                            value={customCorrection}
                            onChange={(e) => setCustomCorrection(e.target.value)}
                            placeholder={selectedFinding.reasoning.suggestedCorrection}
                            className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-900 focus:outline-none bg-white"
                          />
                        </div>
                      )}

                      {/* Decision buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleDecision('accepted')}
                          className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold py-2 px-2.5 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
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
                          className="bg-navy-900 hover:bg-navy-950 active:scale-[0.98] text-white font-extrabold py-2 px-2.5 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> {showEditInput ? 'Save Custom' : 'Edit Fix'}
                        </button>

                        <button
                          onClick={() => handleDecision('disputed')}
                          className="bg-slate-200 hover:bg-slate-300 active:scale-[0.98] text-slate-800 font-bold py-2 px-2.5 rounded-xl text-xs transition-all"
                        >
                          Dispute Finding
                        </button>

                        <button
                          onClick={() => handleDecision('escalated')}
                          className="bg-amber-100 hover:bg-amber-200 active:scale-[0.98] text-amber-900 font-black py-2 px-2.5 rounded-xl text-xs transition-all border border-amber-300"
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
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/90 shadow-sm">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2.5" />
              <p className="text-base font-heading font-extrabold text-navy-900">All findings reviewed</p>
              <p className="text-xs text-slate-500 mt-1">Draft is clean or all corrections applied.</p>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-[#08101e]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-lg text-navy-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Sign Off & Cryptographically Seal Draft
              </h3>
              <button
                onClick={() => setShowApproveModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xl font-bold transition-colors"
              >
                &times;
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Applying this sign-off binds the exact content hash (sha256) into the immutable audit trail. Any future edits
              to this text will automatically revoke approval and trigger a re-review alert.
            </p>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Compliance Justification (Required for Audit Ledger)
              </label>
              <textarea
                rows={3}
                value={approvalJustification}
                onChange={(e) => setApprovalJustification(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-900 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (approvalJustification.trim()) {
                    approveSubmission(activeSubmission.id, approvalJustification.trim());
                    setShowApproveModal(false);
                  } else {
                    showToast('Justification is required for approval.');
                  }
                }}
                className="px-5 py-2.5 text-xs font-extrabold bg-gradient-to-r from-[#FFD60A] to-[#FBBF24] hover:from-[#ffe043] hover:to-[#fcd34d] text-[#14284B] rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                Sign Off & Bind Hash Seal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
