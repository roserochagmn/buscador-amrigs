import React, { useState } from 'react';
import { saveLead } from '../lib/leads.js';
import { trackEvent } from '../lib/analytics.js';
import BrandLogos from './BrandLogos.jsx';

export default function LeadGate({ stats, onUnlock }) {
  const [form, setForm] = useState({ nome: '', email: '', whatsapp: '', consentimento: false });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim() || !form.whatsapp.trim() || !form.consentimento) {
      setError('Preencha todos os campos e aceite receber comunicações para continuar.');
      return;
    }
    setError('');
    setSubmitting(true);
    await saveLead(form);
    trackEvent('form_submit', { form: 'lead_gate' });
    setSubmitting(false);
    onUnlock();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-8"
      style={{
        background:
          'radial-gradient(700px 420px at 12% -8%, var(--accent-soft), transparent 60%), radial-gradient(600px 380px at 108% 8%, var(--gold-soft), transparent 55%), var(--bg)',
      }}
    >
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-[1.1fr_1fr] rounded-[20px] overflow-hidden border"
           style={{ background: 'var(--surface)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}>
        <div className="p-8 md:p-11 flex flex-col gap-4">
          <BrandLogos />
          <span
            className="inline-flex items-center gap-2 font-mono text-[11.5px] tracking-widest uppercase font-semibold"
            style={{ color: 'var(--accent)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--accent)' }} />
            ResidenteOn · Anexo VI do Edital
          </span>
          <h1 className="text-[26px] md:text-[34px] font-semibold leading-tight">
            Encontre as vagas de Residência Médica AMRIGS 2027 - acesso direto
          </h1>
          <p className="max-w-[46ch]" style={{ color: 'var(--ink-muted)' }}>
            Consulte instituições, cidades, número de vagas, valores, notas mínimas, pesos das etapas e programas
            governamentais em poucos segundos.
          </p>
          <div className="flex gap-6 flex-wrap mt-2 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
            <Stat value={stats.total} label="instituições" />
            <Stat value={stats.especialidades} label="especialidades" />
            <Stat value={stats.estados} label="estados" />
          </div>
          <p className="mt-auto text-xs pt-4" style={{ color: 'var(--ink-muted)' }}>
            Fonte: Anexo VI AMRIGS — Tabelas de Instituições e Especialidades (PRM), Especialidades com Acesso
            Direto, Vagas em Primeira Oportunidade
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 md:p-9 flex flex-col gap-3.5 border-t md:border-t-0 md:border-l"
          style={{ background: 'var(--surface-2)', borderColor: 'var(--line)' }}
        >
          <h2 className="text-lg font-semibold mb-0.5">Acesse gratuitamente</h2>

          <Field label="Nome" htmlFor="leadName">
            <input
              id="leadName"
              type="text"
              autoComplete="name"
              value={form.nome}
              onChange={(e) => update('nome', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="E-mail" htmlFor="leadEmail">
            <input
              id="leadEmail"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="WhatsApp" htmlFor="leadWhats">
            <input
              id="leadWhats"
              type="tel"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              value={form.whatsapp}
              onChange={(e) => update('whatsapp', e.target.value)}
              className="input"
            />
          </Field>

          <label className="flex gap-2.5 items-start text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
            <input
              type="checkbox"
              className="mt-0.5"
              checked={form.consentimento}
              onChange={(e) => update('consentimento', e.target.checked)}
            />
            <span>Aceito receber comunicações da ResidenteOn relacionadas à Residência Médica.</span>
          </label>

          <div className="text-xs min-h-[1em]" style={{ color: 'var(--danger)' }} role="alert">
            {error}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary">
            ACESSAR BUSCADOR GRATUITAMENTE
          </button>
          <p className="text-[11.5px]" style={{ color: 'var(--ink-muted)' }}>
            Não pedimos senha. Seus dados ficam salvos apenas neste navegador nesta demonstração.
          </p>
        </form>
      </div>

      <style>{`
        .input { border:1px solid var(--line); background:var(--surface); color:var(--ink); border-radius:10px; padding:11px 12px; font-size:14.5px; width:100%; }
        .input:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
        .btn-primary { background:var(--accent); color:var(--accent-ink); border:none; border-radius:10px; padding:13px 18px; font-size:14.5px; font-weight:700; cursor:pointer; box-shadow:var(--shadow); }
        .btn-primary:disabled { opacity:.55; cursor:not-allowed; }
      `}</style>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <b className="block font-display text-[22px] font-semibold">{value}</b>
      <span className="block text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
        {label}
      </span>
    </div>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-semibold" style={{ color: 'var(--ink-muted)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
