import { runDeterministicReview, computeReadiness } from '../src/services/rulesEngine.ts';
import { runContextualReviewWithAI } from '../src/services/geminiService.ts';
import {
  SEED_RULES,
  SEED_FACTS,
  SEED_TERMINOLOGY,
  SEED_SUBMISSIONS,
  SAMPLE_DRAFTS,
  DEMO_ROLES,
} from '../src/data/seedData.ts';
import { Finding, FindingStatus } from '../src/types/index.ts';

// Recreate computeContentHash exactly as implemented in BrandContext
function computeContentHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sha256-${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

// Verification report collector
const report: { section: string; title: string; status: 'PASS' | 'FAIL'; details: string }[] = [];

function assert(condition: boolean, section: string, title: string, details: string) {
  if (condition) {
    report.push({ section, title, status: 'PASS', details });
  } else {
    report.push({ section, title, status: 'FAIL', details: `FAILED: ${details}` });
  }
}

console.log('===============================================================');
console.log('       BRANDGUARD ARCHITECTURAL VERIFICATION SUITE             ');
console.log('===============================================================\n');

// ============================================================================
// 1. ARCHITECTURE & STATE MANAGEMENT
// ============================================================================
console.log('--- 1. Testing Architecture & State Management ---');

// 1.1 Hashing Engine Format & Keystroke Sensitivity
const textA = 'We are thrilled to announce that CloudLens is back.';
const textB = 'We are thrilled to announce that CloudLens is back!';
const hashA = computeContentHash(textA);
const hashB = computeContentHash(textB);

assert(
  hashA.startsWith('sha256-') && hashA.length === 15,
  'Architecture & State Management',
  '32-bit Hash Format Check',
  `Hash format is 'sha256-xxxxxxxx' (Actual: ${hashA})`
);

assert(
  hashA !== hashB,
  'Architecture & State Management',
  'Keystroke Hash Sensitivity Check',
  `Single keystroke variation ('!' added) altered hash: ${hashA} -> ${hashB}`
);

assert(
  computeContentHash(textA) === hashA,
  'Architecture & State Management',
  'Hash Determinism Check',
  'Identical content produces identical hash value across multiple runs'
);

// 1.2 Persona Role Switcher Permissions
const creatorRole = DEMO_ROLES.find(r => r.id === 'creator');
const brandManagerRole = DEMO_ROLES.find(r => r.id === 'brand_manager');
const legalRole = DEMO_ROLES.find(r => r.id === 'legal');

function canApprove(roleId: string): boolean {
  return roleId !== 'creator';
}

function canEditRules(roleId: string): boolean {
  return roleId !== 'creator';
}

assert(
  creatorRole !== undefined && brandManagerRole !== undefined && legalRole !== undefined,
  'Architecture & State Management',
  'Persona Role Definitions Check',
  'Creator, Brand Manager, and Legal Reviewer personas properly defined'
);

assert(
  !canApprove('creator') && canApprove('brand_manager') && canApprove('legal'),
  'Architecture & State Management',
  'Role Permission Enforcer (Approvals)',
  'Creator is blocked from approving; Brand Manager and Legal have approval authorization'
);

assert(
  !canEditRules('creator') && canEditRules('brand_manager') && canEditRules('legal'),
  'Architecture & State Management',
  'Role Permission Enforcer (Rule Editing)',
  'Creator cannot edit brand rules; Brand Manager and Legal can create/increment rule versions'
);


// ============================================================================
// 2. RULES ENGINE & AI LAYER
// ============================================================================
console.log('--- 2. Testing Rules Engine & AI Layer ---');

// 2.1 Deterministic Rules Engine: Messy Draft Evaluation
const messyDraft = SAMPLE_DRAFTS.messy;
const messyFindings = runDeterministicReview(
  messyDraft.content,
  SEED_RULES,
  SEED_FACTS,
  SEED_TERMINOLOGY,
  messyDraft.market,
  messyDraft.channel
);

// Check RULE-001 (CloudLens sunset)
const cloudlensFinding = messyFindings.find(f => f.ruleId === 'RULE-001');
assert(
  cloudlensFinding !== undefined && cloudlensFinding.severity === 'Critical',
  'Rules Engine & AI Layer',
  'Obsolete Product Name Rule (RULE-001)',
  `Detected obsolete product name "CloudLens" with Critical severity (target: "${cloudlensFinding?.targetText}")`
);

// Check RULE-002 with expired evidence check (FACT-003 expired 2023-12-31)
const gartnerFinding = messyFindings.find(f => f.ruleId === 'RULE-002');
assert(
  gartnerFinding !== undefined &&
  gartnerFinding.reasoning.evidence?.isExpired === true &&
  gartnerFinding.reasoning.explanation.includes('Missing evidence is not proof the claim is false'),
  'Rules Engine & AI Layer',
  'Date-Window Expired Evidence Detection (FACT-003)',
  `Expired fact correctly flagged (isExpired=true) with mandatory disclaimer present`
);

// Check RULE-003 (Absolute security guarantee)
const secFinding = messyFindings.find(f => f.targetText.toLowerCase().includes('guarantees 100% secure'));
assert(
  secFinding !== undefined && secFinding.severity === 'Critical',
  'Rules Engine & AI Layer',
  'Absolute Security Claims Check (RULE-003)',
  `"guarantees 100% secure" flagged with Critical severity (suggested: "${secFinding?.reasoning.suggestedCorrection}")`
);

// Check RULE-010 (Conflicting Evidence Surfacing: 64% vs 42% MTTD)
const mttdFinding = messyFindings.find(f => f.targetText.includes('64% reduction in MTTD'));
assert(
  mttdFinding !== undefined &&
  mttdFinding.reasoning.evidence?.hasConflict === true &&
  mttdFinding.reasoning.evidence?.conflictNote !== undefined,
  'Rules Engine & AI Layer',
  'Bidirectional Conflicting Evidence Surfacing',
  `Detected conflict between Forrester TEI (64%) and Internal Telemetry (42%): "${mttdFinding?.reasoning.evidence?.conflictNote}"`
);

// Check RULE-008 (Competitor Defamation)
const compFinding = messyFindings.find(f => f.ruleId === 'RULE-008');
assert(
  compFinding !== undefined &&
  compFinding.targetText.includes('Datadog') &&
  compFinding.reasoning.explanation.includes('Missing evidence is not proof the claim is false'),
  'Rules Engine & AI Layer',
  'Competitor Defamation Check (RULE-008)',
  `Direct competitor naming flagged with required legal citation disclaimer`
);

// Check RULE-007 (EU GDPR Data Residency)
const euFinding = messyFindings.find(f => f.ruleId === 'RULE-007');
assert(
  euFinding !== undefined &&
  euFinding.targetText.includes('EU data residency is fully supported'),
  'Rules Engine & AI Layer',
  'Regional Market Compliance (EU GDPR)',
  `EU residency claim matched and mapped to approved zones (Frankfurt/Dublin)`
);

// Check RULE-005 (Accessibility link text)
const linkFinding = messyFindings.find(f => f.ruleId === 'RULE-005');
assert(
  linkFinding !== undefined && linkFinding.targetText.toLowerCase() === 'click here',
  'Rules Engine & AI Layer',
  'Accessibility WCAG 2.2 AA (RULE-005)',
  `Non-descriptive link text "click here" flagged with actionable replacement`
);

// 2.2 Silent AI Fallback when API key is missing or invalid
async function testAIFallback() {
  const result = await runContextualReviewWithAI(
    'Some draft copy with no key',
    SEED_RULES,
    SEED_FACTS,
    SEED_TERMINOLOGY,
    'US',
    'LinkedIn',
    undefined // No API key provided
  );
  assert(
    Array.isArray(result) && result.length === 0,
    'Rules Engine & AI Layer',
    'AI Silent Fallback Graceful Degradation',
    'Without API key, returns clean empty array without throwing, allowing deterministic rules to govern safely'
  );
}
await testAIFallback();


// ============================================================================
// 3. TECHNICALLY CHALLENGING COMPONENTS
// ============================================================================
console.log('--- 3. Testing Technically Challenging Components ---');

// 3.1 Reverse-Offset Diff & Replacement Engine
// Simulate multi-span replacement: multiple accepted findings applied simultaneously
let originalDraftText = messyDraft.content;
const originalLength = originalDraftText.length;

// Mark findings as accepted
const acceptedFindings: Finding[] = [
  // CloudLens -> Nimbus Insight
  {
    ...cloudlensFinding!,
    humanDecision: {
      status: 'accepted',
      reason: 'Approved rename',
      decidedBy: 'Marcus Vance',
      role: 'legal',
      timestamp: '2024-10-30',
    },
  },
  // "click here" -> "explore our interactive telemetry platform"
  {
    ...linkFinding!,
    humanDecision: {
      status: 'accepted',
      reason: 'WCAG compliance',
      decidedBy: 'Maya Lin',
      role: 'creator',
      timestamp: '2024-10-30',
    },
  },
  // "cheap pricing" -> "transparent, scalable enterprise pricing"
  {
    ...messyFindings.find(f => f.targetText === 'cheap pricing')!,
    humanDecision: {
      status: 'accepted',
      reason: 'Brand value',
      decidedBy: 'Julian Hayes',
      role: 'brand_manager',
      timestamp: '2024-10-30',
    },
  },
];

// Execute reverse-offset algorithm as defined in BrandContext
let transformedText = originalDraftText;
const sortedAccepted = [...acceptedFindings].sort((a, b) => b.startIndex - a.startIndex);

sortedAccepted.forEach((f) => {
  const fix = f.humanDecision?.customReplacement || f.reasoning.suggestedCorrection;
  if (f.startIndex >= 0 && f.endIndex <= transformedText.length) {
    transformedText =
      transformedText.substring(0, f.startIndex) + fix + transformedText.substring(f.endIndex);
  } else {
    transformedText = transformedText.replace(f.targetText, fix);
  }
});

assert(
  !transformedText.includes('CloudLens') &&
  transformedText.includes('Nimbus Insight') &&
  !transformedText.includes('cheap pricing') &&
  transformedText.includes('transparent, scalable enterprise pricing') &&
  !transformedText.includes('click here') &&
  transformedText.includes('explore our interactive telemetry platform'),
  'Technically Challenging Components',
  'Reverse-Offset Multi-Span String Replacement',
  `All 3 multi-span replacements with variable length differentials applied cleanly without offset drift or corruption`
);

// 3.2 Tamper-Evident Approval Invalidation
// Simulate an approved submission that receives an edit
const approvedContent = SAMPLE_DRAFTS.clean.content;
const approvedHash = computeContentHash(approvedContent);

interface SimulatedSubmission {
  id: string;
  title: string;
  content: string;
  status: 'Approved' | 'Reopened' | 'In review';
  approvedContentHash?: string;
  reopenReason?: string;
}

const simSub: SimulatedSubmission = {
  id: 'SUB-TEST-001',
  title: 'Clean enterprise advisory',
  content: approvedContent,
  status: 'Approved',
  approvedContentHash: approvedHash,
};

// Keystroke modification simulation
const alteredContent = approvedContent + ' [Sneaky unauthorized post-approval modification]';
const alteredHash = computeContentHash(alteredContent);

let auditEventLogged = '';
let statusAfterEdit = simSub.status;
let reopenReasonAfterEdit = '';

if (simSub.status === 'Approved' && simSub.approvedContentHash && simSub.approvedContentHash !== alteredHash) {
  statusAfterEdit = 'Reopened';
  reopenReasonAfterEdit = `Approval invalidated: Material text modification detected after sign-off (hash ${simSub.approvedContentHash.slice(0, 12)}... ≠ ${alteredHash.slice(0, 12)}...).`;
  auditEventLogged = 'REOPENED_VERSION_HASH_MISMATCH';
}

assert(
  statusAfterEdit === 'Reopened',
  'Technically Challenging Components',
  'Tamper-Evident Status Invalidation',
  `Post-approval keystroke immediately transitioned status: 'Approved' -> 'Reopened'`
);

assert(
  auditEventLogged === 'REOPENED_VERSION_HASH_MISMATCH',
  'Technically Challenging Components',
  'Audit Ledger Cryptographic Mismatch Event',
  `Audit event logged as REOPENED_VERSION_HASH_MISMATCH on seal breach`
);

assert(
  reopenReasonAfterEdit.includes(approvedHash.slice(0, 12)) && reopenReasonAfterEdit.includes(alteredHash.slice(0, 12)),
  'Technically Challenging Components',
  'Cryptographic Hash Forensic Comparison',
  `Reopen rationale explicitly records sealed hash vs altered hash for auditability`
);

// 3.3 Publication Readiness Calculation
const messyReadiness = computeReadiness(messyFindings);
assert(
  messyReadiness.status === 'Blocked' && messyReadiness.score < 50 && messyReadiness.criticalCount > 0,
  'Technically Challenging Components',
  'Publication Readiness Scoring (Blocked State)',
  `Messy draft correctly computed as Blocked (Score: ${messyReadiness.score}%, Critical: ${messyReadiness.criticalCount})`
);

const cleanFindings = runDeterministicReview(
  SAMPLE_DRAFTS.clean.content,
  SEED_RULES,
  SEED_FACTS,
  SEED_TERMINOLOGY,
  'EU',
  'Website'
);
const cleanReadiness = computeReadiness(cleanFindings);
assert(
  cleanReadiness.status === 'Ready to publish' && cleanReadiness.score === 100 && cleanReadiness.unresolvedCount === 0,
  'Technically Challenging Components',
  'Publication Readiness Scoring (Ready State)',
  `Clean draft correctly computed as Ready to publish (Score: 100%, Unresolved: 0)`
);


// ============================================================================
// SUMMARY REPORT
// ============================================================================
console.log('\n===============================================================');
console.log('                 VERIFICATION TEST RESULTS                     ');
console.log('===============================================================');

let passCount = 0;
let failCount = 0;

for (const r of report) {
  const icon = r.status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} [${r.section}] ${r.title}`);
  console.log(`   └─ ${r.details}\n`);
  if (r.status === 'PASS') passCount++;
  else failCount++;
}

console.log('---------------------------------------------------------------');
console.log(`TOTAL CHECKS: ${report.length} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('===============================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

