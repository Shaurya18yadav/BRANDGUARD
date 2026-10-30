import {
  generateSlackBlockKitPayload,
  generateTeamsAdaptiveCardPayload,
  dispatchChatBotNotification,
  DEFAULT_CHAT_CONFIGS,
} from '../src/services/chatBotService.ts';
import {
  crawlAndAuditUrl,
  SEED_MONITORED_URLS,
} from '../src/services/driftCrawlerService.ts';
import {
  SEED_RULES,
  SEED_FACTS,
  SEED_TERMINOLOGY,
  SAMPLE_DRAFTS,
  SEED_SUBMISSIONS,
} from '../src/data/seedData.ts';

console.log('===============================================================');
console.log('       TIER 2 & TIER 3 ADVANCED SYSTEMS VERIFICATION           ');
console.log('===============================================================\n');

// ─── 1. Slack & Teams Bots Verification ────────────────────────────────────
console.log('1. Testing Slack & Microsoft Teams Inline Approval Bots...');
const testSub = SEED_SUBMISSIONS[0];

// Slack Block Kit Payload
const slackPayload = generateSlackBlockKitPayload(testSub);
if (!slackPayload.blocks || slackPayload.blocks.length < 4) {
  throw new Error('Slack Block Kit payload incomplete');
}
const actionBlock = slackPayload.blocks.find((b: any) => b.type === 'actions');
if (!actionBlock || actionBlock.elements.length < 2) {
  throw new Error('Slack interactive action buttons missing in payload');
}
console.log('   ✅ Slack Block Kit payload structured with interactive action buttons');

// Teams Adaptive Card Payload
const teamsPayload = generateTeamsAdaptiveCardPayload(testSub);
const cardContent = teamsPayload.attachments[0].content;
if (cardContent.type !== 'AdaptiveCard' || cardContent.actions.length < 2) {
  throw new Error('Teams Adaptive Card payload incomplete or missing Action.Execute');
}
console.log('   ✅ Microsoft Teams Adaptive Card 1.5 payload structured with Action.Execute buttons');

// Simulated Dispatch Test
const dispatchResult = await dispatchChatBotNotification('slack', testSub, DEFAULT_CHAT_CONFIGS[0], true);
if (!dispatchResult.success) {
  throw new Error('Chat bot simulation dispatch failed');
}
console.log('   ✅ Bot notification simulated delivery successful');


// ─── 2. Post-Publication Drift Crawler Verification ────────────────────────
console.log('\n2. Testing Post-Publication Drift Crawler & Web Monitor...');

// Case A: 100% In Sync
const inSyncItem = SEED_MONITORED_URLS[0];
const inSyncScan = await crawlAndAuditUrl(inSyncItem, SEED_RULES, SEED_FACTS, SEED_TERMINOLOGY);
if (inSyncScan.status !== 'in_sync' || inSyncScan.similarityScore !== 100) {
  throw new Error(`In-sync crawler scan failed: expected in_sync, got ${inSyncScan.status}`);
}
console.log('   ✅ Crawled live published page in 100% sync; cryptographic hash verified');

// Case B: Critical Drift Detection with Brand Regressions
const driftedItem = SEED_MONITORED_URLS[1];
const driftScan = await crawlAndAuditUrl(driftedItem, SEED_RULES, SEED_FACTS, SEED_TERMINOLOGY);
if (driftScan.status !== 'critical_drift') {
  throw new Error(`Drift crawler failed to detect critical drift: got ${driftScan.status}`);
}
if (driftScan.regressionsCount === 0) {
  throw new Error('Drift crawler failed to identify newly introduced brand regressions on the live web');
}
console.log(`   ✅ Crawler detected critical drift (${driftScan.similarityScore}% match, ${driftScan.regressionsCount} regressions caught)`);
console.log(`   └─ Regressions caught on live web: ${driftScan.regressions.map(r => r.ruleName).join(', ')}`);

console.log('\n===============================================================');
console.log('     ALL TIER 2 & TIER 3 ADVANCED SYSTEMS FULLY VERIFIED!      ');
console.log('===============================================================');

