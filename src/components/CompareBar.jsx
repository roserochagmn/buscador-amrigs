import React from 'react';

export default function CompareBar({ count, onClear, onOpen }) {
  if (count === 0) return null;
  return (
    <div
      className="sticky bottom-4 mt-4.5 flex items-center justify-between gap-3 flex-wrap rounded-2xl px-4.5 py-3"
      style={{ background: 'var(--ink)', color: 'var(--bg)', boxShadow: 'var(--shadow)', marginTop: 18 }}
    >
      <span>
        {count} selecionada{count === 1 ? '' : 's'} para comparar
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg px-3.5 py-2 text-[13px] font-bold border"
          style={{ background: 'transparent', color: 'inherit', borderColor: 'currentColor', opacity: 0.85 }}
        >
          Limpar seleção
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="rounded-lg px-3.5 py-2 text-[13px] font-bold border-0"
          style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
        >
          Comparar vagas
        </button>
      </div>
    </div>
  );
}
