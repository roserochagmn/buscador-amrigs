#!/usr/bin/env node
/**
 * Validação de consistência de data/vagas.json.
 * Rode com: npm run validate-data
 *
 * Não valida a extração do PDF em si (isso é feito manualmente conferindo
 * scripts/extract_from_pdf.py contra o edital) — valida que o arquivo final
 * é internamente consistente: sem duplicatas, sem lacunas na numeração de
 * especialidades do edital, somas de vagas batendo, e nenhum valor fora do
 * formato esperado.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'data', 'vagas.json');
const vagas = JSON.parse(readFileSync(dataPath, 'utf-8'));

let errors = 0;
function check(label, ok, detail) {
  if (ok) {
    console.log(`OK   ${label}`);
  } else {
    errors++;
    console.log(`FAIL ${label}${detail ? ' — ' + detail : ''}`);
  }
}

check('arquivo carregado', Array.isArray(vagas) && vagas.length > 0, `${vagas.length} registros`);

// 1. numero_total_vagas = militares + livres
const badSum = vagas.filter((v) => v.numero_total_vagas !== v.numero_vagas_militares + v.numero_vagas_livres);
check('total = militares + livres em todos os registros', badSum.length === 0, `${badSum.length} inconsistentes`);

// 2. duplicatas (mesma especialidade + cidade + instituição)
const seen = new Map();
for (const v of vagas) {
  const key = `${v.especialidade_num_edital}|${v.cidade}|${v.instituicao}`;
  seen.set(key, (seen.get(key) || 0) + 1);
}
const dups = [...seen.entries()].filter(([, n]) => n > 1);
check('sem registros duplicados', dups.length === 0, `${dups.length} chaves duplicadas`);

// 3. numeração de especialidades do edital sem lacunas
const nums = [...new Set(vagas.map((v) => v.especialidade_num_edital))].sort((a, b) => a - b);
const missing = [];
for (let n = nums[0]; n <= nums[nums.length - 1]; n++) if (!nums.includes(n)) missing.push(n);
check('numeração de especialidades sem lacunas', missing.length === 0, `faltando: ${missing.join(', ')}`);

// 4. cada número de especialidade tem sempre o mesmo nome
const namesByNum = new Map();
for (const v of vagas) {
  const set = namesByNum.get(v.especialidade_num_edital) || new Set();
  set.add(v.especialidade);
  namesByNum.set(v.especialidade_num_edital, set);
}
const inconsistentNames = [...namesByNum.entries()].filter(([, set]) => set.size > 1);
check('nome da especialidade consistente por número do edital', inconsistentNames.length === 0);

// 5. campos obrigatórios não vazios
const missingFields = vagas.filter((v) => !v.cidade || !v.instituicao || !v.especialidade || !v.estado);
check('cidade/instituição/especialidade/estado presentes em todos os registros', missingFields.length === 0);

// 6. nenhum texto de cidade/instituição contém dígitos "vazados" de outra coluna
const leaked = vagas.filter((v) => /\d/.test(v.cidade) || /\d/.test(v.instituicao));
check('sem números vazados em cidade/instituição', leaked.length === 0, `${leaked.length} registros suspeitos`);

// 7. página de origem sempre presente (auditoria)
const noPage = vagas.filter((v) => !v.pagina_origem_pdf);
check('página de origem preenchida em todos os registros', noPage.length === 0);

console.log('');
if (errors === 0) {
  console.log(`Validação concluída sem problemas (${vagas.length} registros).`);
  process.exit(0);
} else {
  console.log(`Validação encontrou ${errors} problema(s). Veja detalhes acima.`);
  process.exit(1);
}
