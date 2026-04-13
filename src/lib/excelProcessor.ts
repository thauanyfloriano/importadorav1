import ExcelJS from 'exceljs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getVendorMapping } from './learningStore';

export type ConfidenceScore = 'high' | 'medium' | 'low';

export interface ParsedItem {
  ref: string;
  description: string;
  qty: number;
  totalWeight: number;
  totalCbm: number;
  unitWeight: number;
  unitCbm: number;
  confidence: ConfidenceScore;
  inferredFields: string[]; // Fields that were guessed/calculated mathematically
  imageUrl?: string;
  imageBlobUrl?: string; 
  imageBuffer?: ArrayBuffer; 
  imageExt?: string;
}

export interface PreviewData {
  items: ParsedItem[];
}

// Fallback regexes if Gemini fails or is slow
const defaultColumns = {
  ref: /(ref|item|sku|código|code|part no|型号)/i,
  desc: /(desc|name|produto|product|item name|品名|商品)/i,
  qty: /(qty|quant|qtty|pcs|pieces|数量|total qty)/i,
  weight: /(gw|gross weight|net weight|n\.w|peso|nw|净重|毛重)/i,
  cbm: /(cbm|vol|volume|m3|m³|体积)/i,
  image: /(pic|imag|foto|photo|picture|图片)/i,
  boxes: /(ctn|carton|caixa|箱数)/i, // for inference
  qtyPerBox: /(pcs\/ctn|qty\/ctn|embalagem|装箱数)/i, // for inference
  length: /(length|comp|comprimento|长)/i, // for inference
  width: /(width|largura|宽)/i, // for inference
  height: /(height|altura|高)/i // for inference
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

function cleanNumber(val: string): number {
  if (!val) return 0;
  // Handling 1.000,50 vs 1,000.50 heuristically:
  let str = val.toString().trim();
  // Remove spaces
  str = str.replace(/\s+/g, '');
  // If we have both commas and dots, determine which is decimal
  if (str.includes(',') && str.includes('.')) {
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');
    if (lastComma > lastDot) {
      // 1.000,50 -> 1000.50
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,000.50 -> 1000.50
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    // only commas: could be 1,000 or 2,5. Assume , is decimal if only 1-2 digits follow it, otherwise thousands separator.
    const parts = str.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      str = str.replace(',', '.');
    } else {
      str = str.replace(/,/g, ''); // just remove 
    }
  }
  const parsed = parseFloat(str.replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

/** Calls Gemini API to semantically analyze and match headers */
async function geminiSemanticMapHeaders(headers: string[]): Promise<Record<string, number>> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key is missing");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
  
  const prompt = `
  You are an expert AI parser for international trade Packing Lists.
  I have extracted the following column headers from a spreadsheet:
  ${JSON.stringify(headers)}

  Map them to these exact canonical keys if they represent the same concept (semantically, across English, Mandarin, or Portuguese):
  - "ref" (Product Code, SKU, Item No, 型号)
  - "desc" (Description, Product Name, 品名)
  - "qty" (Total Quantity, 数量, PCS)
  - "weight" (Gross/Net Weight, GW, NW, 净重, 毛重)
  - "cbm" (Total Volume, CBM, 体积)
  - "image" (Picture, Photo, 图片)
  - "boxes" (Total Cartons, CTN, 箱数)
  - "qtyPerBox" (PCS/CTN, 装箱数)
  - "length" (L, Comprimento, 长)
  - "width" (W, Largura, 宽)
  - "height" (H, Algura, 高)

  Return ONLY a JSON object where keys are the specific string from the array of headers I gave you, and the value is the canonical key. If a header does not match any, ignore it. Example: {"型号": "ref", "Total Qty": "qty"}
  `;

  try {
    const response = await model.generateContent(prompt);
    const jsonStr = response.response.text();
    const mappedObj = JSON.parse(jsonStr);
    
    // Convert text mapping to column indexes
    const columnMap: Record<string, number> = {};
    headers.forEach((headerText, index) => {
      // Find exact or sanitized key
      const key = Object.keys(mappedObj).find(k => k.toLowerCase() === headerText.toLowerCase());
      if (key && mappedObj[key]) {
        columnMap[mappedObj[key]] = index + 1; // 1-indexed in ExcelJS
      }
    });
    return columnMap;
  } catch (err) {
    console.error("Gemini mapping failed, falling back to heuristic", err);
    return fallbackHeuristicMapHeaders(headers);
  }
}

/** Fallback to Regex when Gemini is unavailable */
function fallbackHeuristicMapHeaders(headers: string[]): Record<string, number> {
  const columnMap: Record<string, number> = {};
  headers.forEach((headerText, i) => {
    const colNumber = i + 1;
    for (const [key, regex] of Object.entries(defaultColumns)) {
      if (!columnMap[key] && regex.test(headerText)) {
        columnMap[key] = colNumber;
      }
    }
  });
  return columnMap;
}

/**
 * Extracts items from Packing List file with AI Inference
 */
export async function parsePackingList(file: File, vendorName?: string): Promise<ParsedItem[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  // Consider the first sheet represents the packing list, unless there are multiple
  // For multiple sheets, ideally we aggregate, but here we process the primary one with data
  // Finding the sheet with the most rows
  let targetSheet = workbook.worksheets[0];
  let maxRows = 0;
  for (const sheet of workbook.worksheets) {
      if (sheet.rowCount > maxRows) {
          maxRows = sheet.rowCount;
          targetSheet = sheet;
      }
  }
  const worksheet = targetSheet;
  if (!worksheet) throw new Error("A planilha de Packing List está vazia.");

  let headerRowIndex = -1;
  let headers: string[] = [];
  let columnMap: Record<string, number> = {};

  // Step 1: Intelligent Table Start Detection
  // We score rows based on how many canonical keywords they trigger
  let bestScore = 0;
  worksheet.eachRow((row, rowNumber) => {
    if (headerRowIndex !== -1) return;
    
    let score = 0;
    const rowHeaders: string[] = [];
    row.eachCell((cell) => {
      const val = getCellValue(cell);
      rowHeaders.push(val);
      for (const regex of Object.values(defaultColumns)) {
        if (regex.test(val)) score++;
      }
    });

    if (score >= Math.max(3, bestScore) && rowHeaders.length > 2) {
      bestScore = score;
      headerRowIndex = rowNumber;
      headers = rowHeaders;
    }
  });

  if (headerRowIndex === -1) {
    throw new Error("Tabela despadronizada: Não foi possível identificar o início dos dados automaticamente.");
  }

  // Step 2: Semantic AI Mapping
  let useAi = true;
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
      useAi = false;
  }

  const learnedMapping = vendorName ? getVendorMapping(vendorName) : null;
  if (learnedMapping && Object.keys(learnedMapping).length > 0) {
     // Merge learned mapping logic here - simplified to fallback
     columnMap = fallbackHeuristicMapHeaders(headers); // in a full impl, we map learned indices
  } else if (useAi) {
     columnMap = await geminiSemanticMapHeaders(headers);
  } else {
     columnMap = fallbackHeuristicMapHeaders(headers);
  }

  const media = (workbook.model as any).media || [];
  const imageByRow: Record<number, any> = {};
  if (worksheet.getImages) {
    for (const imagePlacement of worksheet.getImages()) {
      const rowNum = Math.floor(imagePlacement.range.tl.row) + 1; 
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

  const itemsMap: Record<string, ParsedItem> = {};

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowIndex) return; 
    
    // Get base values
    const rawRef = columnMap['ref'] ? getCellValue(row.getCell(columnMap['ref'])) : '';
    const ref = rawRef.trim();
    if (!ref) return; // Skip empty rows

    const desc = columnMap['desc'] ? getCellValue(row.getCell(columnMap['desc'])) : '';
    
    // Numeric metrics
    let qty = cleanNumber(columnMap['qty'] ? getCellValue(row.getCell(columnMap['qty'])) : '');
    let weight = cleanNumber(columnMap['weight'] ? getCellValue(row.getCell(columnMap['weight'])) : '');
    let cbm = cleanNumber(columnMap['cbm'] ? getCellValue(row.getCell(columnMap['cbm'])) : '');

    // Inference Metrics
    const boxes = cleanNumber(columnMap['boxes'] ? getCellValue(row.getCell(columnMap['boxes'])) : '');
    const qtyPerBox = cleanNumber(columnMap['qtyPerBox'] ? getCellValue(row.getCell(columnMap['qtyPerBox'])) : '');
    const L = cleanNumber(columnMap['length'] ? getCellValue(row.getCell(columnMap['length'])) : '');
    const W = cleanNumber(columnMap['width'] ? getCellValue(row.getCell(columnMap['width'])) : '');
    const H = cleanNumber(columnMap['height'] ? getCellValue(row.getCell(columnMap['height'])) : '');

    const inferredFields: string[] = [];

    // Inference Engine Layer
    if (qty === 0 && boxes > 0 && qtyPerBox > 0) {
        qty = boxes * qtyPerBox;
        inferredFields.push('qty');
    }

    if (cbm === 0 && L > 0 && W > 0 && H > 0 && boxes > 0) {
        // Assume dimensions in CM
        cbm = ((L * W * H) / 1000000) * boxes;
        inferredFields.push('cbm');
    } else if (cbm === 0 && L > 0 && W > 0 && H > 0 && boxes === 0) {
        // Just one unit volume as fallback, very low confidence
        cbm = ((L * W * H) / 1000000);
        inferredFields.push('cbm');
    }

    let imgData = imageByRow[rowNumber];
    
    if (itemsMap[ref]) {
      itemsMap[ref].qty += qty;
      itemsMap[ref].totalWeight += weight;
      itemsMap[ref].totalCbm += cbm;
      if (!itemsMap[ref].imageBuffer && imgData) {
        itemsMap[ref].imageBuffer = imgData.buffer;
        itemsMap[ref].imageExt = imgData.ext;
      }
    } else {
      itemsMap[ref] = {
        ref,
        description: desc,
        qty: qty,
        totalWeight: weight,
        totalCbm: cbm,
        unitWeight: 0,
        unitCbm: 0,
        confidence: 'low', // will evaluate below
        inferredFields,
        imageBuffer: imgData?.buffer,
        imageExt: imgData?.ext
      };
    }
  });

  // Calculate units and confidence
  const result: ParsedItem[] = Object.values(itemsMap).map(item => {
    if (item.qty > 0) {
      item.unitWeight = item.totalWeight / item.qty;
      item.unitCbm = item.totalCbm / item.qty;
    }
    if (item.imageBuffer) {
      const blob = new Blob([item.imageBuffer], { type: `image/${item.imageExt || 'png'}` });
      item.imageBlobUrl = window.URL.createObjectURL(blob);
    }

    // Evaluate Confidence
    let missingCritical = 0;
    if (item.qty <= 0) missingCritical++;
    if (item.totalWeight <= 0) missingCritical++;
    if (item.totalCbm <= 0) missingCritical++;
    if (!item.ref) missingCritical++;

    if (missingCritical === 0 && item.inferredFields.length === 0) {
        item.confidence = 'high';
    } else if (missingCritical === 0 && item.inferredFields.length > 0) {
        item.confidence = 'medium'; // Inferred everything successfully
    } else if (missingCritical === 1) {
        item.confidence = 'medium';
    } else {
        item.confidence = 'low';
    }

    return item;
  });

  return result;
}

