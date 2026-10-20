/**
 * Extração: baixa cada série e grava a resposta BRUTA, byte a byte, em
 *   data/raw/<fonte>/<serie>/<AAAA-MM-DD>/<arquivo>  +  meta.json (URL, data/hora, SHA-256)
 * Nunca edite data/raw à mão. Se uma fonte falhar, o vintage anterior é mantido e a falha
 * é registrada em data/raw/_falhas.json (o build não quebra).
 * Uso: node scripts/data/fetch.ts [--only=id1,id2]
 */
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SERIES, type Serie } from './series.ts';

const RAW = 'data/raw';
const hoje = new Date();
const dia = hoje.toISOString().slice(0, 10);
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',');

async function baixar(url: string, tentativas = 3): Promise<string> {
  let erro: unknown;
  for (let i = 0; i < tentativas; i++) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(60_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.text();
      // Algumas APIs respondem 200 com página de erro HTML: só aceitamos JSON válido.
      JSON.parse(body);
      return body;
    } catch (e) {
      erro = e;
      await new Promise((r) => setTimeout(r, 2000 * 2 ** i));
    }
  }
  throw new Error(`Falha ao baixar ${url}: ${String(erro)}`);
}

async function extrair(s: Serie) {
  const dir = join(RAW, s.fonte, s.id, dia);
  const arquivos = [];
  const respostas: [string, string][] = [];
  for (const r of s.requisicoes(hoje)) respostas.push([r.arquivo, await baixar(r.url)]);
  // Só grava depois que todas as requisições da série deram certo (vintage completo ou nenhum).
  await mkdir(dir, { recursive: true });
  const reqs = s.requisicoes(hoje);
  for (const [i, [arquivo, body]] of respostas.entries()) {
    await writeFile(join(dir, arquivo), body);
    arquivos.push({ arquivo, url: reqs[i]!.url, sha256: createHash('sha256').update(body).digest('hex'), bytes: Buffer.byteLength(body) });
  }
  const meta = { serie: s.id, fonte: s.fonte, codigo: s.codigo, extraido_em: hoje.toISOString(), arquivos };
  await writeFile(join(dir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
  console.log(`✓ ${s.id}: ${arquivos.length} arquivo(s) em ${dir}`);
}

const falhas: { serie: string; data: string; erro: string }[] = [];
for (const s of SERIES.filter((s) => !only || only.includes(s.id))) {
  try {
    await extrair(s);
  } catch (e) {
    console.warn(`⚠ ${s.id}: ${String(e)} — mantido o vintage anterior.`);
    falhas.push({ serie: s.id, data: hoje.toISOString(), erro: String(e) });
  }
}
await mkdir(RAW, { recursive: true });
await writeFile(join(RAW, '_falhas.json'), JSON.stringify(falhas.length ? falhas : [], null, 2) + '\n');
if (falhas.length) console.warn(`${falhas.length} série(s) com falha; ver ${RAW}/_falhas.json`);
