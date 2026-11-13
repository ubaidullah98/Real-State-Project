import React, { useState, useRef } from 'react';
import { Project, ExtractedPlotLayout, PlotCategory } from '../../types';
import { analyzeMasterPlanFile, MasterPlanAnalysisResult } from '../../lib/pdfHelper';
import { formatPKR } from '../../lib/utils';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertTriangle,
  Layers,
  Edit3,
  Trash2,
  Plus,
  Save,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Eye,
  Sliders,
} from 'lucide-react';

interface MasterPlanPdfUploaderProps {
  project: Project;
  onLayoutSaved: (extracted: ExtractedPlotLayout[]) => Promise<void>;
  onClose: () => void;
}

export const MasterPlanPdfUploader: React.FC<MasterPlanPdfUploaderProps> = ({
  project,
  onLayoutSaved,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<MasterPlanAnalysisResult | null>(null);
  const [extractedPlots, setExtractedPlots] = useState<ExtractedPlotLayout[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string>('Block A');
  const [estimatedPlotsCount, setEstimatedPlotsCount] = useState<number>(24);
  const [plotSizeCategory, setPlotSizeCategory] = useState<string>('120 Sq. Yds');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [editingPlotIndex, setEditingPlotIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setIsProcessing(true);
      try {
        const result = await analyzeMasterPlanFile(selected, selectedBlock, estimatedPlotsCount, plotSizeCategory);
        setAnalysisResult(result);
        setExtractedPlots(result.extractedPlots);
        setCurrentStep(2); // Move to Preview & Extraction
      } catch (err) {
        console.error('File parsing error:', err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleReExtract = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const result = await analyzeMasterPlanFile(file, selectedBlock, estimatedPlotsCount, plotSizeCategory);
      setAnalysisResult(result);
      setExtractedPlots(result.extractedPlots);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdatePlotField = (index: number, field: keyof ExtractedPlotLayout, value: any) => {
    setExtractedPlots((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemovePlot = (index: number) => {
    setExtractedPlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPlot = () => {
    const nextNum = extractedPlots.length + 1;
    const newPlot: ExtractedPlotLayout = {
      plotNumber: `${selectedBlock.replace(/Block\s*/i, '').trim() || 'A'}-${String(nextNum).padStart(2, '0')}`,
      blockNumber: selectedBlock,
      x: (nextNum % 6 - 2.5) * 16,
      z: Math.floor(nextNum / 6) * 18,
      width: 14,
      depth: 16,
      sizeStr: plotSizeCategory,
      dimensions: '30 x 36 ft',
      category: 'residential',
      estimatedPrice: 2160000,
    };
    setExtractedPlots((prev) => [...prev, newPlot]);
  };

  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    try {
      await onLayoutSaved(extractedPlots);
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e) {
      console.error('Error saving layout:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                PDF Master Plan Import & 3D Calibration
                <span className="text-xs bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-normal">
                  {project.name}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                10-Step workflow: Upload PDF → Extract Boundaries → Correct Layout → Generate 3D Map
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="bg-slate-50 dark:bg-slate-950/60 px-6 py-3 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs overflow-x-auto gap-2">
          <div className={`flex items-center gap-2 whitespace-nowrap ${currentStep >= 1 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>1</span>
            Upload Master Plan
          </div>
          <div className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
          <div className={`flex items-center gap-2 whitespace-nowrap ${currentStep >= 2 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>2</span>
            Extract & Calibrate
          </div>
          <div className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
          <div className={`flex items-center gap-2 whitespace-nowrap ${currentStep >= 3 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>3</span>
            Review & Manual Fixes
          </div>
          <div className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
          <div className={`flex items-center gap-2 whitespace-nowrap ${currentStep >= 4 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 4 ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>4</span>
            Sync to 3D & Firestore
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Upload */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500/60 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900/60 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                  Upload PDF Master Plan or High-Res Housing Layout
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-4">
                  Supports architectural PDF blueprints, society town-planning layouts, and vector/raster plot maps.
                </p>
                <span className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors">
                  Select File from Computer
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Extraction Parameters */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Pre-Extraction Parameters
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Target Block Prefix</label>
                    <select
                      value={selectedBlock}
                      onChange={(e) => setSelectedBlock(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-xs"
                    >
                      <option value="Block A">Block A</option>
                      <option value="Block B">Block B</option>
                      <option value="Block C">Block C (Executive)</option>
                      <option value="Commercial Sector">Commercial Sector</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Plot Size Category</label>
                    <select
                      value={plotSizeCategory}
                      onChange={(e) => setPlotSizeCategory(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-xs"
                    >
                      <option value="120 Sq. Yds">120 Sq. Yds (30 x 36 ft)</option>
                      <option value="200 Sq. Yds">200 Sq. Yds (35 x 51 ft)</option>
                      <option value="400 Sq. Yds">400 Sq. Yds (50 x 72 ft)</option>
                      <option value="5 Marla">5 Marla</option>
                      <option value="10 Marla">10 Marla</option>
                      <option value="1 Kanal">1 Kanal</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Estimated Plots in Section</label>
                    <input
                      type="number"
                      min={6}
                      max={120}
                      value={estimatedPlotsCount}
                      onChange={(e) => setEstimatedPlotsCount(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Preview & Extraction Calibration */}
          {currentStep === 2 && analysisResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{analysisResult.fileName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {(analysisResult.fileSize / 1024).toFixed(1)} KB • {analysisResult.scaleInfo.totalAreaEstimate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReExtract}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} /> Re-Scan
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                  >
                    Proceed to Review <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Master Plan Visual Preview Canvas */}
              <div className="relative h-64 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                {analysisResult.previewUrl ? (
                  <img
                    src={analysisResult.previewUrl}
                    alt="Master Plan Preview"
                    className="max-h-full object-contain opacity-80"
                  />
                ) : (
                  <div className="text-center p-6">
                    <FileText className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">PDF Master Plan vector geometry loaded</p>
                  </div>
                )}
                {/* Overlay bounding boxes */}
                <div className="absolute inset-0 bg-emerald-500/5 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-emerald-500/60 rounded-lg p-4 bg-white/85 dark:bg-emerald-950/60 backdrop-blur-xs text-center shadow-lg">
                    <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      Successfully Extracted {extractedPlots.length} Plots in {selectedBlock}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Manual Fixes */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Manual Plot Layout Verification Table</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review extracted plot numbers and dimensions. You can manually adjust plot numbers, block, size, or category.
                  </p>
                </div>
                <button
                  onClick={handleAddPlot}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 dark:bg-slate-800 hover:bg-amber-500/20 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Plot
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 sticky top-0 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-2.5">Plot #</th>
                      <th className="p-2.5">Block</th>
                      <th className="p-2.5">Plot Size</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Estimated Price (PKR)</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/50">
                    {extractedPlots.map((plot, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={plot.plotNumber}
                            onChange={(e) => handleUpdatePlotField(idx, 'plotNumber', e.target.value)}
                            className="w-20 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-white font-mono text-xs"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={plot.blockNumber}
                            onChange={(e) => handleUpdatePlotField(idx, 'blockNumber', e.target.value)}
                            className="w-24 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-white text-xs"
                          />
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{plot.sizeStr}</td>
                        <td className="p-2.5">
                          <select
                            value={plot.category}
                            onChange={(e) => handleUpdatePlotField(idx, 'category', e.target.value as PlotCategory)}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-900 dark:text-white"
                          >
                            <option value="residential">Residential</option>
                            <option value="corner">Corner</option>
                            <option value="park_facing">Park Facing</option>
                            <option value="boulevard">Boulevard</option>
                            <option value="commercial">Commercial</option>
                          </select>
                        </td>
                        <td className="p-2.5 font-semibold text-amber-600 dark:text-amber-400">
                          {formatPKR(plot.estimatedPrice)}
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => handleRemovePlot(idx)}
                            className="p-1 text-rose-600 dark:text-rose-400 hover:text-rose-500 rounded hover:bg-rose-500/10"
                            title="Remove Plot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Preview
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                >
                  Proceed to 3D Generation & Save <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: 3D Conversion & Database Save */}
          {currentStep === 4 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Ready to Commit {extractedPlots.length} Plots to 3D Master Plan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  The verified coordinates, plot labels, and block arrangements will be saved into the Firestore database
                  and instantly rendered in the interactive 3D viewer.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-4 rounded-xl max-w-md mx-auto text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Target Project:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{project.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Total Plots to Save:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{extractedPlots.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Target Block:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">{selectedBlock}</span>
                </div>
              </div>

              {saveSuccess ? (
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 py-2 rounded-lg max-w-md mx-auto">
                  ✓ Successfully saved to Firestore! Updating 3D Map...
                </div>
              ) : (
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Back to Review
                  </button>
                  <button
                    onClick={handleSaveToDatabase}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving to Database...' : 'Save Verified Layout to Database'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
