import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, Cpu, Eye, FileText, ArrowRight, Sparkles, Check } from 'lucide-react';

export const RoadmapResponsibleView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm">
        <h1 className="font-heading font-extrabold text-2xl text-navy-900 mb-2">
          Architecture Roadmap & Responsible AI Charter
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
          BrandGuard AI is architected as an accountable control layer between raw evidence and public distribution. We
          prioritize strict determinism, source grounding, and human accountability over autonomous generation.
        </p>
      </div>

      {/* Responsible AI Principles Card */}
      <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white rounded-3xl p-7 shadow-xl border border-navy-700">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-[#FFD60A] text-[#14284B] flex items-center justify-center font-black shadow-md">
            <ShieldCheck className="w-6 h-6 stroke-[2.4]" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-lg text-white">Responsible AI Operating Principles</h2>
            <p className="text-xs text-blue-200 font-medium">The 6 pillars ensuring governance decisions remain defensible</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 text-xs">
          <div className="bg-navy-950/60 p-4.5 rounded-2xl border border-blue-400/20">
            <span className="font-extrabold text-[#FFD60A] block mb-1">1. Deterministic Core</span>
            <p className="text-slate-300 leading-relaxed">
              Regex, trademark registers, and date-window checks execute first without stochastic drift or hallucinations.
            </p>
          </div>

          <div className="bg-navy-950/60 p-4.5 rounded-2xl border border-blue-400/20">
            <span className="font-extrabold text-[#FFD60A] block mb-1">2. Retrieval-Grounded AI</span>
            <p className="text-slate-300 leading-relaxed">
              When LLMs are invoked, they query ONLY from certified knowledge base records. Claims without sources are
              flagged.
            </p>
          </div>

          <div className="bg-navy-950/60 p-4.5 rounded-2xl border border-blue-400/20">
            <span className="font-extrabold text-[#FFD60A] block mb-1">3. Fully Explainable Chains</span>
            <p className="text-slate-300 leading-relaxed">
              Every finding traces: Claim → Applicable Rule → Grounded Evidence → Plain-English Reason → Diff Correction.
            </p>
          </div>

          <div className="bg-navy-950/60 p-4.5 rounded-2xl border border-blue-400/20">
            <span className="font-extrabold text-[#FFD60A] block mb-1">4. Human in Ultimate Control</span>
            <p className="text-slate-300 leading-relaxed">
              "AI findings never grant publication permission." Human sign-off is mandatory for all publication releases.
            </p>
          </div>

          <div className="bg-navy-950/60 p-4.5 rounded-2xl border border-blue-400/20">
            <span className="font-extrabold text-[#FFD60A] block mb-1">5. Version-Bound Permissions</span>
            <p className="text-slate-300 leading-relaxed">
              Approvals seal the exact content cryptographic hash. Material edits automatically reset approval status to
              reopened.
            </p>
          </div>

          <div className="bg-navy-950/60 p-4.5 rounded-2xl border border-blue-400/20">
            <span className="font-extrabold text-[#FFD60A] block mb-1">6. Privacy & Integrity by Design</span>
            <p className="text-slate-300 leading-relaxed">
              Client copy is never retained in public LLM training sets. Auditable logs record every human decision
              justification.
            </p>
          </div>
        </div>
      </div>

      {/* Tier 1 / 2 / 3 Roadmap Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Tier 1: Core MVP (Current) */}
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-500 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-[10px] uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300">
                Tier 1 (Core Governance)
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-navy-900 mb-2">Core Governance Engine</h3>
            <ul className="text-xs space-y-2 text-slate-600">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Versioned brand rules, facts & sources</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Text and social copy deterministic review</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>6-step reasoning chains with minimal-change diffs</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Version-bound cryptographic approval resets</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Time-aware & conflict-surfacing knowledge base</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Governance analytics & learning loop</span>
              </li>
            </ul>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] font-black text-emerald-700">
            100% Implemented & Live
          </div>
        </div>

        {/* Tier 2: Multimodal & Live Bots */}
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-500 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-[10px] uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300">
                Tier 2 (Multimodal Intake)
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-navy-900 mb-2">Multimodal Intake & Bots</h3>
            <ul className="text-xs space-y-2 text-slate-600">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>PDF and Microsoft Word DOCX multi-page parser</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Image OCR & retired logo computer vision detection</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Automated WCAG color contrast vector verification</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Slack Block Kit & Microsoft Teams Adaptive Card inline bots</span>
              </li>
            </ul>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] font-black text-emerald-700">
            100% Implemented & Live
          </div>
        </div>

        {/* Tier 3: Autonomous Publishing & Drift Crawler */}
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-500 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-[10px] uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300">
                Tier 3 (Publishing & Crawler)
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-navy-900 mb-2">Publishing & Crawler</h3>
            <ul className="text-xs space-y-2 text-slate-600">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>WordPress, Webflow, HubSpot, Twitter & LinkedIn webhooks</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Cryptographic seal verification before publish</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Post-publication drift crawler comparing live DOM hashes</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>1-click drift remediation draft creation</span>
              </li>
            </ul>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] font-black text-emerald-700">
            100% Implemented & Live
          </div>
        </div>
      </div>
    </div>
  );
};
