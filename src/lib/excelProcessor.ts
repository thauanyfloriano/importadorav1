import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { translateToPortuguese, containsChinese } from './translator';

export interface ParsedItem {
  ref: string;
  description: string;
  qty: number;
  totalWeight: number;
  totalCbm: number;
  unitWeight: number;
  unitCbm: number;
  imageUrl?: string; 
  imageBlobUrl?: string; 
  imageBuffer?: ArrayBuffer; 
  imageExt?: string;
}

export interface PreviewData {
  items: ParsedItem[];
}

// Heuristics mappings
const regexes = {
  ref: /(ref|item|sku|código|code|part|modelo|型号|model)/i,
  desc: /(desc|name|produto|product|品名|商品|名称|英文)/i,
  qty: /(total\s*qty|total\s*quant|total\s*qtty|t\*quant|总数量|qty|quant|qtty|pcs|pieces|数量)/i,
  weight: /(t\*gw|t\*nw|total\s*weight|gross\s*weight|net\s*weight|peso\s*bruto|peso\s*total|peso\s*l[ií]q|g\.w|n\.w|peso|nw|总毛重|净重|毛重)/i,
  cbm: /(t\*cbm|total\s*cbm|total\s*vol|cbm|vol|volume|m3|m³|总体积|体积)/i,
  image: /(pic|imag|foto|photo|picture|图片)/i,
};

function normalizeString(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).replace(/\n/g, ' ').replace(/\r/g, ' ').trim();
}

/**
 * Extracts items from Packing List file using SheetJS (XLSX) for data 
 * and ExcelJS for image extraction (if .xlsx)
 */
