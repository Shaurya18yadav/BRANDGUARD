import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, Cpu, Eye, FileText, ArrowRight, Sparkles } from 'lucide-react';

export const RoadmapResponsibleView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h1 className="font-heading font-bold text-2xl text-navy-900 mb-2">
          Architecture Roadmap & Responsible AI Charter
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
          BrandGuard AI is architected as an accountable control layer between raw evidence and public distribution. We
          prioritize strict determinism, source grounding, and human accountability over autonomous generation.
        </p>
      </div>

      {/* Responsible AI Principles Card */}
      <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white rounded-2xl p-6 shadow-md border border-navy-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#FFD60A] text-[#14284B] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-white">Responsible AI Operating Principles</h2>
            <p className="text-xs text-blue-200">The 6 pillars ensuring governance decisions remain defensible</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="bg-navy-950/60 p-4 rounded-xl border border-blue-400/20">
            <span className="font-bold text-[#FFD60A] block mb-1">1. Deterministic Core</span>
            <p className="text-slate-300 leading-relaxed">
              Regex, trademark registers, and date-window checks execute first without stochastic drift or hallucinations.
            </p>
          </div>

          <div className="bg-navy-950/60 p-4 rounded-xl border border-blue-400/20">
            <span className="font-bold text-[#FFD60A] block mb-1">2. Retrieval-Grounded AI</span>
            <p className="text-slate-300 leading-relaxed">
              When LLMs are invoked, they query ONLY from certified knowledge base records. Claims without sources are
              flagged.
            </p>
          </div>

          <div className="bg-navy-950/60 p-4 rounded-xl border border-blue-400/20">
            <span className="font-bold text-[#FFD60A] block mb-1">3. Fully Explainable Chains</span>
            <p className="text-slate-300 leading-relaxed">
              Every finding traces: Claim → Applicable Rule → Grounded Evidence → Plain-English Reason → Diff Correction.
            </p>
          </div>

          <div className="bg-navy-950/60 p-4 rounded-xl border border-blue-400/20">
            <span className="font-bold text-[#FFD60A] block mb-1">4. Human in Ultimate Control</span>
            <p className="text-slate-300 leading-relaxed">
              "AI findings never grant publication permission." Human sign-off is mandatory for all publication releases.
            </p>
          </div>

          <div className="bg-navy-950/60 p-4 rounded-xl border border-blue-400/20">
            <span className="font-bold text-[#FFD60A] block mb-1">5. Version-Bound Permissions</span>
            <p className="text-slate-300 leading-relaxed">
              Approvals seal the exact content cryptographic hash. Material edits automatically reset approval status to
              reopened.
            </p>
          </div>

          <div className="bg-navy-950/60 p-4 rounded-xl border border-blue-400/20">
            <span className="font-bold text-[#FFD60A] block mb-1">6. Privacy & Integrity by Design</span>
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
        <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Tier 1 (Current Prototype)
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h3 className="font-heading font-bold text-base text-navy-900 mb-2">Core Governance Engine</h3>
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
          <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] font-bold text-emerald-700">
            100% Implemented & Live
          </div>
        </div>

        {/* Tier 2: Multimodal & Assets */}
        <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between opacity-85">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-xs uppercase tracking-wider text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
                Tier 2 Roadmap
              </span>
              <span className="text-xs text-slate-400">Q2 2025</span>
            </div>
            <h3 className="font-heading font-bold text-base text-navy-900 mb-2">Multimodal Intake & Assets</h3>
            <ul className="text-xs space-y-2 text-slate-600">
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400">•</span>
                <span>PDF and Microsoft Word DOCX multi-page parser</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400">•</span>
                <span>Figma banner OCR & retired logo computer vision</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400">•</span>
                <span>Automated WCAG color contrast vector verification</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400">•</span>
                <span>Direct Slack/Teams inline approval bots</span>
              </li>
            </ul>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-200 text-[11px] font-semibold text-slate-500">
            Planned for Enterprise Beta
          </div>
        </div>

        {/* Tier 3: Enterprise Orchestration */}
        <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between opacity-85">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-xs uppercase tracking-wider text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
                Tier 3 Roadmap
              </span>
              <span className="text-xs text-slate-400">Q3 2025</span>
            </div>
            <h3 className="font-heading font-bold text-base text-navy-900 mb-2">Autonomous Publishing Gateway</h3>
            <ul className="text-xs space-y-2 text-slate-600">
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400">•</span>
                <span>Direct Hubspot, Marketo & Webflow release webhooks</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400">•</span>
                <span>Continuous public web crawler for post-publication drift</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400">•</span>
                <span>Automated competitor rebuttal claim matching</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400">•</span>
                <span>SOC 2 Type II audit report auto-generation</span>
              </li>
            </ul>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-200 text-[11px] font-semibold text-slate-500">
            Enterprise Expansion
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer Footer */}
      <div className="p-4 bg-slate-100 rounded-xl text-center border border-slate-200 text-xs text-slate-500">
        Design approach and prototype. No compliance certification or production readiness is claimed.
      </div>
    </div>
  );
};
