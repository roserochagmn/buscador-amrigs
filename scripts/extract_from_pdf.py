#!/usr/bin/env python3
"""
Extrai a base de dados do Anexo VI (Especialidades com Acesso Direto) a
partir do PDF oficial do edital, e gera data/vagas.json e data/vagas.csv.

Uso:
    pip install pdfplumber
    python3 scripts/extract_from_pdf.py caminho/para/o/edital.pdf --last-page 53

O PDF fornecido nesta primeira extração tem 102 páginas: as 53 primeiras são
o Anexo VI (Acesso Direto) e as demais são o Anexo VII (Pré-Requisito), que
NUNCA deve ser misturado nesta base. Se você receber um PDF diferente
(edital de outro processo seletivo), confira qual página encerra o Anexo VI
antes de rodar o script — ele imprime avisos quando encontra o cabeçalho do
Anexo VII antes do fim do intervalo processado.

Como funciona a extração
-------------------------
O PDF não usa uma tabela real (grade), então o texto é reconstruído a partir
da posição (x, y) de cada palavra na página, usando faixas de coordenadas X
calibradas nas colunas do Anexo VI:
    cidade < 118 < instituição < 335 < total vagas < 386 < militares <
    447 < livres < 503 < valor < 564 < nota mínima < 620 < pesos < 730 < programa

Cada registro (uma linha de instituição) é delimitado pelo início de um novo
bloco de "Pesos das Notas Finais" (que sempre começa com "Primeira Etapa" ou
"Etapa Única") ou pelo início de uma nova cidade quando o registro anterior
já está completo. Nomes de cidade/instituição que quebram em duas linhas do
PDF (às vezes com o número de vagas "flutuando" entre as duas linhas) são
recombinados automaticamente.

Qualquer linha que não se encaixe em nenhuma dessas regras é reportada como
"linha nao classificada", e qualquer registro sem cidade, instituição ou
número total de vagas é reportado como "registro incompleto" — ambos são
impressos no final da execução para conferência manual. Uma extração limpa
não deve ter nenhum dos dois.
"""
import argparse
import csv
import json
import re
import sys
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    sys.exit("Este script depende do pdfplumber. Instale com: pip install pdfplumber")

STATE_RE = re.compile(r'^INSTITUI[ÇC][ÕO]ES\s+D[EO]S?\s+(.*?)\s*-\s*([A-Z]{2})\s*\((.*)\)\s*$')
ESP_RE = re.compile(r'^(\d+)\s*-\s*Especialidade:\s*(.+)$')

ESTADO_NOMES = {
    'RS': 'Rio Grande do Sul',
    'SC': 'Santa Catarina',
    'MS': 'Mato Grosso do Sul',
    'RO': 'Rondônia',
    'RJ': 'Rio de Janeiro',
}


def col_of(x0):
    if x0 < 118:
        return 'cidade'
    if x0 < 335:
        return 'instituicao'
    if x0 < 386:
        return 'total'
    if x0 < 447:
        return 'militares'
    if x0 < 503:
        return 'livres'
    if x0 < 564:
        return 'valor'
    if x0 < 620:
        return 'nota'
    if x0 < 730:
        return 'pesos'
    return 'programa'


def group_lines(words, tolerance=2.5):
    words = sorted(words, key=lambda w: (round(w['top'], 1), w['x0']))
    lines, cur_top, cur = [], None, []
    for w in words:
        t = w['top']
        if cur_top is None or abs(t - cur_top) <= tolerance:
            cur.append(w)
            cur_top = cur_top if cur_top is not None else t
        else:
            lines.append(cur)
            cur, cur_top = [w], t
    if cur:
        lines.append(cur)
    return lines