export async function parsePackingList(file: File): Promise<ParsedItem[]> {
  const arrayBuffer = await file.arrayBuffer();
  
  // 1. Read textual data using SheetJS (handles both .xls and .xlsx robustly)
  const workbookXlsx = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbookXlsx.SheetNames[0];
  if (!sheetName) throw new Error("A planilha de Packing List está vazia ou o formato é inválido.");
  
  const worksheetXlsx = workbookXlsx.Sheets[sheetName];
  const rawData: any[][] = XLSX.utils.sheet_to_json(worksheetXlsx, { header: 1, defval: '' });

  let headerRowIndex = -1;
  const columnMap: Record<string, number[]> = {};

  // Find header row: Score each row based on distinct matching categories
  let maxScore = 0;
  
  for (let r = 0; r < Math.min(rawData.length, 50); r++) {
    const row = rawData[r];
    if (!row) continue;
    
    const rowMap: Record<string, number[]> = {};

    for (let c = 0; c < row.length; c++) {
      const val = normalizeString(row[c]);
      if (!val) continue;

      if (regexes.ref.test(val)) { rowMap['ref'] = rowMap['ref'] || []; rowMap['ref'].push(c); }
      else if (regexes.desc.test(val)) { rowMap['desc'] = rowMap['desc'] || []; rowMap['desc'].push(c); }
      else if (regexes.qty.test(val)) { rowMap['qty'] = rowMap['qty'] || []; rowMap['qty'].push(c); }
      else if (regexes.weight.test(val)) { rowMap['weight'] = rowMap['weight'] || []; rowMap['weight'].push(c); }
      else if (regexes.cbm.test(val)) { rowMap['cbm'] = rowMap['cbm'] || []; rowMap['cbm'].push(c); }
      else if (regexes.image.test(val)) { rowMap['image'] = rowMap['image'] || []; rowMap['image'].push(c); }
    }
    
    const distinctMatches = Object.keys(rowMap).length;
    if (distinctMatches > maxScore && distinctMatches >= 2) {
      maxScore = distinctMatches;
      headerRowIndex = r;
      columnMap['ref'] = rowMap['ref'] || [];
      columnMap['desc'] = rowMap['desc'] || [];
      columnMap['qty'] = rowMap['qty'] || [];
      columnMap['weight'] = rowMap['weight'] || [];
      columnMap['cbm'] = rowMap['cbm'] || [];
      columnMap['image'] = rowMap['image'] || [];
    }
  }

  if (headerRowIndex === -1) {
    throw new Error("Não foi possível identificar o cabeçalho no Packing List (faltam colunas obrigatórias como Ref, Qty, Peso).");
  }

  // 2. Extract media from workbook using ExcelJS (only works well for .xlsx)
  const imageByRow: Record<number, any> = {};
  
  // Only attempt image extraction if it's not a legacy .xls file
  if (file.name.toLowerCase().endsWith('.xlsx')) {
    try {
      const workbookExcelJs = new ExcelJS.Workbook();
      await workbookExcelJs.xlsx.load(arrayBuffer);
      const worksheetExcelJs = workbookExcelJs.worksheets[0];
      
      const media = (workbookExcelJs.model as any).media || [];
      
      if (worksheetExcelJs && worksheetExcelJs.getImages) {
        for (const imagePlacement of worksheetExcelJs.getImages()) {
          const rowNum = Math.floor(imagePlacement.range.tl.row); // 0-indexed to match rawData
          if (!imageByRow[rowNum]) {
            const mediaId = imagePlacement.imageId;
            const mediaObj = media.find((m: any) => m.index === mediaId);
            if (mediaObj && mediaObj.buffer) {
              imageByRow[rowNum] = {
                buffer: mediaObj.buffer,
                ext: mediaObj.extension
              };
            }
          }
        }
      }
    } catch (e) {
      console.warn("Falha ao extrair imagens via ExcelJS:", e);
    }
  }

  const getBestNumber = (row: any[], colIndexes: number[] | undefined): number => {
    if (!colIndexes || colIndexes.length === 0) return 0;
    for (let i = colIndexes.length - 1; i >= 0; i--) {
      const val = String(row[colIndexes[i]] || '');
      const num = parseFloat(val.replace(',', '.').replace(/[^0-9.-]/g, ''));
      if (!isNaN(num) && num > 0) return num;
    }
    return 0;
  };

  const getBestString = (row: any[], colIndexes: number[] | undefined): string => {
    if (!colIndexes || colIndexes.length === 0) return '';
    for (let i = colIndexes.length - 1; i >= 0; i--) {
      const val = normalizeString(row[colIndexes[i]]);
      if (val) return val;
    }
    return '';
  };

  const itemsMap: Record<string, ParsedItem> = {};

  for (let r = headerRowIndex + 1; r < rawData.length; r++) {
    const row = rawData[r];
    if (!row || row.length === 0) continue;

    const numQty = getBestNumber(row, columnMap['qty']);

    // FILTER: Ignorar completamente linhas que não possuem quantidade > 0.
    // Isso evita puxar linhas de "Notas" ou "Instruções" que por acaso caem na coluna de ref/desc.
    if (numQty <= 0) continue;

    let ref = getBestString(row, columnMap['ref']);
    let desc = getBestString(row, columnMap['desc']);
    
    // FILTER: Ignorar textos excessivamente longos (indicativo de notas/termos legais)
    if ((ref && ref.length > 150) || (desc && desc.length > 250)) continue;

    if (!ref) {
      if (desc) {
         ref = 'UNREF-' + (r + 1); // Use generic ref if missing
      } else {
         continue; // If BOTH ref/desc are missing, assume empty row
      }
    }
    
    // TRADUÇÃO: Se for chinês, traduz para o Português
    if (containsChinese(ref)) {
      ref = await translateToPortuguese(ref);
    }
    if (containsChinese(desc)) {
      desc = await translateToPortuguese(desc);
    }
    
    const numWeight = getBestNumber(row, columnMap['weight']);
    const numCbm = getBestNumber(row, columnMap['cbm']);

    const imgData = imageByRow[r];

    if (itemsMap[ref]) {
      // Aggregate
      itemsMap[ref].qty += numQty;
      itemsMap[ref].totalWeight += numWeight;
      itemsMap[ref].totalCbm += numCbm;
      if (!itemsMap[ref].imageBuffer && imgData) {
        itemsMap[ref].imageBuffer = imgData.buffer;
        itemsMap[ref].imageExt = imgData.ext;
      }
    } else {
      itemsMap[ref] = {
        ref,
        description: desc,
        qty: numQty,
        totalWeight: numWeight,
        totalCbm: numCbm,
        unitWeight: 0,
        unitCbm: 0,
        imageBuffer: imgData?.buffer,
        imageExt: imgData?.ext
      };
    }
  }

  // Calculate units
  const result: ParsedItem[] = Object.values(itemsMap).map(item => {
    if (item.qty > 0) {
      item.unitWeight = item.totalWeight / item.qty;
      item.unitCbm = item.totalCbm / item.qty;
    }
    if (item.imageBuffer) {
      const blob = new Blob([item.imageBuffer], { type: `image/${item.imageExt || 'png'}` });
      item.imageBlobUrl = window.URL.createObjectURL(blob);
    }
    return item;
  });

  return result;
}