export async function processBudgetFiles(packingListFile: File, masterFile: File, vendorName?: string): Promise<{ preview: PreviewData, blob: Blob }> {
  const items = await parsePackingList(packingListFile, vendorName);

  const masterBuffer = await masterFile.arrayBuffer();
  const masterWorkbook = new ExcelJS.Workbook();
  await masterWorkbook.xlsx.load(masterBuffer);

  const masterSheet = masterWorkbook.getWorksheet('Master') || masterWorkbook.worksheets[0];
  const prodSheet = masterWorkbook.getWorksheet('Produtos');
  const costSheet = masterWorkbook.getWorksheet('Custo Resumido');

  if (!masterSheet) {
    throw new Error('Aba "Master" não encontrada na planilha fornecida.');
  }

  const msStartRow = 2;
  items.forEach((item, index) => {
    const rowNum = msStartRow + index;
    const row = masterSheet.getRow(rowNum);
    row.getCell(1).value = item.ref;
    row.getCell(7).value = item.description;
    row.getCell(8).value = item.unitWeight;
    row.getCell(11).value = item.unitCbm;
    row.commit();
  });

  if (prodSheet) {
    const prodStartRow = 2;
    items.forEach((item, index) => {
      const rowNum = prodStartRow + index;
      const row = prodSheet.getRow(rowNum);
      row.getCell(4).value = item.qty;
      row.commit();
    });
  }

  if (costSheet) {
    const costStartRow = 2;
    items.forEach((item, index) => {
      const rowNum = costStartRow + index;
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
          console.warn('Falha injetar imagem', e);
        }
      }
    });
  }

  const outputBuffer = await masterWorkbook.xlsx.writeBuffer();
  const blob = new Blob([outputBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  return { preview: { items }, blob };
}
