import React, { useState } from 'react';
import {
  WebhookConfig,
  PublishPlatform,
  PublishResult,
  WEBHOOK_TEMPLATES,
  publishToAllEnabled,
} from '../services/publishingWebhookService';
import { computeContentHash } from '../context/BrandContext';
import { Submission } from '../types';
import {
  Send,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Settings,
  Zap,
  Loader2,
  Globe,
  AlertTriangle,
  Link2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PublishingPanelProps {
  submission: Submission;
  onAuditLog: (action: string, reason: string) => void;
  showToast: (msg: string) => void;
}

export const PublishingPanel: React.FC<PublishingPanelProps> = ({
  submission,
  onAuditLog,
  showToast,
}) => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(() => {
    const saved = localStorage.getItem('bg_webhooks');
    if (saved) return JSON.parse(saved);
    return WEBHOOK_TEMPLATES.map((t, i) => ({
      ...t,
      id: `WH-${t.platform}-${i}`,
      webhookUrl: '',
      apiKey: '',
    }));
  });

  const [showConfig, setShowConfig] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<PublishResult[]>([]);
  const [demoMode, setDemoMode] = useState(true);

  const isApproved = submission.status === 'Approved';
  const currentHash = computeContentHash(submission.content);
  const isSealValid = isApproved && submission.approvedContentHash === currentHash;
  const enabledCount = webhooks.filter((w) => w.enabled).length;

  const saveWebhooks = (updated: WebhookConfig[]) => {
    setWebhooks(updated);
    localStorage.setItem('bg_webhooks', JSON.stringify(updated));
  };

  const toggleWebhook = (id: string) => {
    const updated = webhooks.map((w) =>
      w.id === id ? { ...w, enabled: !w.enabled } : w
    );
    saveWebhooks(updated);
  };

  const updateWebhookField = (id: string, field: 'webhookUrl' | 'apiKey', value: string) => {
    const updated = webhooks.map((w) =>
      w.id === id ? { ...w, [field]: value } : w
    );
    saveWebhooks(updated);
  };

  const handlePublish = async () => {
    if (!isSealValid) {
      showToast('⛔ Publishing blocked: Content must have a valid, unsealed approval before publishing.');
      return;
    }

    setIsPublishing(true);
    setPublishResults([]);

    const results = await publishToAllEnabled(
      webhooks,
      {
        submissionId: submission.id,
        title: submission.title,
        content: submission.content,
        channel: submission.channel,
        market: submission.market,
        approvedBy: submission.approvedBy || '',
        approvalRole: submission.approvalRole || '',
        contentHash: currentHash,
        approvedAt: submission.approvedAt || '',
        metadata: {},
      },
      demoMode
    );

    setPublishResults(results);
    setIsPublishing(false);

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    if (successCount > 0) {
      onAuditLog(
        'PUBLISHED_VIA_WEBHOOK',
        `Published to ${successCount} platform(s)${demoMode ? ' [DEMO MODE]' : ''}. Hash: ${currentHash.slice(0, 14)}. Platforms: ${results.filter((r) => r.success).map((r) => r.platform).join(', ')}.`
      );
      showToast(`✅ Published to ${successCount} platform(s)!${failCount > 0 ? ` (${failCount} failed)` : ''}`);
    } else {
      showToast(`❌ All publish attempts failed. Check webhook configuration.`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-violet-50 to-blue-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-navy-900">
              Automated Publishing Webhooks
            </h3>
            <p className="text-[11px] text-slate-500">
              Publish approved content directly to CMS platforms & social APIs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[11px]">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={() => setDemoMode(!demoMode)}
              className="rounded border-slate-300"
            />
            <span className="font-medium text-slate-600">Demo Mode</span>
          </label>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-navy-900 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configure</span>
            {showConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 space-y-3">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Webhook Integrations
          </div>
          {webhooks.map((wh) => (
            <div
              key={wh.id}
              className={`p-3 rounded-xl border transition-colors ${
                wh.enabled
                  ? 'bg-white border-violet-200 shadow-sm'
                  : 'bg-slate-100/50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{wh.icon}</span>
                  <span className="font-bold text-xs text-navy-900">{wh.name}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wh.enabled}
                    onChange={() => toggleWebhook(wh.id)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>
              {wh.enabled && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      Webhook URL
                    </label>
                    <input
                      type="url"
                      value={wh.webhookUrl}
                      onChange={(e) => updateWebhookField(wh.id, 'webhookUrl', e.target.value)}
                      placeholder={`https://api.${wh.platform}.com/v1/posts`}
                      className="w-full text-[11px] px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-violet-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      API Key / Bearer Token
                    </label>
                    <input
                      type="password"
                      value={wh.apiKey}
                      onChange={(e) => updateWebhookField(wh.id, 'apiKey', e.target.value)}
                      placeholder="sk-••••••••••••"
                      className="w-full text-[11px] px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-violet-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
          <p className="text-[10px] text-slate-400 italic">
            {demoMode
              ? 'Demo mode simulates publishing without sending real API requests.'
              : 'Live mode sends real HTTP POST requests to configured webhook URLs.'}
          </p>
        </div>
      )}

      {/* Publish Action */}
      <div className="p-4 space-y-3">
        {!isSealValid && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900">Publishing Requires Approval</span>
              <p className="text-amber-700 mt-0.5">
                Content must be approved with a valid cryptographic seal before it can be published.
                {submission.status === 'Reopened' &&
                  ' This submission was reopened due to post-approval edits — re-approve to restore the seal.'}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span className="font-semibold">{enabledCount}</span> webhook(s) enabled
            {isSealValid && (
              <span className="ml-2 text-emerald-600 font-semibold">
                • Seal Valid ✓
              </span>
            )}
          </div>
          <button
            onClick={handlePublish}
            disabled={!isSealValid || isPublishing || enabledCount === 0}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publish to {enabledCount} Platform{enabledCount !== 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>

        {/* Publish Results */}
        {publishResults.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Publish Results
            </div>
            {publishResults.map((result, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
                  result.success
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-bold ${
                        result.success ? 'text-emerald-900' : 'text-red-900'
                      }`}
                    >
                      {result.platform.charAt(0).toUpperCase() + result.platform.slice(1)}
                      {result.responseCode && (
                        <span className="ml-1 font-mono text-[10px] opacity-70">
                          ({result.responseCode})
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400">{result.timestamp}</span>
                  </div>
                  <p className={result.success ? 'text-emerald-700' : 'text-red-700'}>
                    {result.message}
                  </p>
                  {result.publishedUrl && (
                    <a
                      href={result.publishedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-violet-600 hover:underline mt-1 font-semibold"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {result.publishedUrl}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

