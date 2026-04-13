import { Filter, Edit2, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, Map } from 'lucide-react';

const mockItems = [
  {
    id: 'LOG-CN-0012',
    desc: 'Módulo Fotovoltaico Mono-Silício 540...',
    lote: '2024-Q1-SHANGHAI',
    ncm: '8541.43.00',
    ncmStatus: 'valid',
    qty: '1,240',
    unit: 'un',
    weight: '27,280.00',
    dims: '227.8 x 113.4 x 3.5',
    status: 'CONSOLIDADO',
  },
  {
    id: 'LOG-CN-0045',
    desc: 'Inversor String Trifásico 15kW',
    lote: '2024-Q1-SHANGHAI',
    ncm: '8504.40.30',
    ncmStatus: 'error',
    qty: '45',
    unit: 'un',
    weight: '1,125.00',
    dims: '60.0 x 40.0 x 25.0',
    status: 'PENDENTE NCM',
  },
  {
    id: 'LOG-DE-8891',
    desc: 'Suporte de Alumínio - Perfil 4500mm',
    lote: '2024-EU-HAMBURG',
    ncm: '7604.29.00',
    ncmStatus: 'valid',
    qty: '5,000',
    unit: 'un',
    weight: '12,500.00',
    dims: '450.0 x 10.0 x 10.0',
    status: 'EM TRÂNSITO',
  },
  {
    id: 'LOG-VN-1120',
    desc: 'Cabos Solares 6mm2 H1Z2Z2-K',
    lote: '2024-SEA-HAIPHONG',
    ncm: '8544.60.00',
    ncmStatus: 'valid',
    qty: '100',
    unit: 'rls',
    weight: '1,890.00',
    dims: '50.0 x 50.0 x 30.0',
    status: 'CONSOLIDADO',
  }
];