def extract_raw_records(pdf_path, last_page):
    records, issues = [], []
    cur_state = cur_uf = cur_entidade = cur_esp_num = cur_esp = None

    def new_rec(page_start):
        return {
            'city': [], 'inst': [], 'pesos': [], 'total': None, 'militares': None,
            'livres': None, 'valor': None, 'nota': None, 'programa': None,
            'page_start': page_start,
        }

    def flush(rec, page):
        if rec is None:
            return
        city = ' '.join(rec['city']).strip()
        inst = ' '.join(rec['inst']).strip()
        pesos = re.sub(r'\s+', ' ', ' '.join(rec['pesos'])).strip() or '-'
        if not city or not inst or rec.get('total') is None:
            issues.append({'page': page, 'issue': 'registro incompleto',
                            'partial': {'city': city, 'inst': inst, 'total': rec.get('total')}})
            return
        records.append({
            'especialidade': cur_esp, 'especialidade_num': cur_esp_num,
            'estado_nome': cur_state, 'estado': cur_uf, 'entidade': cur_entidade,
            'cidade': city, 'instituicao': inst,
            'numero_total_vagas': rec.get('total'), 'numero_vagas_militares': rec.get('militares'),
            'numero_vagas_livres': rec.get('livres'), 'valor_instituicao': rec.get('valor'),
            'nota_minima': rec.get('nota'), 'pesos_notas_finais': pesos,
            'programa_governo': rec.get('programa') if rec.get('programa') else '-',
            'pagina_origem_pdf': rec.get('page_start'),
        })

    with pdfplumber.open(pdf_path) as pdf:
        for pi in range(min(last_page, len(pdf.pages))):
            pageno = pi + 1
            text_preview = pdf.pages[pi].extract_text() or ''
            if 'Anexo VII' in text_preview:
                print(f"[aviso] cabeçalho 'Anexo VII' encontrado na página {pageno} — "
                      f"confira se --last-page não deveria ser menor.", file=sys.stderr)

            lines = group_lines(pdf.pages[pi].extract_words())
            cur_rec = None

            for line in lines:
                line.sort(key=lambda w: w['x0'])
                text = ' '.join(w['text'] for w in line)

                if text.startswith('Anexo VI') or text.startswith('ESPECIALIDADES COM ACESSO DIRETO'):
                    continue
                if not text.strip():
                    continue
                if text.startswith('Nº de vagas') or text.startswith('Nº total de') or \
                        text.startswith('Cidade Instituição') or 'militares livres' in text or \
                        re.match(r'^vagas\s', text):
                    continue

                m = STATE_RE.match(text)
                if m:
                    flush(cur_rec, cur_rec['page_start'] if cur_rec else pageno)
                    cur_rec = None
                    cur_state, cur_uf, cur_entidade = m.group(1).strip(), m.group(2).strip(), m.group(3).strip()
                    continue
                m = ESP_RE.match(text)
                if m:
                    flush(cur_rec, cur_rec['page_start'] if cur_rec else pageno)
                    cur_rec = None
                    cur_esp_num, cur_esp = int(m.group(1)), m.group(2).strip()
                    continue

                by_col = {}
                for w in line:
                    by_col.setdefault(col_of(w['x0']), []).append(w['text'])

                pesos_text = ' '.join(by_col.get('pesos', []))
                has_city = 'cidade' in by_col
                has_numbers = 'total' in by_col
                pesos_starts_new = pesos_text.strip().startswith('Primeira Etapa') or \
                    pesos_text.strip().startswith('Etapa Única')

                if pesos_starts_new and not has_city and not has_numbers:
                    # pesos-only line that opens a new record's "Pesos das Notas
                    # Finais" block (this happens before we've seen the city on
                    # the next line, or right after the previous specialty/state
                    # header with no record started yet)
                    flush(cur_rec, cur_rec['page_start'] if cur_rec else pageno)
                    cur_rec = new_rec(pageno)
                    cur_rec['pesos'].append(pesos_text)
                    continue

                if has_city or has_numbers:
                    should_start_new = cur_rec is None or (
                        has_city and cur_rec.get('total') is not None and
                        (pesos_starts_new or not pesos_text.strip())
                    )
                    if should_start_new:
                        flush(cur_rec, cur_rec['page_start'] if cur_rec else pageno)
                        cur_rec = new_rec(pageno)
                    if has_city:
                        cur_rec['city'].append(' '.join(by_col['cidade']))
                    if 'instituicao' in by_col:
                        cur_rec['inst'].append(' '.join(by_col['instituicao']))
                    if has_numbers:
                        def num(colname):
                            v = by_col.get(colname)
                            return v[0] if v else None
                        cur_rec['total'] = num('total')
                        cur_rec['militares'] = num('militares')
                        cur_rec['livres'] = num('livres')
                        cur_rec['valor'] = num('valor')
                        cur_rec['nota'] = num('nota')
                        if 'programa' in by_col:
                            cur_rec['programa'] = ' '.join(by_col['programa'])
                    if pesos_text:
                        cur_rec['pesos'].append(pesos_text)
                    continue

                if 'instituicao' in by_col and cur_rec is not None:
                    cur_rec['inst'].append(' '.join(by_col['instituicao']))
                    continue
                if pesos_text and cur_rec is not None:
                    cur_rec['pesos'].append(pesos_text)
                    continue

                issues.append({'page': pageno, 'issue': 'linha nao classificada', 'text': text})

            if cur_rec is not None:
                flush(cur_rec, cur_rec['page_start'])

    return records, issues


