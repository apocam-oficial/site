#!/usr/bin/env node
// Guarda contra o erro que ja foi ao ar em 04/ago/2026: uma @media sem chave de
// fechamento engoliu todo o CSS seguinte, e a Politica de Privacidade ficou sem
// estilo em producao sem ninguem perceber. O navegador nao reclama, so ignora.
//
// Uso: node tools/checar-css.mjs
// Sai com codigo 1 se achar problema, para poder virar passo de publicacao.

import { readFileSync } from 'node:fs'

const ARQUIVO = 'styles.css'
const css = readFileSync(new URL(`../${ARQUIVO}`, import.meta.url), 'utf8')

const problemas = []
let profundidade = 0
let emComentario = false
let linha = 1
let abreDaLinha = []

for (let i = 0; i < css.length; i++) {
  const c = css[i]
  const par = css.slice(i, i + 2)

  if (c === '\n') { linha++; continue }

  if (emComentario) {
    if (par === '*/') { emComentario = false; i++ }
    continue
  }
  if (par === '/*') { emComentario = true; i++; continue }

  if (c === '{') {
    profundidade++
    abreDaLinha.push(linha)
  } else if (c === '}') {
    profundidade--
    abreDaLinha.pop()
    if (profundidade < 0) {
      problemas.push(`linha ${linha}: chave de fechamento a mais`)
      profundidade = 0
    }
  }
}

if (emComentario) problemas.push('comentario aberto e nunca fechado')

if (profundidade > 0) {
  problemas.push(
    `${profundidade} bloco(s) sem fechar. Aberto(s) na(s) linha(s): ${abreDaLinha.join(', ')}. ` +
    'Tudo abaixo disso esta preso dentro do bloco e nao se aplica como voce espera.',
  )
}

// Nao ha checagem de profundidade: @keyframes dentro de @media da tres niveis
// legitimamente, e guarda que acusa o que e certo acaba ignorado.

if (problemas.length) {
  console.error(`FALHA em ${ARQUIVO}:`)
  for (const p of problemas) console.error(`  - ${p}`)
  process.exit(1)
}

console.log(`OK: ${ARQUIVO} com blocos e comentarios balanceados.`)
