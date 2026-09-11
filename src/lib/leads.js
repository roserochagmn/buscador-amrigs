// ---------------------------------------------------------------------------
// Armazenamento de leads.
//
// Hoje o lead é gravado apenas no localStorage do navegador (não sai da
// máquina da pessoa). Quando for conectar um armazenamento real, troque o
// corpo de saveLead() por uma chamada para o backend escolhido — Google
// Sheets (via Apps Script Web App), Supabase, Firebase ou um webhook de CRM.
// Veja "Arquitetura de Leads" no README para o desenho recomendado.
//
// Importante: nenhuma chave de API ou segredo deve ser colocado neste
// arquivo (ele roda no navegador da pessoa). Uma chamada a um serviço que
// exija chave secreta deve passar por uma função server-side (Vercel/Netlify
// Function, Cloudflare Worker, Apps Script, etc.), nunca diretamente daqui.
// ---------------------------------------------------------------------------

const UNLOCK_KEY = 'residenteon_lead_unlocked';
const LEADS_KEY = 'residenteon_leads';

export function isUnlocked() {
  try {
    return localStorage.getItem(UNLOCK_KEY) === '1';
  } catch {
    return false;
  }
}

export async function saveLead(lead) {
  const record = { ...lead, criado_em: new Date().toISOString() };

  // --- Exemplo de integração real (deixe comentado até configurar) --------
  // await fetch(import.meta.env.VITE_LEADS_ENDPOINT, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(record),
  // });
  // --------------------------------------------------------------------------

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
