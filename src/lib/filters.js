export const DEFAULT_FILTERS = {
  especialidade: '',
  estado: '',
  cidade: '',
  instituicao: '',
  pesos: '',
  programa: '',
  total_op: '>=',
  total_val: '',
  mil_op: '>=',
  mil_val: '',
  livres_op: '>=',
  livres_val: '',
  valor_op: '<=',
  valor_val: '',
  nota_op: '<=',
  nota_val: '',
};

function cmp(a, op, b) {
  if (op === '>=') return a >= b;
  if (op === '<=') return a <= b;
  return a === b;
}

export function applyFilters(rows, f) {
  return rows.filter((r) => {
    if (f.especialidade && r.especialidade !== f.especialidade) return false;
    if (f.estado && r.estado_nome !== f.estado) return false;
    if (f.cidade && r.cidade !== f.cidade) return false;
    if (f.instituicao && r.instituicao !== f.instituicao) return false;
    if (f.pesos && r.pesos_notas_finais !== f.pesos) return false;
    if (f.programa && r.programa_governo !== f.programa) return false;
    if (f.total_val !== '' && !cmp(r.numero_total_vagas, f.total_op, Number(f.total_val))) return false;
    if (f.mil_val !== '' && !cmp(r.numero_vagas_militares, f.mil_op, Number(f.mil_val))) return false;
    if (f.livres_val !== '' && !cmp(r.numero_vagas_livres, f.livres_op, Number(f.livres_val))) return false;
    if (f.valor_val !== '' && r.valor_instituicao !== null && !cmp(r.valor_instituicao, f.valor_op, Number(f.valor_val)))
      return false;
    if (f.nota_val !== '' && r.nota_minima !== null && !cmp(r.nota_minima, f.nota_op, Number(f.nota_val))) return false;
    return true;
  });
}

export function sortRows(rows, sort) {
  const s = [...rows];
  switch (sort) {
    case 'vagas_desc':
      s.sort((a, b) => b.numero_total_vagas - a.numero_total_vagas);
      break;
    case 'livres_desc':
      s.sort((a, b) => b.numero_vagas_livres - a.numero_vagas_livres);
      break;
    case 'valor_asc':
      s.sort((a, b) => (a.valor_instituicao ?? Infinity) - (b.valor_instituicao ?? Infinity));
      break;
    case 'nota_asc':
      s.sort((a, b) => (a.nota_minima ?? Infinity) - (b.nota_minima ?? Infinity));
      break;
    case 'cidade_asc':
      s.sort((a, b) => a.cidade.localeCompare(b.cidade, 'pt-BR'));
      break;
    case 'instituicao_asc':
      s.sort((a, b) => a.instituicao.localeCompare(b.instituicao, 'pt-BR'));
      break;
    default:
      break;
  }
  return s;
}
