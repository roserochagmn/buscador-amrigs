// ---------------------------------------------------------------------------
// Camada mínima de analytics.
//
// trackEvent() empurra o evento para window.dataLayer (padrão do Google Tag
// Manager / GA4) e também loga no console em desenvolvimento. Para ativar o
// Google Analytics ou o GTM de verdade, basta colar o snippet de carregamento
// deles em index.html (veja o comentário lá) — nenhum código aqui precisa
// mudar, porque o dataLayer já está sendo alimentado.
//
// Eventos disparados pela aplicação:
//   - page_view          quando o app carrega
//   - form_submit        quando o formulário de leads é enviado
//   - tool_access        quando o buscador é liberado após o formulário
//   - filter_applied     a cada alteração de filtro (com debounce)
//   - institution_click  ao abrir o detalhe de uma instituição
//   - comparison_view    ao abrir a tela de comparação
// ---------------------------------------------------------------------------

export function trackEvent(name, payload = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });
  if (import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.log('[analytics]', name, payload);
  }
}
