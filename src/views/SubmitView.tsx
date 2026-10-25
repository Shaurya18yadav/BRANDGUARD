import React, { useState } from 'react';
import { useBrand } from '../context/BrandContext';
import { SAMPLE_DRAFTS } from '../data/seedData';
import { Sparkles, Send, FileEdit, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';

export const SubmitView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { createNewSubmission, runReviewOnSubmission, showToast } = useBrand();

  const [title, setTitle] = useState<string>('Q4 Product Launch & Platform Update Announcement');
  const [brand, setBrand] = useState<string>('Nimbus Analytics');
  const [channel, setChannel] = useState<'LinkedIn' | 'Website' | 'Email' | 'Press' | 'Twitter/X'>('LinkedIn');
  const [market, setMarket] = useState<'US' | 'EU' | 'India' | 'Global'>('EU');
  const [content, setContent] = useState<string>(SAMPLE_DRAFTS.messy.content);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [stepMessage, setStepMessage] = useState<string>('');

  const loadPreset = (key: 'messy' | 'risky' | 'clean') => {
    const preset = SAMPLE_DRAFTS[key];
    setTitle(preset.title);
    setChannel(preset.channel);
    setMarket(preset.market);
    setContent(preset.content);
    showToast(`Loaded ${key.toUpperCase()} sample draft.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast('Please provide text copy to evaluate.');
      return;
    }

    setIsSubmitting(true);
    setStepMessage('Tokenizing content and loading active brand rules...');
    await new Promise((r) => setTimeout(r, 400));

    setStepMessage('Evaluating deterministic rules and approved fact sources...');
    await new Promise((r) => setTimeout(r, 500));

    setStepMessage('Computing publication readiness and reasoning chains...');
    const newSub = createNewSubmission({
      title,
      brand,
      channel,
      market,
      content,
    });

    await runReviewOnSubmission(newSub.id);
    setIsSubmitting(false);

    onNavigate('workspace');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h1 className="font-heading font-bold text-xl text-navy-900">Submit Content for Governance Review</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Input copy with channel and regional target parameters before public release.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Presets:</span>
            <button
              type="button"
              onClick={() => loadPreset('messy')}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors border border-amber-300"
            >
              Messy (Demo)
            </button>
            <button
              type="button"
              onClick={() => loadPreset('risky')}
              className="bg-red-50 hover:bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors border border-red-200"
            >
              Risky Claims
            </button>
            <button
              type="button"
              onClick={() => loadPreset('clean')}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors border border-emerald-200"
            >
              Clean
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Submission Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-900 focus:outline-none"
                placeholder="e.g. Q4 Platform Release Announcement"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Channel</label>
              <select
                value={channel}
                onChange={(e: any) => setChannel(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-navy-900 focus:outline-none"
              >
                <option value="LinkedIn">LinkedIn Post</option>
                <option value="Website">Website / Blog</option>
                <option value="Email">Customer Email</option>
                <option value="Press">Press Release</option>
                <option value="Twitter/X">Twitter / X</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Regional Market</label>
              <select
                value={market}
                onChange={(e: any) => setMarket(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-navy-900 focus:outline-none"
              >
                <option value="EU">European Union (GDPR Strict)</option>
                <option value="US">United States (FTC / SEC)</option>
                <option value="India">India (DPDP Compliant)</option>
                <option value="Global">Global / Worldwide</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Content / Social Copy</label>
              <span className="text-[11px] text-slate-400">{content.length} characters</span>
            </div>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs font-sans p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-900 focus:outline-none leading-relaxed"
              placeholder="Paste draft copy, marketing announcement, or social copy..."
            />
          </div>

          {/* Review execution button with loading states */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Grounded in Nimbus Knowledge Base v2.1</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#14284B] hover:bg-navy-950 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#FFD60A] border-t-transparent rounded-full animate-spin" />
                  <span>{stepMessage}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FFD60A]" />
                  <span>Run Governance Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Excluded Roadmap Chips */}
      <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
          Intake Integrations (Tier 2/3 Roadmap):
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full border border-slate-300 cursor-not-allowed">
            PDF / DOCX Intake • Roadmap (Tier 2)
          </span>
          <span className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full border border-slate-300 cursor-not-allowed">
            Figma OCR & Asset Matching • Roadmap (Tier 2)
          </span>
          <span className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full border border-slate-300 cursor-not-allowed">
            Automated CMS Publishing Webhooks • Roadmap (Tier 3)
          </span>
        </div>
      </div>
    </div>
  );
};
