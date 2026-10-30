import React, { useState, useRef } from 'react';
import { analyzeImageAsset, VisionAnalysisResult, isImageFile } from '../services/ocrVisionService';
import {
  Eye,
  Upload,
  Palette,
  AlertTriangle,
  CheckCircle2,
  ImageIcon,
  ScanLine,
  Loader2,
  XCircle,
} from 'lucide-react';

interface VisionAnalysisPanelProps {
  onVisionFindings: (findings: VisionAnalysisResult) => void;
  showToast: (msg: string) => void;
}

export const VisionAnalysisPanel: React.FC<VisionAnalysisPanelProps> = ({
  onVisionFindings,
  showToast,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VisionAnalysisResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file)) {
      showToast('Unsupported file type. Upload PNG, JPG, WebP, or GIF images for visual analysis.');
      return;
    }

    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    setIsAnalyzing(true);
    setResult(null);

    try {
      const analysisResult = await analyzeImageAsset(file);
      setResult(analysisResult);
      onVisionFindings(analysisResult);

      if (analysisResult.findings.length > 0) {
        showToast(`🔍 Vision Analysis: ${analysisResult.findings.length} visual governance finding(s) detected.`);
      } else {
        showToast('✅ Vision Analysis: No visual governance violations found.');
      }
    } catch (error: any) {
      showToast(`Vision analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const severityColor = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'logo_violation': return '🏷️';
      case 'color_violation': return '🎨';
      case 'text_on_image': return '✍️';
      case 'accessibility': return '♿';
      default: return '🔍';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-cyan-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-navy-900">
              OCR & Visual Asset Governance
            </h3>
            <p className="text-[11px] text-slate-500">
              Upload images to check logos, colors, contrast & text compliance
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer transition-colors group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={handleImageUpload}
            className="hidden"
          />
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <span className="text-xs font-semibold text-indigo-700">Analyzing visual asset...</span>
              <span className="text-[11px] text-slate-400">Running OCR, color extraction & compliance checks</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-500 flex items-center justify-center transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Drop or click to upload image asset
              </span>
              <span className="text-[11px] text-slate-400">
                PNG, JPG, WebP, GIF — Checks logos, colors, WCAG contrast & text
              </span>
            </div>
          )}
        </div>

        {/* Preview + Results */}
        {result && (
          <div className="space-y-3">
            {/* Image preview & metadata */}
            <div className="flex gap-4 items-start">
              {previewUrl && (
                <div className="shrink-0">
                  <img
                    src={previewUrl}
                    alt="Uploaded asset preview"
                    className="w-28 h-20 object-cover rounded-lg border border-slate-200 shadow-sm"
                  />
                </div>
              )}
              <div className="flex-1 space-y-1.5 text-xs">
                <div className="font-bold text-navy-900">{fileName}</div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {result.imageWidth}×{result.imageHeight}px
                  </span>
                  <span className="flex items-center gap-1">
                    <ScanLine className="w-3 h-3" />
                    OCR Confidence: {result.ocrConfidence}%
                  </span>
                </div>

                {/* Dominant Colors */}
                <div className="flex items-center gap-1.5 mt-1">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-semibold text-slate-600">Dominant Colors:</span>
                  {result.dominantColors.slice(0, 5).map((color, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-0.5"
                      title={`${color.hex} — ${color.percentage}%`}
                    >
                      <div
                        className="w-4 h-4 rounded border border-slate-300 shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[9px] font-mono text-slate-400">{color.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* OCR Extracted Text */}
            {result.ocrText && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  OCR Extracted Text
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{result.ocrText}</p>
              </div>
            )}

            {/* Vision Findings */}
            {result.findings.length > 0 ? (
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Visual Governance Findings ({result.findings.length})
                </div>
                {result.findings.map((finding) => (
                  <div
                    key={finding.id}
                    className={`p-3 rounded-xl border text-xs ${severityColor(finding.severity)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold flex items-center gap-1.5">
                        <span>{typeIcon(finding.type)}</span>
                        {finding.title}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-white/60">
                          {finding.severity}
                        </span>
                        <span className="text-[10px] font-medium opacity-70">
                          {finding.confidence}% conf.
                        </span>
                      </div>
                    </div>
                    <p className="opacity-90 leading-relaxed">{finding.description}</p>
                    <div className="mt-1.5 pt-1.5 border-t border-current/10">
                      <span className="font-semibold">Suggestion: </span>
                      {finding.suggestion}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">All visual governance checks passed.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

