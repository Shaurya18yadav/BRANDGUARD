import React, { useState } from 'react';
import { useBrand, computeContentHash } from '../context/BrandContext';
import {
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Lock,
  Unlock,
  History,
  FileCode,
  FileCheck2,
  User,
  ArrowRight,
} from 'lucide-react';

export const ApprovalsAuditView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const {
    submissions,
    activeSubmission,
    setActiveSubmissionId,
    updateDraftContent,
    auditLogs,
    currentRole,
    currentUser,
    approveSubmission,
    showToast,
  } = useBrand();

  const [selectedSubId, setSelectedSubId] = useState<string>(
    activeSubmission?.status === 'Approved' ? activeSubmission.id : 'SUB-002'
  );

  const targetSub = submissions.find((s) => s.id === selectedSubId) || submissions[0];
  const currentHash = targetSub ? computeContentHash(targetSub.content) : '';
  const isApprovedAndSealed = targetSub?.status === 'Approved' && targetSub.approvedContentHash === currentHash;

  return (
    <div className="space-y-6">
      {/* Top Banner explaining Version-Bound Approvals */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-xl text-navy-900">
              Version-Bound Approvals & Forensic Audit Trail
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
              Tamper Evident
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            In BrandGuard, publication approval is bound cryptographically to the exact content hash. If a creator or
            marketer alters text post-approval, the seal is broken instantly, revoking approval and reopening the review
            cycle.
          </p>
        </div>

        {/* Quick select submission */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-bold text-slate-700">Inspect Draft:</label>
          <select
            value={selectedSubId}
            onChange={(e) => {
              setSelectedSubId(e.target.value);
              setActiveSubmissionId(e.target.value);
            }}
            className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium focus:outline-none"
          >
            {submissions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Interactive Invalidation Test Bench */}
      {targetSub && (
        <div className="bg-white rounded-2xl border-2 border-navy-900/10 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-navy-900">
                Live Verification Bench: {targetSub.title}
              </span>
              <span
                className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isApprovedAndSealed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : targetSub.status === 'Reopened'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {isApprovedAndSealed ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {isApprovedAndSealed ? 'Approved & Sealed' : targetSub.status}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                Live Hash: <strong className="text-slate-800">{currentHash.slice(0, 14)}...</strong>
              </span>
              {targetSub.approvedContentHash && (
                <span className="text-slate-500 font-mono text-[11px]">
                  • Sealed Hash: <strong className="text-emerald-700">{targetSub.approvedContentHash.slice(0, 14)}...</strong>
                </span>
              )}
            </div>
          </div>

          <div className="p-5 space-y-4">
            {targetSub.status === 'Reopened' && (
              <div className="bg-red-50 border-2 border-red-400 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-red-900 text-sm">
                    ⚠️ Seal Invalidation Triggered!
                  </span>
                  <p className="text-red-800 mt-0.5 font-medium">
                    {targetSub.reopenReason ||
                      'Material content change occurred post-approval. The approval seal has been invalidated and recorded in the audit ledger.'}
                  </p>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Interactive Live Content (Type below to test instant approval seal invalidation):
                </label>
                <span className="text-[11px] text-slate-400">
                  Try typing or deleting any character to observe the live reset
                </span>
              </div>
              <textarea
                rows={5}
                value={targetSub.content}
                onChange={(e) => updateDraftContent(targetSub.id, e.target.value)}
                className="w-full text-xs font-sans p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-900 focus:outline-none leading-relaxed"
                placeholder="Edit text to watch approval reset..."
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500">
                {targetSub.approvedBy && (
                  <span>
                    Approved by <strong>{targetSub.approvedBy}</strong> ({targetSub.approvalRole}) on{' '}
                    {targetSub.approvedAt}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {targetSub.status !== 'Approved' && (
                  <button
                    onClick={() => {
                      if (currentRole === 'creator') {
                        showToast('Switch to Legal Reviewer or Brand Manager to sign off.');
                        return;
                      }
                      approveSubmission(targetSub.id, 'Manual legal re-certification after audit review.');
                    }}
                    className="flex items-center gap-1.5 bg-[#FFD60A] hover:bg-[#ffe043] text-[#14284B] font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Re-Certify & Seal Approval</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveSubmissionId(targetSub.id);
                    onNavigate('workspace');
                  }}
                  className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm"
                >
                  <span>Open in Review Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forensic Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-base text-navy-900 flex items-center gap-2">
              <History className="w-4 h-4 text-navy-800" />
              Immutable Governance Audit Ledger
            </h2>
            <p className="text-xs text-slate-500">
              Timestamped cryptographic record of all submissions, human decisions, version bumps, and approvals.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            {auditLogs.length} Events Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor & Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Submission Context</th>
                <th className="py-3 px-4">Governance Reason / Justification</th>
                <th className="py-3 px-4">Cryptographic Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => {
                const isTamper = log.action.includes('REOPENED') || log.action.includes('MISMATCH');
                const isApproval = log.action.includes('APPROVED');

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-navy-900">{log.actor}</div>
                      <span className="text-[10px] text-slate-500 capitalize bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isApproval
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isTamper
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-800 font-medium">
                      {log.submissionTitle}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm">{log.reason}</td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                      {log.contentVersionHash.slice(0, 16)}...
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
