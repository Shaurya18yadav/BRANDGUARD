import React, { useState } from 'react';
import { Submission, Role } from '../types';
import {
  ChatPlatform,
  ChatBotConfig,
  DEFAULT_CHAT_CONFIGS,
  generateSlackBlockKitPayload,
  generateTeamsAdaptiveCardPayload,
  dispatchChatBotNotification,
  BotNotificationResult,
} from '../services/chatBotService';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  Settings,
  Lock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface SlackTeamsBotPanelProps {
  submission: Submission;
  currentRole: Role;
  onApprove: (id: string, reason: string) => void;
  onReject: (id: string, reason: string) => void;
  onNavigateToWorkspace: (id: string) => void;
  showToast: (msg: string) => void;
}

export const SlackTeamsBotPanel: React.FC<SlackTeamsBotPanelProps> = ({
  submission,
  currentRole,
  onApprove,
  onReject,
  onNavigateToWorkspace,
  showToast,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<ChatPlatform>('slack');
  const [configs, setConfigs] = useState<ChatBotConfig[]>(() => {
    const saved = localStorage.getItem('bg_chat_bot_configs');
    return saved ? JSON.parse(saved) : DEFAULT_CHAT_CONFIGS;
  });

  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showJsonPayload, setShowJsonPayload] = useState<boolean>(false);
  const [notificationLog, setNotificationLog] = useState<BotNotificationResult[]>([]);

  const activeConfig = configs.find((c) => c.platform === selectedPlatform) || configs[0];

  const slackPayload = generateSlackBlockKitPayload(submission);
  const teamsPayload = generateTeamsAdaptiveCardPayload(submission);
  const activePayload = selectedPlatform === 'slack' ? slackPayload : teamsPayload;

  const saveConfigs = (updated: ChatBotConfig[]) => {
    setConfigs(updated);
    localStorage.setItem('bg_chat_bot_configs', JSON.stringify(updated));
  };

  const handleSendNotification = async () => {
    setIsSending(true);
    const result = await dispatchChatBotNotification(
      selectedPlatform,
      submission,
      activeConfig,
      demoMode
    );
    setIsSending(false);
    setNotificationLog((prev) => [result, ...prev]);

    if (result.success) {
      showToast(result.message);
    } else {
      showToast(`❌ ${result.message}`);
    }
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(activePayload, null, 2));
    showToast(`Copied ${selectedPlatform.toUpperCase()} JSON payload to clipboard!`);
  };

  // Inline action triggered from the interactive card button
  const handleInlineApprove = () => {
    if (currentRole === 'creator') {
      showToast('Permission Denied: Approval requires Brand Manager or Legal Reviewer role.');
      return;
    }
    const reason = `Approved via ${selectedPlatform === 'slack' ? 'Slack Block Kit Bot' : 'Microsoft Teams Adaptive Card'} inline action.`;
    onApprove(submission.id, reason);
    showToast(`✓ Approved directly from ${selectedPlatform === 'slack' ? 'Slack' : 'Teams'} bot!`);
  };

  const handleInlineReject = () => {
    const reason = `Rejected via ${selectedPlatform === 'slack' ? 'Slack Block Kit Bot' : 'Microsoft Teams Adaptive Card'}: Additional source grounding needed.`;
    onReject(submission.id, reason);
    showToast(`Draft rejected directly from ${selectedPlatform === 'slack' ? 'Slack' : 'Teams'} bot.`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#4A154B] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            #
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-sm text-navy-900">
                Slack & Microsoft Teams Inline Approval Bots
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                Tier 2 • Live Bot
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Interactive chat cards with 1-click cryptographic approvals & real-time webhook dispatch
            </p>
          </div>
        </div>

        {/* Platform Selector & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedPlatform('slack')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedPlatform === 'slack'
                  ? 'bg-white text-navy-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <span>Slack</span>
            </button>
            <button
              onClick={() => setSelectedPlatform('teams')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedPlatform === 'teams'
                  ? 'bg-[#505AC9] text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <span>MS Teams</span>
            </button>
          </div>

          <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={() => setDemoMode(!demoMode)}
              className="rounded border-slate-300"
            />
            <span>Demo Mode</span>
          </label>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-1.5 text-slate-500 hover:text-navy-900 bg-white rounded-lg border border-slate-200 transition-colors"
            title="Configure Bot Webhooks"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Webhook Configuration Drawer */}
      {showConfig && (
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="text-xs font-bold text-navy-900 uppercase tracking-wider">
            {selectedPlatform === 'slack' ? 'Slack Incoming Webhook Settings' : 'Microsoft Teams Webhook Settings'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Webhook Target URL:
              </label>
              <input
                type="url"
                value={activeConfig.webhookUrl}
                onChange={(e) => {
                  const updated = configs.map((c) =>
                    c.platform === selectedPlatform ? { ...c, webhookUrl: e.target.value } : c
                  );
                  saveConfigs(updated);
                }}
                className="w-full text-xs font-mono px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy-900"
                placeholder={
                  selectedPlatform === 'slack'
                    ? 'https://hooks.slack.com/services/...'
                    : 'https://outlook.office.com/webhook/...'
                }
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Channel / Team Name:
              </label>
              <input
                type="text"
                value={activeConfig.channelName}
                onChange={(e) => {
                  const updated = configs.map((c) =>
                    c.platform === selectedPlatform ? { ...c, channelName: e.target.value } : c
                  );
                  saveConfigs(updated);
                }}
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Interactive Chat Mock Bench */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Live {selectedPlatform === 'slack' ? 'Slack Block Kit' : 'Microsoft Teams'} Card Preview & Interactive Action Test:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={copyPayload}
              className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-navy-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors font-medium"
            >
              <Copy className="w-3 h-3" />
              <span>Copy {selectedPlatform === 'slack' ? 'Block Kit' : 'Adaptive Card'} JSON</span>
            </button>
            <button
              onClick={() => setShowJsonPayload(!showJsonPayload)}
              className="text-[11px] text-blue-600 hover:underline font-medium"
            >
              {showJsonPayload ? 'Hide JSON' : 'Inspect JSON'}
            </button>
          </div>
        </div>

        {/* JSON Inspector */}
        {showJsonPayload && (
          <pre className="p-3 bg-slate-900 text-emerald-400 text-[10px] font-mono rounded-xl max-h-48 overflow-y-auto leading-relaxed border border-slate-700">
            {JSON.stringify(activePayload, null, 2)}
          </pre>
        )}

        {/* ─── SLACK THEMED CARD MOCK ─── */}
        {selectedPlatform === 'slack' && (
          <div className="bg-[#1A1D21] text-white p-4 rounded-xl border border-slate-800 shadow-md font-sans">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-navy-950 text-sm shrink-0">
                BG
              </div>
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100">{activeConfig.botName}</span>
                  <span className="bg-[#2C3136] text-[10px] text-slate-400 px-1.5 py-0.2 rounded font-semibold uppercase">
                    APP
                  </span>
                  <span className="text-[11px] text-slate-400">Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="bg-[#222529] p-3.5 rounded-lg border-l-4 border-amber-400 space-y-2.5">
                  <div className="font-bold text-sm text-slate-100">
                    🛡️ BrandGuard Governance Sign-Off Request
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>
                      <span className="text-slate-400 block font-semibold">Draft Title:</span>
                      <span className="font-medium text-slate-200">{submission.title}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Status & Readiness:</span>
                      <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">
                        {submission.status} ({submission.readinessScore}%)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Channel / Market:</span>
                      <span>{submission.channel} • {submission.market}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Author:</span>
                      <span>{submission.submittedBy}</span>
                    </div>
                  </div>

                  <div className="bg-[#1A1D21] p-2.5 rounded text-[11px] text-slate-300 border border-slate-800 font-mono leading-relaxed line-clamp-3">
                    {submission.content}
                  </div>

                  {/* Interactive Buttons (Simulated Slack Block Kit Actions) */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-800">
                    <button
                      onClick={handleInlineApprove}
                      className="bg-[#007A5A] hover:bg-[#148567] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Seal</span>
                    </button>
                    <button
                      onClick={handleInlineReject}
                      className="bg-[#E01E5A] hover:bg-[#c9184e] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject (Needs Evidence)</span>
                    </button>
                    <button
                      onClick={() => onNavigateToWorkspace(submission.id)}
                      className="bg-[#2C3136] hover:bg-[#383F45] text-slate-200 text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-medium"
                    >
                      <span>Open Review Workspace</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── MICROSOFT TEAMS THEMED CARD MOCK ─── */}
        {selectedPlatform === 'teams' && (
          <div className="bg-[#292B36] text-white p-4 rounded-xl border border-[#3D4050] shadow-md font-sans">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#505AC9] flex items-center justify-center font-bold text-white text-sm shrink-0">
                T
              </div>
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100">{activeConfig.botName}</span>
                  <span className="text-[11px] text-slate-400">• Brand Compliance Connector</span>
                </div>

                <div className="bg-[#1F2129] p-4 rounded-xl border border-[#3D4050] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#7B83EB]">
                      🛡️ BrandGuard Sign-Off Request
                    </span>
                    <span className="bg-[#505AC9]/20 text-[#7B83EB] font-bold text-[10px] px-2 py-0.5 rounded-full border border-[#505AC9]/40">
                      Adaptive Card 1.5
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-100 text-xs">{submission.title}</h4>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#292B36] p-2.5 rounded-lg">
                    <div>
                      <span className="text-slate-400 block font-semibold">Author:</span>
                      <span>{submission.submittedBy}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Channel:</span>
                      <span>{submission.channel} ({submission.market})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Readiness Score:</span>
                      <span className="text-emerald-400 font-bold">{submission.readinessScore}% ({submission.readinessStatus})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Approval Seal:</span>
                      <span className="font-mono text-slate-300">{submission.approvedContentHash ? `${submission.approvedContentHash.slice(0, 12)}...` : 'Unsealed'}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#292B36] rounded-lg text-slate-300 text-[11px] font-mono line-clamp-3">
                    {submission.content}
                  </div>

                  {/* Adaptive Card Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-[#3D4050]">
                    <button
                      onClick={handleInlineApprove}
                      className="bg-[#505AC9] hover:bg-[#626BD6] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve (Sign Off)</span>
                    </button>
                    <button
                      onClick={handleInlineReject}
                      className="bg-[#3D4050] hover:bg-[#4D5163] text-red-400 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => onNavigateToWorkspace(submission.id)}
                      className="bg-[#3D4050] hover:bg-[#4D5163] text-slate-200 text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Open Workspace
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dispatch Button & Result status */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Target Channel: <strong className="text-slate-700">{activeConfig.channelName}</strong>
            {demoMode && <span className="ml-1 text-amber-600 font-semibold">(Simulation Mode Active)</span>}
          </div>

          <button
            onClick={handleSendNotification}
            disabled={isSending}
            className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {isSending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Dispatching Bot...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-[#FFD60A]" />
                <span>Post {selectedPlatform === 'slack' ? 'Slack' : 'Teams'} Interactive Notification</span>
              </>
            )}
          </button>
        </div>

        {/* Notification Activity Log */}
        {notificationLog.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Recent Bot Dispatches:
            </span>
            {notificationLog.slice(0, 3).map((log, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-slate-700 font-medium">{log.message}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

