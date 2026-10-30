/**
 * Slack & Microsoft Teams Inline Approval Bots Service — Tier 2 Feature
 *
 * Generates interactive message payloads for Slack (Block Kit) and
 * Microsoft Teams (Adaptive Cards v1.5) with inline action buttons
 * allowing reviewers to approve, reject, or request changes directly from chat.
 */

import { Submission } from '../types';

export type ChatPlatform = 'slack' | 'teams';

export interface ChatBotConfig {
  platform: ChatPlatform;
  enabled: boolean;
  webhookUrl: string;
  channelName: string;
  botName: string;
  autoNotifyOnReview: boolean;
  lastNotifiedAt?: string;
  lastStatus?: 'success' | 'error' | 'idle';
}

export interface ChatActionPayload {
  action: 'approve' | 'reject' | 'view';
  submissionId: string;
  actor: string;
  role: string;
  reason?: string;
  timestamp: string;
}

export interface BotNotificationResult {
  platform: ChatPlatform;
  success: boolean;
  message: string;
  timestamp: string;
  deliveredPayload: any;
}

// ─── Default Configurations ─────────────────────────────────────────────────

export const DEFAULT_CHAT_CONFIGS: ChatBotConfig[] = [
  {
    platform: 'slack',
    enabled: true,
    webhookUrl: 'https://example.com/webhooks/slack-approvals',
    channelName: '#brand-governance-approvals',
    botName: 'BrandGuard Sentinel',
    autoNotifyOnReview: true,
  },
  {
    platform: 'teams',
    enabled: true,
    webhookUrl: 'https://example.com/webhooks/teams-approvals',
    channelName: 'Legal & Brand Review Channel',
    botName: 'BrandGuard Bot',
    autoNotifyOnReview: true,
  },
];

// ─── Slack Block Kit Payload Generator ──────────────────────────────────────

export function generateSlackBlockKitPayload(submission: Submission): any {
  const unresolvedCount = submission.findings.filter(
    (f) => !f.humanDecision || f.humanDecision.status === 'open' || f.humanDecision.status === 'disputed'
  ).length;

  const criticalCount = submission.findings.filter((f) => f.severity === 'Critical').length;
  const highCount = submission.findings.filter((f) => f.severity === 'High').length;

  const snippet = submission.content.length > 280
    ? submission.content.substring(0, 277) + '...'
    : submission.content;

  return {
    text: `[BrandGuard] Governance Review Required: "${submission.title}"`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🛡️ BrandGuard Governance Sign-Off Request`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Draft Title:*\n${submission.title}`,
          },
          {
            type: 'mrkdwn',
            text: `*Status:*\n\`${submission.status.toUpperCase()}\` (${submission.readinessScore}% Readiness)`,
          },
          {
            type: 'mrkdwn',
            text: `*Channel & Market:*\n${submission.channel} • ${submission.market}`,
          },
          {
            type: 'mrkdwn',
            text: `*Submitted By:*\n${submission.submittedBy} (${submission.updatedAt})`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Content Preview:*\n>${snippet.replace(/\n/g, '\n>')}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Findings Breakdown:* ${
            unresolvedCount === 0
              ? '✅ _All findings resolved! Ready for publication sign-off._'
              : `⚠️ *${unresolvedCount} open finding(s)* (${criticalCount} Critical, ${highCount} High)`
          }\n*Initial Hash:* \`${submission.initialContentHash.slice(0, 16)}...\``,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '✓ Approve & Cryptographically Seal',
              emoji: true,
            },
            style: 'primary',
            value: `approve_${submission.id}`,
            action_id: 'brandguard_approve_action',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '✕ Reject / Needs Evidence',
              emoji: true,
            },
            style: 'danger',
            value: `reject_${submission.id}`,
            action_id: 'brandguard_reject_action',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '🔍 Open Review Workspace',
              emoji: true,
            },
            url: `https://brandguard.internal/workspace?sub=${submission.id}`,
            action_id: 'brandguard_workspace_link',
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '🔒 _Version-bound seal: Approval will bind to the exact 32-bit content hash. Modifying copy post-approval breaks seal automatically._',
          },
        ],
      },
    ],
  };
}

