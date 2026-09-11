import React, { useEffect } from 'react';
import { fmtMoney, fmtNota } from '../lib/format.js';

const FIELDS = [
  ['Especialidade', (r) => r.especialidade],
  ['Cidade', (r) => r.cidade],
  ['Instituição', (r) => r.instituicao],
  ['Vagas totais', (r) => r.numero_total_vagas],
  ['Vagas militares', (r) => r.numero_vagas_militares],
  ['Vagas livres', (r) => r.numero_vagas_livres],
  ['Valor', (r) => fmtMoney(r.valor_instituicao, r.valor_instituicao_display)],
  ['Nota mínima', (r) => fmtNota(r.nota_minima, r.nota_minima_display)],
  ['Pesos das notas finais', (r) => r.pesos_notas_finais],
  ['Programa Governo', (r) => r.programa_governo],
];

export default function CompareModal({ items, onRemove, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (items.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ background: 'rgba(10,16,14,.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cmpTitle"
        className="w-full max-w-3xl max-h-[88vh] overflow-auto rounded-t-2xl md:rounded-2xl border"
        style={{ background: 'var(--surface)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}
      >
        <div
          className="flex justify-between items-start gap-3 sticky top-0"
          style={{ borderBottom: '1px solid var(--line)', background: 'var(--surface)', padding: '20px 22px' }}
        >
          <div>
            <h3 id="cmpTitle" className="text-[19px] font-semibold">
              Comparar vagas
            </h3>
            <div className="text-[13px] mt-1" style={{ color: 'var(--ink-muted)' }}>
              {items.length} instituições selecionadas
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg border text-[15px]"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '20px 22px' }}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 520 }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '1px solid var(--line)' }}></th>
                  {items.map((r) => (
                    <td
                      key={r.id}
                      className="font-display font-bold px-3 py-2.5"
                      style={{ borderBottom: '1px solid var(--line)' }}
                    >
                      #{r.id}
                      <div>
                        <button
                          onClick={() => onRemove(r.id)}
                          className="text-xs font-semibold mt-1.5"
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        >
                          remover
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FIELDS.map(([label, fn]) => (
                  <tr key={label}>
                    <th
                      className="text-left text-[11px] uppercase tracking-wide px-3 py-2.5 whitespace-nowrap"
                      style={{ color: 'var(--ink-muted)', borderBottom: '1px solid var(--line)' }}
                    >
                      {label}
                    </th>
                    {items.map((r) => (
                      <td key={r.id} className="px-3 py-2.5 text-[13px]" style={{ borderBottom: '1px solid var(--line)' }}>
                        {fn(r)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
