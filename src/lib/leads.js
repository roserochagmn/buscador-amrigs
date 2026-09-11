// ---------------------------------------------------------------------------
// Armazenamento de leads.
//
// Cada lead é enviado para a planilha "Leads Buscador AMRIGS" da ResidenteOn
// no Google Sheets, via um Apps Script Web App (LEADS_ENDPOINT abaixo), e
// também fica guardado no localStorage do navegador como cópia local/estado
// de desbloqueio. Para trocar de planilha, gere um novo link de implantação
// no Apps Script e substitua LEADS_ENDPOINT. Veja "Arquitetura de Leads" no
// README para outras opções (Supabase, Firebase, webhook de CRM).
//
// Importante: nenhuma chave de API ou segredo é usado aqui — o endpoint do
// Apps Script só aceita a gravação que o próprio script (do lado do Google)
// define, então não há nada sensível para expor no navegador da pessoa.
// ---------------------------------------------------------------------------

const UNLOCK_KEY = 'residenteon_lead_unlocked';
const LEADS_KEY = 'residenteon_leads';
const LEADS_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbyDXfevdzGqBM_lqfRN9599NmIqnRfDmeeYWunh2clOdUUtfsaZLMmnp-FWW23Cc8iCdg/exec';

export function isUnlocked() {
  try {
    return localStorage.getItem(UNLOCK_KEY) === '1';
  } catch {
    return false;
  }
}

export async function saveLead(lead) {
  const record = { ...lead, criado_em: new Date().toISOString() };

  try {
    // mode: 'no-cors' porque o Apps Script não devolve cabeçalhos CORS —
    // o envio funciona normalmente, só não conseguimos ler a resposta.
    fetch(LEADS_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(record),
    }).catch((e) => console.warn('[leads] falha ao enviar para a planilha', e));
  } catch {
    // sem fetch disponível — segue sem bloquear o desbloqueio
  }

  try {
    const existing = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
    existing.push(record);
    localStorage.setItem(LEADS_KEY, JSON.stringify(existing));
    localStorage.setItem(UNLOCK_KEY, '1');
  } catch {
    // localStorage indisponível (modo privado, etc.) — segue sem persistir
  }

  return record;
}
