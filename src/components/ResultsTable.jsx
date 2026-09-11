import React from 'react';
import { fmtMoney, fmtNota } from '../lib/format.js';

function LivresPill({ value }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold"
      style={
        value > 0
          ? { background: 'var(--accent-soft)', color: 'var(--accent)' }
          : { background: 'var(--surface-2)', color: 'var(--ink-muted)' }
      }
    >
      {value}
    </span>
  );
}

function ProgTag({ value }) {
  const none = value === 'Não informado';
  return (
    <span
      className="text-[11px] px-2 py-0.5 rounded-md font-semibold whitespace-nowrap"
      style={none ? { background: 'var(--surface-2)', color: 'var(--ink-muted)' } : { background: 'var(--gold-soft)', color: 'var(--gold)' }}
    >
      {value}
    </span>
  );
}

export default function ResultsTable({ rows, compareSet, onToggleCompare, onOpenDetail }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-card border p-12 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink-muted)' }}>
        <h3 className="mb-1.5" style={{ color: 'var(--ink)' }}>
          Nenhuma instituição encontrada
        </h3>
        <p>Tente ajustar ou limpar os filtros aplicados.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden md:block rounded-card border overflow-x-auto" style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr>
              {['', 'Especialidade', 'Cidade', 'Instituição', 'Vagas totais', 'Militares', 'Vagas livres', 'Valor', 'Nota mínima', 'Pesos das notas finais', 'Programa Governo'].map(
                (h, i) => (
                  <th
                    key={i}
                    className="text-left text-[11px] tracking-wide uppercase px-3 py-2.5 whitespace-nowrap"
                    style={{ color: 'var(--ink-muted)', borderBottom: '1px solid var(--line)' }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="cursor-pointer hover:[background:var(--surface-2)]"
                onClick={() => onOpenDetail(r.id)}
              >
                <td className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--line)' }} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    style={{ accentColor: 'var(--accent)' }}
                    checked={compareSet.has(r.id)}
                    onChange={() => onToggleCompare(r.id)}
                    aria-label="Selecionar para comparar"
                  />
                </td>
                <td className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--line)' }}>{r.especialidade}</td>
                <td className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--line)' }}>{r.cidade}</td>
                <td className="px-3 py-2.5 font-semibold" style={{ borderBottom: '1px solid var(--line)' }}>{r.instituicao}</td>
                <td className="px-3 py-2.5 tnum" style={{ borderBottom: '1px solid var(--line)' }}>{r.numero_total_vagas}</td>
                <td className="px-3 py-2.5 tnum" style={{ borderBottom: '1px solid var(--line)' }}>{r.numero_vagas_militares}</td>
                <td className="px-3 py-2.5 tnum" style={{ borderBottom: '1px solid var(--line)' }}>
                  <LivresPill value={r.numero_vagas_livres} />
                </td>
                <td className="px-3 py-2.5 tnum" style={{ borderBottom: '1px solid var(--line)' }}>{fmtMoney(r.valor_instituicao, r.valor_instituicao_display)}</td>
                <td className="px-3 py-2.5 tnum" style={{ borderBottom: '1px solid var(--line)' }}>{fmtNota(r.nota_minima, r.nota_minima_display)}</td>
                <td className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--line)', maxWidth: 220 }}>{r.pesos_notas_finais}</td>
                <td className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--line)' }}>
                  <ProgTag value={r.programa_governo} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex md:hidden flex-col gap-2.5">
        {rows.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border p-3.5 cursor-pointer"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
            onClick={() => onOpenDetail(r.id)}
          >
            <div className="flex justify-between gap-2.5 items-start">
              <div>
                <div className="font-semibold">{r.instituicao}</div>
                <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                  {r.cidade} · {r.especialidade}
                </div>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 mt-1"
                style={{ accentColor: 'var(--accent)' }}
                checked={compareSet.has(r.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleCompare(r.id);
                }}
                onClick={(e) => e.stopPropagation()}
                aria-label="Selecionar para comparar"
              />
            </div>
            <div className="grid grid-cols-2 gap-x-3.5 gap-y-2 mt-2.5 text-[12.5px]">
              <Info k="Vagas totais" v={r.numero_total_vagas} />
              <Info k="Vagas livres" v={<LivresPill value={r.numero_vagas_livres} />} />
              <Info k="Militares" v={r.numero_vagas_militares} />
              <Info k="Valor" v={fmtMoney(r.valor_instituicao, r.valor_instituicao_display)} />
              <Info k="Nota mínima" v={fmtNota(r.nota_minima, r.nota_minima_display)} />
              <Info k="Programa" v={<ProgTag value={r.programa_governo} />} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Info({ k, v }) {
  return (
    <div>
      <span className="block text-[10.5px] uppercase tracking-wide" style={{ color: 'var(--ink-muted)' }}>
        {k}
      </span>
      {v}
    </div>
  );
}
