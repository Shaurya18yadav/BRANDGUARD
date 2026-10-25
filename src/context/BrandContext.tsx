import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  UserRole,
  BrandRule,
  ApprovedFactSource,
  TerminologyItem,
  Submission,
  AuditEvent,
  Finding,
  FindingStatus,
} from '../types';
import {
  DEMO_ROLES,
  SEED_RULES,
  SEED_FACTS,
  SEED_TERMINOLOGY,
  SEED_SUBMISSIONS,
  SEED_AUDIT_LOGS,
  SAMPLE_DRAFTS,
} from '../data/seedData';
import { runDeterministicReview, computeReadiness } from '../services/rulesEngine';
import { runContextualReviewWithAI } from '../services/geminiService';

// Hash helper for version binding
export function computeContentHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sha256-${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

interface BrandContextType {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  currentUser: UserRole;
  rules: BrandRule[];
  facts: ApprovedFactSource[];
  terminology: TerminologyItem[];
  submissions: Submission[];
  activeSubmission: Submission | null;
  setActiveSubmissionId: (id: string) => void;
  auditLogs: AuditEvent[];
  // Guided tour
  tourStep: number | null;
  startGuidedTour: () => void;
  nextTourStep: () => void;
  endGuidedTour: () => void;
  // Actions
  createNewSubmission: (draft: {
    title: string;
    brand: string;
    channel: any;
    market: any;
    content: string;
  }) => Submission;
  runReviewOnSubmission: (submissionId: string) => Promise<void>;
  updateDraftContent: (submissionId: string, newContent: string) => void;
  updateFindingDecision: (
    submissionId: string,
    findingId: string,
    decision: FindingStatus,
    reason: string,
    customReplacement?: string
  ) => void;
  applyAllAcceptedFixes: (submissionId: string) => void;
  approveSubmission: (submissionId: string, reason: string) => void;
  rejectSubmission: (submissionId: string, reason: string) => void;
  // Knowledge Base versioning
  addRuleVersion: (ruleId: string, updatedFields: Partial<BrandRule>, changeSummary: string) => void;
  addFact: (fact: Omit<ApprovedFactSource, 'id' | 'status'>) => void;
  addTerminology: (item: Omit<TerminologyItem, 'id' | 'version'>) => void;
  resetDemoData: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state or use seed data
  const [currentRoleId, setCurrentRoleId] = useState<Role>(() => {
    return (localStorage.getItem('bg_current_role') as Role) || 'brand_manager';
  });

  const [rules, setRules] = useState<BrandRule[]>(() => {
    const saved = localStorage.getItem('bg_rules');
    return saved ? JSON.parse(saved) : SEED_RULES;
  });

  const [facts, setFacts] = useState<ApprovedFactSource[]>(() => {
    const saved = localStorage.getItem('bg_facts');
    return saved ? JSON.parse(saved) : SEED_FACTS;
  });

  const [terminology, setTerminology] = useState<TerminologyItem[]>(() => {
    const saved = localStorage.getItem('bg_terminology');
    return saved ? JSON.parse(saved) : SEED_TERMINOLOGY;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('bg_submissions');
    if (saved) return JSON.parse(saved);
    // Initialize initial submissions with findings
    return SEED_SUBMISSIONS.map((sub) => {
      const initialFindings = runDeterministicReview(sub.content, SEED_RULES, SEED_FACTS, SEED_TERMINOLOGY, sub.market, sub.channel);
      const readiness = computeReadiness(initialFindings);
      return {
        ...sub,
        findings: initialFindings,
        readinessScore: readiness.score,
        readinessStatus: readiness.status,
      };
    });
  });

  const [activeSubmissionId, setActiveSubmissionId] = useState<string>('SUB-DEMO-001');
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(() => {
    const saved = localStorage.getItem('bg_audit_logs');
    return saved ? JSON.parse(saved) : SEED_AUDIT_LOGS;
  });

  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('bg_gemini_key') || '');
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('bg_current_role', currentRoleId);
    localStorage.setItem('bg_rules', JSON.stringify(rules));
    localStorage.setItem('bg_facts', JSON.stringify(facts));
    localStorage.setItem('bg_terminology', JSON.stringify(terminology));
    localStorage.setItem('bg_submissions', JSON.stringify(submissions));
    localStorage.setItem('bg_audit_logs', JSON.stringify(auditLogs));
    localStorage.setItem('bg_gemini_key', apiKey);
  }, [currentRoleId, rules, facts, terminology, submissions, auditLogs, apiKey]);

  const currentUser = DEMO_ROLES.find((r) => r.id === currentRoleId) || DEMO_ROLES[0];
  const activeSubmission = submissions.find((s) => s.id === activeSubmissionId) || submissions[0] || null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const addAuditLog = (
    submissionId: string,
    submissionTitle: string,
    action: string,
    reason: string,
    contentHash: string
  ) => {
    const newLog: AuditEvent = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      submissionId,
      submissionTitle,
      actor: currentUser.name,
      role: currentRoleId,
      action,
      reason,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      contentVersionHash: contentHash,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Content change handler: VERSION-BOUND APPROVAL RESET
  const updateDraftContent = (submissionId: string, newContent: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== submissionId) return sub;

        const newHash = computeContentHash(newContent);
        let updatedStatus = sub.status;
        let reopenReason = sub.reopenReason;

        // CRITICAL UNIQUENESS FEATURE: If draft was Approved and is edited -> Reset to Reopened!
        if (sub.status === 'Approved' && sub.approvedContentHash && sub.approvedContentHash !== newHash) {
          updatedStatus = 'Reopened';
          reopenReason = `Approval invalidated: Material text modification detected after sign-off (hash ${sub.approvedContentHash.slice(0, 12)}... ≠ ${newHash.slice(0, 12)}...).`;
          
          addAuditLog(
            sub.id,
            sub.title,
            'REOPENED_VERSION_HASH_MISMATCH',
            `Approved text was altered post-approval. Seal broken; returned to review queue.`,
            newHash
          );
          showToast('⚠️ Approval Reset: Draft was edited post-approval. Reopened for legal review.');
        }

        // Re-evaluate deterministic findings
        const refreshedFindings = runDeterministicReview(newContent, rules, facts, terminology, sub.market, sub.channel);
        const readiness = computeReadiness(refreshedFindings);

        return {
          ...sub,
          content: newContent,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: updatedStatus,
          reopenReason,
          findings: refreshedFindings,
          readinessScore: readiness.score,
          readinessStatus: readiness.status,
        };
      })
    );
  };

  // Run review action
  const runReviewOnSubmission = async (submissionId: string) => {
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return;

    // 1. Run deterministic review
    const deterministicFindings = runDeterministicReview(
      sub.content,
      rules,
      facts,
      terminology,
      sub.market,
      sub.channel
    );

    // 2. Try Gemini / AI review if available
    let aiFindings: Finding[] = [];
    if (apiKey) {
      aiFindings = await runContextualReviewWithAI(
        sub.content,
        rules,
        facts,
        terminology,
        sub.market,
        sub.channel,
        apiKey
      );
    }

    // Merge findings, avoiding duplicates on same target span
    const allFindings = [...deterministicFindings];
    for (const af of aiFindings) {
      const alreadyCovered = allFindings.some(
        (df) => Math.abs(df.startIndex - af.startIndex) < 5 || df.targetText.includes(af.targetText)
      );
      if (!alreadyCovered) {
        allFindings.push(af);
      }
    }

    const readiness = computeReadiness(allFindings);

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              findings: allFindings,
              readinessScore: readiness.score,
              readinessStatus: readiness.status,
              status: s.status === 'Draft' ? 'In review' : s.status,
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : s
      )
    );

    addAuditLog(
      sub.id,
      sub.title,
      'RUN_GOVERNANCE_REVIEW',
      `Identified ${allFindings.length} findings (${deterministicFindings.length} deterministic, ${aiFindings.length} AI-assisted). Readiness: ${readiness.score}% (${readiness.status}).`,
      computeContentHash(sub.content)
    );

    showToast(`Governance Review Complete: ${allFindings.length} findings detected.`);
  };

  // Human decision on a finding
  const updateFindingDecision = (
    submissionId: string,
    findingId: string,
    decision: FindingStatus,
    reason: string,
    customReplacement?: string
  ) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== submissionId) return sub;

        const updatedFindings = sub.findings.map((f) => {
          if (f.id !== findingId) return f;
          return {
            ...f,
            humanDecision: {
              status: decision,
              reason,
              decidedBy: currentUser.name,
              role: currentRoleId,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
              customReplacement,
            },
          };
        });

        const readiness = computeReadiness(updatedFindings);

        return {
          ...sub,
          findings: updatedFindings,
          readinessScore: readiness.score,
          readinessStatus: readiness.status,
        };
      })
    );

    const sub = submissions.find((s) => s.id === submissionId);
    if (sub) {
      addAuditLog(
        sub.id,
        sub.title,
        `FINDING_${decision.toUpperCase()}`,
        `Finding ${findingId} marked "${decision}": ${reason}`,
        computeContentHash(sub.content)
      );
    }
    showToast(`Finding marked as ${decision}.`);
  };

  // Apply all accepted corrections
  const applyAllAcceptedFixes = (submissionId: string) => {
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return;

    let updatedText = sub.content;
    const acceptedFindings = sub.findings
      .filter((f) => f.humanDecision?.status === 'accepted')
      .sort((a, b) => b.startIndex - a.startIndex); // replace from back to front to preserve offsets

    if (acceptedFindings.length === 0) {
      showToast('No accepted findings to apply. Accept findings first!');
      return;
    }

    acceptedFindings.forEach((f) => {
      const fix = f.humanDecision?.customReplacement || f.reasoning.suggestedCorrection;
      if (f.startIndex >= 0 && f.endIndex <= updatedText.length) {
        updatedText =
          updatedText.substring(0, f.startIndex) + fix + updatedText.substring(f.endIndex);
      } else {
        // Fallback exact replace
        updatedText = updatedText.replace(f.targetText, fix);
      }
    });

    updateDraftContent(submissionId, updatedText);

    addAuditLog(
      sub.id,
      sub.title,
      'APPLIED_ACCEPTED_CORRECTIONS',
      `Applied ${acceptedFindings.length} minimal-change corrections to draft.`,
      computeContentHash(updatedText)
    );

    showToast(`Applied ${acceptedFindings.length} accepted corrections.`);
  };

  // Approve submission (requires Legal or Brand Manager)
  const approveSubmission = (submissionId: string, reason: string) => {
    if (currentRoleId === 'creator') {
      showToast('Permission Denied: Only Legal / Compliance or Brand Managers can grant publication approval.');
      return;
    }

    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return;

    const hash = computeContentHash(sub.content);

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status: 'Approved',
              approvedBy: currentUser.name,
              approvalRole: currentRoleId,
              approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              approvedContentHash: hash,
              reopenReason: undefined,
              readinessScore: 100,
              readinessStatus: 'Ready to publish',
            }
          : s
      )
    );

    addAuditLog(
      sub.id,
      sub.title,
      'APPROVED_FOR_PUBLICATION',
      `Version-bound approval granted by ${currentUser.name} (${currentRoleId}). Sealed with hash: ${hash}. Reason: ${reason}`,
      hash
    );

    showToast(`Publication Approved! Sealed with hash ${hash.slice(0, 10)}.`);
  };

  // Reject submission
  const rejectSubmission = (submissionId: string, reason: string) => {
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return;

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status: 'Needs evidence',
              reopenReason: `Rejected by ${currentUser.name}: ${reason}`,
            }
          : s
      )
    );

    addAuditLog(
      sub.id,
      sub.title,
      'REJECTED_NEEDS_EVIDENCE',
      `Submission rejected by ${currentUser.name}: ${reason}`,
      computeContentHash(sub.content)
    );

    showToast(`Submission rejected and marked "Needs evidence".`);
  };

  // Knowledge base versioning: Never overwrite, increment version
  const addRuleVersion = (ruleId: string, updatedFields: Partial<BrandRule>, changeSummary: string) => {
    if (currentRoleId === 'creator') {
      showToast('Permission Denied: Creators cannot edit brand rules.');
      return;
    }

    setRules((prev) =>
      prev.map((r) => {
        if (r.id !== ruleId) return r;

        // Parse version e.g. v2.1 -> v2.2
        const versionMatch = r.version.match(/v(\d+)\.?(\d*)/);
        let newVersion = 'v2.0';
        if (versionMatch) {
          const major = parseInt(versionMatch[1], 10);
          const minor = versionMatch[2] ? parseInt(versionMatch[2], 10) + 1 : 1;
          newVersion = `v${major}.${minor}`;
        }

        const updated: BrandRule = {
          ...r,
          ...updatedFields,
          version: newVersion,
          owner: `${currentUser.name} (${currentUser.title})`,
          changeLog: `[${new Date().toISOString().substring(0, 10)}] ${changeSummary} (incremented from ${r.version} to ${newVersion})`,
        };

        return updated;
      })
    );

    addAuditLog(
      'KB-RULES',
      `Rule ${ruleId}`,
      'INCREMENTED_RULE_VERSION',
      `Updated rule ${ruleId}: ${changeSummary}`,
      'kb-version-hash'
    );

    showToast(`Rule updated to new version.`);
  };

  const addFact = (fact: Omit<ApprovedFactSource, 'id' | 'status'>) => {
    const newFact: ApprovedFactSource = {
      ...fact,
      id: `FACT-00${facts.length + 1}`,
      status: new Date(fact.expiryDate) < new Date() ? 'Expired' : 'Active',
    };
    setFacts((prev) => [newFact, ...prev]);
    showToast('Approved Fact & Evidence added to Knowledge Base.');
  };

  const addTerminology = (item: Omit<TerminologyItem, 'id' | 'version'>) => {
    const newItem: TerminologyItem = {
      ...item,
      id: `TERM-00${terminology.length + 1}`,
      version: 'v1.0',
    };
    setTerminology((prev) => [newItem, ...prev]);
    showToast('Terminology entry created.');
  };

  const createNewSubmission = (draft: {
    title: string;
    brand: string;
    channel: any;
    market: any;
    content: string;
  }): Submission => {
    const id = `SUB-${Date.now().toString().slice(-4)}`;
    const hash = computeContentHash(draft.content);
    const initialFindings = runDeterministicReview(draft.content, rules, facts, terminology, draft.market, draft.channel);
    const readiness = computeReadiness(initialFindings);

    const newSub: Submission = {
      id,
      title: draft.title || 'Untitled Draft',
      brand: draft.brand || 'Nimbus Analytics',
      channel: draft.channel || 'LinkedIn',
      market: draft.market || 'US',
      content: draft.content,
      initialContentHash: hash,
      status: 'In review',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      submittedBy: currentUser.name,
      findings: initialFindings,
      readinessScore: readiness.score,
      readinessStatus: readiness.status,
    };

    setSubmissions((prev) => [newSub, ...prev]);
    setActiveSubmissionId(newSub.id);

    addAuditLog(
      newSub.id,
      newSub.title,
      'CREATED_SUBMISSION',
      `New submission created for channel ${draft.channel}, market ${draft.market}. Initial score: ${readiness.score}%.`,
      hash
    );

    showToast('New draft submitted for governance review.');
    return newSub;
  };

  const resetDemoData = () => {
    localStorage.clear();
    setRules(SEED_RULES);
    setFacts(SEED_FACTS);
    setTerminology(SEED_TERMINOLOGY);
    const freshSubs = SEED_SUBMISSIONS.map((sub) => {
      const initialFindings = runDeterministicReview(sub.content, SEED_RULES, SEED_FACTS, SEED_TERMINOLOGY, sub.market, sub.channel);
      const readiness = computeReadiness(initialFindings);
      return {
        ...sub,
        findings: initialFindings,
        readinessScore: readiness.score,
        readinessStatus: readiness.status,
      };
    });
    setSubmissions(freshSubs);
    setActiveSubmissionId('SUB-DEMO-001');
    setAuditLogs(SEED_AUDIT_LOGS);
    setCurrentRoleId('brand_manager');
    setTourStep(null);
    showToast('All demo data reset to pristine state!');
  };

  const startGuidedTour = () => {
    setActiveSubmissionId('SUB-DEMO-001');
    setTourStep(1);
  };

  const nextTourStep = () => {
    if (tourStep !== null) {
      if (tourStep >= 6) {
        setTourStep(null);
        showToast('Guided Tour completed! Feel free to explore freely.');
      } else {
        setTourStep(tourStep + 1);
      }
    }
  };

  const endGuidedTour = () => setTourStep(null);

  return (
    <BrandContext.Provider
      value={{
        currentRole: currentRoleId,
        setCurrentRole: setCurrentRoleId,
        currentUser,
        rules,
        facts,
        terminology,
        submissions,
        activeSubmission,
        setActiveSubmissionId,
        auditLogs,
        tourStep,
        startGuidedTour,
        nextTourStep,
        endGuidedTour,
        createNewSubmission,
        runReviewOnSubmission,
        updateDraftContent,
        updateFindingDecision,
        applyAllAcceptedFixes,
        approveSubmission,
        rejectSubmission,
        addRuleVersion,
        addFact,
        addTerminology,
        resetDemoData,
        apiKey,
        setApiKey,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) throw new Error('useBrand must be used within BrandProvider');
  return context;
};
