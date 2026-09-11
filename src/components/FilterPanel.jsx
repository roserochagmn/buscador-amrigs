import React from 'react';
import { uniqueSorted } from '../lib/format.js';

const OPS = [
  ['>=', '≥'],
  ['<=', '≤'],
  ['=', '='],
];

function SelectField({ id, label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold" style={{ color: 'var(--ink-muted)' }}>
        {label}
      </label>
      <select id={id} className="field-input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Todas</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumField({ idPrefix, label, op, val, onOp, onVal }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`${idPrefix}_val`} className="text-xs font-semibold" style={{ color: 'var(--ink-muted)' }}>
        {label}
      </label>
      <div className="grid grid-cols-[64px_1fr] gap-1.5">
        <select id={`${idPrefix}_op`} className="field-input" value={op} onChange={(e) => onOp(e.target.value)}>
          {OPS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <input
          id={`${idPrefix}_val`}
          type="number"
          min="0"
          inputMode="decimal"
          placeholder="—"
          className="field-input"
          value={val}
          onChange={(e) => onVal(e.target.value)}
        />
      </div>
    </div>
  );
}

export default function FilterPanel({ data, filters, setFilters, resultCount, onClear }) {
  const set = (key) => (value) => setFilters((f) => ({ ...f, [key]: value }));

  return (
    <section
      className="rounded-card border p-4.5 mb-4"
      style={{ background: 'var(--surface)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)', padding: 18 }}
      aria-label="Filtros"
    >
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        <SelectField id="f_especialidade" label="Especialidade" value={filters.especialidade} onChange={set('especialidade')} options={uniqueSorted(data, 'especialidade')} />
        <SelectField id="f_estado" label="Estado" value={filters.estado} onChange={set('estado')} options={uniqueSorted(data, 'estado_nome')} />
        <SelectField id="f_cidade" label="Cidade" value={filters.cidade} onChange={set('cidade')} options={uniqueSorted(data, 'cidade')} />
        <SelectField id="f_instituicao" label="Instituição" value={filters.instituicao} onChange={set('instituicao')} options={uniqueSorted(data, 'instituicao')} />

        <NumField idPrefix="f_total" label="Nº total de vagas" op={filters.total_op} val={filters.total_val} onOp={set('total_op')} onVal={set('total_val')} />
        <NumField idPrefix="f_mil" label="Nº vagas militares" op={filters.mil_op} val={filters.mil_val} onOp={set('mil_op')} onVal={set('mil_val')} />
        <NumField idPrefix="f_livres" label="Nº vagas livres" op={filters.livres_op} val={filters.livres_val} onOp={set('livres_op')} onVal={set('livres_val')} />
        <NumField idPrefix="f_valor" label="Valor da instituição (R$)" op={filters.valor_op} val={filters.valor_val} onOp={set('valor_op')} onVal={set('valor_val')} />
        <NumField idPrefix="f_nota" label="Nota mínima" op={filters.nota_op} val={filters.nota_val} onOp={set('nota_op')} onVal={set('nota_val')} />

        <SelectField id="f_pesos" label="Pesos das notas finais" value={filters.pesos} onChange={set('pesos')} options={uniqueSorted(data, 'pesos_notas_finais')} />
        <SelectField id="f_programa" label="Programa Governo" value={filters.programa} onChange={set('programa')} options={uniqueSorted(data, 'programa_governo')} />
      </div>

      <div
        className="flex items-center justify-between gap-3 flex-wrap mt-3.5 pt-3.5"
        style={{ borderTop: '1px dashed var(--line)' }}
      >
        <div className="text-[13.5px]" style={{ color: 'var(--ink-muted)' }}>
          <b className="font-display text-base font-semibold" style={{ color: 'var(--ink)' }}>
            {resultCount}
          </b>{' '}
          instituiç{resultCount === 1 ? 'ão' : 'ões'} encontrada{resultCount === 1 ? '' : 's'}
        </div>
        <button type="button" onClick={onClear} className="btn-ghost">
          Limpar filtros
        </button>
      </div>

      <style>{`
        .field-input { width:100%; border:1px solid var(--line); background:var(--surface); color:var(--ink); border-radius:9px; padding:9px 10px; font-size:13.5px; }
        .btn-ghost { background:transparent; border:1px solid var(--line); color:var(--ink); border-radius:9px; padding:9px 14px; font-size:13px; font-weight:600; cursor:pointer; }
        .btn-ghost:hover { border-color:var(--accent); color:var(--accent); }
      `}</style>
    </section>
  );
}
