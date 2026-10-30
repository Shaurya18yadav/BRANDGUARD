import React, { useState, useRef } from 'react';
import { useBrand } from '../context/BrandContext';
import { SAMPLE_DRAFTS } from '../data/seedData';
import { parseFile, detectFileType, SupportedFileType } from '../services/fileParserService';
import { VisionAnalysisPanel } from '../components/VisionAnalysisPanel';
import { VisionAnalysisResult } from '../services/ocrVisionService';
import {
  Sparkles,
  Send,
  FileEdit,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  Upload,
  FileText,
  File,
  X,
  Loader2,
  Eye,
  Check,
  Shield,
  Layers,
} from 'lucide-react';

export const SubmitView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { createNewSubmission, runReviewOnSubmission, showToast } = useBrand();

  const [title, setTitle] = useState<string>('Q4 Product Launch & Platform Update Announcement');
  const [brand, setBrand] = useState<string>('Nimbus Analytics');
  const [channel, setChannel] = useState<'LinkedIn' | 'Website' | 'Email' | 'Press' | 'Twitter/X'>('LinkedIn');
  const [market, setMarket] = useState<'US' | 'EU' | 'India' | 'Global'>('EU');
  const [content, setContent] = useState<string>(SAMPLE_DRAFTS.messy.content);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [stepMessage, setStepMessage] = useState<string>('');

  // Mode: Text entry vs Document upload vs Vision check
  const [intakeMode, setIntakeMode] = useState<'text' | 'file' | 'vision'>('text');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [fileInfo, setFileInfo] = useState<{ type: SupportedFileType; wordCount: number; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Vision analysis state
  const [visionResults, setVisionResults] = useState<VisionAnalysisResult | null>(null);

  const loadPreset = (key: 'messy' | 'risky' | 'clean') => {
    const preset = SAMPLE_DRAFTS[key];
    setTitle(preset.title);
    setChannel(preset.channel);
    setMarket(preset.market);
    setContent(preset.content);
    setUploadedFile(null);
    setFileInfo(null);
    showToast(`Loaded ${key.toUpperCase()} sample draft.`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = detectFileType(file);
    if (fileType === 'unsupported') {
      showToast('Unsupported file format. Upload PDF, DOCX, or TXT files.');
      return;
    }

    setUploadedFile(file);
    setIsParsingFile(true);

    try {
      const result = await parseFile(file);
      setContent(result.text);
      setFileInfo({ type: fileType, wordCount: result.wordCount, name: file.name });
      showToast(`Extracted ${result.wordCount} words from ${file.name}`);
    } catch (error: any) {
      showToast(`File parsing error: ${error.message}`);
      setUploadedFile(null);
    } finally {
      setIsParsingFile(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setFileInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleVisionFindings = (results: VisionAnalysisResult) => {
    setVisionResults(results);
    if (results.ocrText && results.ocrText.length > 0) {
      const ocrPrefix = '\n\n--- [OCR Extracted Visual Text] ---\n';
      if (!content.includes('[OCR Extracted Visual Text]')) {
        setContent((prev) => prev + ocrPrefix + results.ocrText);
      }
    }
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
    showToast('Governance review complete. Opening workspace...');
    onNavigate('workspace');
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-navy-900">Submit Content for Review</h1>
            <span className="bg-[#FFD60A] text-[#14284B] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-xs">
              Intake Gateway
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Run copy, uploaded documents, or marketing assets against Nimbus brand guidelines, verified metrics, and legal
            sources before publication.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Presets:</span>
          <button
            type="button"
            onClick={() => loadPreset('messy')}
            className="text-xs font-bold px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl border border-rose-200/70 transition-all hover:scale-105 active:scale-95 shadow-xs"
            title="Load sample copy with obsolete names and unapproved claims"
          >
            Messy (5 issues)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('risky')}
            className="text-xs font-bold px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl border border-amber-200/70 transition-all hover:scale-105 active:scale-95 shadow-xs"
            title="Load copy with extreme superlatives and competitor naming"
          >
            Risky Claims
          </button>
          <button
            type="button"
            onClick={() => loadPreset('clean')}
            className="text-xs font-bold px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200/70 transition-all hover:scale-105 active:scale-95 shadow-xs"
            title="Load compliant, evidence-backed sample"
          >
            Clean Copy
          </button>
        </div>
      </div>

      {/* Intake Mode Switcher Tabs */}
      <div className="flex bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300/80 gap-1.5">
        <button
          type="button"
          onClick={() => setIntakeMode('text')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            intakeMode === 'text'
              ? 'bg-[#14284B] text-white shadow-md'
              : 'text-slate-700 hover:text-navy-900 hover:bg-white/60'
          }`}
        >
          <FileEdit className="w-4 h-4" />
          <span>Direct Text Editor</span>
        </button>

        <button
          type="button"
          onClick={() => setIntakeMode('file')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            intakeMode === 'file'
              ? 'bg-[#14284B] text-white shadow-md'
              : 'text-slate-700 hover:text-navy-900 hover:bg-white/60'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document (PDF / DOCX)</span>
          {fileInfo && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
        </button>

        <button
          type="button"
          onClick={() => setIntakeMode('vision')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            intakeMode === 'vision'
              ? 'bg-[#14284B] text-white shadow-md'
              : 'text-slate-700 hover:text-navy-900 hover:bg-white/60'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>OCR & Visual Governance (Images)</span>
          {visionResults && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
        </button>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm space-y-5">
        {/* Title & Brand */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Submission Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs font-medium px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#14284B] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Governed Brand
            </label>
            <input
              type="text"
              disabled
              value={brand}
              className="w-full text-xs font-bold px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Channel and Market */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Target Channel
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as any)}
              className="w-full text-xs font-semibold px-4 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#14284B] focus:outline-none"
            >
              <option value="LinkedIn">LinkedIn (Professional Tone)</option>
              <option value="Twitter/X">Twitter/X (Shortform)</option>
              <option value="Website">Website (Product Marketing)</option>
              <option value="Email">Email (Direct Demand Gen)</option>
              <option value="Press">Press Release (Strict Regulatory)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Target Market & Jurisdiction
            </label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value as any)}
              className="w-full text-xs font-semibold px-4 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#14284B] focus:outline-none"
            >
              <option value="EU">EU (GDPR & Strict Comparative Ad Directives)</option>
              <option value="US">US (FTC Claim Substantiation Rules)</option>
              <option value="India">India (Digital Personal Data Protection Act)</option>
              <option value="Global">Global (Conservative Baseline)</option>
            </select>
          </div>
        </div>

        {/* CONDITIONAL MODE PANELS */}

        {/* Mode 1: File Upload Dropzone */}
        {intakeMode === 'file' && (
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Upload Document for Extraction
            </label>

            {!fileInfo ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#14284B] bg-slate-50/80 hover:bg-blue-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all duration-150 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-500 group-hover:text-navy-900 group-hover:scale-110 transition-all">
                  <Upload className="w-6 h-6 stroke-[2]" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Click to select PDF or Microsoft Word DOCX
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Full multi-page parsing via pdfjs-dist and mammoth. Raw text will be extracted automatically.
                </p>
                {isParsingFile && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-navy-900">
                    <Loader2 className="w-4 h-4 animate-spin text-[#14284B]" />
                    <span>Parsing document pages and extracting text spans...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-950">{fileInfo.name}</p>
                    <p className="text-[11px] text-emerald-700">
                      Format: {fileInfo.type.toUpperCase()} • {fileInfo.wordCount} words extracted
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors"
                  title="Remove uploaded file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mode 2: Vision & OCR Panel */}
        {intakeMode === 'vision' && (
          <div className="space-y-3">
            <VisionAnalysisPanel
              onVisionFindings={handleVisionFindings}
              showToast={showToast}
            />
          </div>
        )}

        {/* Mode 3 / Universal: Copy Content Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              {intakeMode === 'file' ? 'Extracted Text Review' : 'Content Copy to Review'}
            </label>
            <span className="text-[11px] font-semibold text-slate-500">
              {wordCount} words • {charCount} characters
            </span>
          </div>

          <textarea
            rows={10}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste raw marketing copy, social draft, or announcement text here..."
            className="w-full text-xs font-mono p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-[#14284B] focus:outline-none leading-relaxed bg-white selection:bg-yellow-200"
          />
        </div>

        {/* Submit Button & Progress Indicator */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs text-slate-500">
            {isSubmitting ? (
              <div className="flex items-center gap-2 text-navy-900 font-bold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-[#14284B]" />
                <span>{stepMessage}</span>
              </div>
            ) : (
              <span>Deterministic rules evaluate first; LLM extracts contextual claims.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-[#14284B] hover:bg-navy-950 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Evaluating...' : 'Run Governance Review →'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
