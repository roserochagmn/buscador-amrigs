import React, { useMemo, useState } from 'react';
import FilterPanel from '../components/FilterPanel.jsx';
import BrandLogos from '../components/BrandLogos.jsx';
import ResultsTable from '../components/ResultsTable.jsx';
import DetailModal from '../components/DetailModal.jsx';
import CompareBar from '../components/CompareBar.jsx';
import CompareModal from '../components/CompareModal.jsx';
import { DEFAULT_FILTERS, applyFilters, sortRows } from '../lib/filters.js';
import { trackEvent } from '../lib/analytics.js';
import vagas from '../../data/vagas.json';

const SORT_OPTIONS = [
  ['vagas_desc', 'Maior número de vagas'],
  ['livres_desc', 'Maior número de vagas livres'],
  ['valor_asc', 'Menor valor'],
  ['nota_asc', 'Menor nota mínima'],
  ['cidade_asc', 'Cidade (A–Z)'],
  ['instituicao_asc', 'Instituição (A–Z)'],
];

export default function Buscador() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState('vagas_desc');
  const [compareSet, setCompareSet] = useState(new Set());
  const [detailId, setDetailId] = useState(null);
  const [showCompare, setShowCompare] = useState(false);

  const filtered = useMemo(() => {
    const rows = sortRows(applyFilters(vagas, filters), sort);
    return rows;
  }, [filters, sort]);

  function toggleCompare(id) {
    setCompareSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openDetail(id) {
    trackEvent('institution_click', { id });
    setDetailId(id);
  }

  function openCompare() {
    trackEvent('comparison_view', { count: compareSet.size });
    setShowCompare(true);
  }

  const detailRecord = vagas.find((v) => v.id === detailId) || null;
  const compareItems = vagas.filter((v) => compareSet.has(v.id));

  return (
    <div className="max-w-[1280px] mx-auto px-5 pt-5.5 pb-16" style={{ paddingTop: 22, paddingBottom: 64 }}>
      <header
        className="flex items-center justify-between gap-4 pb-4.5 mb-4.5"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        <div>
          <div className="mb-2.5">
            <BrandLogos size="compact" />
          </div>
          <h1 className="text-[22px] font-semibold">Buscador de Vagas de Residência Médica - AMRIGS 2027</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--ink-muted)' }}>
            Anexo VI - Tabelas de Instituições e Especialidades (PRM) - Especialidades com Acesso Direto - Vagas em
            Primeira Oportunidade
          </p>
        </div>
        <span
          className="font-mono text-[11px] tracking-wide uppercase font-semibold px-2.5 py-1.5 rounded-full whitespace-nowrap"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
        >
          {vagas.length} registros
        </span>
      </header>

      <FilterPanel
        data={vagas}
        filters={filters}
        setFilters={(updater) => {
          setFilters(updater);
          trackEvent('filter_applied', {});
        }}
        resultCount={filtered.length}
        onClear={() => setFilters(DEFAULT_FILTERS)}
      />

      <div className="flex items-center justify-between gap-3 flex-wrap mb-2.5">
        <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--ink-muted)' }}>
          <label htmlFor="sortSelect">Ordenar por</label>
          <select
            id="sortSelect"
            className="field-input"
            style={{ width: 'auto' }}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <main id="mainResults">
        <ResultsTable rows={filtered} compareSet={compareSet} onToggleCompare={toggleCompare} onOpenDetail={openDetail} />
      </main>

      <CompareBar
        count={compareSet.size}
        onClear={() => setCompareSet(new Set())}
        onOpen={openCompare}
      />

      {detailRecord && <DetailModal record={detailRecord} onClose={() => setDetailId(null)} />}
      {showCompare && (
        <CompareModal
          items={compareItems}
          onRemove={(id) => {
            setCompareSet((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          }}
          onClose={() => setShowCompare(false)}
        />
      )}

      <style>{`.field-input { border:1px solid var(--line); background:var(--surface); color:var(--ink); border-radius:9px; padding:9px 10px; font-size:13.5px; }`}</style>
    </div>
  );
}
