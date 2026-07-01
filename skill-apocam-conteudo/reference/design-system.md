# APOCAM — Design system (resumo operacional)

Fonte de verdade completa: `contexto-apocam-cowork_1.md` na raiz do projeto.

## Paleta (hex oficiais)

- Verde `#008505` — principal (vida, cura, sustentabilidade)
- Verde-água `#009E9A` — acolhimento, equilíbrio, comunicação
- Azul profundo `#00434F` — responsabilidade, ciência, confiança
- Carmim `#D92B43` — ancestralidade, luta (uso pontual, sem agressividade)
- Marrom oliva `#80513D` / Areia queimada `#A07346` — ancestralidade, estabilidade
- Areia dourada `#DCA865` — acolhimento, transparência (acento em fundo escuro)
- Branco `#FFFFFF` — tipografia, transparência

## Tipografia

- **Montserrat** — títulos e destaques (fallback offline: Poppins)
- **Lora** — textos longos, manifesto, itálico humanizado
- **Source Sans 3** — corpo técnico/informativo (fallback offline: Lato)

## Tratamento visual "acolhimento / como funciona"

Fundo escuro em gradiente `#053b45 → #02323b → #053a38` (155°) + brilhos radiais
verde-água (topo-direita) e verde (base-esquerda). Acentos e numeração em
areia-dourada. Marca (folha) como marca d'água branca a ~5%. Cartões com fundo
branco a ~6%, borda a ~18% e barra de acento areia-dourada à esquerda.

## Regras de linguagem (não-negociáveis)

1. Nunca "venda" nem "desconto".
2. Nunca prometer resultado terapêutico nem garantir habeas corpus/decisão judicial.
3. APOCAM nunca como intermediária de outra associação — foco nela mesma.
4. Ética, educativa, não criminalizante, baseada em evidências.
5. Sem nomes/cargos da diretoria.
6. Óleos/pomadas: ok. Gummy/flor: só fase futura.
7. CTA de acolhimento ("fale com a gente"), nunca comercial.
8. Endereço da sede pode ser usado. Canal atual = formulário do site.

## Fase atual

Social/informativa: sem produtos, sem distribuição, sem comercialização. Muda
apenas quando o cultivo próprio for legalizado.

## Erros já cometidos (e evitados pelo renderer)

| Erro | Sintoma | Prevenção na skill |
|---|---|---|
| Texto sem acento | "Orientacao" em vez de "Orientação" | conteúdo sempre UTF-8 acentuado |
| Escala dupla `P(y)` | textos jogados para fora/baixo | helpers retornam px escalado; somar `y+P(k)` |
| Glyph ausente ("→") | quadrado tofu | seta/ícone vetoriais |
| Fonte fixa inexistente | erro/serif errada | resolvedor com fallback + relatório |
| Rede bloqueada | pip/curl 403 | pipeline 100% offline (Pillow) |
| Termo proibido passar | risco jurídico | `compliance_check()` aborta |
