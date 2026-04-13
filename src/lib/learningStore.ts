const STORAGE_KEY = 'budget_prefill_learned_mappings';

export interface ColumnMapping {
  ref: string;
  desc: string;
  qty: string;
  weight: string;
  cbm: string;
}

export function saveVendorMapping(vendorName: string, mapping: Partial<ColumnMapping>) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    
    // Merge existing
    data[vendorName] = {
      ...(data[vendorName] || {}),
      ...mapping
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save mapping to local storage', e);
  }
}

export function getVendorMapping(vendorName: string): Partial<ColumnMapping> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = raw ? JSON.parse(raw) : {};
    return data[vendorName] || null;
  } catch (e) {
    return null;
  }
}
