import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Plot, PlotStatus, PlotCategory } from '../types';
import { formatPKR, getPlotStatusColor } from '../lib/utils';
import { exportPlotsToExcel } from '../lib/excelExport';
import { BookingWizardModal } from '../components/common/BookingWizardModal';
import {
  Grid3X3,
  Plus,
  Layers,
  Search,
  Download,
  Edit,
  Trash2,
  X,
} from 'lucide-react';

export const PlotsPage: React.FC = () => {
  const { activeProject, plots, createPlot, bulkCreatePlots, updatePlot, deletePlot } = useProjects();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [blockFilter, setBlockFilter] = useState<string>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [bookingPlot, setBookingPlot] = useState<Plot | null>(null);

  const [plotNumber, setPlotNumber] = useState('');
  const [blockNumber, setBlockNumber] = useState('Block A');
  const [plotSize, setPlotSize] = useState('120 Sq. Yds');
  const [dimensions, setDimensions] = useState('30 x 36 ft');
  const [pricePerSqUnit, setPricePerSqUnit] = useState(18000);
  const [totalPlotPrice, setTotalPlotPrice] = useState(2160000);
  const [category, setCategory] = useState<PlotCategory>('residential');
  const [status, setStatus] = useState<PlotStatus>('available');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [bulkBlock, setBulkBlock] = useState('Block A');
  const [bulkStartNum, setBulkStartNum] = useState(1);
  const [bulkCount, setBulkCount] = useState(16);
  const [bulkSize, setBulkSize] = useState('120 Sq. Yds');
  const [bulkDimensions] = useState('30 x 36 ft');
  const [bulkPrice, setBulkPrice] = useState(2160000);

  const availableBlocks = Array.from(new Set(plots.map((p) => p.blockNumber)));

  const filteredPlots = plots.filter((p) => {
    const matchesSearch =
      p.plotNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.blockNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.plotSize.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesBlock = blockFilter === 'all' || p.blockNumber === blockFilter;

    return matchesSearch && matchesStatus && matchesBlock;
  });

  const openAddModal = () => {
    const nextSeq = plots.length + 1;
    setPlotNumber(`A-${String(nextSeq).padStart(2, '0')}`);
    setBlockNumber('Block A');
    setPlotSize('120 Sq. Yds');
    setDimensions('30 x 36 ft');
    setPricePerSqUnit(18000);
    setTotalPlotPrice(2160000);
    setCategory('residential');
    setStatus('available');
    setNotes('');
    setErrorMsg('');
    setShowAddModal(true);
  };

  const openEditModal = (p: Plot) => {
    setEditingPlot(p);
    setPlotNumber(p.plotNumber);
    setBlockNumber(p.blockNumber);
    setPlotSize(p.plotSize);
    setDimensions(p.dimensions);
    setPricePerSqUnit(p.pricePerSqUnit);
    setTotalPlotPrice(p.totalPlotPrice);
    setCategory(p.category);
    setStatus(p.status);
    setNotes(p.notes || '');
    setErrorMsg('');
  };

  const handleSaveSinglePlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotNumber.trim()) {
      setErrorMsg('Plot Number is required.');
      return;
    }

    try {
      if (editingPlot) {
        await updatePlot(editingPlot.id, {
          plotNumber,
          blockNumber,
          plotSize,
          dimensions,
          pricePerSqUnit,
          totalPlotPrice,
          category,
          status,
          notes,
        });
        setEditingPlot(null);
      } else {
        await createPlot({
          plotNumber,
          blockNumber,
          plotSize,
          dimensions,
          pricePerSqUnit,
          totalPlotPrice,
          category,
          status,
          notes,
          projectId: activeProject?.id,
        });
        setShowAddModal(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving plot');
    }
  };

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPlotsData: Partial<Plot>[] = [];
    const prefix = bulkBlock.replace(/Block\s*/i, '').trim() || 'A';

    for (let i = 0; i < bulkCount; i++) {
      const num = bulkStartNum + i;
      const plotNum = `${prefix}-${String(num).padStart(2, '0')}`;

      if (plots.some((p) => p.plotNumber.toLowerCase() === plotNum.toLowerCase())) {
        continue;
      }

      newPlotsData.push({
        plotNumber: plotNum,
        blockNumber: bulkBlock,
        plotSize: bulkSize,
        dimensions: bulkDimensions,
        pricePerSqUnit: Math.round(bulkPrice / 120),
        totalPlotPrice: bulkPrice,
        status: 'available',
        category: i === 0 || i === bulkCount - 1 ? 'corner' : 'residential',
        projectId: activeProject?.id,
        coordinates: {
          x: (i % 8 - 4) * 16,
          y: 0,
          z: Math.floor(i / 8) * 18,
          width: 14,
          depth: 16,
        },
      });
    }

    if (newPlotsData.length === 0) {
      setErrorMsg('All specified plot numbers already exist.');
      return;
    }

    await bulkCreatePlots(newPlotsData);
    setShowBulkModal(false);
  };

  const handleDeletePlot = async (p: Plot) => {
    if (!confirm(`Are you sure you want to delete Plot ${p.plotNumber}?`)) return;
    try {
      await deletePlot(p.id);
    } catch (err: any) {
      alert(err.message || 'Cannot delete plot');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Plot Inventory Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeProject?.name || 'Al-Basit Residency'} • Full list of residential, commercial, corner, and boulevard plots.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportPlotsToExcel(plots, activeProject || undefined)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-3.5 py-2 bg-amber-500/10 dark:bg-slate-800 hover:bg-amber-500/20 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-400 font-semibold text-xs rounded-xl border border-amber-500/30 flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-4 h-4" /> Bulk Generator
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Single Plot
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-lg flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by plot #, block, size..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-3 py-2 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="installments_in_progress">Installments Active</option>
            <option value="overdue">Payment Overdue</option>
            <option value="sold">Fully Sold</option>
          </select>

          <select
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs"
          >
            <option value="all">All Blocks</option>
            {availableBlocks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Showing <strong className="text-slate-900 dark:text-white">{filteredPlots.length}</strong> plots
          </span>
        </div>
      </div>

      {/* Plot Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-bold uppercase tracking-wider">Plot Number</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Block</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Size & Dims</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Category</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Status</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Total Price</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
              {filteredPlots.map((plot) => {
                const statusMeta = getPlotStatusColor(plot.status);

                return (
                  <tr key={plot.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {plot.plotNumber}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{plot.blockNumber}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">{plot.plotSize}</div>
                      <div className="text-[10px] text-slate-500">{plot.dimensions}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="capitalize text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 font-medium">
                        {plot.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400">{formatPKR(plot.totalPlotPrice)}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {plot.status === 'available' && (
                          <button
                            onClick={() => setBookingPlot(plot)}
                            className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-slate-950 font-bold rounded-lg border border-amber-500/30 transition-colors"
                          >
                            Book
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(plot)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
                          title="Edit Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePlot(plot)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/15 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                          title="Delete Plot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Single Plot Modal */}
      {(showAddModal || editingPlot) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                {editingPlot ? 'Edit Plot' : 'Add New Plot to Project'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingPlot(null);
                }}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSinglePlot} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Plot Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A-12"
                    value={plotNumber}
                    onChange={(e) => setPlotNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Block Number</label>
                  <input
                    type="text"
                    placeholder="e.g. Block A"
                    value={blockNumber}
                    onChange={(e) => setBlockNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Plot Size</label>
                  <input
                    type="text"
                    value={plotSize}
                    onChange={(e) => setPlotSize(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Total Plot Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={totalPlotPrice}
                    onChange={(e) => setTotalPlotPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-amber-600 dark:text-amber-400 font-bold rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PlotCategory)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5"
                  >
                    <option value="residential">Residential</option>
                    <option value="corner">Corner</option>
                    <option value="park_facing">Park Facing</option>
                    <option value="boulevard">Boulevard</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Plot Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PlotStatus)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="installments_in_progress">Installments in Progress</option>
                  <option value="overdue">Payment Overdue</option>
                  <option value="sold">Fully Sold</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Notes / Description</label>
                <input
                  type="text"
                  placeholder="Prime location..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPlot(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-colors"
                >
                  {editingPlot ? 'Update Plot' : 'Create Plot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Generator Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Bulk Plot Generator
              </h2>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkGenerate} className="p-6 space-y-4 text-xs">
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Quickly batch create consecutive plots (e.g. Block A Plots 1 to 20) with assigned sizes and prices.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Target Block</label>
                  <input
                    type="text"
                    value={bulkBlock}
                    onChange={(e) => setBulkBlock(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Starting Number</label>
                  <input
                    type="number"
                    min={1}
                    value={bulkStartNum}
                    onChange={(e) => setBulkStartNum(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Number of Plots to Generate</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={bulkCount}
                    onChange={(e) => setBulkCount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Plot Size</label>
                  <input
                    type="text"
                    value={bulkSize}
                    onChange={(e) => setBulkSize(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Total Plot Price (PKR)</label>
                <input
                  type="number"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-amber-600 dark:text-amber-400 font-bold rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-colors"
                >
                  Generate {bulkCount} Plots
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Wizard Modal */}
      {bookingPlot && (
        <BookingWizardModal
          initialPlot={bookingPlot}
          onClose={() => setBookingPlot(null)}
          onSuccess={() => setBookingPlot(null)}
        />
      )}
    </div>
  );
};
