import React, { useState } from 'react';
import { useBrand } from '../context/BrandContext';
import { DEMO_ROLES } from '../data/seedData';
import { Role } from '../types';
import { Shield, Sparkles, RotateCcw, Key, HelpCircle, CheckCircle2 } from 'lucide-react';

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

  const handleSaveKey = () => {
    setApiKey(tempKey);
    setShowKeyModal(false);
    showToast('Gemini API key configured for contextual reviews.');
  };

  return (
    <>
      <header className="bg-[#14284B] text-white border-b border-[#1e3865] px-6 py-3.5 sticky top-0 z-40 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD60A] to-[#f59e0b] flex items-center justify-center text-[#14284B] shadow-lg shadow-yellow-500/20 font-bold text-xl">
              <Shield className="w-6 h-6 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-xl tracking-tight text-white">BrandGuard AI</span>
                <span className="bg-[#FFD60A] text-[#14284B] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
                  Tier 1 MVP
                </span>
              </div>
              <p className="text-xs text-blue-200/80 font-normal">
                Evidence-backed brand governance before publication. Every content decision. Backed by evidence.
              </p>
            </div>
          </div>

          {/* Action Bar & Role Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Guided Demo Button */}
            <button
              onClick={() => {
                onNavigate('workspace');
                startGuidedTour();
              }}
              className="flex items-center gap-1.5 bg-[#FFD60A] hover:bg-[#ffe043] text-[#14284B] text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition-all transform hover:scale-[1.02]"
              title="Step-by-step interactive demo walkthrough"
              id="btn-guided-demo"
            >
              <Sparkles className="w-3.5 h-3.5 fill-[#14284B]" />
              <span>Guided Demo</span>
            </button>

            {/* Optional Gemini Key Button */}
            <button
              onClick={() => setShowKeyModal(true)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                apiKey
                  ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                  : 'bg-navy-800 border-navy-700 text-slate-300 hover:text-white'
              }`}
              title="Configure optional Gemini API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{apiKey ? 'Gemini AI Active' : 'Gemini Key (Optional)'}</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={resetDemoData}
              className="flex items-center gap-1 bg-navy-800 hover:bg-navy-700 border border-navy-700 text-slate-300 hover:text-white text-xs px-2.5 py-1.5 rounded-lg transition-colors"
              title="Reset all drafts, rules, and facts to pristine seed state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            {/* Role Switcher */}
            <div className="flex items-center bg-[#0b162a] p-1 rounded-xl border border-[#2a4b82]/50 shadow-inner">
              <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase tracking-wider hidden lg:inline">
                Role:
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
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#1e3865] text-white shadow-sm font-semibold border border-blue-400/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/40'
                      }`}
                      aria-label={`Switch role to ${r.name}`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isActive ? 'bg-[#FFD60A] text-[#14284B]' : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {r.avatar}
                      </span>
                      <span className="hidden sm:inline">{r.name.split(' ')[0]}</span>
                      {isActive && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5" />}
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
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-lg text-navy-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                Gemini API Key Configuration
              </h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              BrandGuard works with 100% deterministic rules & simulated AI out-of-the-box. Providing a Gemini API key
              enables live LLM JSON extraction grounded exclusively in your active brand knowledge base.
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-900 focus:outline-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setTempKey('');
                  setApiKey('');
                  setShowKeyModal(false);
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Clear Key
              </button>
              <button
                onClick={handleSaveKey}
                className="px-4 py-2 text-xs font-bold bg-navy-900 text-white rounded-xl hover:bg-navy-800"
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