def clean_txt(s):
    return re.sub(r'\s+', ' ', s).strip()


def parse_valor(v):
    v = v.strip()
    if v in ('-', '', 'Não informado'):
        return None
    try:
        return float(v.replace('.', '').replace(',', '.'))
    except ValueError:
        return None


def parse_nota(v):
    v = v.strip()
    if v in ('-', '', 'Não informado'):
        return None
    try:
        return float(v)
    except ValueError:
        return None


def build_final(records):
    out = []
    for i, r in enumerate(records, start=1):
        valor = parse_valor(r['valor_instituicao'])
        nota = parse_nota(r['nota_minima'])
        prog = r['programa_governo'].strip()
        if prog in ('-', ''):
            prog = 'Não informado'
        out.append({
            'id': i,
            'especialidade': clean_txt(r['especialidade']),
            'especialidade_num_edital': r['especialidade_num'],
            'estado': r['estado'],
            'estado_nome': ESTADO_NOMES.get(r['estado'], clean_txt(r['estado_nome']).title()),
            'entidade': clean_txt(r['entidade']),
            'cidade': clean_txt(r['cidade']),
            'instituicao': clean_txt(r['instituicao']),
            'numero_total_vagas': int(r['numero_total_vagas']),
            'numero_vagas_militares': int(r['numero_vagas_militares']),
            'numero_vagas_livres': int(r['numero_vagas_livres']),
            'valor_instituicao': valor,
            'valor_instituicao_display': r['valor_instituicao'] if r['valor_instituicao'] not in ('-', '') else 'Não informado',
            'nota_minima': nota,
            'nota_minima_display': r['nota_minima'] if r['nota_minima'] not in ('-', '') else 'Não informado',
            'pesos_notas_finais': clean_txt(r['pesos_notas_finais']),
            'programa_governo': prog,
            'pagina_origem_pdf': r['pagina_origem_pdf'],
        })
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('pdf', help='Caminho para o PDF do Anexo VI (ou edital completo com Anexo VI no início)')
    ap.add_argument('--last-page', type=int, default=53,
                     help='Última página (1-indexada, inclusiva) que ainda pertence ao Anexo VI (padrão: 53)')
    ap.add_argument('--out-dir', default=str(Path(__file__).resolve().parent.parent / 'data'),
                     help='Diretório de saída para vagas.json / vagas.csv (padrão: ./data)')
    args = ap.parse_args()

    raw_records, issues = extract_raw_records(args.pdf, args.last_page)
    final_records = build_final(raw_records)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    with open(out_dir / 'vagas.json', 'w', encoding='utf-8') as f:
        json.dump(final_records, f, ensure_ascii=False, indent=2)

    if final_records:
        cols = list(final_records[0].keys())
        with open(out_dir / 'vagas.csv', 'w', encoding='utf-8', newline='') as f:
            w = csv.DictWriter(f, fieldnames=cols)
            w.writeheader()
            w.writerows(final_records)

    with open(out_dir / 'vagas_raw_extraido.json', 'w', encoding='utf-8') as f:
        json.dump(raw_records, f, ensure_ascii=False, indent=2)

    print(f"Registros extraídos: {len(final_records)}")
    print(f"Linhas/registros com problema: {len(issues)}")
    if issues:
        print("\nATENÇÃO — revise antes de publicar:")
        for it in issues:
            print(" ", it)
    print(f"\nArquivos gerados em {out_dir}/: vagas.json, vagas.csv, vagas_raw_extraido.json")


if __name__ == '__main__':
    main()
