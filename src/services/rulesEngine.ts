import { Finding, BrandRule, ApprovedFactSource, TerminologyItem } from '../types';

export function runDeterministicReview(
  content: string,
  rules: BrandRule[],
  facts: ApprovedFactSource[],
  terminology: TerminologyItem[],
  market: string = 'US',
  channel: string = 'LinkedIn'
): Finding[] {
  const findings: Finding[] = [];
  const lowerContent = content.toLowerCase();

  // Helper to safely find span indices
  function addFinding(
    ruleId: string,
    targetText: string,
    startIndex: number,
    endIndex: number,
    severity: 'Critical' | 'High' | 'Medium' | 'Low',
    confidence: number,
    origin: 'Deterministic rule' | 'AI-assisted',
    originalClaim: string,
    applicableRule: string,
    evidence: {
      sourceId: string;
      sourceTitle: string;
      version: string;
      isExpired?: boolean;
      hasConflict?: boolean;
      conflictNote?: string;
    } | null,
    explanation: string,
    suggestedCorrection: string
  ) {
    findings.push({
      id: `FIND-${Date.now()}-${findings.length + 1}`,
      ruleId,
      ruleName: applicableRule,
      severity,
      confidence,
      origin,
      targetText,
      startIndex,
      endIndex,
      reasoning: {
        originalClaim,
        applicableRule,
        evidence,
        explanation,
        suggestedCorrection,
      },
    });
  }

  // 1. Obsolete Product Name (CloudLens -> Nimbus Insight)
  const cloudLensRegex = /\bCloudLens\b/gi;
  let match;
  while ((match = cloudLensRegex.exec(content)) !== null) {
    addFinding(
      'RULE-001',
      match[0],
      match.index,
      match.index + match[0].length,
      'Critical',
      99,
      'Deterministic rule',
      `"${match[0]}" used in public copy.`,
      'RULE-001: Obsolete Product Name (CloudLens Deprecation)',
      {
        sourceId: 'SRC-REBRAND-2024',
        sourceTitle: 'Nimbus Analytics Global Brand Guidelines & Naming Matrix',
        version: 'v2.0 (Active)',
      },
      'CloudLens was retired in Q1 2024 and superseded by "Nimbus Insight". Using legacy product branding causes severe market confusion and voids active enterprise warranties.',
      'Nimbus Insight'
    );
  }

  // 2. Superlatives / Gartner Badging (Expired evidence check!)
  const gartnerRegex = /(#1\s+Gartner[a-zA-Z-]*\s+observability\s+platform|#1\s+Gartner[^\.\,\!\n]*)/gi;
  while ((match = gartnerRegex.exec(content)) !== null) {
    const expiredFact = facts.find((f) => f.id === 'FACT-003');
    addFinding(
      'RULE-002',
      match[0],
      match.index,
      match.index + match[0].length,
      'High',
      95,
      'Deterministic rule',
      `Claiming "${match[0]}" without active certification.`,
      'RULE-002: Banned Unsubstantiated Superlatives & Expired Badges',
      expiredFact
        ? {
            sourceId: expiredFact.id,
            sourceTitle: expiredFact.sourceTitle,
            version: `${expiredFact.version} (EXPIRED: ${expiredFact.expiryDate})`,
            isExpired: true,
          }
        : null,
      'Evidence exists in repository but is EXPIRED (expired on 2023-12-31). FTC truth-in-advertising guidelines forbid using past customer-choice badging past the 12-month attribution window. Note: Missing evidence is not proof the claim is false, but publication requires re-certification.',
      'recognized enterprise observability platform'
    );
  }

  // 3. Absolute Security Guarantees ("guarantees 100% secure", "unhackable")
  const secRegex = /(guarantees?\s+100%\s+secure|unhackable|100%\s+security)/gi;
  while ((match = secRegex.exec(content)) !== null) {
    addFinding(
      'RULE-003',
      match[0],
      match.index,
      match.index + match[0].length,
      'Critical',
      98,
      'Deterministic rule',
      `Guaranteeing "${match[0]}".`,
      'RULE-003: Absolute Reliability & Security Claims',
      {
        sourceId: 'FACT-007',
        sourceTitle: 'Annual Independent Security Audit Report (SOC 2 Type II / ISO 27001)',
        version: 'v1.0 (Active)',
      },
      'Absolute claims of 100% security or invulnerability create catastrophic legal exposure and breach standard SaaS insurance covenants. Must describe defense-in-depth architecture instead.',
      'implements enterprise defense-in-depth security architecture'
    );
  }

  // 4. Absolute Downtime Claims ("zero downtime ever", "zero downtime forever")
  const downtimeRegex = /(zero\s+downtime\s+(ever|forever))/gi;
  while ((match = downtimeRegex.exec(content)) !== null) {
    const msaFact = facts.find((f) => f.id === 'FACT-002');
    addFinding(
      'RULE-003',
      match[0],
      match.index,
      match.index + match[0].length,
      'High',
      97,
      'Deterministic rule',
      `Promising "${match[0]}".`,
      'RULE-003: Absolute Reliability & Security Claims',
      msaFact
        ? {
            sourceId: msaFact.id,
            sourceTitle: msaFact.sourceTitle,
            version: `${msaFact.version} (Active)`,
          }
        : null,
      'Published SLA commitment in customer MSA is 99.95%, not 100% or absolute zero downtime. Promising zero downtime creates breach-of-contract liability.',
      'delivers 99.95% SLA uptime availability'
    );
  }

  // 5. Conflicting Evidence Surfacing (64% vs 42% MTTD reduction)
  const mttdRegex = /(64%\s+reduction\s+in\s+MTTD|reduces?\s+MTTD\s+by\s+64%)/gi;
  while ((match = mttdRegex.exec(content)) !== null) {
    const f4 = facts.find((f) => f.id === 'FACT-004');
    addFinding(
      'RULE-010',
      match[0],
      match.index,
      match.index + match[0].length,
      'Medium',
      88,
      'AI-assisted',
      `Claiming "${match[0]}".`,
      'RULE-010: Performance Speed & Metric Substantiation',
      f4
        ? {
            sourceId: f4.id,
            sourceTitle: f4.sourceTitle,
            version: `${f4.version}`,
            hasConflict: true,
            conflictNote: 'Conflicting source detected: Internal Telemetry Report (FACT-005) claims 42% average reduction.',
          }
        : null,
      'Source conflict detected between external study (Forrester TEI: 64%) and internal telemetry benchmark (FACT-005: 42%). To prevent contradictory press claims, specify the exact cohort or study attribution.',
      'up to 64% reduction in MTTD (per 2024 Forrester TEI™ Study)'
    );
  }

  // 6. Competitor Defamation ("totally destroy slow tools like Datadog", "faster than Datadog")
  const compRegex = /(totally\s+destroy\s+slow\s+tools\s+like\s+Datadog|slow\s+tools\s+like\s+Datadog|100x\s+faster\s+than\s+Datadog)/gi;
  while ((match = compRegex.exec(content)) !== null) {
    addFinding(
      'RULE-008',
      match[0],
      match.index,
      match.index + match[0].length,
      'High',
      94,
      'Deterministic rule',
      `Defamatory competitor comparison: "${match[0]}".`,
      'RULE-008: Competitor Defamation & Comparative Claims',
      null,
      'Directly disparaging named competitors ("destroy slow tools like Datadog") violates advertising compliance and trademark disparagement statutes. Missing evidence is not proof the claim is false, but comparative claims require independent third-party benchmark methodology citation.',
      'outperform legacy distributed monitoring stacks'
    );
  }

  // 7. EU Data Residency without required region specification
  if (market === 'EU' || lowerContent.includes('european users') || lowerContent.includes('eu data residency')) {
    const euRegex = /(EU\s+data\s+residency\s+is\s+fully\s+supported)/gi;
    while ((match = euRegex.exec(content)) !== null) {
      const euFact = facts.find((f) => f.id === 'FACT-006');
      addFinding(
        'RULE-007',
        match[0],
        match.index,
        match.index + match[0].length,
        'High',
        93,
        'Deterministic rule',
        `Unqualified EU residency statement: "${match[0]}".`,
        'RULE-007: EU Market GDPR Data Residency Wording',
        euFact
          ? {
              sourceId: euFact.id,
              sourceTitle: euFact.sourceTitle,
              version: `${euFact.version} (Active)`,
            }
          : null,
        'GDPR communications in the EU market must explicitly cite storage locations (Frankfurt and Dublin AWS regions) and confirm zero cross-border transfer.',
        'EU customer data is stored exclusively in Frankfurt and Dublin AWS regions with zero cross-border transfer'
      );
    }
  }

  // 8. Unapproved Tagline ("smartest AI for data")
  const taglineRegex = /(smartest\s+AI\s+for\s+data)/gi;
  while ((match = taglineRegex.exec(content)) !== null) {
    addFinding(
      'RULE-004',
      match[0],
      match.index,
      match.index + match[0].length,
      'Medium',
      92,
      'Deterministic rule',
      `Unapproved positioning statement: "${match[0]}".`,
      'RULE-004: Official Tagline Enforcement',
      {
        sourceId: 'SRC-TAGLINE-2024',
        sourceTitle: 'Corporate Brand Messaging Framework',
        version: 'v1.2 (Active)',
      },
      'Approved corporate tagline is "Unified intelligence for modern enterprise". The phrase "smartest AI for data" is an unapproved legacy positioning statement.',
      'unified intelligence for modern enterprise'
    );
  }

  // 9. Accessibility Link Text ("click here")
  const linkRegex = /\bclick\s+here\b/gi;
  while ((match = linkRegex.exec(content)) !== null) {
    addFinding(
      'RULE-005',
      match[0],
      match.index,
      match.index + match[0].length,
      'Medium',
      96,
      'Deterministic rule',
      `Non-descriptive link text: "${match[0]}".`,
      'RULE-005: Descriptive Hyperlink & CTA Text (WCAG 2.2 AA)',
      {
        sourceId: 'SRC-WCAG-GUIDELINES',
        sourceTitle: 'W3C Web Content Accessibility Guidelines 2.2 AA (Success Criterion 2.4.4)',
        version: 'v2.2 Official',
      },
      'Non-descriptive hyperlinked text like "click here" fails accessibility requirements for screen readers and search indexing. Must describe the destination or target action.',
      'explore our interactive telemetry platform'
    );
  }

  // 10. Jargon & Buzzwords ("synergize effortlessly", "bleeding-edge", "cheap pricing")
  const jargonTerms = [
    {
      regex: /\bsynergize\s+effortlessly\b/gi,
      ruleId: 'RULE-009',
      ruleName: 'RULE-009: Corporate Buzzword & Jargon Deprecation',
      severity: 'Low' as const,
      suggested: 'seamlessly integrate and collaborate',
      explanation: 'Overused corporate jargon undermines brand authenticity and clarity.',
    },
    {
      regex: /\bbleeding-edge\b/gi,
      ruleId: 'RULE-009',
      ruleName: 'RULE-009: Corporate Buzzword & Jargon Deprecation',
      severity: 'Low' as const,
      suggested: 'modern, production-tested',
      explanation: 'The term "bleeding-edge" connotes experimental instability rather than enterprise reliability.',
    },
    {
      regex: /\bcheap\s+pricing\b/gi,
      ruleId: 'RULE-011',
      ruleName: 'RULE-011: Pricing Transparency & Brand Perception',
      severity: 'Medium' as const,
      suggested: 'transparent, scalable enterprise pricing',
      explanation: 'Describing enterprise tiers as "cheap" impairs brand prestige and premium positioning.',
    },
  ];

  jargonTerms.forEach((j) => {
    let jMatch;
    while ((jMatch = j.regex.exec(content)) !== null) {
      addFinding(
        j.ruleId,
        jMatch[0],
        jMatch.index,
        jMatch.index + jMatch[0].length,
        j.severity,
        90,
        'Deterministic rule',
        `Corporate buzzword: "${jMatch[0]}".`,
        j.ruleName,
        null,
        j.explanation,
        j.suggested
      );
    }
  });

  // 11. Tone & Excessive Punctuation ("!!" or "???")
  const punctRegex = /([!?]{2,})/g;
  while ((match = punctRegex.exec(content)) !== null) {
    addFinding(
      'RULE-006',
      match[0],
      match.index,
      match.index + match[0].length,
      'Low',
      99,
      'Deterministic rule',
      `Excessive punctuation "${match[0]}".`,
      'RULE-006: Excessive Punctuation & Hype Tone',
      null,
      'Nimbus brand style calls for calm, authoritative punctuation. Multiple consecutive exclamation marks degrade professional perception.',
      '.'
    );
  }

  // 12. Risky draft checks: "100x faster", "totally free forever"
  const multiplierRegex = /\b100x\s+faster\b/gi;
  while ((match = multiplierRegex.exec(content)) !== null) {
    addFinding(
      'RULE-010',
      match[0],
      match.index,
      match.index + match[0].length,
      'High',
      91,
      'AI-assisted',
      `Extreme speed multiplier claim: "${match[0]}".`,
      'RULE-010: Performance Speed Multipliers (10x / 100x)',
      {
        sourceId: 'FACT-008',
        sourceTitle: 'TechValidate Verified Customer Benchmark Study',
        version: 'v1.1 (Validates 10x query speed, NOT 100x)',
      },
      'Approved benchmark evidence only supports up to 10x faster query execution. 100x is unsubstantiated. Missing evidence is not proof the claim is false, but requires engineering lab verification.',
      'up to 10x faster'
    );
  }

  const freeRegex = /\btotally\s+free\s+forever\b/gi;
  while ((match = freeRegex.exec(content)) !== null) {
    addFinding(
      'RULE-011',
      match[0],
      match.index,
      match.index + match[0].length,
      'Medium',
      89,
      'Deterministic rule',
      `Unconditional free statement: "${match[0]}".`,
      'RULE-011: Pricing Transparency & Free Claims',
      null,
      'Unqualified "free forever" statements breach deceptive advertising rules unless limits (e.g. 5M events/month) are prominently disclaimed.',
      'generous free starter tier (up to 5M monthly events)'
    );
  }

  // Sort findings by position in text
  findings.sort((a, b) => a.startIndex - b.startIndex);

  return findings;
}

// Compute Publication Readiness Score and Status
export function computeReadiness(findings: Finding[]): {
  score: number;
  status: 'Blocked' | 'Needs human review' | 'Ready to publish';
  unresolvedCount: number;
  criticalCount: number;
  highCount: number;
} {
  const unresolved = findings.filter(
    (f) => !f.humanDecision || f.humanDecision.status === 'open' || f.humanDecision.status === 'disputed'
  );

  const criticalCount = unresolved.filter((f) => f.severity === 'Critical').length;
  const highCount = unresolved.filter((f) => f.severity === 'High').length;
  const medCount = unresolved.filter((f) => f.severity === 'Medium').length;
  const lowCount = unresolved.filter((f) => f.severity === 'Low').length;

  if (findings.length === 0) {
    return {
      score: 100,
      status: 'Ready to publish',
      unresolvedCount: 0,
      criticalCount: 0,
      highCount: 0,
    };
  }

  let penalty = criticalCount * 35 + highCount * 20 + medCount * 10 + lowCount * 5;
  let score = Math.max(0, 100 - penalty);

  let status: 'Blocked' | 'Needs human review' | 'Ready to publish' = 'Ready to publish';
  if (criticalCount > 0 || score < 50) {
    status = 'Blocked';
  } else if (highCount > 0 || medCount > 0 || score < 90) {
    status = 'Needs human review';
  } else {
    status = 'Ready to publish';
  }

  return {
    score,
    status,
    unresolvedCount: unresolved.length,
    criticalCount,
    highCount,
  };
}
