import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Project, ProjectStatus } from '../types';
import { formatDate } from '../lib/utils';
import {
  Building,
  Plus,
  MapPin,
  Calendar,
  Grid3X3,
  Edit,
  Trash2,
  X,
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { projects, activeProject, setActiveProjectId, createProject, updateProject, deleteProject, allPlots } =
    useProjects();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [totalPlots, setTotalPlots] = useState(50);
  const [plotSizes, setPlotSizes] = useState('120 Sq. Yds, 200 Sq. Yds, 400 Sq. Yds');
  const [launchDate, setLaunchDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const openCreateModal = () => {
    setName('');
    setCode(`ABR-0${projects.length + 1}`);
    setDescription('');
    setLocation('Karachi, Pakistan');
    setTotalPlots(48);
    setPlotSizes('120 Sq. Yds, 200 Sq. Yds, 400 Sq. Yds');
    setLaunchDate(new Date().toISOString().split('T')[0]);
    setStatus('active');
    setErrorMsg('');
    setShowCreateModal(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setName(proj.name);
    setCode(proj.code);
    setDescription(proj.description);
    setLocation(proj.location);
    setTotalPlots(proj.totalPlots);
    setPlotSizes(proj.plotSizes);
    setLaunchDate(proj.launchDate);
    setStatus(proj.status);
    setErrorMsg('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Project Name is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      if (editingProject) {
        await updateProject(editingProject.id, {
          name,
          code,
          description,
          location,
          totalPlots,
          plotSizes,
          launchDate,
          status,
        });
        setEditingProject(null);
      } else {
        await createProject({
          name,
          code,
          description,
          location,
          totalPlots,
          plotSizes,
          launchDate,
          status,
        });
        setShowCreateModal(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (proj: Project) => {
    const hasPlots = allPlots.some((p) => p.projectId === proj.id);
    if (hasPlots) {
      if (!confirm(`Project "${proj.name}" has plots associated. Are you sure you want to delete this project?`)) {
        return;
      }
    } else {
      if (!confirm(`Delete project "${proj.name}"?`)) return;
    }

    try {
      await deleteProject(proj.id);
    } catch (err: any) {
      alert(err.message || 'Cannot delete project');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Housing Societies & Projects Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage multi-project portfolio for Al-Basit Builders. Add new schemes, master plans, and launch phases.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((proj) => {
          const projectPlots = allPlots.filter((p) => p.projectId === proj.id);
          const isActive = activeProject?.id === proj.id;

          return (
            <div
              key={proj.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-amber-500/60 ring-1 ring-amber-500/40'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{proj.name}</h3>
                      {isActive && (
                        <span className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-mono font-semibold">{proj.code}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      proj.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        : proj.status === 'completed'
                        ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                  {proj.description || 'Master-planned housing community with modern amenities.'}
                </p>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="truncate">{proj.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>
                      {projectPlots.length} Plots in Database (Capacity: {proj.totalPlots})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Launched: {formatDate(proj.launchDate)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                {!isActive ? (
                  <button
                    onClick={() => setActiveProjectId(proj.id)}
                    className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors"
                  >
                    Set Active
                  </button>
                ) : (
                  <div className="flex-1 text-center py-1.5 bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-xs rounded-xl border border-amber-500/30">
                    Currently Selected
                  </div>
                )}

                <button
                  onClick={() => openEditModal(proj)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl transition-colors"
                  title="Edit Project"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                {projects.length > 1 && (
                  <button
                    onClick={() => handleDelete(proj)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/15 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Project Modal */}
      {(showCreateModal || editingProject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                {editingProject ? 'Edit Project Details' : 'Create New Real Estate Project'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingProject(null);
                }}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al-Basit Heights"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Project Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Location / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Main Super Highway, Karachi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Project Description</label>
                <textarea
                  rows={3}
                  placeholder="High-end residential society with modern infrastructure..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Total Plots</label>
                  <input
                    type="number"
                    value={totalPlots}
                    onChange={(e) => setTotalPlots(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Launch Date</label>
                  <input
                    type="date"
                    value={launchDate}
                    onChange={(e) => setLaunchDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Plot Sizes</label>
                <input
                  type="text"
                  placeholder="120 Sq. Yds, 200 Sq. Yds, 400 Sq. Yds"
                  value={plotSizes}
                  onChange={(e) => setPlotSizes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingProject(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-colors"
                >
                  {isSubmitting ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
