export type Role = 'creator' | 'brand_manager' | 'legal';

export interface UserRole {
  id: Role;
  name: string;
  title: string;
  avatar: string;
  badge: string;
}

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export type FindingStatus = 'open' | 'accepted' | 'edited' | 'evidence_provided' | 'disputed' | 'escalated';

export interface Finding {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: Severity;
  confidence: number; // e.g. 96 (%)
  origin: 'Deterministic rule' | 'AI-assisted';
  targetText: string;
  startIndex: number;
  endIndex: number;
  reasoning: {
    originalClaim: string;
    applicableRule: string;
    evidence: {
      sourceId: string;
      sourceTitle: string;
      version: string;
      isExpired?: boolean;
      hasConflict?: boolean;
      conflictNote?: string;
    } | null;
    explanation: string;
    suggestedCorrection: string;
  };
  humanDecision?: {
    status: FindingStatus;
    reason: string;
    decidedBy: string;
    role: Role;
    timestamp: string;
    customReplacement?: string;
  };
}

export type SubmissionStatus = 'Draft' | 'In review' | 'Needs evidence' | 'Approved' | 'Reopened';

export interface Submission {
  id: string;
  title: string;
  brand: string;
  channel: 'LinkedIn' | 'Website' | 'Email' | 'Press' | 'Twitter/X';
  market: 'US' | 'EU' | 'India' | 'Global';
  content: string;
  initialContentHash: string;
  approvedContentHash?: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
  submittedBy: string;
  findings: Finding[];
  readinessScore: number; // 0 - 100
  readinessStatus: 'Blocked' | 'Needs human review' | 'Ready to publish';
  approvedBy?: string;
  approvalRole?: Role;
  approvedAt?: string;
  reopenReason?: string;
}

export interface BrandRule {
  id: string;
  category: 'Terminology' | 'Superlatives & Claims' | 'Tone & Voice' | 'Regional & Legal' | 'Accessibility';
  name: string;
  description: string;
  patternSummary: string;
  severity: Severity;
  owner: string;
  version: string; // e.g. v2.1
  effectiveDate: string;
  expiryDate?: string;
  status: 'Active' | 'Expiring' | 'Expired';
  changeLog?: string;
}

export interface ApprovedFactSource {
  id: string;
  fact: string;
  sourceTitle: string;
  sourceRef: string;
  owner: string;
  version: string;
  effectiveDate: string;
  expiryDate: string;
  status: 'Active' | 'Expiring' | 'Expired';
  conflictWithId?: string;
  conflictReason?: string;
}

export interface TerminologyItem {
  id: string;
  forbidden: string;
  preferred: string;
  category: string;
  rationale: string;
  version: string;
}

export interface AuditEvent {
  id: string;
  submissionId: string;
  submissionTitle: string;
  actor: string;
  role: Role;
  action: string;
  reason: string;
  timestamp: string;
  contentVersionHash: string;
}

export interface GuidedStep {
  step: number;
  title: string;
  targetView: string;
  instruction: string;
  actionHint: string;
}
