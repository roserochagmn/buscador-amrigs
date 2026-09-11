export function fmtMoney(value, display) {
  if (value === null || value === undefined) return display || 'Não informado';
  return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtNota(value, display) {
  if (value === null || value === undefined) return display || 'Não informado';
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function uniqueSorted(rows, key) {
  return [...new Set(rows.map((r) => r[key]))]
    .filter(Boolean)
    .sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));
}
