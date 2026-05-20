import React from 'react';
import { ClientLogo } from '../../types';

interface GlobalCMSProps {
  clientLogos: ClientLogo[];
  selectedLogo: ClientLogo | null;
  setSelectedLogo: React.Dispatch<React.SetStateAction<ClientLogo | null>>;
  saveContent: (table: string, data: any) => Promise<void>;
  setConfirmDelete: React.Dispatch<React.SetStateAction<{ isOpen: boolean, id: string, type: 'project' | 'hero' | 'archive' | 'logo' | 'booking' | 'inquiry' }>>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string, type: 'project' | 'hero' | 'archive' | 'about' | 'client') => Promise<void>;
}

export default function GlobalCMS({
  clientLogos,
  selectedLogo,
  setSelectedLogo,
  saveContent,
  setConfirmDelete,
  handleFileUpload
}: GlobalCMSProps) {
  return (
    <div className="flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-12 animate-fade-in">
      <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-border pb-8 md:pb-0 md:pr-8 space-y-4">
        <button 
          type="button"
          onClick={() => setSelectedLogo({ id: crypto.randomUUID(), name: "Partner", logo: "", order_index: clientLogos.length })}
          className="w-full py-4 border border-border hover:border-fg text-fg rounded-sm text-[10px] tracking-[0.2em] font-bold uppercase transition-all"
        >+ NEW CLIENT PARTNER</button>
        <div className="flex md:grid md:grid-cols-2 gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[60vh] scrollbar-hide pb-2 md:pb-0">
          {clientLogos.map((l) => (
            <button 
              type="button"
              key={l.id}
              onClick={() => setSelectedLogo(l)}
              className={`flex-shrink-0 w-32 md:w-full text-left p-3 md:p-4 rounded-sm border transition-all ${selectedLogo?.id === l.id ? 'bg-fg text-bg border-fg scale-[1.01]' : 'border-border hover:border-fg/50 text-muted'}`}
            >
              <div className="text-[9px] md:text-[10px] font-bold uppercase truncate">{l.name}</div>
              {l.logo && <img src={l.logo} className="h-4 md:h-5 w-auto object-contain mt-3 grayscale opacity-40 mx-auto" referrerPolicy="no-referrer" alt={l.name} />}
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-8">
        {selectedLogo ? (
          <form onSubmit={(e) => { e.preventDefault(); saveContent('client_logos', selectedLogo); }} className="space-y-6 md:space-y-10">
            <div className="p-6 md:p-8 bg-fg/[0.02] border border-border rounded-sm space-y-6 md:space-y-8">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Partner Name</label>
                <input type="text" value={selectedLogo.name} onChange={e => setSelectedLogo({...selectedLogo, name: e.target.value})} className="w-full bg-transparent border-b border-border py-3 focus:outline-none text-sm text-fg" placeholder="e.g. NIKE GLOBAL" />
              </div>
              
              <div className="space-y-6">
                <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Logo Representation (White SVG/PNG Preferred)</label>
                <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10">
                  <div className="w-full flex-1 space-y-4">
                    <input type="text" value={selectedLogo.logo || ""} onChange={e => setSelectedLogo({...selectedLogo, logo: e.target.value})} className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none text-fg" placeholder="Paste SVG Link or Public Image URL" />
                    <div className="flex items-center gap-4">
                      <span className="text-[8px] uppercase text-muted">Or Upload:</span>
                      <input type="file" onChange={e => handleFileUpload(e, 'logo', 'client')} className="text-[8px] opacity-40 hover:opacity-100 transition-opacity text-muted" />
                    </div>
                  </div>
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-bg border border-border flex items-center justify-center rounded-sm">
                    {selectedLogo.logo ? (
                      <img src={selectedLogo.logo} className="w-16 h-16 md:w-20 md:h-20 object-contain grayscale" referrerPolicy="no-referrer" alt="preview logo" />
                    ) : (
                      <span className="text-[8px] text-muted uppercase font-bold tracking-widest text-center px-4">Logo Preview</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-w-[150px]">
                <label className="text-[9px] uppercase tracking-widest text-muted font-bold">Sorting Order</label>
                <input type="number" value={selectedLogo.order_index} onChange={e => setSelectedLogo({...selectedLogo, order_index: parseInt(e.target.value)})} className="w-full bg-transparent border-b border-border py-2 focus:outline-none text-sm text-fg" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button type="submit" className="flex-1 py-4 bg-fg text-bg rounded-lg font-bold uppercase tracking-[0.2em] order-2 sm:order-1 text-center">Save Partner</button>
              <button type="button" onClick={() => setConfirmDelete({ isOpen: true, id: selectedLogo.id, type: 'logo' })} className="px-8 py-4 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold uppercase tracking-[0.1em] order-1 sm:order-2">Delete</button>
            </div>
          </form>
        ) : (
          <div className="h-full min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center text-muted border border-dashed border-border rounded-lg bg-fg/[0.01]">
             <span className="text-[10px] uppercase tracking-[0.4em]">Manage Global Partners</span>
          </div>
        )}
      </div>
    </div>
  );
}
