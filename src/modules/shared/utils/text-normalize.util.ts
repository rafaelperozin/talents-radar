/**
 * Normaliza texto para comparação tolerante a maiúsculas,
 * acentos e caracteres especiais (ç → c, à → a, etc.).
 *
 * Exemplos:
 *   normalizeText('São Paulo') === normalizeText('sao paulo') // true
 *   normalizeText('Comunicação') === normalizeText('comunicacao') // true
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD') // decompõe caracteres acentuados (à → a + ̀)
    .replace(/[\u0300-\u036f]/g, '') // remove os diacríticos combinantes
    .toLowerCase()
    .trim();
}
