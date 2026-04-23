/**
 * Cache em memória para evitar chamadas duplicadas para o Google Translate.
 * Isso acelera imensamente a tradução de Packing Lists com itens repetidos.
 */
const translationCache = new Map<string, string>();

/**
 * Função utilitária para verificar se um texto contém caracteres asiáticos (Mandarim/Japonês/Coreano).
 * Foca primariamente no bloco CJK (Chinese, Japanese, Korean).
 */
export function containsChinese(text: string): boolean {
  if (!text) return false;
  // Regex simples para blocos CJK unificados
  const cjkRegex = /[\u4E00-\u9FFF]/;
  return cjkRegex.test(text);
}

/**
 * Traduz um texto de origem (detectado automaticamente, geralmente Mandarim) para o Português
 * usando o endpoint público gratuito do Google Translate (gtx).
 */
export async function translateToPortuguese(text: string): Promise<string> {
  if (!text || !text.trim()) return text;
  
  const cleanText = text.trim();

  // Verifica o cache primeiro
  if (translationCache.has(cleanText)) {
    return translationCache.get(cleanText)!;
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=${encodeURIComponent(cleanText)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Translate falhou com status ${response.status}`);
    }

    const data = await response.json();
    
    // O retorno da API gtx é um array complexo.
    // data[0] contém as traduções fracionadas.
    // data[0][x][0] contém a string traduzida de cada segmento.
    let translatedText = '';
    if (data && data[0] && Array.isArray(data[0])) {
      data[0].forEach((segment: any) => {
        if (segment[0]) {
          translatedText += segment[0];
        }
      });
    }

    if (translatedText) {
      // Salva no cache e retorna
      translationCache.set(cleanText, translatedText);
      return translatedText;
    }

    return cleanText; // fallback para o original
  } catch (error) {
    console.warn("Falha ao traduzir texto:", cleanText, error);
    // Em caso de falha de rede/cors, retorna o texto original silenciosamente
    return cleanText;
  }
}
