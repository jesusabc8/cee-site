/**
 * Extração: baixa cada série e grava a resposta BRUTA, byte a byte, em
 *   data/raw/<fonte>/<serie>/<AAAA-MM-DD>/<arquivo>  +  meta.json (URL, data/hora, SHA-256)
 * Nunca edite data/raw à mão. Se uma fonte falhar, o vintage anterior é mantido e a falha
 * é registrada em data/raw/_falhas.json (o build não quebra).
 * Uso: node scripts/data/fetch.ts [--only=id1,id2]
 */
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SERIES, type Serie } from './series.ts';

const RAW = 'data/raw';
const hoje = new Date();
const dia = hoje.toISOString().slice(0, 10);
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',');

async function baixar(url: string, s: Serie, tentativas = 3): Promise<Buffer> {
  let erro: unknown;
  for (let i = 0; i < tentativas; i++) {
    try {
      const res = await fetch(url, { headers: { Accept: s.formato === 'binario' ? '*/*' : 'application/json' }, signal: AbortSignal.timeout(180_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = Buffer.from(await res.arrayBuffer());
      if (s.formato === 'binario') {
        // Arquivo publicado com checksum oficial: só aceitamos o arquivo idêntico.
        const sha1 = createHash('sha1').update(body).digest('hex');
        if (s.sha1_oficial && sha1 !== s.sha1_oficial) throw new Error(`SHA-1 ${sha1} difere do oficial ${s.sha1_oficial}`);
      } else {
        // Algumas APIs respondem 200 com página de erro HTML: só aceitamos JSON válido.
        JSON.parse(body.toString('utf8'));
      }
      return body;
    } catch (e) {
      erro = e;
      await new Promise((r) => setTimeout(r, 2000 * 2 ** i));
    }
  }
  throw new Error(`Falha ao baixar ${url}: ${String(erro)}`);
}

/** Fonte estática com checksum oficial já arquivada: não há o que atualizar. */
async function jaArquivada(s: Serie) {
  if (!s.sha1_oficial) return false;
  const base = join(RAW, s.fonte, s.id);
  const dias = (await readdir(base).catch(() => [])).sort();
  if (!dias.length) return false;
  const meta = JSON.parse(await readFile(join(base, dias.at(-1)!, 'meta.json'), 'utf8'));
  return meta.arquivos.every((a: { sha1?: string }) => a.sha1 === s.sha1_oficial);
}

async function extrair(s: Serie) {
  if (await jaArquivada(s)) {
    console.log(`= ${s.id}: versão oficial já arquivada (SHA-1 confere); nada a baixar.`);
    return;
  }
  const dir = join(RAW, s.fonte, s.id, dia);
  const arquivos = [];
  const respostas: [string, Buffer][] = [];
  for (const r of s.requisicoes(hoje)) respostas.push([r.arquivo, await baixar(r.url, s)]);
  // Vintage idêntico ao anterior (mesmos arquivos, mesmos hashes): não duplica.
  const base = join(RAW, s.fonte, s.id);
  const anteriores = (await readdir(base).catch(() => [])).filter((d) => d !== dia).sort();
  if (anteriores.length) {
    const metaAnt = JSON.parse(await readFile(join(base, anteriores.at(-1)!, 'meta.json'), 'utf8'));
    const hashes = respostas.map(([a, b]) => `${a}:${createHash('sha256').update(b).digest('hex')}`).join('|');
    const hashesAnt = metaAnt.arquivos.map((a: { arquivo: string; sha256: string }) => `${a.arquivo}:${a.sha256}`).join('|');
    if (hashes === hashesAnt) {
      console.log(`= ${s.id}: sem mudanças desde ${anteriores.at(-1)}; vintage não duplicado.`);
      return;
    }
  }
  // Só grava depois que todas as requisições da série deram certo (vintage completo ou nenhum).
  await mkdir(dir, { recursive: true });
  const reqs = s.requisicoes(hoje);
  for (const [i, [arquivo, body]] of respostas.entries()) {
    await writeFile(join(dir, arquivo), body);
    arquivos.push({
      arquivo, url: reqs[i]!.url, sha256: createHash('sha256').update(body).digest('hex'), bytes: body.length,
      ...(s.formato === 'binario' ? { sha1: createHash('sha1').update(body).digest('hex') } : {}),
    });
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
