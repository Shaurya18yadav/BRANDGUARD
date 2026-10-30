/**
 * Post-Publication Drift Crawler Service — Tier 3 Feature
 *
 * Continuously or on-demand crawls published URLs (blog posts, marketing sites, CMS pages),
 * extracts published DOM text, computes the live cryptographic content hash,
 * compares it against the signed approval seal (approvedContentHash),
 * and executes brand governance rules to detect post-publication regressions
 * (unauthorized edits, reintroduced legacy names, stripped disclaimers).
 */

import { computeContentHash } from '../context/BrandContext';
import { runDeterministicReview } from './rulesEngine';
import { Finding, BrandRule, ApprovedFactSource, TerminologyItem } from '../types';

export type DriftStatus = 'in_sync' | 'minor_drift' | 'critical_drift' | 'unreachable';

export interface MonitoredUrl {
  id: string;
  submissionId: string;
  submissionTitle: string;
  channel: string;
  url: string;
  platform: 'WordPress' | 'Webflow' | 'HubSpot' | 'Website' | 'LinkedIn' | 'Twitter/X';
  approvedContent: string;
  approvedHash: string;
  approvedBy: string;
  approvedAt: string;
  // Crawler results
  lastCrawledAt?: string;
  liveContent?: string;
  liveHash?: string;
  driftStatus: DriftStatus;
  similarityScore: number; // 0 - 100%
  driftExplanation?: string;
  detectedRegressions: Finding[];
}

export interface CrawlScanResult {
  urlId: string;
  timestamp: string;
  status: DriftStatus;
  approvedHash: string;
  liveHash: string;
  similarityScore: number;
  addedChars: number;
  removedChars: number;
  regressionsCount: number;
  regressions: Finding[];
  remediationSummary: string;
}

// ─── Initial Monitored Endpoints ────────────────────────────────────────────

const MON_001_APPROVED_CONTENT = `Nimbus Insight™ provides unified intelligence for modern enterprise engineering organizations. Processing over 4.2 billion telemetry events daily across 1,200 enterprise customers, the platform is backed by our standard 99.95% uptime SLA commitment.

For European customers, all telemetry data is stored exclusively in Frankfurt and Dublin AWS regions with zero cross-border transfer. According to the 2024 TechValidate Verified Customer Study, teams achieve up to 10x faster query execution on petabyte-scale event schemas. Explore our compliance documentation to learn more about our SOC 2 Type II and ISO 27001 certifications.`;

const MON_001_HASH = computeContentHash(MON_001_APPROVED_CONTENT);

const MON_002_APPROVED_CONTENT = `We are thrilled to announce that Nimbus Insight is back and bigger than ever. As a recognized enterprise observability platform, our modern, production-tested engine implements enterprise defense-in-depth security architecture with 99.95% SLA uptime availability.

Thanks to our groundbreaking technology, enterprise engineering teams can seamlessly integrate and collaborate and achieve up to 64% reduction in MTTD (per 2024 Forrester TEI™ Study). We outperform legacy distributed monitoring stacks!

For our European users, EU customer data is stored exclusively in Frankfurt and Dublin AWS regions with zero cross-border transfer with transparent, scalable enterprise pricing. Want to experience unified intelligence for modern enterprise? Just explore our interactive telemetry platform to start your journey now!`;

const MON_002_HASH = computeContentHash(MON_002_APPROVED_CONTENT);

const MON_002_LIVE_CONTENT = `We are thrilled to announce that CloudLens is back and bigger than ever. As a recognized enterprise observability platform, our modern engine guarantees 100% secure analytics with 99.95% SLA uptime availability.

Thanks to our groundbreaking technology, enterprise engineering teams can seamlessly integrate and collaborate. We outperform legacy distributed monitoring stacks!

For our European users, cheap pricing is now live worldwide. Just click here to start your journey now!`;

