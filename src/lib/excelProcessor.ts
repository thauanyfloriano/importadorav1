import ExcelJS from 'exceljs';

export interface ParsedItem {
  ref: string;
  description: string;
  qty: number;
  totalWeight: number;
  totalCbm: number;
  unitWeight: number;
  unitCbm: number;
  imageUrl?: string; // Original image extension/Type mapping for ExcelJS
  imageBlobUrl?: string; // For UI preview
  imageBuffer?: ArrayBuffer; // For injection
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

function getCellValue(cell: ExcelJS.Cell | undefined): string {
  if (!cell) return '';
  if (cell.value === null || cell.value === undefined) return '';
  if (typeof cell.value === 'object') {
    if ('richText' in cell.value) {
      return cell.value.richText.map((rt: any) => rt.text).join('').trim();
    }
    if ('sharedFormula' in cell.value || 'formula' in cell.value) {
      return String(cell.result || '').trim();
    }
  }
  return String(cell.value).trim();
}

/**
 * Extracts items from Packing List file
 */
export async function parsePackingList(file: File): Promise<ParsedItem[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  // Consider the first sheet represents the packing list
  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error("A planilha de Packing List está vazia.");

  let headerRowIndex = -1;
  const columnMap: Record<string, number[]> = {};

  // Find header row: look for a row that has at least 2 known columns
  worksheet.eachRow((row, rowNumber) => {
    if (headerRowIndex !== -1) return; // already found
    
    let matches = 0;

    row.eachCell((cell) => {
      const val = getCellValue(cell);
      if (regexes.ref.test(val) || regexes.desc.test(val)) matches++;
      if (regexes.qty.test(val) || regexes.weight.test(val) || regexes.cbm.test(val)) matches++;
    });

    if (matches >= 2) {
      headerRowIndex = rowNumber;
      // Map columns allowing arrays of matches
      row.eachCell((cell, colNumber) => {
        const val = getCellValue(cell);
        
        if (regexes.ref.test(val)) {
            columnMap['ref'] = columnMap['ref'] || [];
            columnMap['ref'].push(colNumber);
        } else if (regexes.desc.test(val)) {
            columnMap['desc'] = columnMap['desc'] || [];
            columnMap['desc'].push(colNumber);
        } else if (regexes.qty.test(val)) {
            columnMap['qty'] = columnMap['qty'] || [];
            columnMap['qty'].push(colNumber);
        } else if (regexes.weight.test(val)) {
            columnMap['weight'] = columnMap['weight'] || [];
            columnMap['weight'].push(colNumber);
        } else if (regexes.cbm.test(val)) {
            columnMap['cbm'] = columnMap['cbm'] || [];
            columnMap['cbm'].push(colNumber);
        } else if (regexes.image.test(val)) {
            columnMap['image'] = columnMap['image'] || [];
            columnMap['image'].push(colNumber);
        }
      });
    }
  });

  if (headerRowIndex === -1) {
    throw new Error("Não foi possível identificar o cabeçalho no Packing List (Ex: faltando colunas Ref / Qty).");
  }

  // Extract media from workbook (only some exceljs versions support this cleanly, but we try)
  // workbook.model.media contains all images
  const media = (workbook.model as any).media || [];
  
  // Map images by row based on worksheet placements
  const imageByRow: Record<number, any> = {};
  if (worksheet.getImages) {
    for (const imagePlacement of worksheet.getImages()) {
      const rowNum = Math.floor(imagePlacement.range.tl.row) + 1; // 0-indexed in range
      // Just keep the first image found for the row
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

  const getBestNumber = (row: ExcelJS.Row, colIndexes: number[] | undefined): number => {
    if (!colIndexes) return 0;
    // Iterate backwards. In Packing lists, "Total" columns usually appear to the right of "Unit" ones.
    for (let i = colIndexes.length - 1; i >= 0; i--) {
      const val = getCellValue(row.getCell(colIndexes[i]));
      const num = parseFloat(val.replace(',', '.').replace(/[^0-9.-]/g, '')) || 0;
      if (num > 0) return num;
    }
    return 0;
  };

  const getBestString = (row: ExcelJS.Row, colIndexes: number[] | undefined): string => {
    if (!colIndexes) return '';
    for (let i = colIndexes.length - 1; i >= 0; i--) {
      const val = getCellValue(row.getCell(colIndexes[i]));
      if (val) return val;
    }
    return '';
  };

  const itemsMap: Record<string, ParsedItem> = {};

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowIndex) return; // Skip headers
    
    const numQty = getBestNumber(row, columnMap['qty']);

    let ref = getBestString(row, columnMap['ref']);
    const desc = getBestString(row, columnMap['desc']);
    
    if (!ref) {
      if (desc || numQty > 0) {
         ref = 'UNREF-' + rowNumber; // Use generic ref if missing
      } else {
         return; // If BOTH ref/desc and qty are missing, assume empty row
      }
    }
    
    const numWeight = getBestNumber(row, columnMap['weight']);
    const numCbm = getBestNumber(row, columnMap['cbm']);

    let imgData = imageByRow[rowNumber];

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
  });

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
  // Procura a linha em branco inicial ou assume a linha 2 para os dados
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
    const prodStartRow = 2; // Assuming line 2 for products
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
          // Add image to workbook
          const imageId = masterWorkbook.addImage({
            buffer: item.imageBuffer,
            extension: item.imageExt as any,
          });
          
          // Add to cell B[linha] (which is col index 1, row index diff)
          costSheet.addImage(imageId, {
            tl: { col: 1, row: rowNum - 1 } as any,
            br: { col: 2, row: rowNum } as any,
            editAs: 'oneCell'
          });

          // Aumentar a altura da linha para a imagem caber
          const row = costSheet.getRow(rowNum);
          row.height = 80; // approximate pleasant height
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