export function Items() {
  return (
    <div className="max-w-[1400px] mx-auto h-full flex flex-col pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Gestão de Itens e Carga</h1>
          <p className="text-sm text-brand-text-muted">Consolidação central de 14 packing lists ativos</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center px-4 py-2 bg-[#121827] hover:bg-[#1e293b] text-sm text-brand-text font-medium rounded-md transition-colors border border-[#1e293b]">
            <Filter className="w-4 h-4 mr-2 text-brand-text-muted" />
            Filtros Avançados
          </button>
          <button className="flex items-center px-4 py-2 bg-[#a2b4ff] hover:bg-[#8da3fa] text-[#0e121e] text-sm font-bold rounded-md transition-colors shadow-sm">
            <Edit2 className="w-4 h-4 mr-2" />
            Edição em Lote
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-[#121827] border border-[#1e293b] rounded-xl p-6 shadow-lg">
           <h3 className="text-[10px] font-bold text-brand-text-muted tracking-widest uppercase mb-4">Total de Itens</h3>
           <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-white">12,482</span>
              <span className="text-xs font-semibold text-brand-success mb-1">+12%</span>
           </div>
        </div>
        <div className="bg-[#121827] border border-[#1e293b] rounded-xl p-6 shadow-lg">
           <h3 className="text-[10px] font-bold text-brand-text-muted tracking-widest uppercase mb-4">Peso Total Consolidado</h3>
           <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">42.8</span>
              <span className="text-sm font-semibold text-brand-text-muted mb-1">ton</span>
           </div>
        </div>
        <div className="bg-[#121827] border border-[#1e293b] rounded-xl p-6 shadow-lg">
           <h3 className="text-[10px] font-bold text-brand-text-muted tracking-widest uppercase mb-4">Validação NCM</h3>
           <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-[#3b82f6]">98.2%</span>
           </div>
        </div>
        <div className="bg-brand-panel border border-[#1e293b] rounded-xl p-6 shadow-lg flex flex-col justify-between">
           <h3 className="text-[10px] font-bold text-brand-text-muted tracking-widest uppercase mb-2">Ação Requerida</h3>
           <p className="text-xs text-white leading-relaxed mb-3">32 itens possuem inconsistências de peso bruto vs. líquido superiores a 5%.</p>
           <button className="text-xs font-semibold text-brand-accent hover:text-white transition-colors text-left flex items-center">
             Verificar discrepâncias <ChevronRight className="w-4 h-4 ml-1" />
           </button>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-[#121827] rounded-xl border border-[#1e293b] shadow-lg flex-1 flex flex-col min-h-0 mb-6">
         <div className="overflow-auto flex-1">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="border-b border-[#1e293b] bg-[#0e121e]/50">
                 <th className="py-4 px-6 w-12"><div className="w-4 h-4 rounded border border-[#334155] bg-transparent"></div></th>
                 <th className="py-4 px-4 text-[10px] font-bold text-brand-text-muted tracking-widest uppercase">ID / SKU</th>
                 <th className="py-4 px-4 text-[10px] font-bold text-brand-text-muted tracking-widest uppercase min-w-[300px]">Descrição do Produto</th>
                 <th className="py-4 px-4 text-[10px] font-bold text-brand-text-muted tracking-widest uppercase text-center">Código NCM</th>
                 <th className="py-4 px-4 text-[10px] font-bold text-brand-text-muted tracking-widest uppercase text-right">Qtd Total</th>
                 <th className="py-4 px-4 text-[10px] font-bold text-brand-text-muted tracking-widest uppercase text-right">Peso (KG)</th>
                 <th className="py-4 px-4 text-[10px] font-bold text-brand-text-muted tracking-widest uppercase">Dimensões (CM)</th>
                 <th className="py-4 px-4 text-[10px] font-bold text-brand-text-muted tracking-widest uppercase text-right pr-6">Status</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-[#1e293b]">
               {mockItems.map((item, i) => (
                 <tr key={i} className="hover:bg-[#161c2c] transition-colors group cursor-default">
                   <td className="py-4 px-6 w-12"><div className="w-4 h-4 rounded border border-[#334155] bg-transparent"></div></td>
                   <td className="py-4 px-4">
                     <span className="text-xs font-mono text-brand-text-muted">{item.id.split('-').join('-\n')}</span>
                   </td>
                   <td className="py-4 px-4">
                     <p className="text-sm font-semibold text-white mb-0.5 truncate max-w-sm">{item.desc}</p>
                     <p className="text-[10px] text-brand-text-muted">Lote: {item.lote}</p>
                   </td>
                   <td className="py-4 px-4 text-center">
                     <div className="flex items-center justify-center gap-2">
                       <span className={`px-2 py-1 bg-[#0e121e] rounded text-xs font-mono font-medium border ${item.ncmStatus === 'error' ? 'text-brand-error border-brand-error/30' : 'text-brand-text-muted border-[#1e293b]'}`}>
                         {item.ncm}
                       </span>
                       {item.ncmStatus === 'valid' ? (
                         <div className="bg-[#3b82f6]/20 p-0.5 rounded-full"><CheckCircle className="w-3 h-3 text-[10px] text-[#3b82f6]" /></div>
                       ) : (
                         <AlertTriangle className="w-4 h-4 text-brand-error" />
                       )}
                     </div>
                   </td>
                   <td className="py-4 px-4 text-right">
                     <span className="text-sm font-bold text-white block">{item.qty}</span>
                     <span className="text-[10px] text-brand-text-muted">{item.unit}</span>
                   </td>
                   <td className="py-4 px-4 text-right">
                     <span className="text-sm font-semibold text-white">{item.weight}</span>
                   </td>
                   <td className="py-4 px-4">
                     <span className="text-[11px] font-mono text-brand-text-muted block whitespace-pre-wrap leading-tight">{item.dims.split(' x ').join(' x\n')}</span>
                   </td>
                   <td className="py-4 px-4 text-right pr-6">
                     <span className={`inline-block px-2 py-1 text-[9px] font-bold tracking-widest uppercase rounded
                        ${item.status === 'CONSOLIDADO' ? 'text-[#3b82f6]' : 
                          item.status === 'PENDENTE NCM' ? 'bg-brand-error/20 text-brand-error' : 
                          'text-brand-text-muted'}`}>
                       {item.status}
                     </span>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
         
         {/* Footer Pagination Area */}
         <div className="p-4 border-t border-[#1e293b] flex justify-between items-center bg-[#0e121e]/30 px-6 rounded-b-xl">
           <div className="flex items-center gap-4 text-xs text-brand-text-muted">
             <span>Mostrando <strong className="text-white">1-50</strong> de <strong className="text-white">12,482</strong></span>
             <span className="border-l border-[#1e293b] pl-4">Linhas por página:</span>
             <select className="bg-[#1e293b] border-none text-white text-xs rounded px-2 py-1 outline-none">
               <option>50</option>
               <option>100</option>
             </select>
           </div>
           <div className="flex items-center gap-4 text-brand-text-muted">
             <div className="flex gap-2">
               <button className="p-1 hover:text-white disabled:opacity-50" disabled><ChevronLeft className="w-4 h-4" /></button>
               <button className="p-1 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
             </div>
             <span className="text-xs">1 / 250</span>
           </div>
         </div>
      </div>

      {/* Bottom Footer Panels */}
      <div className="grid grid-cols-2 gap-6">
         <div className="bg-[#121827] border border-[#1e293b] rounded-xl p-5 shadow-lg flex justify-between items-end">
            <div>
               <h3 className="text-[10px] font-bold text-white tracking-widest uppercase mb-1">Volume por Porto de Origem</h3>
               <p className="text-xs text-brand-text-muted">Shanghai, CN <span className="font-bold text-white ml-24">64%</span></p>
               <div className="w-full bg-[#161c2c] h-1.5 mt-2 rounded-full overflow-hidden min-w-[250px]">
                  <div className="bg-[#a2b4ff] h-full w-[64%]"></div>
               </div>
            </div>
         </div>
         <div className="bg-[#121827] border border-[#1e293b] rounded-xl p-5 shadow-lg flex justify-between items-center p-6">
             <div className="flex items-center gap-4 max-w-sm">
                <div className="bg-[#1e293b] p-3 rounded-lg"><Map className="w-6 h-6 text-brand-text-muted" /></div>
                <div>
                  <h3 className="text-xs font-bold text-white tracking-wider mb-1">Mapa de Fluxo Logístico</h3>
                  <p className="text-[10px] text-brand-text-muted leading-tight">Visualização de rota para carga consolidada SHIP-7729</p>
                </div>
             </div>
             <button className="text-[10px] font-bold text-brand-text-muted hover:text-white uppercase tracking-widest transition-colors">Ver Mapa Completo</button>
         </div>
      </div>

    </div>
  );
}
