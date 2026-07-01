---
name: apocam-conteudo
description: >-
  Gera peças de conteúdo da APOCAM (Associação Popular de Cannabis Medicinal) —
  carrosséis e posts para Instagram, imagens sociais — aplicando o design system
  oficial (paleta, tipografia, marca) e as regras de linguagem não-negociáveis da
  associação. Use sempre que o pedido envolver "carrossel", "post", "story",
  "peça", "arte", "conteúdo" ou "instagram" para a APOCAM. Renderiza slides
  1080x1350 (4:5) offline com Pillow e roda um verificador de conformidade antes
  de exportar.
---

# APOCAM — Conteúdo social

Skill para produzir peças visuais da APOCAM com fidelidade ao design system e
segurança jurídica de linguagem. Ela existe porque a comunicação da APOCAM tem
restrições legais rígidas e uma identidade visual específica — errar qualquer um
dos dois compromete a peça.

## 0. Antes de qualquer coisa: leia o contexto

Leia `contexto-apocam-cowork_1.md` na raiz do projeto **por completo** antes de
gerar conteúdo. Ele é a fonte de verdade sobre fase atual, restrições e identidade.
Se uma instrução conflitar com as regras abaixo, **sinalize antes de executar.**

## 1. Regras de linguagem NÃO-NEGOCIÁVEIS

Toda peça deve ser ética, educativa, não criminalizante e baseada em evidências.

Proibido:
- As palavras **"venda"** e **"desconto"** (em qualquer forma). A APOCAM não comercializa nada nesta fase.
- Tratar a APOCAM como **intermediária** de outra associação — o foco é sempre ela própria, entidade já legalizada.
- **Prometer resultado terapêutico** ou **garantir** habeas corpus / decisão judicial. Sempre deixar explícito que a indicação é referencial e que não há garantia.
- Citar **nomes ou cargos da diretoria**.
- Mencionar **gummy/flor** como oferta (fase futura). Óleos e pomadas podem ser citados no discurso institucional.
- Depoimentos/imagens de pacientes sem autorização formal prévia.

Permitido / preferido:
- "encaminhamento médico" e "encaminhamento jurídico".
- CTA de **acolhimento** ("fale com a gente", "busque orientação") — nunca comercial.
- Endereço da sede: SCES Trecho 2, Lote 32 - Pier 21, Loja R60C · Asa Sul, Brasília/DF.
- Canal de contato atual: **formulário do site** (não afirme WhatsApp ativo enquanto não confirmado).

O renderer (`scripts/apocam_render.py`) roda `compliance_check()` automaticamente e
**aborta** se achar termo proibido. Não desligue essa checagem.

## 2. Design system

Paleta (hex oficiais):

| Token | Hex | Uso |
|---|---|---|
| verde | `#008505` | principal — vida, cura |
| verde-água | `#009E9A` | acolhimento, destaques secundários |
| azul profundo | `#00434F` | base escura, ciência, confiança |
| carmim | `#D92B43` | pontual (marca), sem agressividade |
| areia-dourada | `#DCA865` | acento sobre fundo escuro (eyebrow, números) |
| marrom / areia-queimada | `#80513D` / `#A07346` | ancestralidade |
| branco | `#FFFFFF` | tipografia, transparência |

Tipografia (com fallback offline embutido no resolvedor de fontes):

| Papel | Ideal | Fallback offline |
|---|---|---|
| Títulos/destaques | **Montserrat** | Poppins |
| Textos longos/manifesto | **Lora** | Lora (disponível) |
| Corpo técnico/informativo | **Source Sans 3** | Lato |

Fundo padrão das peças "como funciona/acolhimento": gradiente escuro
(`#053b45 → #02323b → #053a38`) com brilhos radiais verde-água (topo-direita) e
verde (base-esquerda), acentos em areia-dourada — espelha a seção `#como-funciona`
do site. Marca (folha) como marca d'água branca a ~5% de opacidade.

## 3. Como gerar (passo a passo)

1. Confirme com o usuário **foco** e **formato** (4:5 1080x1350 é o padrão).
2. Escreva o conteúdo em **português com acentuação correta (UTF-8)**.
3. Defina os slides como lista de dicts (ver `scripts/build_como_funciona.py`).
4. Rode o renderer:
   ```bash
   python3 scripts/build_como_funciona.py \
       --assets /caminho/para/APOCAM/assets \
       --out /caminho/para/saida
   ```
   Para fidelidade máxima de fonte, coloque `Montserrat-*.ttf` e `SourceSans3-*.ttf`
   numa pasta e passe `--fonts /essa/pasta`. Sem isso, usa Poppins/Lato e **avisa**.
5. Revise o `montage.png` gerado e o relatório de conformidade impresso.

## 4. Checklist anti-erro (lições já aprendidas — não repetir)

Estes erros já aconteceram uma vez. O renderer desta skill previne cada um; ao
editar o código, mantenha as proteções.

- [ ] **Acentuação**: todo texto em UTF-8 com acentos ("Orientação", não "Orientacao"). As fontes suportam.
- [ ] **Escala dupla**: as helpers de texto retornam coordenadas JÁ escaladas. Nunca reembrulhe um `y` retornado em `P()`. Some offsets como `y + P(k)`.
- [ ] **Glyphs ausentes**: setas/ícones são **vetoriais** (linha + polígono), nunca caractere "→" (pode virar tofu).
- [ ] **Fontes**: use o resolvedor com fallback; não fixe caminho de fonte que pode não existir. Verifique com `fc-list` antes.
- [ ] **Sem rede**: o ambiente pode bloquear pip/curl (proxy 403). Não dependa de download; renderize offline com Pillow (não presuma navegador/Playwright).
- [ ] **Conformidade**: rode `compliance_check()` e leia o relatório. Frases sobre garantia só passam se estiverem **negadas**.
- [ ] **Verificação visual**: gere e abra o `montage.png` antes de entregar.

## Arquivos

- `scripts/apocam_render.py` — biblioteca de renderização (tokens, fontes, helpers, linter).
- `scripts/build_como_funciona.py` — exemplo reprodutível do carrossel "Como funciona o acolhimento".
- `reference/design-system.md` — resumo do design system e das regras.
- `assets/` — marca APOCAM (folha colorida e logo branco) para as peças.
