import { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Download, AlertCircle, CheckCircle, ChevronRight, Settings2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { processBudgetFiles, type PreviewData } from '../lib/excelProcessor';

export function BudgetPrefill() {
  const [packingListFile, setPackingListFile] = useState<File | null>(null);
  const [masterFile, setMasterFile] = useState<File | null>(null);
  const [vendorName, setVendorName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finalFileBlob, setFinalFileBlob] = useState<Blob | null>(null);

  const handleProcess = async () => {
    if (!packingListFile || !masterFile) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await processBudgetFiles(packingListFile, masterFile, vendorName);
      setPreviewData(result.preview);
      setFinalFileBlob(result.blob);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao processar os arquivos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!finalFileBlob) return;
    const url = window.URL.createObjectURL(finalFileBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Master_Preenchido_${new Date().getTime()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Pré-preenchimento para Orçamento</h1>
          <p className="text-sm text-brand-text-muted">Faça upload de um Packing List para preencher a Planilha Master automaticamente.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Packing List */}
        <div className="bg-brand-panel rounded-xl border border-[#1e293b] p-6 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-panel-hover opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <input 
            type="file" 
            accept=".xlsx, .xls"
            onChange={(e) => setPackingListFile(e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${packingListFile ? 'bg-brand-success/20 text-brand-success' : 'bg-brand-accent/20 text-brand-accent'}`}>
            {packingListFile ? <CheckCircle className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
          </div>
          <h3 className="text-lg font-medium text-white mb-2">1. Importar Packing List</h3>
          <p className="text-sm text-brand-text-muted text-center max-w-xs">
            {packingListFile ? <span className="text-white font-semibold">{packingListFile.name}</span> : 'Clique ou arraste um arquivo Excel (.xlsx) contendo os produtos.'}
          </p>
        </div>

        {/* Upload Master Plan */}
        <div className="bg-brand-panel rounded-xl border border-[#1e293b] p-6 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-panel-hover opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <input 
            type="file" 
            accept=".xlsx, .xls"
            onChange={(e) => setMasterFile(e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${masterFile ? 'bg-brand-success/20 text-brand-success' : 'bg-[#1e293b] text-brand-text-muted group-hover:text-white'}`}>
            {masterFile ? <CheckCircle className="w-8 h-8" /> : <FileSpreadsheet className="w-8 h-8" />}
          </div>
          <h3 className="text-lg font-medium text-white mb-2">2. Importar Planilha Master</h3>
          <p className="text-sm text-brand-text-muted text-center max-w-xs">
            {masterFile ? <span className="text-white font-semibold">{masterFile.name}</span> : 'Clique ou arraste o modelo base Master (.xlsx).'}
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 bg-brand-panel rounded-xl border border-[#1e293b]">
        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4 flex-1 mr-4">
           <div className="flex items-center space-x-3 w-full max-w-sm">
             <Settings2 className="w-5 h-5 text-brand-text-muted flex-shrink-0" />
             <input
                type="text"
                placeholder="Fornecedor (Opcional) para aprender padrão"
                value={vendorName}
                onChange={e => setVendorName(e.target.value)}
                className="w-full bg-[#161c2c] border border-[#1e293b] rounded text-sm px-3 py-1.5 focus:outline-none focus:border-brand-accent text-white"
             />
           </div>
           <span className="text-xs text-brand-text-muted hidden lg:block">Usando: Inteligência Artificial (Google Gemini) e Inferência Matemática.</span>
        </div>
        <button
          onClick={handleProcess}
          disabled={!packingListFile || !masterFile || isLoading}
          className={cn(
            "flex items-center px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg",
            (!packingListFile || !masterFile || isLoading) 
              ? "bg-[#1e293b] text-brand-text-muted cursor-not-allowed" 
              : "bg-brand-accent text-white hover:bg-brand-accent-hover hover:shadow-brand-accent/25"
          )}
        >
          {isLoading ? (
             <span className="flex items-center"><span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full mr-2"></span> Processando...</span>
          ) : (
             <span className="flex items-center">Gerar Pré-preenchimento <ChevronRight className="w-4 h-4 ml-2" /></span>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-brand-error/10 border border-brand-error/20 rounded-xl flex items-start">
          <AlertCircle className="w-5 h-5 text-brand-error mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-brand-error">{error}</p>
        </div>
      )}

      {/* Preview Section */}
      {previewData && (
        <div className="bg-brand-panel rounded-xl border border-[#1e293b] overflow-hidden flex-1 flex flex-col">
          <div className="p-5 border-b border-[#1e293b] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Revisão de Dados Extraídos</h3>
              <p className="text-sm text-brand-text-muted mt-1">{previewData.items.length} produtos processados.</p>
            </div>
            {finalFileBlob && (
              <button 
                onClick={handleDownload}
                className="flex items-center px-4 py-2 bg-brand-success text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" /> Exportar Master Preenchido
              </button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#161c2c] text-xs font-medium text-brand-text-muted uppercase tracking-wider">
                  <th className="px-6 py-4 border-b border-[#1e293b]">Imagem</th>
                  <th className="px-6 py-4 border-b border-[#1e293b]">Ref / SKU</th>
                  <th className="px-6 py-4 border-b border-[#1e293b]">Descrição</th>
                  <th className="px-6 py-4 border-b border-[#1e293b]">Qtd Total</th>
                  <th className="px-6 py-4 border-b border-[#1e293b]">Peso (Unit)</th>
                  <th className="px-6 py-4 border-b border-[#1e293b]">CBM (Unit)</th>
                  <th className="px-6 py-4 border-b border-[#1e293b]">Confiança (IA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b] text-sm text-brand-text">
                {previewData.items.map((item, idx) => {
                  const hasError = !item.ref || item.qty <= 0 || !item.unitWeight || !item.unitCbm;
                  return (
                    <tr key={idx} className={`hover:bg-brand-panel-hover transition-colors ${hasError ? 'bg-brand-error/5' : ''}`}>
                      <td className="px-6 py-4">
                        {item.imageBlobUrl ? (
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-brand-base border border-[#1e293b]">
                            <img src={item.imageBlobUrl} alt={item.ref} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-[#1e293b] flex items-center justify-center text-xs text-brand-text-muted">N/A</div>
                        )}
                      </td>
                      <td className={`px-6 py-4 font-medium ${!item.ref ? 'text-brand-error' : 'text-white'}`}>
                        {item.ref || 'Faltando'}
                      </td>
                      <td className="px-6 py-4 truncate max-w-xs" title={item.description}>
                        {item.description || <span className="text-brand-error">Faltando</span>}
                      </td>
                      <td className={`px-6 py-4 ${item.qty <= 0 ? 'text-brand-error' : ''}`}>
                        {item.qty}
                      </td>
                      <td className={`px-6 py-4 ${!item.unitWeight ? 'text-brand-error' : ''}`}>
                        {item.unitWeight ? item.unitWeight.toFixed(4) : 'N/D'}
                      </td>
                      <td className={`px-6 py-4 ${!item.unitCbm ? 'text-brand-error' : ''}`}>
                         {item.unitCbm ? item.unitCbm.toFixed(4) : 'N/D'}
                      </td>
                      <td className="px-6 py-4">
                         {item.confidence === 'high' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-success/10 text-brand-success">
                              🟢 Alta
                            </span>
                         )}
                         {item.confidence === 'medium' && (
                            <div className="flex flex-col gap-1 items-start">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500">
                                🟡 Média
                              </span>
                              {item.inferredFields && item.inferredFields.length > 0 && (
                                <span className="text-[10px] text-brand-text-muted">Inferred: {item.inferredFields.join(', ')}</span>
                              )}
                            </div>
                         )}
                         {item.confidence === 'low' && (
                            <span className="inline-flex flex-col text-xs text-brand-error gap-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-brand-error/10 w-fit">
                                🔴 Baixa
                              </span>
                              {!item.ref && <span>Ref pendente</span>}
                              {item.qty <= 0 && <span>Qtd inválida</span>}
                            </span>
                         )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