// ─── Microsoft Teams Adaptive Card Generator (v1.5) ─────────────────────────

export function generateTeamsAdaptiveCardPayload(submission: Submission): any {
  const unresolvedCount = submission.findings.filter(
    (f) => !f.humanDecision || f.humanDecision.status === 'open' || f.humanDecision.status === 'disputed'
  ).length;

  return {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.5',
          body: [
            {
              type: 'TextBlock',
              text: '🛡️ BrandGuard Governance Sign-Off Request',
              weight: 'Bolder',
              size: 'Medium',
              color: 'Accent',
            },
            {
              type: 'TextBlock',
              text: submission.title,
              weight: 'Bolder',
              size: 'Small',
              wrap: true,
            },
            {
              type: 'FactSet',
              facts: [
                { title: 'Status', value: submission.status },
                { title: 'Readiness Score', value: `${submission.readinessScore}% (${submission.readinessStatus})` },
                { title: 'Target Channel', value: submission.channel },
                { title: 'Regional Market', value: submission.market },
                { title: 'Author', value: submission.submittedBy },
                { title: 'Open Findings', value: `${unresolvedCount} unresolved` },
                { title: 'Sealed Hash', value: submission.approvedContentHash ? `${submission.approvedContentHash.slice(0, 16)}...` : 'Pending Approval' },
              ],
            },
            {
              type: 'Container',
              style: 'emphasis',
              items: [
                {
                  type: 'TextBlock',
                  text: 'Content Preview:',
                  weight: 'Bolder',
                  size: 'Small',
                },
                {
                  type: 'TextBlock',
                  text: submission.content.length > 250 ? submission.content.slice(0, 247) + '...' : submission.content,
                  wrap: true,
                  fontType: 'Monospace',
                  size: 'Small',
                },
              ],
            },
            {
              type: 'TextBlock',
              text: 'Approving binds the cryptographic seal to this exact draft hash. Any subsequent edit automatically resets approval.',
              isSubtle: true,
              size: 'Small',
              wrap: true,
            },
          ],
          actions: [
            {
              type: 'Action.Execute',
              title: '✓ Approve (Sign-Off)',
              verb: 'approve',
              data: {
                submissionId: submission.id,
                action: 'approve',
              },
            },
            {
              type: 'Action.Execute',
              title: '✕ Reject (Needs Evidence)',
              verb: 'reject',
              data: {
                submissionId: submission.id,
                action: 'reject',
              },
            },
            {
              type: 'Action.OpenUrl',
              title: 'Open Workspace',
              url: `https://brandguard.internal/workspace?sub=${submission.id}`,
            },
          ],
        },
      },
    ],
  };
}

// ─── Dispatcher & Simulation ────────────────────────────────────────────────

export async function dispatchChatBotNotification(
  platform: ChatPlatform,
  submission: Submission,
  config: ChatBotConfig,
  demoMode: boolean = true
): Promise<BotNotificationResult> {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const payload = platform === 'slack'
    ? generateSlackBlockKitPayload(submission)
    : generateTeamsAdaptiveCardPayload(submission);

  if (demoMode) {
    await new Promise((r) => setTimeout(r, 650));
    return {
      platform,
      success: true,
      message: `[DEMO] Interactive ${platform === 'slack' ? 'Slack Block Kit' : 'Teams Adaptive Card'} notification sent to ${config.channelName}.`,
      timestamp,
      deliveredPayload: payload,
    };
  }

  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return {
        platform,
        success: true,
        message: `Notification successfully posted to ${config.channelName}.`,
        timestamp,
        deliveredPayload: payload,
      };
    }

    return {
      platform,
      success: false,
      message: `${platform.toUpperCase()} webhook error: HTTP ${response.status}`,
      timestamp,
      deliveredPayload: payload,
    };
  } catch (err: any) {
    return {
      platform,
      success: false,
      message: `Network error posting to ${platform}: ${err.message}`,
      timestamp,
      deliveredPayload: payload,
    };
  }
}

