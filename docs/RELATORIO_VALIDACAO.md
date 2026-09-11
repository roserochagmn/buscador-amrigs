# Relatório de Validação dos Dados — Anexo VI (Acesso Direto)

Base extraída de: *Anexo VI - Tabelas de Instituições e Especialidades (PRM) — Especialidades com Acesso Direto — Vagas em Primeira Oportunidade* (102 páginas no PDF original; o Anexo VI ocupa as páginas 1–53; as páginas 54–102 são o Anexo VII — Pré-Requisito — e foram **deliberadamente excluídas** desta base).

## 1. Resultado da extração

| Item | Resultado |
|---|---|
| Registros extraídos | **408** |
| Páginas processadas | 1–53 (Anexo VI completo) |
| Registros incompletos/rejeitados | **0** |
| Linhas não classificadas | **0** |
| Duplicatas encontradas | **0** |

A extração foi feita programaticamente (não manualmente), reconstruindo cada linha da tabela a partir da posição x/y de cada palavra no PDF — o documento não usa uma grade de tabela real, então cidade, instituição, números e "pesos das notas finais" foram remontados por coordenada de coluna. O script usado está em `scripts/extract_from_pdf.py` e pode ser reexecutado a qualquer momento para conferência (veja o README).

## 2. Verificações de consistência (todas aprovadas)

1. **Especialidades sem lacunas** — o edital numera as especialidades de 1 a 70 dentro do Anexo VI; todos os 70 números aparecem, sem nenhum faltando.
2. **Nome da especialidade estável por número** — nenhum número de especialidade aparece com dois nomes diferentes (ex.: "48 - Clínica Médica" nunca aparece como outra coisa em outro registro).
3. **Sem mistura com o Anexo VII** — o script para de ler exatamente na página 53; a página 54 (onde começa "Anexo VII - ... Especialidades com Pré-Requisito") foi conferida manualmente e não gerou nenhum registro.
4. **Sem duplicatas** — nenhuma combinação (especialidade do edital + cidade + instituição) se repete.
5. **Vagas livres/militares corretas** — em 100% dos 408 registros, `numero_total_vagas = numero_vagas_militares + numero_vagas_livres`.
6. **Sem números vazados no texto** — nenhum campo de cidade ou instituição contém dígitos (o que indicaria uma coluna numérica mal alinhada durante a extração).
7. **Auditoria por página** — todos os 408 registros têm `pagina_origem_pdf` preenchida, permitindo conferir qualquer linha diretamente contra o PDF original.

Essas mesmas verificações podem ser reexecutadas a qualquer momento com:

```bash
npm run validate-data
```

## 3. Panorama dos dados

- **Estados:** 5 — Rio Grande do Sul (236 registros), Santa Catarina (141), Rondônia (12), Mato Grosso do Sul (10), Rio de Janeiro (9).
- **Especialidades distintas:** 28 (a mesma especialidade se repete em estados/entidades diferentes, por isso 70 blocos numerados geram 28 nomes únicos).
- **Cidades distintas:** 58. **Instituições distintas:** 123.
- **Total de vagas somadas:** 1.668 (1.630 livres + 38 reservadas a militares).
- **Programa Governo:** 238 registros com "PRMGFC"; 170 registros em que o edital não informa programa (marcados como "Não informado", nunca inferidos).
- **Valor da instituição:** presente em 100% dos registros (nenhum "-" encontrado nesta coluna no Anexo VI).
- **Notas mínimas encontradas:** 50, 55, 60, 65 e 70 — todas preservadas exatamente como no edital.

## 4. Pontos de atenção sinalizados durante a extração

Três registros exigiram atenção redobrada porque o nome da cidade e/ou da instituição quebra em duas linhas do PDF, com os números da linha "flutuando" visualmente entre elas (eles foram conferidos manualmente contra o PDF original e estão corretos):

- Página 11 — **Palmeira das Missões** / Escola de Saúde Pública SES/RS (Medicina de Família e Comunidade).
- Página 23 — **São Lourenço do Sul** / Secretaria Municipal de Saúde de São Lourenço do Sul (Psiquiatria).
- Página 35 — **São Pedro de Alcântara** / Hospital Santa Teresa (Dermatologia).

Nenhum outro registro exigiu correção manual.

## 5. O que **não** foi inferido

Conforme solicitado, nenhum dado foi complementado com conhecimento externo. Onde o edital usa "-" (por exemplo, quando não há Programa Governo associado a uma vaga), o campo foi gravado como **"Não informado"**, nunca como um valor presumido.

## 6. Como conferir uma linha específica

Cada registro na base carrega `pagina_origem_pdf` e `especialidade_num_edital`. Para auditar: abra o PDF original na página indicada e localize o bloco "N - Especialidade: ..." correspondente — a linha da instituição estará nesse bloco. O buscador também mostra essa referência ("Fonte: Anexo VI do edital — página X") no detalhe de cada instituição.
