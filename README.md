# Site institucional da APOCAM

Site oficial da Associação Popular de Cannabis Medicinal, organização civil sem fins lucrativos com sede em Brasília, Distrito Federal.

O projeto apresenta a atuação social e informativa da associação, o fluxo de acolhimento, a rede de profissionais parceiros, perguntas frequentes e formas de participação.

## Estrutura

O site é estático e não precisa de processo de compilação.

```text
.
|-- index.html
|-- privacidade.html
|-- styles.css
|-- script.js
|-- vercel.json
|-- assets
|   |-- cannabis-bg.jpg
|   |-- brand
|   |   |-- apple-touch-icon.png
|   |   |-- favicon-192.png
|   |   |-- favicon-32.png
|   |   |-- logo-apocam.svg
|   |   |-- logo-apocam-branco.svg
|   |   |-- logo-apocam-mark.svg
|   |   `-- mark-branco.svg
|   `-- parceiros
|       |-- dra-desiree-guarnieri.jpeg
|       |-- dra-tais-correa.jpeg
|       |-- eduardo-augusto-lopes.jpeg
|       `-- henrique-cesar-ramiro.jpeg
`-- README.md
```

## Visualização local

Abra o arquivo `index.html` em um navegador moderno.

## Publicação

O site é publicado na Vercel (projeto `site`) e responde em https://apocam.ong.br e https://www.apocam.ong.br. A publicação é feita por linha de comando, com `npx vercel --prod --yes --scope apocam` na raiz do repositório. O projeto ainda não está conectado ao GitHub, então enviar commit para a branch principal não publica nada sozinho, e publicar a partir de uma pasta que não contenha o `vercel.json` colocaria o site no ar sem os cabeçalhos de segurança.

Os cabeçalhos de segurança ficam em `vercel.json` e valem para todas as rotas. Depois de cada publicação, confira com `curl -sI https://apocam.ong.br` se `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` e `Cross-Origin-Opener-Policy` aparecem, e abra a página inicial e a política com o console do navegador aberto para confirmar que nada foi bloqueado por engano.

## Contato oficial

- WhatsApp: (61) 99512-7355
- E-mail: medicina.apocam@gmail.com
- Sede: SCES Trecho 2, Lote 32, Pier 21, Loja R60C, Asa Sul, Brasília/DF

## Formulário de acolhimento

O formulário está inativo por decisão da associação: a diretoria ainda precisa definir para onde as mensagens vão e quem, dentro da APOCAM, terá acesso a elas. Enquanto isso, o cartão do formulário avisa que o canal está em configuração e indica o WhatsApp e o e-mail oficiais.

O bloqueio não depende do JavaScript. O `vercel.json` publica `form-action 'self'` e `connect-src 'self'`, então nem o envio nativo do HTML nem o `fetch` do `script.js` conseguem sair do site. É isso que sustenta o item 03 da Política de Privacidade.

Para ativar o envio, tudo no mesmo commit:

1. Decida o destino em diretoria e registre quem recebe as mensagens, onde ficam guardadas e por quanto tempo.
2. Atualize a Política de Privacidade antes de ligar o formulário: item 03 (destino), item 07 (empresa que passa a participar da operação) e item 08 (transferência internacional, se o destino ficar fora do Brasil).
3. Libere o destino escolhido apenas em `connect-src`, no `vercel.json`. Mantenha `form-action 'self'` para que nada seja enviado quando o JavaScript não roda.
4. Substitua `SUA-CHAVE-WEB3FORMS-AQUI` em `index.html` pela chave do serviço escolhido, revise o texto do consentimento e remova o aviso `.form-notice`.
5. Teste o envio em produção antes de anunciar o canal.

## Serviços externos

O site utiliza:

- Google Fonts para as tipografias institucionais.
- Google Maps para o mapa da sede.
- Web3Forms para o formulário, quando configurado.

## Diretrizes institucionais

A comunicação da APOCAM deve ser ética, educativa, não criminalizante e baseada em evidências. A associação está em fase social e informativa, não realiza cultivo e não promete resultados terapêuticos ou decisões judiciais.
