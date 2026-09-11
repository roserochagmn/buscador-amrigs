import React from 'react';

/**
 * Lockup dos dois logotipos (ResidenteOn + AMRIGS) usado tanto na página de
 * captura quanto no cabeçalho do buscador. Os arquivos ficam em public/ —
 * troque residenteon-logo.png / amrigs-logo.png lá se a arte mudar.
 */
export default function BrandLogos({ size = 'default' }) {
  const heights =
    size === 'compact'
      ? { residenteon: 22, amrigs: 26, divider: 20 }
      : { residenteon: 28, amrigs: 32, divider: 26 };

  return (
    <div className="flex items-center gap-3.5 flex-wrap">
      {/* Logo ResidenteOn tem versão para fundo claro e para fundo escuro;
          a troca é automática conforme o tema (claro/escuro) do navegador,
          para nunca ficar ilegível em nenhum dos dois. */}
      <img
        src="/residenteon-logo.png"
        alt="ResidenteOn"
        className="logo-residenteon-light"
        style={{ height: heights.residenteon, width: 'auto', display: 'block' }}
      />
      <img
        src="/residenteon-logo-dark.png"
        alt="ResidenteOn"
        className="logo-residenteon-dark"
        style={{ height: heights.residenteon, width: 'auto', display: 'none' }}
      />
      <span style={{ width: 1, height: heights.divider, background: 'var(--line)' }} aria-hidden="true" />
      <img
        src="/amrigs-logo.png"
        alt="AMRIGS — Associação Médica do Rio Grande do Sul"
        style={{ height: heights.amrigs, width: 'auto', display: 'block' }}
      />
      <style>{`
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .logo-residenteon-light { display: none !important; }
          :root:not([data-theme="light"]) .logo-residenteon-dark { display: block !important; }
        }
        :root[data-theme="dark"] .logo-residenteon-light { display: none !important; }
        :root[data-theme="dark"] .logo-residenteon-dark { display: block !important; }
      `}</style>
    </div>
  );
}
