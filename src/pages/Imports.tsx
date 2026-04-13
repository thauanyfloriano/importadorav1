import { CloudUpload, History, Layers, List, Settings2, FileText, CircleDashed } from 'lucide-react';

export function Imports() {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Dashboard de Importação</h1>
          <p className="text-sm text-brand-text-muted">Manage global packing lists and logistics synchronization.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center px-4 py-2 bg-[#121827] hover:bg-[#1e293b] text-sm text-brand-text font-medium rounded-md transition-colors border border-[#1e293b]">
            <History className="w-4 h-4 mr-2 text-brand-text-muted" />
            Audit Log
          </button>
          <button className="flex items-center px-4 py-2 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent text-sm font-semibold rounded-md transition-colors shadow-sm">
            <Layers className="w-4 h-4 mr-2" />
            Bulk Action
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Dropzone Area */}
          <div className="bg-[#121827]/40 border-2 border-dashed border-[#1e293b] rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all hover:bg-[#121827]/60 hover:border-brand-accent/50 group">
             <div className="w-16 h-16 bg-[#161c2c] rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 transition-transform border border-[#1e293b]">
               <CloudUpload className="w-8 h-8 text-brand-text-muted group-hover:text-brand-accent transition-colors" />
             </div>
             <h2 className="text-xl font-bold text-white mb-3">Drop packing lists here</h2>
             <p className="text-sm text-brand-text-muted max-w-sm mb-8 leading-relaxed">
               Securely upload PDF, Excel (XLSX), or high-res images of manifest documents. Max file size 50MB.
             </p>
             <div className="flex items-center gap-3">
               <button className="px-6 py-3 bg-[#a2b4ff] hover:bg-[#8da3fa] text-[#0e121e] font-bold text-sm rounded-lg shadow-lg border border-transparent transition-colors">
                 Select Files
               </button>
               <div className="flex items-center bg-[#161c2c] rounded-lg border border-[#1e293b] p-1 gap-1">
                 <button className="p-2 hover:bg-[#1e293b] rounded-md transition-colors text-brand-accent"><FileText className="w-4 h-4" /></button>
                 <div className="w-px h-4 bg-[#1e293b]"></div>
                 <button className="p-2 hover:bg-[#1e293b] rounded-md transition-colors text-brand-text-muted"><List className="w-4 h-4" /></button>
                 <div className="w-px h-4 bg-[#1e293b]"></div>
                 <button className="p-2 hover:bg-[#1e293b] rounded-md transition-colors text-brand-text-muted"><Settings2 className="w-4 h-4" /></button>
               </div>
             </div>
          </div>

          {/* Recent Imports Table */}
          <div className="bg-[#121827] rounded-xl border border-[#1e293b] shadow-lg flex-1 flex flex-col min-h-0">
             <div className="p-5 border-b border-[#1e293b] flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Recent Imports</h3>
                <button className="text-[10px] font-bold text-brand-text-muted hover:text-white tracking-widest uppercase transition-colors">View All</button>
             </div>
             <div className="overflow-auto flex-1">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-[#1e293b]">
                     <th className="py-4 px-6 text-[10px] font-bold text-brand-text-muted tracking-widest uppercase">Document ID</th>
                     <th className="py-4 px-6 text-[10px] font-bold text-brand-text-muted tracking-widest uppercase">Timestamp</th>
                     <th className="py-4 px-6 text-[10px] font-bold text-brand-text-muted tracking-widest uppercase">Status</th>
                     <th className="py-4 px-6 text-[10px] font-bold text-brand-text-muted tracking-widest uppercase">Confidence</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#1e293b]">
                   <tr className="hover:bg-[#161c2c] transition-colors group">
                     <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                           <FileText className="w-4 h-4 text-brand-text-muted" />
                           <span className="text-sm font-semibold text-white">PL-99283-ZH</span>
                        </div>
                     </td>
                     <td className="py-4 px-6 text-sm text-brand-text-muted">2 mins ago</td>
                     <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2 py-1 bg-[#1e293b] text-brand-text border border-[#334155] text-[10px] font-bold tracking-widest uppercase rounded">
                           <CircleDashed className="w-3 h-3 mr-1.5 text-brand-accent animate-spin-slow" />
                           Processing
                        </span>
                     </td>
                     <td className="py-4 px-6 text-sm font-medium text-brand-text-muted">--</td>
                   </tr>
                   <tr className="hover:bg-[#161c2c] transition-colors group">
                     <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                           <FileText className="w-4 h-4 text-brand-text-muted" />
                           <span className="text-sm font-semibold text-white">PL-99104-DE</span>
                        </div>
                     </td>
                     <td className="py-4 px-6 text-sm text-brand-text-muted">45 mins ago</td>
                     <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2 py-1 bg-brand-success/10 text-brand-success border border-brand-success/20 text-[10px] font-bold tracking-widest uppercase rounded">
                           <div className="w-1 h-1 rounded-full bg-brand-success mr-2" />
                           Completed
                        </span>
                     </td>
                     <td className="py-4 px-6 text-sm font-bold text-[#3b82f6]">98.4%</td>
                   </tr>
                   <tr className="hover:bg-[#161c2c] transition-colors group">
                     <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                           <FileText className="w-4 h-4 text-brand-text-muted" />
                           <span className="text-sm font-semibold text-white">PL-98012-BR</span>
                        </div>
                     </td>
                     <td className="py-4 px-6 text-sm text-brand-text-muted">2 hours ago</td>
                     <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2 py-1 bg-brand-error/10 text-brand-error border border-brand-error/20 text-[10px] font-bold tracking-widest uppercase rounded">
                           <div className="w-1 h-1 rounded-full bg-brand-error mr-2" />
                           Error
                        </span>
                     </td>
                     <td className="py-4 px-6 text-sm font-bold text-brand-error">Critical</td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex flex-col gap-6 flex-shrink-0">
          
          {/* Pending Verifications */}
          <div className="bg-[#121827] rounded-xl border border-[#1e293b] shadow-lg p-6">
             <div className="flex justify-between items-start mb-6">
               <div className="bg-[#1e293b] p-2 rounded-md">
                 <Settings2 className="w-5 h-5 text-brand-text-muted" />
               </div>
               <span className="px-2 py-1 bg-[#1e293b] border border-[#334155] rounded text-[10px] font-bold text-brand-text uppercase tracking-widest">Required</span>
             </div>
             
             <h3 className="text-[10px] font-bold text-brand-text-muted tracking-widest uppercase mb-1">Pending Verifications</h3>
             <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-white">14</span>
                <span className="text-xs font-semibold text-brand-error">-2 since yesterday</span>
             </div>

             <div className="space-y-2 mb-8">
               <div className="flex justify-between text-xs">
                 <span className="text-brand-text-muted">OCR Confidence Level</span>
                 <span className="text-white font-medium">72%</span>
               </div>
               <div className="w-full h-1.5 bg-[#161c2c] rounded-full overflow-hidden">
                 <div className="h-full bg-[#a2b4ff] w-[72%]"></div>
               </div>
             </div>

             <button className="w-full bg-[#1e293b] hover:bg-[#334155] text-white font-bold text-sm py-3 rounded-lg transition-colors border border-[#334155]">
               Review Queue
             </button>
          </div>

          {/* Import Architecture */}
          <div className="bg-[#121827] rounded-xl border border-[#1e293b] shadow-lg flex-1 flex flex-col">
             <div className="p-5 border-b border-[#1e293b]">
               <h3 className="text-[10px] font-bold text-brand-text-muted tracking-widest uppercase">Import Architecture</h3>
             </div>
             <div className="p-5 space-y-6 flex-1">
                <div className="flex gap-4 relative">
                   <div className="w-2 h-2 rounded-full bg-[#3b82f6] mt-1.5 flex-shrink-0 relative z-10" />
                   <div className="absolute left-[3px] top-[14px] bottom-[-28px] w-px bg-[#1e293b] z-0" />
                   <div>
                     <h4 className="text-xs font-bold text-white">Neural Parser (V3)</h4>
                     <p className="text-[10px] text-brand-text-muted mt-0.5">Operational • Latency 140ms</p>
                   </div>
                </div>
                
                <div className="flex gap-4 relative">
                   <div className="w-2 h-2 rounded-full bg-[#3b82f6] mt-1.5 flex-shrink-0 relative z-10" />
                   <div className="absolute left-[3px] top-[14px] bottom-[-28px] w-px bg-[#1e293b] z-0" />
                   <div>
                     <h4 className="text-xs font-bold text-white">HS-Code Auto-Match</h4>
                     <p className="text-[10px] text-brand-text-muted mt-0.5">Operational • 92% accuracy</p>
                   </div>
                </div>

                <div className="flex gap-4 relative">
                   <div className="w-2 h-2 rounded-full bg-brand-error mt-1.5 flex-shrink-0 relative z-10" />
                   <div>
                     <h4 className="text-xs font-bold text-white">SAP Integration</h4>
                     <p className="text-[10px] text-brand-text-muted mt-0.5">Reconnecting...</p>
                   </div>
                </div>
             </div>

             {/* Node status card */}
             <div className="m-4 bg-gradient-to-br from-[#161c2c] to-[#0e121e] border border-[#1e293b] rounded-xl p-4 overflow-hidden relative">
                {/* Decoration */}
                <div className="absolute inset-0 opacity-[0.05] flex justify-between pointer-events-none">
                  {[...Array(20)].map((_, i) => <div key={i} className="w-px h-full bg-white mx-0.5"></div>)}
                </div>
                <div className="relative z-10">
                  <h5 className="text-[9px] font-bold text-brand-text-muted tracking-widest uppercase mb-1">Global Node</h5>
                  <p className="text-sm font-bold text-white">Rotterdam Terminal 4</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
