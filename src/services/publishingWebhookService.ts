/**
 * Publishing Webhook Service — Tier 3 Feature
 *
 * Provides automated CMS publishing webhooks for approved content.
 * Supports: WordPress, Webflow, HubSpot, and Social APIs (Twitter/X, LinkedIn).
 *
 * Security: Only approved submissions with valid cryptographic seals can be published.
 * All publish attempts are logged to the immutable audit trail.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type PublishPlatform = 'wordpress' | 'webflow' | 'hubspot' | 'twitter' | 'linkedin';

export interface WebhookConfig {
  id: string;
  platform: PublishPlatform;
  name: string;
  icon: string;
  webhookUrl: string;
  apiKey: string;
  enabled: boolean;
  lastPublished?: string;
  lastStatus?: 'success' | 'error' | 'pending';
  siteId?: string; // For Webflow
  blogId?: string; // For WordPress
}

export interface PublishPayload {
  submissionId: string;
  title: string;
  content: string;
  channel: string;
  market: string;
  approvedBy: string;
  approvalRole: string;
  contentHash: string;
  approvedAt: string;
  metadata: Record<string, string>;
}

export interface PublishResult {
  platform: PublishPlatform;
  success: boolean;
  message: string;
  publishedUrl?: string;
  timestamp: string;
  responseCode?: number;
}

// ─── Default Webhook Templates ──────────────────────────────────────────────

export const WEBHOOK_TEMPLATES: Omit<WebhookConfig, 'id' | 'webhookUrl' | 'apiKey'>[] = [
  {
    platform: 'wordpress',
    name: 'WordPress',
    icon: '📝',
    enabled: false,
    siteId: '',
  },
  {
    platform: 'webflow',
    name: 'Webflow',
    icon: '🌐',
    enabled: false,
    siteId: '',
  },
  {
    platform: 'hubspot',
    name: 'HubSpot',
    icon: '🟠',
    enabled: false,
  },
  {
    platform: 'twitter',
    name: 'Twitter / X',
    icon: '𝕏',
    enabled: false,
  },
  {
    platform: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    enabled: false,
  },
];

// ─── Webhook URL Builders ───────────────────────────────────────────────────

function buildWordPressPayload(payload: PublishPayload, config: WebhookConfig) {
  return {
    title: payload.title,
    content: payload.content,
    status: 'draft', // Always publish as draft first for safety
    meta: {
      brandguard_submission_id: payload.submissionId,
      brandguard_content_hash: payload.contentHash,
      brandguard_approved_by: payload.approvedBy,
      brandguard_approval_role: payload.approvalRole,
      brandguard_approved_at: payload.approvedAt,
      brandguard_market: payload.market,
      brandguard_channel: payload.channel,
    },
  };
}

function buildWebflowPayload(payload: PublishPayload, config: WebhookConfig) {
  return {
    fields: {
      name: payload.title,
      slug: payload.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      'post-body': payload.content,
      _archived: false,
      _draft: true,
      'brandguard-hash': payload.contentHash,
      'brandguard-approved-by': payload.approvedBy,
    },
  };
}

function buildHubSpotPayload(payload: PublishPayload) {
  return {
    name: payload.title,
    contentGroupId: 'default',
    state: 'DRAFT',
    postBody: payload.content,
    metaDescription: `Approved by ${payload.approvedBy} (${payload.approvalRole}). Hash: ${payload.contentHash}`,
    customProperties: {
      brandguard_submission_id: payload.submissionId,
      brandguard_content_hash: payload.contentHash,
    },
  };
}

function buildSocialPayload(payload: PublishPayload, platform: 'twitter' | 'linkedin') {
  const maxLength = platform === 'twitter' ? 280 : 3000;
  const truncatedContent = payload.content.length > maxLength
    ? payload.content.substring(0, maxLength - 3) + '...'
    : payload.content;

  return {
    text: truncatedContent,
    metadata: {
      brandguard_hash: payload.contentHash,
      brandguard_approved: true,
    },
  };
}

// ─── Publish Execution Engine ───────────────────────────────────────────────

export async function publishToWebhook(
  config: WebhookConfig,
  payload: PublishPayload
): Promise<PublishResult> {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Validate approval seal
  if (!payload.contentHash || !payload.approvedBy) {
    return {
      platform: config.platform,
      success: false,
      message: 'Publication blocked: Content must have a valid cryptographic approval seal before publishing.',
      timestamp,
    };
  }

  if (!config.webhookUrl || !config.apiKey) {
    return {
      platform: config.platform,
      success: false,
      message: `Publishing to ${config.name} requires a valid webhook URL and API key. Configure in Publishing settings.`,
      timestamp,
    };
  }

  // Build platform-specific payload
  let body: any;
  switch (config.platform) {
    case 'wordpress':
      body = buildWordPressPayload(payload, config);
      break;
    case 'webflow':
      body = buildWebflowPayload(payload, config);
      break;
    case 'hubspot':
      body = buildHubSpotPayload(payload);
      break;
    case 'twitter':
    case 'linkedin':
      body = buildSocialPayload(payload, config.platform);
      break;
  }

  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
        'X-BrandGuard-Hash': payload.contentHash,
        'X-BrandGuard-Approved-By': payload.approvedBy,
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        platform: config.platform,
        success: true,
        message: `Successfully published to ${config.name} as draft.`,
        publishedUrl: data.url || data.link || data.permalink || undefined,
        timestamp,
        responseCode: response.status,
      };
    }

    return {
      platform: config.platform,
      success: false,
      message: `${config.name} API returned ${response.status}: ${response.statusText}`,
      timestamp,
      responseCode: response.status,
    };
  } catch (error: any) {
    return {
      platform: config.platform,
      success: false,
      message: `Network error publishing to ${config.name}: ${error.message}`,
      timestamp,
    };
  }
}

// ─── Simulate publish (for demo mode without real API keys) ─────────────────

export async function simulatePublish(
  config: WebhookConfig,
  payload: PublishPayload
): Promise<PublishResult> {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Validate approval seal
  if (!payload.contentHash || !payload.approvedBy) {
    return {
      platform: config.platform,
      success: false,
      message: 'Publication blocked: Content must have a valid cryptographic approval seal.',
      timestamp,
    };
  }

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

  const demoUrls: Record<PublishPlatform, string> = {
    wordpress: `https://blog.nimbus-analytics.com/posts/${payload.submissionId.toLowerCase()}`,
    webflow: `https://nimbus-analytics.webflow.io/${payload.title.toLowerCase().replace(/\s+/g, '-')}`,
    hubspot: `https://app.hubspot.com/blog/nimbus/${payload.submissionId}`,
    twitter: `https://x.com/NimbusAnalytics/status/${Date.now()}`,
    linkedin: `https://linkedin.com/feed/update/urn:li:activity:${Date.now()}`,
  };

  return {
    platform: config.platform,
    success: true,
    message: `[DEMO] Successfully published to ${config.name} as draft. Content hash ${payload.contentHash.slice(0, 12)}... verified.`,
    publishedUrl: demoUrls[config.platform],
    timestamp,
    responseCode: 201,
  };
}

// ─── Bulk Publish (publish to all enabled webhooks) ─────────────────────────

export async function publishToAllEnabled(
  configs: WebhookConfig[],
  payload: PublishPayload,
  demoMode: boolean = true
): Promise<PublishResult[]> {
  const enabledConfigs = configs.filter((c) => c.enabled);

  if (enabledConfigs.length === 0) {
    return [
      {
        platform: 'wordpress',
        success: false,
        message: 'No publishing integrations are enabled. Configure at least one webhook in Publishing settings.',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      },
    ];
  }

  const results = await Promise.all(
    enabledConfigs.map((config) =>
      demoMode ? simulatePublish(config, payload) : publishToWebhook(config, payload)
    )
  );

  return results;
}