/**
 * Modifies the Master workbook with parsed items
 */
export async function processBudgetFiles(packingListFile: File, masterFile: File): Promise<{ preview: PreviewData, blob: Blob }> {
  // 1. Parse Packing List
  const items = await parsePackingList(packingListFile);

  // 2. Load Master File
  const masterBuffer = await masterFile.arrayBuffer();
  const masterWorkbook = new ExcelJS.Workbook();
  await masterWorkbook.xlsx.load(masterBuffer);

  const masterSheet = masterWorkbook.getWorksheet('Master') || masterWorkbook.worksheets[0];
  const prodSheet = masterWorkbook.getWorksheet('Produtos');
  const costSheet = masterWorkbook.getWorksheet('Custo Resumido');

  if (!masterSheet) {
    throw new Error('Aba "Master" não encontrada na planilha fornecida.');
  }

  // Preencher Aba "Master"
  const msStartRow = 2; // Default
  items.forEach((item, index) => {
    const rowNum = msStartRow + index;
    const row = masterSheet.getRow(rowNum);
    
    // Col A: Produto (Ref)
    row.getCell(1).value = item.ref;
    // Col G: Descrição (7)
    row.getCell(7).value = item.description;
    // Col H: Peso Unitário (8)
    row.getCell(8).value = item.unitWeight;
    // Col K: CBM Unitário (11)
    row.getCell(11).value = item.unitCbm;

    row.commit();
  });

  // Preencher Aba "Produtos"
  if (prodSheet) {
    const prodStartRow = 2; 
    items.forEach((item, index) => {
      const rowNum = prodStartRow + index;
      const row = prodSheet.getRow(rowNum);
      
      // Col D: Quantidade (4)
      row.getCell(4).value = item.qty;
      row.commit();
    });
  }

  // Preencher Aba "Custo Resumido"
  if (costSheet) {
    const costStartRow = 2;
    items.forEach((item, index) => {
      const rowNum = costStartRow + index;
      
      // Col B: Imagens (2)
      if (item.imageBuffer && item.imageExt) {
        try {
          const imageId = masterWorkbook.addImage({
            buffer: item.imageBuffer,
            extension: item.imageExt as any,
          });
          
          costSheet.addImage(imageId, {
            tl: { col: 1, row: rowNum - 1 } as any,
            br: { col: 2, row: rowNum } as any,
            editAs: 'oneCell'
          });

          const row = costSheet.getRow(rowNum);
          row.height = 80;
          costSheet.getColumn(2).width = 15;
        } catch (e) {
          console.warn('Falha ao injetar imagem na linha', rowNum, e);
        }
      }
    });
  }

  // Export
  const outputBuffer = await masterWorkbook.xlsx.writeBuffer();
  const blob = new Blob([outputBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  return {
    preview: { items },
    blob
  };
}
