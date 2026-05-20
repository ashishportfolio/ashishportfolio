import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Project, ArchiveMedia } from '../../types';

interface ProjectsCMSProps {
  projects: Project[];
  archiveMedia: ArchiveMedia[];
  selectedProject: Project | null;
  setSelectedProject: React.Dispatch<React.SetStateAction<Project | null>>;
  selectedArchive: ArchiveMedia | null;
  setSelectedArchive: React.Dispatch<React.SetStateAction<ArchiveMedia | null>>;
  saveContent: (table: string, data: any) => Promise<void>;
  isLoading: boolean;
  setConfirmDelete: React.Dispatch<React.SetStateAction<{ isOpen: boolean, id: string, type: 'project' | 'hero' | 'archive' | 'logo' | 'booking' | 'inquiry' }>>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string, type: 'project' | 'hero' | 'archive' | 'about' | 'client') => Promise<void>;
  siteContent?: Record<string, string>;
  setSiteContent?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  saveSiteContent?: (keys: string[]) => Promise<void>;
}

export default function ProjectsCMS({
  projects,
  archiveMedia,
  selectedProject,
  setSelectedProject,
  selectedArchive,
  setSelectedArchive,
  saveContent,
  isLoading,
  setConfirmDelete,
  handleFileUpload,
  siteContent = {},
  setSiteContent,
  saveSiteContent
}: ProjectsCMSProps) {
  const [projectSubTab, setProjectSubTab] = useState<'case-studies' | 'archive' | 'portfolio-header'>('case-studies');

  const isVideo = (url?: string) => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mov') || cleanUrl.includes('/videos/') || cleanUrl.includes('stream');
  };

  return (
    <div className="space-y-8">
      {/* Sub-tabs switcher */}
      <div className="flex border-b border-border/20 pb-4 gap-8 text-[10px] uppercase tracking-widest font-bold">
        <button 
          type="button"
          onClick={() => setProjectSubTab('case-studies')}
          className={`transition-all relative pb-2 ${projectSubTab === 'case-studies' ? 'text-fg' : 'text-muted hover:text-fg'}`}
        >
          Case Studies
          {projectSubTab === 'case-studies' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-fg" />}
        </button>
        <button 
          type="button"
          onClick={() => setProjectSubTab('archive')}
          className={`transition-all relative pb-2 ${projectSubTab === 'archive' ? 'text-fg' : 'text-muted hover:text-fg'}`}
        >
          Visual Archive
          {projectSubTab === 'archive' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-fg" />}
        </button>
        <button 
          type="button"
          onClick={() => setProjectSubTab('portfolio-header')}
          className={`transition-all relative pb-2 ${projectSubTab === 'portfolio-header' ? 'text-fg' : 'text-muted hover:text-fg'}`}
        >
          Portfolio Page Header
          {projectSubTab === 'portfolio-header' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-fg" />}
        </button>
      </div>

      {projectSubTab === 'case-studies' && (
        <div className="flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-12 animate-fade-in">
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-border pb-8 md:pb-0 md:pr-8 space-y-4">
            <button 
              type="button"
              onClick={() => setSelectedProject({
                id: crypto.randomUUID(), 
                title: "Untitled Project", 
                slug: "new-project", 
                category: "BRAND IDENTITY", 
                year: "2026", 
                client: "", 
                role: "", 
                description: "", 
                image: "", 
                overview: "", 
                challenge: "", 
                approach: "", 
                execution: "", 
                outcome: "", 
                is_featured: false,
                image_overview: "",
                image_challenge: "",
                image_approach: "",
                image_execution: "",
                image_outcome: "",
                video: "",
                hover_video: "",
                case_study_banner: "",
                longDescription: "",
                show_directive: true,
                show_overview: true,
                show_challenge: true,
                show_approach: true,
                show_execution: true,
                show_outcome: true
              })}
              className="w-full py-4 border border-border hover:border-fg text-fg rounded-sm text-[10px] tracking-[0.2em] font-bold uppercase transition-all"
            >+ NEW PROJECT</button>
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[60vh] scrollbar-hide pb-2 md:pb-0">
              {projects.map(p => (
                <button 
                  type="button"
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className={`flex-shrink-0 md:flex-shrink-1 w-48 md:w-full text-left p-4 rounded-sm border transition-all ${selectedProject?.id === p.id ? 'bg-fg text-bg border-fg scale-[1.02]' : 'border-border hover:border-fg/50 text-muted'}`}
                >
                  <div className="text-xs font-bold uppercase truncate">{p.title}</div>
                  <div className="text-[9px] opacity-60 uppercase mt-1">{p.year} / {p.category}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-8">
            {selectedProject ? (
              <form onSubmit={(e) => { e.preventDefault(); saveContent('projects', selectedProject); }} className="space-y-8 md:space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 p-6 md:p-8 bg-fg/[0.02] border border-border rounded-sm">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Project Title</label>
                      <input type="text" value={selectedProject.title} onChange={e => setSelectedProject({...selectedProject, title: e.target.value})} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm text-fg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Case Study Slug</label>
                      <input type="text" value={selectedProject.slug} onChange={e => setSelectedProject({...selectedProject, slug: e.target.value})} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm text-fg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Client Name</label>
                      <input type="text" value={selectedProject.client || ""} onChange={e => setSelectedProject({...selectedProject, client: e.target.value})} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm text-fg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Listing Description (Home Screen Snippet)</label>
                      <textarea value={selectedProject.description || ""} onChange={e => setSelectedProject({...selectedProject, description: e.target.value})} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm text-fg" rows={2} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Category (Deliverables)</label>
                      <input type="text" value={selectedProject.category} onChange={e => setSelectedProject({...selectedProject, category: e.target.value})} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm text-fg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Publication Year</label>
                      <input type="text" value={selectedProject.year} onChange={e => setSelectedProject({...selectedProject, year: e.target.value})} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm text-fg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Lead Role</label>
                      <input type="text" value={selectedProject.role || ""} onChange={e => setSelectedProject({...selectedProject, role: e.target.value})} className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-fg text-sm text-fg" />
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 bg-fg/[0.02] border border-border rounded-sm space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Featured Configuration</h3>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={selectedProject.is_featured} onChange={e => setSelectedProject({...selectedProject, is_featured: e.target.checked})} className="w-4 h-4 rounded border-border text-fg focus:ring-0 bg-transparent" />
                      <span className="text-[9px] uppercase tracking-widest text-muted group-hover:text-fg transition-colors">Featured on Home</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Thumbnail Asset (Image - Grid View)</label>
                      {selectedProject.image && (
                        <div className="w-full aspect-video overflow-hidden rounded-sm border border-border mb-4 relative bg-muted/5">
                          {isVideo(selectedProject.image) ? (
                            <video src={selectedProject.image} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                          ) : (
                            <img src={selectedProject.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="thumbnail" />
                          )}
                        </div>
                      )}
                      <input type="text" placeholder="Media Link (Image)" value={selectedProject.image} onChange={e => setSelectedProject({...selectedProject, image: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none focus:border-fg mb-2 text-fg" />
                      <input type="file" onChange={e => handleFileUpload(e, 'image', 'project')} className="text-[9px] cursor-pointer text-muted" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Hover Transition Video (Optional)</label>
                      {selectedProject.hover_video && <video src={selectedProject.hover_video} className="w-full aspect-video object-cover rounded-sm border border-border mb-4 bg-muted/5" autoPlay muted loop playsInline />}
                      <input type="text" placeholder="Hover Video Link" value={selectedProject.hover_video || ""} onChange={e => setSelectedProject({...selectedProject, hover_video: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none focus:border-fg mb-2 text-fg" />
                      <input type="file" onChange={e => handleFileUpload(e, 'hover_video', 'project')} className="text-[9px] cursor-pointer text-muted" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Case Study Top Banner (Image or Video)</label>
                      {selectedProject.case_study_banner && (
                        <div className="w-full aspect-video overflow-hidden rounded-sm border border-border mb-4 relative bg-muted/5">
                          {isVideo(selectedProject.case_study_banner) ? (
                            <video src={selectedProject.case_study_banner} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                          ) : (
                            <img src={selectedProject.case_study_banner} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="banner" />
                          )}
                        </div>
                      )}
                      <input type="text" placeholder="Banner Media Link (Image/Video)" value={selectedProject.case_study_banner || ""} onChange={e => setSelectedProject({...selectedProject, case_study_banner: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none focus:border-fg mb-2 text-fg" />
                      <input type="file" onChange={e => handleFileUpload(e, 'case_study_banner', 'project')} className="text-[9px] cursor-pointer text-muted" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Main Motion Asset (If distinct from banner)</label>
                      {selectedProject.video && <video src={selectedProject.video} className="w-full aspect-video object-cover rounded-sm border border-border mb-4 bg-muted/5" autoPlay muted loop playsInline />}
                      <input type="text" placeholder="Main Video Link" value={selectedProject.video || ""} onChange={e => setSelectedProject({...selectedProject, video: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none focus:border-fg mb-2 text-fg" />
                      <input type="file" onChange={e => handleFileUpload(e, 'video', 'project')} className="text-[9px] cursor-pointer text-muted" />
                    </div>
                  </div>
                </div>

                {/* Case Study Details */}
                <div className="p-8 bg-fg/[0.02] border border-border rounded-sm space-y-12">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Full Case Study Content</h3>
                  
                  {/* The Directive Section */}
                  <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] uppercase tracking-widest text-muted font-bold">The Directive (Long Intro Text)</label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={selectedProject.show_directive !== false} 
                            onChange={e => setSelectedProject({...selectedProject, show_directive: e.target.checked})}
                            className="w-3.5 h-3.5 rounded border-border text-fg focus:ring-0 bg-transparent" 
                          />
                          <span className="text-[8px] uppercase tracking-widest text-muted">Show Section Text</span>
                        </label>
                      </div>
                      <div className="space-y-2">
                        <textarea 
                          value={selectedProject.longDescription || ""}
                          onChange={e => setSelectedProject({...selectedProject, longDescription: e.target.value})}
                          rows={4}
                          className="w-full bg-transparent border border-border p-4 focus:outline-none focus:border-fg rounded-sm text-sm text-fg"
                          placeholder="Long introduction text for the case study..."
                        />
                      </div>
                  </div>

                  {[
                    {id: 'overview', label: '01. Overview', media: 'image_overview', showKey: 'show_overview'},
                    {id: 'challenge', label: '02. Challenge', media: 'image_challenge', showKey: 'show_challenge'},
                    {id: 'approach', label: '03. Approach', media: 'image_approach', showKey: 'show_approach'},
                    {id: 'execution', label: '04. Execution', media: 'image_execution', showKey: 'show_execution'},
                    {id: 'outcome', label: '05. Outcome', media: 'image_outcome', showKey: 'show_outcome'},
                  ].map(section => (
                    <div key={section.id} className="space-y-6 pt-12 border-t border-border/20 first:pt-0 first:border-0">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] uppercase tracking-widest text-muted font-bold">{section.label} Descriptive Text</label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={(selectedProject as any)[section.showKey] !== false} 
                            onChange={e => setSelectedProject({...selectedProject, [section.showKey]: e.target.checked})}
                            className="w-3.5 h-3.5 rounded border-border text-fg focus:ring-0 bg-transparent" 
                          />
                          <span className="text-[8px] uppercase tracking-widest text-muted">Show Section Text</span>
                        </label>
                      </div>
                      <div className="space-y-2">
                        <textarea 
                          value={(selectedProject as any)[section.id]}
                          onChange={e => setSelectedProject({...selectedProject, [section.id]: e.target.value})}
                          rows={4}
                          className="w-full bg-transparent border border-border p-4 focus:outline-none focus:border-fg rounded-sm text-sm text-fg"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[9px] uppercase tracking-widest text-muted font-bold">{section.label} Full-Width Media (Image or Video)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <input type="text" placeholder="Media Link" value={(selectedProject as any)[section.media] || ""} onChange={e => setSelectedProject({...selectedProject, [section.media]: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none focus:border-fg text-fg" />
                            <input type="file" onChange={e => handleFileUpload(e, section.media, 'project')} className="text-[9px] text-muted" />
                          </div>
                          {(selectedProject as any)[section.media] && (
                            <div className="relative group overflow-hidden rounded-sm border border-border aspect-[21/9] bg-muted/5">
                              {isVideo((selectedProject as any)[section.media]) ? (
                                <video src={(selectedProject as any)[section.media]} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                              ) : (
                                <img src={(selectedProject as any)[section.media]} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="section" />
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-[8px] uppercase tracking-widest text-white">Section View</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4 sticky bottom-6 bg-bg/80 backdrop-blur-md p-4 border border-border shadow-2xl z-50 rounded-lg">
                  <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-fg text-bg rounded-lg font-bold uppercase tracking-[0.2em] transform active:scale-[0.98] transition-all text-center">
                    {isLoading ? 'Processing...' : 'Deploy Changes'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setConfirmDelete({ isOpen: true, id: selectedProject.id, type: 'project' })}
                    className="px-8 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg font-bold uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all"
                  >Delete Project</button>
                </div>
              </form>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-muted border border-dashed border-border rounded-lg bg-fg/[0.01]">
                 <span className="text-[10px] uppercase tracking-[0.4em] mb-4">No Selection</span>
                 <p className="text-[9px] uppercase tracking-widest opacity-40">Choose a project from the left panel to begin editing.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {projectSubTab === 'archive' && (
        <div className="flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-12 animate-fade-in">
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-border pb-8 md:pb-0 md:pr-8 space-y-4">
            <button 
              type="button"
              onClick={() => setSelectedArchive({ id: crypto.randomUUID(), image: "", video: "", order_index: archiveMedia.length })}
              className="w-full py-4 border border-border hover:border-fg text-fg rounded-sm text-[10px] tracking-[0.2em] font-bold uppercase transition-all"
            >+ ADD ARCHIVE ENTRY</button>
            <div className="flex md:grid md:grid-cols-2 gap-4 overflow-x-auto md:overflow-y-auto md:max-h-[60vh] scrollbar-hide pb-2 md:pb-0">
              {archiveMedia.map((a, i) => (
                <button 
                  type="button"
                  key={a.id}
                  onClick={() => setSelectedArchive(a)}
                  className={`flex-shrink-0 w-24 md:w-full text-left p-2 rounded-sm border transition-all ${selectedArchive?.id === a.id ? 'bg-fg border-fg' : 'border-border hover:border-fg/50'}`}
                >
                  <div className="relative aspect-square overflow-hidden rounded-[2px] bg-muted/5">
                    {a.image ? <img src={a.image} className="w-full h-full object-cover grayscale opacity-60" referrerPolicy="no-referrer" alt="archive thumbnail" /> : <div className="w-full h-full bg-muted/20" />}
                    <div className="absolute inset-x-1 bottom-1 flex justify-between items-center text-[7px] text-fg uppercase font-black bg-bg/90 px-1 py-0.5">
                      <span>#0{i+1}</span>
                      <span>idx {a.order_index}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-8">
            {selectedArchive ? (
              <form onSubmit={(e) => { e.preventDefault(); saveContent('archive_media', selectedArchive); }} className="space-y-6 md:space-y-10">
                <div className="p-6 md:p-8 bg-fg/[0.02] border border-border rounded-sm space-y-6 md:space-y-8">
                  <div className="flex justify-between items-center">
                     <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Archive Entry Details</h3>
                     <input type="number" value={selectedArchive.order_index} onChange={e => setSelectedArchive({...selectedArchive, order_index: parseInt(e.target.value)})} className="w-20 bg-transparent border-b border-border text-center text-xs py-1 focus:outline-none text-fg" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                     <div className="space-y-4">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Image Preview</label>
                      {selectedArchive.image && <img src={selectedArchive.image} className="w-full aspect-[4/5] object-cover rounded-sm border border-border bg-muted/5" referrerPolicy="no-referrer" alt="preview" />}
                      <input type="text" placeholder="Entry URL" value={selectedArchive.image} onChange={e => setSelectedArchive({...selectedArchive, image: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none text-fg" />
                      <input type="file" onChange={e => handleFileUpload(e, 'image', 'archive')} className="text-[9px] text-muted" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Video Preview (Optional)</label>
                      {selectedArchive.video && <video src={selectedArchive.video} className="w-full aspect-[4/5] object-cover rounded-sm border border-border bg-muted/5" autoPlay muted loop playsInline />}
                      <input type="text" placeholder="Entry Video URL" value={selectedArchive.video || ""} onChange={e => setSelectedArchive({...selectedArchive, video: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none text-fg" />
                      <input type="file" onChange={e => handleFileUpload(e, 'video', 'archive')} className="text-[9px] text-muted" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button type="submit" className="flex-1 py-4 bg-fg text-bg rounded-lg font-bold uppercase tracking-[0.2em] order-2 sm:order-1 text-center">Save Archive Entry</button>
                  <button type="button" onClick={() => setConfirmDelete({ isOpen: true, id: selectedArchive.id, type: 'archive' })} className="px-8 py-4 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold uppercase tracking-[0.1em] order-1 sm:order-2">Delete</button>
                </div>
              </form>
            ) : (
              <div className="h-full min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center text-muted border border-dashed border-border rounded-lg bg-fg/[0.01]">
                 <span className="text-[10px] uppercase tracking-[0.4em]">Select Archive Entry</span>
              </div>
            )}
          </div>
        </div>
      )}

      {projectSubTab === 'portfolio-header' && (
        <div className="p-6 md:p-8 bg-fg/[0.02] border border-border/65 rounded-sm space-y-8 max-w-4xl animate-fade-in font-sans">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#FF4D00]">Portfolio Page Header Manager</h2>
              <p className="text-[10px] text-muted uppercase mt-1">Configure layout options for the Portfolio page</p>
            </div>
            <button 
              type="button"
              onClick={() => {
                if (saveSiteContent) {
                  saveSiteContent(['work_hero_bg', 'work_hero_label', 'work_hero_heading', 'work_hero_paragraph']);
                }
              }}
              className="px-6 py-2.5 bg-[#FF4D00] hover:bg-[#E64200] text-white rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              Save Portfolio Header Changes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Background Image */}
            <div className="space-y-4">
              <label className="text-[9px] uppercase tracking-widest text-muted font-bold block">Portfolio Hero Banner (Image URL or Upload)</label>
              <div className="relative aspect-video bg-muted/5 rounded-sm overflow-hidden border border-border/40">
                {siteContent['work_hero_bg'] ? (
                  <img src={siteContent['work_hero_bg']} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" alt="portfolio hero preview" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] text-muted uppercase tracking-widest">No Image</div>
                )}
              </div>
              <div className="space-y-3 font-sans">
                <input 
                  type="text" 
                  value={siteContent['work_hero_bg'] || ""} 
                  onChange={e => setSiteContent && setSiteContent({ ...siteContent, work_hero_bg: e.target.value })} 
                  className="w-full bg-transparent border-b border-border/50 py-2 text-xs focus:outline-none placeholder:text-muted/30 text-fg font-mono" 
                  placeholder="Image URL" 
                />
                <div className="space-y-1">
                  <span className="text-[8px] uppercase tracking-wider text-muted block font-bold">Or Upload File:</span>
                  <input 
                    type="file" 
                    onChange={e => handleFileUpload(e, 'work_hero_bg', 'about')} 
                    className="text-[9px] text-muted w-full" 
                  />
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-[#FF4D00] font-bold">Release / Label Text (Top-Left small tag)</label>
                <input 
                  type="text"
                  value={siteContent['work_hero_label'] || ""}
                  onChange={e => setSiteContent && setSiteContent({ ...siteContent, work_hero_label: e.target.value })}
                  className="w-full bg-transparent border-b border-border/50 py-2.5 text-xs text-fg focus:outline-none focus:border-fg transition-colors animate-none"
                  placeholder="©2026"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-[#FF4D00] font-bold">Page Header Title (Big text)</label>
                <input 
                  type="text"
                  value={siteContent['work_hero_heading'] || ""}
                  onChange={e => setSiteContent && setSiteContent({ ...siteContent, work_hero_heading: e.target.value })}
                  className="w-full bg-transparent border-b border-border/50 py-2.5 text-xs text-fg focus:outline-none focus:border-fg transition-colors"
                  placeholder="Portfolio"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-[#FF4D00] font-bold">Intro Paragraph (Right Column text)</label>
                <textarea 
                  value={siteContent['work_hero_paragraph'] || ""}
                  onChange={e => setSiteContent && setSiteContent({ ...siteContent, work_hero_paragraph: e.target.value })}
                  className="w-full bg-transparent border border-border/50 p-3 text-xs leading-relaxed text-fg focus:outline-none focus:border-fg transition-colors"
                  rows={6}
                  placeholder="From brand identity and art direction to cinematic AI production..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
