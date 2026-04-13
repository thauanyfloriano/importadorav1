import React from 'react';
import { Share2, CloudUpload, Package, Maximize, TrendingUp, CheckCircle, Download } from 'lucide-react';
export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 fade-in h-full pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] text-brand-text-muted font-bold tracking-widest uppercase mb-1">Shipment History / SHP-99284-BRA</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Relatórios e Exportação</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-brand-panel hover:bg-brand-panel-hover text-sm font-medium text-white rounded-md transition-colors border border-[#1e293b]">
            <Share2 className="w-4 h-4 mr-2 text-brand-text-muted" />
            Compartilhar
          </button>
          <button className="flex items-center px-4 py-2 bg-brand-text text-brand-base hover:bg-white text-sm font-medium rounded-md transition-colors shadow-sm">
            <CloudUpload className="w-4 h-4 mr-2" />
            Enviar ao ERP
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Main Metrics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Total Net Weight */}
             <div className="bg-[#121827] rounded-xl p-6 relative overflow-hidden border border-[#1e293b] shadow-lg">
                <Package className="w-32 h-32 absolute -right-6 -top-6 text-white/5 opacity-50" />
                <h3 className="text-xs font-bold text-brand-accent tracking-widest uppercase mb-4">Total Net Weight</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-5xl font-bold text-white">42,850.40</span>
                  <span className="text-xl text-brand-text-muted ml-2">KG</span>
                </div>
                <div className="flex items-center text-xs text-brand-text-muted mt-2">
                  <TrendingUp className="w-3 h-3 text-brand-success mr-1" />
                  <span className="text-white">+12.4%</span><span className="ml-1">vs last shipment</span>
                </div>
             </div>

             <div className="space-y-6">
               {/* Gross Weight */}
               <div className="bg-[#121827] rounded-xl p-6 border border-[#1e293b] shadow-lg flex justify-between items-center relative overflow-hidden">
                  <div className="z-10">
                    <h3 className="text-[10px] font-bold text-brand-text-muted tracking-widest uppercase mb-1">Gross Weight</h3>
                    <p className="text-2xl font-bold text-white">45,120.00 KG</p>
                  </div>
                  <div className="bg-brand-accent/20 p-2 rounded-lg z-10">
                    <Package className="w-5 h-5 text-brand-accent" />
                  </div>
               </div>

               {/* Total Volume */}
               <div className="bg-[#121827] rounded-xl p-6 border border-[#1e293b] shadow-lg flex justify-between items-center relative overflow-hidden">
                  <div className="z-10">
                     <h3 className="text-[10px] font-bold text-brand-text-muted tracking-widest uppercase mb-1">Total Volume</h3>
                     <p className="text-2xl font-bold text-white">114.50 CBM</p>
                  </div>
                  <div className="bg-brand-accent/20 p-2 rounded-lg z-10">
                    <Maximize className="w-5 h-5 text-brand-accent" />
                  </div>
               </div>
             </div>
          </div>

          {/* Weight Distribution Analysis */}
          <div className="bg-[#121827] rounded-xl border border-[#1e293b] shadow-lg flex flex-col h-[380px]">
             <div className="p-5 border-b border-[#1e293b] flex justify-between items-center">
                <h3 className="text-xs font-bold text-white tracking-widest uppercase">Weight Distribution Analysis</h3>
                <div className="flex items-center space-x-4 text-xs font-medium text-brand-text-muted">
                   <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#4f46e5] mr-2"></span>Container A</div>
                   <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#3b82f6] mr-2"></span>Container B</div>
                </div>
             </div>
             <div className="flex-1 p-5 relative flex flex-col justify-end">
                {/* Mock Chart Area */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                   <p className="text-sm">Chart Placeholder</p>
                </div>
                <div className="flex justify-between items-end h-40 border-b border-[#1e293b] pb-2 px-4 gap-4">
                   {[40, 70, 45, 90, 60, 30].map((h, i) => (
                     <div key={i} className="w-full flex justify-center space-x-1 items-end relative group">
                        <div className="w-1/2 bg-[#4f46e5] rounded-t-sm hover:opacity-80 transition-opacity" style={{height: `${h}%`}}></div>
                        <div className="w-1/2 bg-[#3b82f6] rounded-t-sm hover:opacity-80 transition-opacity" style={{height: `${h * 0.8}%`}}></div>
                     </div>
                   ))}
                </div>
                <div className="flex justify-between px-4 mt-3 text-[9px] text-brand-text-muted tracking-wider">
                   {['P-001 (PALLET)', 'P-002 (PALLET)', 'P-003 (PALLET)', 'P-004 (PALLET)', 'P-005 (PALLET)', 'P-006 (PALLET)'].map(l => (
                     <span key={l}>{l}</span>
                   ))}
                </div>
             </div>
             
             <div className="bg-[#161c2c] p-4 rounded-b-xl border-t border-[#1e293b] flex gap-8">
               <div>
                 <p className="text-[10px] text-brand-text-muted uppercase tracking-widest font-bold mb-1">Heaviest Unit</p>
                 <p className="text-sm font-semibold text-white">P-004 <span className="font-normal text-brand-text-muted">5,240 kg</span></p>
               </div>
               <div>
                 <p className="text-[10px] text-brand-text-muted uppercase tracking-widest font-bold mb-1">Utilization Factor</p>
                 <p className="text-sm font-semibold text-white">92.4% <span className="text-brand-accent ml-1">Optimal</span></p>
               </div>
             </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          
          {/* Total Items Count */}
          <div className="bg-[#121827] rounded-xl p-8 border border-[#1e293b] shadow-lg flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-[#1e293b] rounded-xl flex items-center justify-center mb-6">
               <Package className="w-6 h-6 text-brand-text-muted" />
            </div>
            <h3 className="text-[10px] font-bold text-brand-text-muted tracking-widest uppercase mb-2">Total Items Count</h3>
            <p className="text-5xl font-bold text-white mb-2">1,402</p>
            <p className="text-xs text-brand-text-muted italic">Spread across 12 Pallets / 2 Containers</p>
          </div>

          {/* Formatos de Exportação */}
          <div className="bg-[#121827] rounded-xl border border-[#1e293b] shadow-lg p-5">
             <h3 className="text-[10px] font-bold text-white tracking-widest uppercase mb-4">Formatos de Exportação</h3>
             <div className="space-y-3">
               <button className="w-full bg-[#161c2c] hover:bg-[#1e293b] border border-[#1e293b] rounded-lg p-4 flex items-center transition-colors text-left group">
                 <div className="bg-[#10b981]/10 p-2 rounded-md mr-4 group-hover:bg-[#10b981]/20 transition-colors">
                   <Download className="w-5 h-5 text-[#10b981]" />
                 </div>
                 <div>
                   <p className="text-sm font-semibold text-white">Relatório Completo</p>
                   <p className="text-[10px] text-brand-text-muted">Microsoft Excel (XLSX)</p>
                 </div>
               </button>
               <button className="w-full bg-[#161c2c] hover:bg-[#1e293b] border border-[#1e293b] rounded-lg p-4 flex items-center transition-colors text-left group">
                 <div className="bg-[#3b82f6]/10 p-2 rounded-md mr-4 group-hover:bg-[#3b82f6]/20 transition-colors">
                   <Download className="w-5 h-5 text-[#3b82f6]" />
                 </div>
                 <div>
                   <p className="text-sm font-semibold text-white">Packing List</p>
                   <p className="text-[10px] text-brand-text-muted">Raw Data (CSV)</p>
                 </div>
               </button>
             </div>
          </div>

          {/* Integrações de sistema */}
          <div className="bg-[#121827] rounded-xl border border-[#1e293b] shadow-lg p-5">
             <h3 className="text-[10px] font-bold text-white tracking-widest uppercase mb-4">Integrações de Sistema</h3>
             <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-[#161c2c] border border-[#1e293b] rounded-lg p-4 text-center">
                   <p className="text-sm font-bold text-white mb-1">SAP</p>
                   <p className="text-[9px] text-brand-text-muted">S/4HANA</p>
                </div>
                <div className="bg-[#161c2c] border border-[#1e293b] rounded-lg p-4 text-center">
                   <p className="text-sm font-bold text-white mb-1">TOTVS</p>
                   <p className="text-[9px] text-brand-text-muted">PROTHEUS</p>
                </div>
             </div>
             <div className="bg-[#161c2c] border border-[#1e293b] rounded-lg p-3 text-center flex items-center justify-center gap-2 relative overflow-hidden">
                <CheckCircle className="w-4 h-4 text-brand-text-muted" />
                <span className="text-xs font-bold text-white tracking-wider">CUSTOMS CLEARANCE</span>
                <div className="absolute right-0 bottom-0 bg-[#3b82f6]/20 p-2 rounded-tl-lg">
                   <Share2 className="w-3 h-3 text-[#3b82f6]" />
                </div>
             </div>
             
             <div className="mt-4 bg-[#1e293b]/50 p-3 rounded-lg border border-[#1e293b] text-[10px] text-brand-text-muted flex gap-2">
                <div className="w-4 h-4 rounded-full bg-brand-accent/20 flex items-center justify-center flex-shrink-0 text-brand-accent font-bold pb-[1px]">i</div>
                <p>Integrations require valid API tokens. Check system health status for real-time sync availability.</p>
             </div>
          </div>
        </div>
      </div>

      {/* Sync History Table Bottom */}
      <div className="bg-[#121827] rounded-xl border border-[#1e293b] shadow-lg">
         <div className="p-5 border-b border-[#1e293b] flex justify-between items-center">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase">Sync History</h3>
            <button className="text-[10px] font-bold text-brand-text-muted hover:text-white uppercase tracking-wider transition-colors">Ver Log Completo</button>
         </div>
         <div className="divide-y divide-[#1e293b]">
            <div className="p-4 flex items-center justify-between hover:bg-[#161c2c] transition-colors">
               <div className="flex items-center gap-4">
                  <div className="bg-brand-success/10 p-2 rounded-full">
                     <CheckCircle className="w-4 h-4 text-brand-success" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Exportado para SAP S/4HANA</p>
                    <p className="text-xs text-brand-text-muted mt-0.5">ID de Transação: SAP-REQ-99021 | Por: Andre S.</p>
                  </div>
               </div>
               <span className="font-mono text-xs text-brand-text-muted">Hoje, 14:22</span>
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-[#161c2c] transition-colors">
               <div className="flex items-center gap-4">
                  <div className="bg-[#3b82f6]/10 p-2 rounded-full">
                     <Download className="w-4 h-4 text-[#3b82f6]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Download XLSX - Packing List</p>
                    <p className="text-xs text-brand-text-muted mt-0.5">Arquivo: SHP-99284-FullReport.xlsx | Por: Sistema (Auto)</p>
                  </div>
               </div>
               <span className="font-mono text-xs text-brand-text-muted">Hoje, 11:05</span>
            </div>
         </div>
      </div>

    </div>
  );
}