export const SEED_MONITORED_URLS: MonitoredUrl[] = [
  {
    id: 'MON-001',
    submissionId: 'SUB-002',
    submissionTitle: 'Customer Advisory on EU Data Residency & Sovereignty',
    channel: 'Website',
    platform: 'Webflow',
    url: 'https://nimbus-analytics.webflow.io/legal/eu-data-residency-advisory',
    approvedContent: MON_001_APPROVED_CONTENT,
    approvedHash: MON_001_HASH,
    approvedBy: 'Marcus Vance, Esq.',
    approvedAt: '2024-10-22 11:20',
    lastCrawledAt: '2024-10-29 08:30:15',
    liveContent: MON_001_APPROVED_CONTENT,
    liveHash: MON_001_HASH,
    driftStatus: 'in_sync',
    similarityScore: 100,
    detectedRegressions: [],
  },
  {
    id: 'MON-002',
    submissionId: 'SUB-DEMO-001',
    submissionTitle: 'Q4 Product Launch & Platform Update Announcement',
    channel: 'Website',
    platform: 'WordPress',
    url: 'https://blog.nimbus-analytics.com/posts/q4-platform-announcement',
    approvedContent: MON_002_APPROVED_CONTENT,
    approvedHash: MON_002_HASH,
    approvedBy: 'Julian Hayes',
    approvedAt: '2024-10-25 15:10',
    lastCrawledAt: '2024-10-29 08:30:15',
    liveContent: MON_002_LIVE_CONTENT,
    liveHash: computeContentHash(MON_002_LIVE_CONTENT),
    driftStatus: 'critical_drift',
    similarityScore: 68,
    driftExplanation: 'Marketing editor modified published copy: reintroduced retired "CloudLens" brand, added unapproved "guarantees 100% secure", and removed EU data residency GDPR protections.',
    detectedRegressions: [],
  },
];

// ─── Similarity Metric Helper ───────────────────────────────────────────────

function computeSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 100;
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 100;

  let common = 0;
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = new Set(str2.toLowerCase().split(/\s+/));
  words1.forEach((w) => {
    if (words2.has(w)) common++;
  });

  return Math.round((common / Math.max(words1.length, words2.size)) * 100);
}

// ─── Crawler Execution Engine ───────────────────────────────────────────────

export async function crawlAndAuditUrl(
  monitoredItem: MonitoredUrl,
  rules: BrandRule[],
  facts: ApprovedFactSource[],
  terminology: TerminologyItem[],
  customLiveText?: string
): Promise<CrawlScanResult> {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // In live environments, this fetches the published URL HTML & strips scripts/tags.
  // In client/demo environments, we use live text or simulate the crawler network fetch.
  let fetchedText = customLiveText !== undefined ? customLiveText : (monitoredItem.liveContent || monitoredItem.approvedContent);

  // Simulate network latency for crawl
  await new Promise((r) => setTimeout(r, 700 + Math.random() * 600));

  const liveHash = computeContentHash(fetchedText);
  const approvedHash = monitoredItem.approvedHash;
  const isHashExactMatch = liveHash === approvedHash;

  // Run full deterministic brand governance against the live scraped copy
  const regressions = runDeterministicReview(
    fetchedText,
    rules,
    facts,
    terminology,
    'EU',
    monitoredItem.channel
  );

  const similarityScore = isHashExactMatch ? 100 : computeSimilarity(monitoredItem.approvedContent, fetchedText);
  const charDiff = fetchedText.length - monitoredItem.approvedContent.length;

  let status: DriftStatus = 'in_sync';
  let remediationSummary = 'Live published copy matches signed approval hash 1:1. Tamper-evident seal intact.';

  if (!isHashExactMatch) {
    const criticalRegressions = regressions.filter((r) => r.severity === 'Critical');
    const highRegressions = regressions.filter((r) => r.severity === 'High');

    if (criticalRegressions.length > 0 || highRegressions.length > 0) {
      status = 'critical_drift';
      remediationSummary = `CRITICAL DRIFT: ${regressions.length} brand governance violations introduced post-publication (${criticalRegressions.length} Critical, ${highRegressions.length} High). Immediate takedown or roll-back required.`;
    } else {
      status = 'minor_drift';
      remediationSummary = `MINOR DRIFT: Copy modified post-approval (hash mismatch), but no active brand rule violations were introduced. Update approval seal or revert changes.`;
    }
  }

  return {
    urlId: monitoredItem.id,
    timestamp,
    status,
    approvedHash,
    liveHash,
    similarityScore,
    addedChars: Math.max(0, charDiff),
    removedChars: Math.max(0, -charDiff),
    regressionsCount: regressions.length,
    regressions,
    remediationSummary,
  };
}

// ─── Bulk Crawler Scanner ───────────────────────────────────────────────────

export async function crawlAllMonitoredEndpoints(
  items: MonitoredUrl[],
  rules: BrandRule[],
  facts: ApprovedFactSource[],
  terminology: TerminologyItem[]
): Promise<CrawlScanResult[]> {
  const results = await Promise.all(
    items.map((item) => crawlAndAuditUrl(item, rules, facts, terminology))
  );
  return results;
}
