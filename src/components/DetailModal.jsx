import React, { useEffect } from 'react';
import { fmtMoney, fmtNota } from '../lib/format.js';

export default function DetailModal({ record, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!record) return null;
  const r = record;

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
        aria-labelledby="detailTitle"
        className="w-full max-w-xl max-h-[88vh] overflow-auto rounded-t-2xl md:rounded-2xl border"
        style={{ background: 'var(--surface)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}
      >
        <div
          className="flex justify-between items-start gap-3 px-5.5 py-5 sticky top-0"
          style={{ borderBottom: '1px solid var(--line)', background: 'var(--surface)', padding: '20px 22px' }}
        >
          <div>
            <h3 id="detailTitle" className="text-[19px] font-semibold">
              {r.instituicao}
            </h3>
            <div className="text-[13px] mt-1" style={{ color: 'var(--ink-muted)' }}>
              {r.cidade} — {r.estado_nome} · {r.especialidade}
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

        <div className="px-5.5 py-5 flex flex-col gap-4" style={{ padding: '20px 22px' }}>
          <div className="grid grid-cols-2 gap-3.5">
            <Item k="Entidade organizadora" v={r.entidade} />
            <Item k="Programa Governo" v={r.programa_governo} />
            <Item k="Vagas totais" v={r.numero_total_vagas} />
            <Item k="Vagas militares" v={r.numero_vagas_militares} />
            <Item k="Vagas livres" v={r.numero_vagas_livres} />
            <Item k="Valor da instituição" v={fmtMoney(r.valor_instituicao, r.valor_instituicao_display)} />
            <Item k="Nota mínima" v={fmtNota(r.nota_minima, r.nota_minima_display)} />
            <Item k="Pesos das notas finais" v={r.pesos_notas_finais} full />
          </div>
          <div className="text-[12.5px] pt-3.5" style={{ color: 'var(--ink-muted)', borderTop: '1px dashed var(--line)' }}>
            Fonte: Anexo VI do edital — página {r.pagina_origem_pdf}. Especialidade nº {r.especialidade_num_edital} no
            edital.
          </div>
        </div>
      </div>
    </div>
  );
}

function Item({ k, v, full }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <span className="block text-[11px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--ink-muted)' }}>
        {k}
      </span>
      <span className={full ? 'text-[15px] font-medium' : 'text-[15px] font-semibold'}>{v}</span>
    </div>
  );
}
