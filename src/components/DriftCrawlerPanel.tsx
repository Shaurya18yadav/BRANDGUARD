import React, { useState } from 'react';
import { useBrand, computeContentHash } from '../context/BrandContext';
import {
  MonitoredUrl,
  SEED_MONITORED_URLS,
  crawlAndAuditUrl,
  crawlAllMonitoredEndpoints,
  CrawlScanResult,
  DriftStatus,
} from '../services/driftCrawlerService';
import { DiffViewer } from './DiffViewer';
import {
  Globe,
  Radio,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Search,
  ArrowRight,
  Plus,
  Loader2,
  FileText,
} from 'lucide-react';

export const DriftCrawlerPanel: React.FC<{ onNavigateToWorkspace?: (subId: string) => void }> = ({
  onNavigateToWorkspace,
}) => {
  const { rules, facts, terminology, showToast, createNewSubmission, runReviewOnSubmission } = useBrand();

  const [monitoredList, setMonitoredList] = useState<MonitoredUrl[]>(() => {
    const saved = localStorage.getItem('bg_monitored_urls');
    return saved ? JSON.parse(saved) : SEED_MONITORED_URLS;
  });

  const [selectedItem, setSelectedItem] = useState<MonitoredUrl>(monitoredList[0]);
  const [isCrawlingAll, setIsCrawlingAll] = useState<boolean>(false);
  const [isCrawlingSingle, setIsCrawlingSingle] = useState<boolean>(false);
  const [newUrlInput, setNewUrlInput] = useState<string>('');
  const [showAddUrl, setShowAddUrl] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'diff' | 'regressions'>('diff');

  const saveList = (updated: MonitoredUrl[]) => {
    setMonitoredList(updated);
    localStorage.setItem('bg_monitored_urls', JSON.stringify(updated));
  };

  // Crawl a single endpoint
  const handleCrawlSingle = async (item: MonitoredUrl) => {
    setIsCrawlingSingle(true);
    try {
      const scan = await crawlAndAuditUrl(item, rules, facts, terminology);
      const updated: MonitoredUrl = {
        ...item,
        lastCrawledAt: scan.timestamp,
        liveHash: scan.liveHash,
        driftStatus: scan.status,
        similarityScore: scan.similarityScore,
        detectedRegressions: scan.regressions,
        driftExplanation: scan.remediationSummary,
      };

      const newList = monitoredList.map((m) => (m.id === item.id ? updated : m));
      saveList(newList);
      setSelectedItem(updated);

      if (scan.status === 'in_sync') {
        showToast(`✅ [Crawler] ${item.platform} page is in 100% sync! Hash seal verified.`);
      } else if (scan.status === 'critical_drift') {
        showToast(`🚨 [Crawler Alert] Critical drift detected on ${item.platform}! ${scan.regressionsCount} brand violations found.`);
      } else {
        showToast(`⚠️ [Crawler] Minor copy drift detected on ${item.platform}.`);
      }
    } finally {
      setIsCrawlingSingle(false);
    }
  };

  // Crawl all endpoints in batch
  const handleCrawlAll = async () => {
    setIsCrawlingAll(true);
    try {
      const scans = await crawlAllMonitoredEndpoints(monitoredList, rules, facts, terminology);
      const newList = monitoredList.map((item) => {
        const scan = scans.find((s) => s.urlId === item.id);
        if (!scan) return item;
        return {
          ...item,
          lastCrawledAt: scan.timestamp,
          liveHash: scan.liveHash,
          driftStatus: scan.status,
          similarityScore: scan.similarityScore,
          detectedRegressions: scan.regressions,
          driftExplanation: scan.remediationSummary,
        };
      });

      saveList(newList);
      const currentSelected = newList.find((n) => n.id === selectedItem.id) || newList[0];
      setSelectedItem(currentSelected);
      showToast(`🌐 Crawled and audited ${scans.length} live public endpoints!`);
    } finally {
      setIsCrawlingAll(false);
    }
  };

  // Import drifted copy directly into the review workspace for immediate remediation
  const handleImportDriftedToWorkspace = async () => {
    if (!selectedItem.liveContent) return;

    const newSub = createNewSubmission({
      title: `[Remediation Scan] Drift on ${selectedItem.submissionTitle}`,
      brand: 'Nimbus Analytics',
      channel: selectedItem.channel as any,
      market: 'EU',
      content: selectedItem.liveContent,
    });

    await runReviewOnSubmission(newSub.id);
    showToast(`Created remediation draft in Review Workspace!`);
    if (onNavigateToWorkspace) onNavigateToWorkspace(newSub.id);
  };

  const getStatusBadge = (status: DriftStatus, score: number) => {
    switch (status) {
      case 'in_sync':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>In Sync (100% Match)</span>
          </span>
        );
      case 'critical_drift':
        return (
          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-300 flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span>Critical Drift ({score}% Match)</span>
          </span>
        );
      case 'minor_drift':
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Minor Drift ({score}% Match)</span>
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
            Pending Crawl
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
      {/* Top Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-sm text-navy-900">
                Post-Publication Drift Crawler & Web Monitor
              </h3>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-300">
                Tier 3 • Autonomous Sentinel
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Continuously crawls live public web pages, verifies signed cryptographic hashes, and detects brand regressions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCrawlAll}
            disabled={isCrawlingAll}
            className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#FFD60A] ${isCrawlingAll ? 'animate-spin' : ''}`} />
            <span>{isCrawlingAll ? 'Crawling All...' : 'Crawl All Monitored URLs'}</span>
          </button>
        </div>
      </div>

      {/* Monitored Endpoints Table */}
      <div className="px-5">
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-navy-900">
              Active Monitored Public Endpoints ({monitoredList.length})
            </span>
            <span className="text-slate-400 text-[11px]">
              Click any URL row to inspect live drift & cryptographic comparison
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Monitored Resource</th>
                  <th className="py-2.5 px-3">Live Web URL</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Sealed Hash vs Live Hash</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monitoredList.map((item) => {
                  const isSelected = selectedItem.id === item.id;
                  const isExact = item.approvedHash === item.liveHash;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-navy-900">{item.submissionTitle}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-700">
                            {item.platform}
                          </span>
                          <span>•</span>
                          <span>Approved by {item.approvedBy}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 max-w-xs truncate text-[11px] text-blue-600 font-mono">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span className="truncate">{item.url}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      </td>

                      <td className="py-2.5 px-3">
                        {getStatusBadge(item.driftStatus, item.similarityScore)}
                      </td>

                      <td className="py-2.5 px-3 font-mono text-[10px]">
                        <div className="text-emerald-700">
                          Sealed: <strong>{item.approvedHash.slice(0, 14)}...</strong>
                        </div>
                        <div className={isExact ? 'text-emerald-700' : 'text-red-600 font-bold'}>
                          Live:&nbsp;&nbsp;&nbsp;<strong>{item.liveHash ? `${item.liveHash.slice(0, 14)}...` : 'Unchecked'}</strong>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCrawlSingle(item);
                          }}
                          disabled={isCrawlingSingle}
                          className="inline-flex items-center gap-1 text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-lg font-semibold shadow-2xs"
                        >
                          <RefreshCw className="w-3 h-3 text-blue-600" />
                          <span>Scrape Now</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Selected Endpoint Drift Inspector */}
      {selectedItem && (
        <div className="p-5 pt-0 space-y-3">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-sm text-navy-900">
                    Live Drift Analysis: {selectedItem.submissionTitle}
                  </span>
                  {getStatusBadge(selectedItem.driftStatus, selectedItem.similarityScore)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Target URL: <strong className="text-slate-800">{selectedItem.url}</strong> (Last crawled: {selectedItem.lastCrawledAt || 'Never'})
                </div>
              </div>

              {selectedItem.driftStatus === 'critical_drift' && (
                <button
                  onClick={handleImportDriftedToWorkspace}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Reopen & Import Drifted Text for Remediation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Alert banner if brand regressions detected */}
            {selectedItem.detectedRegressions && selectedItem.detectedRegressions.length > 0 && (
              <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-red-900 font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Brand Regressions Detected on Live Published Page ({selectedItem.detectedRegressions.length}):</span>
                </div>
                <p className="text-red-700 text-[11px] leading-relaxed">
                  {selectedItem.driftExplanation || 'Post-publication edits reintroduced non-compliant brand terminology or removed mandatory disclosures.'}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedItem.detectedRegressions.map((reg, idx) => (
                    <span
                      key={idx}
                      className="bg-red-100 text-red-900 border border-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    >
                      {reg.ruleName} ({reg.severity})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs: Diff vs Regressions */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab('diff')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'diff'
                    ? 'bg-navy-900 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Side-by-Side Content Diff
              </button>
              <button
                onClick={() => setActiveTab('regressions')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'regressions'
                    ? 'bg-navy-900 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Crawler Finding Details</span>
                {selectedItem.detectedRegressions?.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                    {selectedItem.detectedRegressions.length}
                  </span>
                )}
              </button>
            </div>

            {/* Side-by-side diff */}
            {activeTab === 'diff' && (
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                  <span>Approved Sealed Copy vs. Live Crawled DOM Text:</span>
                  <span className="font-mono text-[10px]">
                    Hash match: {selectedItem.approvedHash === selectedItem.liveHash ? 'TRUE (Exact)' : 'FALSE (Seal Broken)'}
                  </span>
                </div>
                <DiffViewer
                  original={selectedItem.approvedContent}
                  suggested={selectedItem.liveContent || selectedItem.approvedContent}
                />
              </div>
            )}

            {/* Regressions list */}
            {activeTab === 'regressions' && (
              <div className="space-y-2">
                {selectedItem.detectedRegressions && selectedItem.detectedRegressions.length > 0 ? (
                  selectedItem.detectedRegressions.map((reg) => (
                    <div
                      key={reg.id}
                      className="p-3 bg-white rounded-xl border border-red-200 text-xs space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between font-bold text-navy-900">
                        <span>{reg.ruleName}</span>
                        <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {reg.severity}
                        </span>
                      </div>
                      <p className="text-slate-700 text-[11px]">{reg.reasoning.explanation}</p>
                      <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-1.5 rounded">
                        Suggested Remediation: "{reg.reasoning.suggestedCorrection}"
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>No brand violations detected on the live published page!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

