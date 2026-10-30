import React, { useState } from 'react';
import { useBrand } from '../context/BrandContext';
import { DEMO_ROLES } from '../data/seedData';
import { Shield, Sparkles, RotateCcw, Key, Check, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

export const Header: React.FC<{ onNavigate: (view: string) => void; currentView: string }> = ({
  onNavigate,
  currentView,
}) => {
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    resetDemoData,
    startGuidedTour,
    apiKey,
    setApiKey,
    showToast,
  } = useBrand();

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveKey = () => {
    setApiKey(tempKey);
    setShowKeyModal(false);
    showToast('Gemini API key configured for contextual reviews.');
  };

  const handleResetWithAnimation = () => {
    setIsResetting(true);
    resetDemoData();
    setTimeout(() => {
      setIsResetting(false);
      showToast('All demo drafts, rules, and facts restored to pristine state.');
    }, 400);
  };

  return (
    <>
      <header className="bg-[#14284B] text-white border-b border-[#213f70] px-6 lg:px-10 py-4.5 lg:py-5 sticky top-0 z-40 shadow-[0_4px_24px_rgba(10,22,44,0.25)] select-none">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 max-w-[1850px] mx-auto w-full">
          {/* Logo & Brand Identity — Spacious & Authoritative */}
          <div
            className="flex items-center gap-4 cursor-pointer group shrink-0"
            onClick={() => onNavigate('dashboard')}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FFD60A] via-[#FBBF24] to-[#F59E0B] flex items-center justify-center text-[#14284B] shadow-lg shadow-amber-500/25 ring-2 ring-[#FFD60A]/40 group-hover:scale-105 group-hover:shadow-amber-500/40 transition-all duration-200">
              <Shield className="w-6 h-6 stroke-[2.4] fill-[#14284B]/15" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-heading font-extrabold text-2xl lg:text-[26px] tracking-tight text-white group-hover:text-[#FFD60A] transition-colors">
                  BrandGuard AI
                </span>
                <span className="bg-[#FFD60A] text-[#14284B] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-xs">
                  Enterprise Control Layer
                </span>
              </div>
              <p className="text-xs text-blue-200/90 font-medium tracking-tight mt-0.5 flex items-center gap-2">
                <span>Governance before publication. Every content decision backed by evidence.</span>
              </p>
            </div>
          </div>

          {/* Action Center & Persona Switcher — Spacious with Generous Gap */}
          <div className="flex flex-wrap items-center gap-3.5">
            {/* Guided Demo Button — High-Impact Gold Pill */}
            <button
              onClick={() => {
                onNavigate('workspace');
                startGuidedTour();
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-[#FFD60A] to-[#FBBF24] hover:from-[#ffe043] hover:to-[#fcd34d] text-[#14284B] text-xs font-black px-4.5 py-2.5 rounded-xl shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150"
              title="Launch interactive 60-second guided demo walkthrough"
              id="btn-guided-demo"
            >
              <Sparkles className="w-4 h-4 fill-[#14284B]" />
              <span>Guided Demo (60s)</span>
            </button>

            {/* Gemini API Key Button */}
            <button
              onClick={() => setShowKeyModal(true)}
              className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2.5 rounded-xl border transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${
                apiKey
                  ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-sm'
                  : 'bg-[#1e3865]/80 hover:bg-[#1e3865] border-[#2c4e85] text-slate-200 hover:text-white shadow-xs'
              }`}
              title="Configure optional Gemini API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{apiKey ? 'Gemini AI Active ✓' : 'Gemini Key (Optional)'}</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={handleResetWithAnimation}
              className="flex items-center gap-1.5 bg-[#1e3865]/80 hover:bg-[#1e3865] border border-[#2c4e85] text-slate-200 hover:text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-xs"
              title="Reset all drafts, rules, and facts to pristine seed state"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            {/* Persona Role Switcher — Spacious, Segmented, Clearly Labeled */}
            <div className="flex items-center bg-[#0b162b]/90 p-1.5 rounded-2xl border border-[#28497d] shadow-inner gap-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2.5 hidden xl:inline">
                Active Persona:
              </span>
              <div className="flex items-center gap-1">
                {DEMO_ROLES.map((r) => {
                  const isActive = r.id === currentRole;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        setCurrentRole(r.id);
                        showToast(`Switched active persona to ${r.name} (${r.title})`);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-[#1e3865] text-white shadow-sm border border-blue-400/50 font-bold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-[#14284B]/60'
                      }`}
                      aria-label={`Switch role to ${r.name}`}
                      title={`${r.name} — ${r.title}`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                          isActive
                            ? 'bg-[#FFD60A] text-[#14284B] shadow-xs'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {r.avatar}
                      </span>
                      <span className="hidden md:inline">{r.name.split(' ')[0]}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Gemini API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-[#08101e]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-navy-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                Gemini API Key Configuration
              </h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xl font-bold transition-colors"
              >
                &times;
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              BrandGuard functions fully with deterministic rules & simulated AI out-of-the-box. Providing a Gemini API key
              enables live LLM extraction strictly grounded in your active brand knowledge base.
            </p>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">API Key</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="w-full text-xs font-mono px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-900 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setTempKey('');
                  setApiKey('');
                  setShowKeyModal(false);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
              >
                Clear Key
              </button>
              <button
                onClick={handleSaveKey}
                className="px-4 py-2 text-xs font-bold bg-[#14284B] hover:bg-navy-950 text-white rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                Save & Enable Live AI
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
