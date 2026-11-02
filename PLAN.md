# portfolio-lab — Plano de evolução

Documento de trabalho para o Claude Code. Leia este arquivo inteiro antes de escrever qualquer linha, e releia a seção da entrega em que estiver trabalhando.

---

## 0. Contexto

`portfolio-lab` é um **cartão bio-link** — gênero do guns.lol, linktr.ee, e-z.bio. Uma tela, sem rolagem, com identidade, links e presença ao vivo.

Stack atual, que **não deve mudar**: Next.js 14.2.15, React 18.3.1, JavaScript/JSX, CSS puro, WebGL, Canvas 2D, Web Audio API. Sem TypeScript, sem Tailwind, sem GSAP, sem Framer Motion. Toda animação sai de CSS, `requestAnimationFrame` e `IntersectionObserver`.

O projeto roda e funciona. Isto é uma evolução, não uma reconstrução.

### O que este projeto NÃO é

Não transforme isto num portfólio one-page de rolagem com Hero / Projetos / Sobre / Especialidades / Contato / Footer. Essa arquitetura foi avaliada e **recusada**. É a estrutura mais repetida da internet, exige conteúdo de case study que ainda não existe, e destruiria justamente o que diferencia o projeto.

Uma tela. Sem rolagem vertical de seções. Sem header de navegação. Sem âncoras.

### Componentes existentes, todos reaproveitáveis

`ShaderBackground`, `Particles`, `CustomCursor`, `TiltCard`, `MusicPlayer`, `Presence`, `SocialLinks`, `SettingsPanel`, `EnterGate`, `Portfolio`, mais `lib/icons.js` (ícones SVG de marca) e `lib/config.js` (conteúdo).

Nenhum deles deve ser apagado. Vários serão re-alojados e re-estilizados.

---

## 1. Direção de arte — JÁ IMPLEMENTADA, NÃO REDESENHE

> **Leia este aviso antes de qualquer outra coisa.** Uma versão anterior deste plano propunha um layout assimétrico, de "placa de exposição", com o conteúdo encostado à esquerda e os links em lista numerada. **Essa direção foi descartada.** O dono construiu e aprovou outro visual, que é o que está no código hoje. Se você encontrar em algum lugar instruções para tornar o layout assimétrico, para tirar o card do centro ou para trocar a fileira de ícones por uma lista, **ignore: estão obsoletas.**
>
> Sua tarefa nesta área é **zero**. Não redesenhe, não reorganize, não "melhore" a composição. Corrija apenas os defeitos listados na Seção 3, preservando a aparência exatamente como está. Se uma correção mudar o visual, ela está errada — refaça de outro jeito.

### O visual aprovado, para você reconhecer e preservar

Card de vidro centralizado sobre vídeo em tela cheia. Especificamente:

- **Composição:** card único, centralizado, largura `min(92vw, 442px)`, cantos de 26px, vidro com `backdrop-filter: blur(24px)` sobre a variável `--glass`.
- **Transparência:** calibrada por medição, não por gosto. O véu sobre o vídeo (`background.scrim`) está em 0.18 e o card (`--glass`) em 0.22. No segundo mais claro do vídeo isso dá 5,9:1 de contraste, acima do mínimo de 4,5:1. **Se mexer em qualquer um dos dois, meça de novo** — abaixo de 0.12 de véu o texto começa a reprovar.
- **Tipografia:** nome em Instrument Serif, `clamp(2.7rem, 10vw, 4.1rem)`; frase em itálico da mesma família; interface em Inter Tight. Carregadas por `next/font` em `app/layout.jsx`, com alternativas comentadas ali.
- **Nome:** com estrelas brancas em loop contínuo (`SparkleText`).
- **Links:** fileira horizontal de ícones monocromáticos, fundo transparente, glow branco em quatro camadas, 26px, numa única linha em todas as larguras. Entradas sem URL ficam apagadas e inertes.
- **Avatar:** circular, 108px, sem borda e sem aro colorido, puxado do Discord ao vivo.
- **Bloco de presença:** avatar, nome, atividade, barra de progresso do Spotify e capa do álbum.
- **Player:** barra fixa embaixo, fundo `--glass-ui`, com o botão liquid metal no play/pause.
- **Entrada:** botão liquid metal "entrar" sobre a tela escurecida.

### Regras de estilo que continuam valendo

Um destaque só, sem neon, sem gradiente multicolorido, sem glow em tudo. Efeito sutil e intencional, nunca vários competindo. Nada de elemento decorativo sem função. Tipografia legível.


## 2. Arquitetura do fundo

> **Já implementado em parte.** `components/BackgroundLayer.jsx` existe e funciona com os quatro modos (`shader`, `video`, `image`, `none`), mais scrim, grão e vinheta, configurados por `background` em `lib/config.js`. Os quatro modos foram verificados em navegador. **Refine, não reconstrua.** Falta: mover a configuração para `data/site.js` na renomeação, reduzir o shader a um matiz só, trocar o grão de retícula por ruído `feTurbulence`, e validar o contraste de texto com o scrim aplicado.

Este é o pedaço técnico mais importante da entrega, porque é o que o dono do projeto vai trocar com frequência.

Crie `components/background/BackgroundLayer.jsx`, uma camada única e intercambiável, configurada por dado e não por código:

```js
// data/site.js
background: {
  kind: "shader",          // "shader" | "video" | "image" | "none"
  src: "",                 // usado por video e image
  scrim: 0.55,             // 0–1, escurecimento sobre a mídia
  grain: true,
  vignette: true,
}
```

Regras:

- **Uma camada de mídia por vez.** Nunca um shader e um vídeo simultâneos.
- **Scrim obrigatório.** Um véu escuro entre a mídia e o conteúdo, com opacidade configurável, garantindo contraste de texto seja qual for a mídia. Sem isso, trocar o fundo quebra a legibilidade.
- `kind: "video"` → `<video>` mudo, em loop, `playsInline`, `preload="metadata"`, com `poster`. Em conexão lenta ou `prefers-reduced-motion`, exiba só o poster.
- `kind: "image"` → `next/image` com `priority` e dimensões explícitas.
- `kind: "shader"` → o `ShaderBackground` atual, com a paleta reduzida a um matiz.
- `kind: "none"` → só a cor de fundo, grão e vinheta. Esta opção precisa ficar bonita sozinha; se ficar, a direção de arte está certa.
- `Particles` vira textura ambiente opcional, com densidade bem menor que a atual, e desligada por padrão no celular.

O dono vai jogar um `.mp4` ou um `.webp` em `/public/background/` e apontar o `src`. Nada além disso deve ser necessário.

---

## 3. Correções verificadas

Estes defeitos foram confirmados por leitura do código. **A Entrega 1 foi concluída e verificada em 02/11/2026** — tudo abaixo está corrigido. Esta seção fica como histórico: confira antes de supor que algo ainda está quebrado, e não refaça.

Corrigidos na Entrega 1: tilt no toque; painel acessível por teclado, com Escape e clique fora; `smoothstep`; checagem de compilação do shader com queda para o gradiente estático; pausa por `visibilitychange` no shader, no visualizador, nas partículas, nas estrelas e no cursor; liberação de WebGL e AudioContext; lockfile; ícone do LinkedIn.

Defeitos achados **durante** a Entrega 1, já corrigidos:

- `LiquidButton.jsx` chamava `mount.current?.destroy?.()`, mas o método da biblioteca se chama `dispose()`. O contexto WebGL do botão nunca era liberado.
- `ShaderBackground.jsx`, quando a compilação falhava, tentava desanexar shaders que nunca haviam sido anexados, gerando aviso no console.
- O `LiquidButton` não precisou de `visibilitychange`: o `ShaderMount` já pausa sozinho com a aba oculta e fora da tela. Um segundo listener brigaria com a velocidade ajustada no hover. **Não acrescente um.**

**Dependência:** `@paper-design/shaders@0.0.82`. O `import()` dinâmico protegido **não** evita a quebra do build quando o pacote falta, porque o Next resolve a importação em tempo de compilação — a afirmação anterior neste plano estava errada.

**Next:** atualizado para 14.2.35, a última da linha 14, com versão exata no `package.json`. O `npm audit` ainda acusa o Next e o `postcss`; a correção só existe a partir da 15, que é migração de versão principal e **decisão do dono**, não tarefa de manutenção.

**Atenção à deriva de arquivos:** a pasta fica dentro do OneDrive e já houve perda de edição entre gravações. Leia todo arquivo do disco antes de confiar no conteúdo, e releia depois de gravar para confirmar que a mudança ficou.

**`TiltCard.jsx` — inclina no toque.** `onPointerMove` não checa o tipo de ponteiro, então arrastar o dedo inclina o elemento no celular. Ignore eventos cujo `pointerType` não seja `"mouse"`.

**`SettingsPanel.jsx` — inacessível por teclado.** O `<input type="checkbox">` está com `display: none`, e elemento assim não recebe foco: o painel só funciona no clique. Troque pelo padrão visually-hidden (`position: absolute; opacity: 0`), com estilo de `:focus-visible` no indicador. Acrescente fechar com `Escape`, fechar ao clicar fora, e devolver o foco ao botão que abriu.

**`MusicPlayer.jsx` — playlist de uma faixa trava.** *(JÁ CORRIGIDO — verificado em navegador. Confira e siga.)* `go()` calcula `(i + len) % len`, que com uma faixa devolve o mesmo índice; o `useEffect([idx])` não dispara e o `onEnded` morre. Reinicie a faixa explicitamente quando o índice não mudar.

**`MusicPlayer.jsx` — reclicar a faixa pausada não faz nada.** *(JÁ CORRIGIDO — verificado em navegador. Confira e siga.)* Clicar na faixa que já está selecionada mantém `idx` igual, o efeito não roda e o áudio continua pausado. Chame `play()` diretamente no clique em vez de depender do efeito.

**`Presence.jsx` — vazamento de timer.** Dentro de `load()`, o `setTimeout` que agenda a próxima consulta roda **depois** do `await`. Se o componente desmontar durante a requisição, a limpeza já executou o `clearTimeout`, e esse novo timer nunca é cancelado. Cheque a flag de montagem antes de agendar. Acrescente `AbortController` e verifique `response.ok` antes de ler o JSON.

**`Presence.jsx` — perfil fictício em produção.** *(JÁ CORRIGIDO: oculto em produção, aviso só em dev.)* Sem `discordId`, o componente mostra um objeto `DEMO` inventado. Oculte o componente inteiro quando não houver configuração válida.

**`ShaderBackground.jsx` — `smoothstep` com limites invertidos.** `smoothstep(.55, 0., d)` tem `edge0 > edge1`, que é comportamento indefinido pela especificação do GLSL: funciona na maioria das GPUs e pode falhar em outras. Troque por `1.0 - smoothstep(0.0, 0.55, d)`, que é definido e **produz exatamente o mesmo visual**. Não altere a aparência ao corrigir.

**`ShaderBackground.jsx` — falhas de shader passam em silêncio.** Não há verificação de `COMPILE_STATUS` nem de `LINK_STATUS`; o fallback só cobre o caso de o contexto WebGL ser nulo. Verifique as duas coisas, registre o log do shader em desenvolvimento, e caia no fundo estático em qualquer falha.

**Nada pausa com a aba oculta.** *(JÁ CORRIGIDO em `Particles` e `SparkleText`; falta no shader e no visualizador do player.)* Shader, partículas e visualizador do player seguem rodando `requestAnimationFrame` em segundo plano, queimando bateria. Pause nos três com `document.visibilityState`.

**Nada é liberado na desmontagem.** Faltam `deleteProgram`, `deleteShader`, `deleteBuffer` e `loseContext` no shader, e `AudioContext.close()` no player.

**Sem lockfile.** O projeto nunca teve `npm install` rodado. Gere e versione o `package-lock.json`.

**`lib/icons.js` não tem LinkedIn.** O export que foi tentado não existe nessa build do `react-icons`. Resolva com o nome de export correto ou adicione o path SVG manualmente.

**Assets de demonstração a remover.** `public/music/drift.wav` e `afterglow.wav` (1 MB cada, gerados sinteticamente só para teste) e `public/avatar.svg` são placeholders. Mantenha-os fora do build final ou troque por conteúdo real.

### Já está correto — não "conserte"

O `CustomCursor` já verifica `pointer: coarse`. O `Particles` já limita o DPR a 2. O `MusicPlayer` já trata arquivo inexistente e rejeição de `play()`. Não refaça esses trechos.

---

## 4. Base técnica

**Tokens.** Mova toda cor, raio, duração e escala para `:root` em `globals.css`. Hoje os valores estão espalhados, e isso é o que impede temas trocáveis.

**Temas.** Um arquivo por tema, trocado por `data-theme` no `<html>`, cada um redefinindo apenas os tokens. Entregue dois: o da direção nova e um segundo contrastante. Isso é o que viabiliza revenda futura.

**Conteúdo.** Renomeie `lib/config.js` para `data/site.js`, mantendo a mesma ideia: todo o conteúdo editável num arquivo, nenhum dado pessoal dentro de componente. Acrescente os campos de `background` e de tema.

**SEO.** `metadata` do App Router alimentado por `data/site.js` — título, descrição, Open Graph, imagem de compartilhamento, favicon, `lang="pt-BR"`. Um fonte de verdade só; nada de nome duplicado entre perfil e metadados.

**`EnterGate`.** *(Reformulado: agora é só um botão "entrar" centralizado, mas ainda cobre a tela.)* Hoje é uma barreira: ninguém vê a página sem clicar. Transforme numa ativação opcional de áudio — a página carrega e é legível de imediato, e um controle discreto liga o som. O clique continua sendo necessário tecnicamente, porque o navegador bloqueia áudio sem gesto, mas não pode bloquear o conteúdo.

**`MusicPlayer`.** Nunca iniciar sozinho. Reduza a um controle compacto e discreto, coerente com a nova direção — nada de barra flutuante de vidro. Preserve playlist, volume e progresso.

---

## 5. Acessibilidade e celular

Valide em 360, 390, 768, 1024, 1440 e 1920 px.

No celular: coluna única, tipografia fluida com `clamp()`, alvos de toque de no mínimo 44px, sem cursor personalizado, sem tilt, sem efeito que dependa de hover, sem rolagem horizontal, partículas desligadas por padrão. Use `100svh`, não `100vh`, por causa da barra do navegador móvel.

Obrigatório: navegação por teclado completa, foco visível em tudo que é interativo, HTML semântico, `alt` em imagens, contraste mínimo de 4.5:1 para texto normal sobre o fundo **já com o scrim aplicado**, e `prefers-reduced-motion` desligando shader, partículas e animações de entrada. Com movimento reduzido, a página precisa continuar bonita e legível.

---

## 6. Ordem de entrega

Execute uma entrega por sessão. Não tente as quatro de uma vez.

**Entrega 1 — Estabilizar e vestir.** Todas as correções da seção 3, tokens, fontes carregadas de verdade, grão e vinheta, nova tipografia e novo layout assimétrico. Resultado: a tela inicial já demonstra a nova identidade e não carrega bug conhecido.

**Entrega 2 — Fundo e links.** Refino do `BackgroundLayer` já existente (ver nota na seção 2), shader reduzido a um matiz, índice de links no lugar da fileira de ícones, telemetria marginal. Resultado: trocar o fundo é editar uma linha de dado.

**Entrega 3 — Presença, player e configurações.** `Presence` corrigido e oculto quando não configurado, player discreto com ativação manual, `EnterGate` deixando de ser barreira, painel de configurações acessível. Resultado: tudo vivo, nada atrapalhando.

**Entrega 4 — Temas, acessibilidade e publicação.** Segundo tema, varredura dos seis breakpoints, auditoria de teclado e contraste, `next/image`, metadados, Open Graph, favicon, remoção dos assets de demonstração. Resultado: pronto para receber conteúdo real e publicar.

Ao fim de cada entrega, relate: arquivos criados, arquivos modificados, decisões principais, problemas encontrados, o que foi verificado de fato e o que ficou pendente.

---

## 7. Verificação

```bash
npm install
npm run build
npm run dev
# depois do lockfile existir:
npm ci && npm run build
```

Confira: build sem erro, console limpo, links abrindo em nova aba, sem rolagem horizontal em 360px, cursor e tilt desligados no toque, áudio só com ativação manual, fundo estático aparecendo quando o WebGL falha, `prefers-reduced-motion` respeitado, navegação por teclado completa, nenhuma requisição de rede desnecessária.

Se houver navegador automatizado disponível, tire capturas em um desktop e um celular e **olhe para elas**. Se não houver, diga que não houve verificação visual. Nunca afirme ter testado o que não testou.

---

## 8. Regras

Não reconstrua do zero. Leia antes de modificar. Não troque versão de Next ou React. Não acrescente dependência pesada por efeito que CSS ou API nativa resolve; se achar que precisa de uma, justifique peso e ganho antes. Não remova recurso existente sem avaliar reaproveitamento. Não invente nome, projeto, cliente, métrica ou depoimento para preencher espaço — deixe campo vazio e documente a pendência. Não use imagem fictícia como se fosse trabalho real.

---

## 9. Pendências do dono

Já fornecido: nome (Satouy), frase, avatar, favicon, vídeo de fundo e a faixa de música.

**Ainda falta, e nada disto pode ser inventado** — deixe o campo vazio e sinalize:

- As URLs reais de cada rede social. Hoje `lib/config.js` tem `seuusuario` em todas as sete.
- O ID numérico do Discord, e a entrada no servidor `discord.gg/lanyard` (é o bot que lê a presença). Sem isso o widget de presença e os selos da Fase 11 não têm dados.
- E-mail de contato, se for entrar no card.
- As frases do rodízio do typewriter (ver Fase 11).

---

## 10. Feito fora do plano (nov/2026)

Implementado e verificado em navegador, antes das entregas. **Confira e preserve.**

- `components/BackgroundLayer.jsx` — fundo intercambiável (shader/video/image/none) com scrim, grão e vinheta.
- `components/LiquidButton.jsx` — botão "liquid metal" em camadas 3D. O brilho metálico usa `@paper-design/shaders` por `import()` dinâmico dentro de try/catch; **sem o pacote instalado o botão continua funcionando** com um aro em conic-gradient. Usado no `EnterGate` e no play/pause do player. Não aplicar nos controles de volume — decisão do dono.
- `components/SparkleText.jsx` — estrelas brancas em volta do nome, em canvas, com pausa por `visibilitychange` e respeito a `prefers-reduced-motion`.
- `components/Particles.jsx` — reescrito como efeito ambiente discreto com presets `dust`/`snow`/`rain`/`none`, escolhidos em `background.effect`. Sem as linhas de ligação antigas.
- Ícones sociais em círculo preto com glow branco no hover.
- `app/icon.png` (favicon). O avatar vem do Discord ao vivo (`hooks/useLanyard.js`), com `public/avatar.svg` de reserva e a última foto guardada no navegador do visitante.

- `components/Presence.jsx` — reescrito: `AbortController`, checagem de `response.ok`, sem timer órfão após desmontar, oculto em produção quando não configurado ou quando o Lanyard não responde. Exibe capa do álbum e barra de progresso da faixa, com relógio local interpolando entre as consultas de 20s. Verificado com a resposta real da API.
- `hooks/useTypewriter.js` — rodízio de frases com digitar, segurar, apagar e trocar; uma frase só fica estática; respeita `prefers-reduced-motion`. Frases em `profile.phrases`.
- `components/SocialLinks.jsx` — entrada com `url` vazia vira ícone apagado e inerte, com tooltip "em breve", em vez de link quebrado.

Pendente nessa frente: nada. Os `.wav` de demonstração e o `avatar.jpg` já foram apagados pelo dono. **`public/avatar.svg` deve ficar** — é a imagem de reserva enquanto o Discord não responde.

---

## 11. Expansão — escopo enxuto

Escopo revisado e aprovado pelo dono. As frentes de "produto" (layouts, seletor de fontes, biblioteca de efeitos) foram **deliberadamente adiadas** — ver 11.5. Não as antecipe.

### 11.0 Pré-requisito

Nada desta fase começa antes de a **Entrega 1 estar fechada** (seção 6) e o conteúdo real preenchido (seção 9). A página hoje ainda não funciona como bio-link: os sete links apontam para `seuusuario`. Links reais valem mais que qualquer recurso novo desta fase.

### 11.1 Selos vindos de dado real

O princípio: **selo que carrega dado vale; selo decorativo é enfeite e fica de fora.** Um selo "Developer" que o próprio dono se atribui não informa nada a quem chega, e contraria a regra da seção 1 sobre elemento decorativo sem função.

> **Verificado na API em 02/11/2026, com a conta real do dono (ID 901320854489694298):**
> `public_flags` voltou **0** — ele não possui nenhum badge clássico do Discord (HypeSquad, Active Developer, Early Supporter, Bug Hunter). **Selos baseados em `public_flags` renderizariam a fileira vazia.** Não construa em cima desse campo sem antes reconferir.
>
> O que a conta realmente tem, e que serve de base:
> - `primary_guild` — tag de clã `𝘾𝙉`, com `badge` (hash de ícone) e `identity_guild_id`. É o mesmo selo que aparecia no perfil do guns.lol usado como referência.
> - `collectibles.nameplate` — item cosmético da coleção Gothica/Nevermore.
>
> O dono optou por **não** implementar a tag de clã por ora. Mantido aqui como a base correta caso a frente de selos seja retomada.

A fonte é a resposta que o Lanyard **já devolve** no `Presence.jsx` — nenhuma requisição nova:

- `discord_user.public_flags` — bitfield dos badges do Discord (HypeSquad, Active Developer, Early Supporter, Bug Hunter e afins).
- `discord_user.clan` / `primary_guild` — a tag de clã, com o ícone que o `Presence` já exibe.
- `discord_user.avatar_decoration_data` — a moldura animada do avatar.
- `activities` e `spotify` — já em uso.

Implementação: decodifique o bitfield num módulo próprio (`lib/discord-badges.js`) que mapeia bit → `{ nome, svg, cor }`, e renderize como uma fileira discreta abaixo do nome.

**Verifique os valores dos bits contra a documentação oficial do Discord e contra a resposta real da API antes de confiar em qualquer tabela** — inclusive em tabelas que apareçam neste plano. Flag errado exibe selo errado, que é pior que não exibir.

Visual: alinhado ao resto — monocromático com glow branco, como os ícones sociais. Tooltip no hover com o nome do selo. Nada de tique azul imitando verificação de plataforma.

Se o dono quiser um selo manual além desses, ele entra por `lib/config.js` num array separado, claramente distinto dos que vêm do Discord, e nunca com rótulo que simule verificação oficial.

### 11.2 Typewriter com rodízio

Metade já existe: o hook `useTyping` dentro de `Portfolio.jsx` digita letra por letra com cursor. Extraia para `hooks/useTypewriter.js` e acrescente: ciclo entre frases, apagar e reescrever, velocidade de digitação e de apagamento configuráveis, pausa ao fim de cada frase, e `prefers-reduced-motion` exibindo a primeira frase estática.

As frases vêm de `lib/config.js` (`profile.phrases`, array). **O dono vai fornecer as frases dele** — não invente, e não use genéricas de portfólio ("Creative Developer", "Front-end Developer" e afins): a frase atual sobre o tempo é forte e o rodízio não pode enfraquecê-la. Com uma frase só no array, o rodízio se desliga sozinho e o texto fica estático.

### 11.3 Medir no celular e cortar

Não construa registro de efeitos nem orçamento declarativo de desempenho — é engenharia para um problema que este site pode não ter. Faça a medição concreta:

A página pode ter até cinco camadas animadas ao mesmo tempo — vídeo de fundo, shader, partículas, sparkles e o visualizador do player. Abra num celular real ou no emulador com CPU limitada a 4x, meça os quadros por segundo e o consumo, e **desligue por padrão no celular o que não couber**. Documente no README o que ficou ligado e o que ficou desligado, e por quê.

Candidatos óbvios a desligar no celular: shader junto com vídeo (nunca os dois), partículas, e o visualizador do player.

### 11.4 Painel de configurações

Com selos e typewriter, o painel ganha mais itens. Antes de acrescentar qualquer opção, **corrija a acessibilidade por teclado** (seção 3) — hoje os interruptores não recebem foco. Painel maior e ainda inacessível é dívida, não recurso.

### 11.5 Adiado por decisão, não por esquecimento

Registrado aqui para não ser reinventado a cada sessão. **Só entra em pauta quando existir a decisão concreta de vender o projeto como template:**

- **Sistema de layouts** (centralizado, lateral, minimalista, banner, assimétrico). Criar essa abstração agora cobra imposto sobre a iteração visual: toda mudança de design passaria a precisar funcionar em N layouts, justamente enquanto o visual principal ainda está sendo descoberto. Quando entrar, separar conteúdo de apresentação é o caminho — o card vira dado, cada layout vira componente que o consome — e dois layouts bem resolvidos valem mais que seis pela metade.
- **Seletor de fontes com prévia ao vivo.** Limite técnico a considerar antes de prometer: `next/font/google` resolve as fontes **no build**, não em tempo de execução, então um seletor não baixa família nova no clique. A saída é carregar um conjunto fechado (teto sensato: seis famílias) e alternar por variável CSS, com controle separado para título e texto. Hoje o dono troca a fonte mudando uma linha em `app/layout.jsx`, o que já o atende.
- **Biblioteca de efeitos** (glitch, chuva digital, distorção, paralaxe, iluminação dinâmica). Incremento sobre o que já existe, não construção nova. Só faz sentido depois de 11.3, e sob a regra da seção 1: efeito sutil e intencional, nunca vários competindo.

---

## 12. Selos e contador de visitas — FEITO, não refaça

Implementado e verificado em navegador em 02/11/2026, **fora** da Fase 11. Isto substitui a abordagem descrita em 11.1.

**Selos (`components/Badges.jsx`).** O dono optou por selos **decorativos**, escolhidos à mão em `profile.badges` (`lib/config.js`), e não pelos derivados de `public_flags` — que, como a própria 11.1 registra, voltaria vazio para a conta dele. Dois selos: `developer` e `verified`. Os desenhos estão em `BADGES`, no `lib/icons.js`, e são **propositalmente diferentes** das marcas de verificação de plataformas: é enfeite assumido, não credencial. **Não troque por uma cópia do selo do Twitter ou do Discord.**

Visual, decidido pelo dono e **já ajustado — não reverta**: cada selo tem cor própria, definida em `color` no próprio `profile.badges` (Developer `#8b7cff`, Verified `#3ba3ff`), e **não** herda o branco do nome. O glow, a borda do tooltip e o texto do tooltip acompanham essa cor. Ícone a 25px numa caixa de 32px — equivale a 39% da altura do nome, calibrado comparando 17, 21, 25 e 29px em tela. Tooltip no hover, acessível por teclado.

**Contador no celular:** em telas até 480px ele fica no topo à esquerda, não embaixo — embaixo colidia com a barra do player, que ocupa 94% da largura. Verificado em 1100, 390 e 360px.

**Contador (`components/ViewCounter.jsx`).** Usa o Abacus (`abacus.jasoncameron.dev`): gratuito, sem cadastro e sem back-end — requisito, porque o site é estático. Verificado no ar, com CORS liberado a partir de outra origem. Configurado em `viewCounter`, no `lib/config.js`.

Limitações conhecidas, já aceitas pelo dono — **não tente "corrigir"**:
- O namespace fica visível no código do cliente, então o número é inflável. É enfeite, não métrica.
- Conta uma vez por aba aberta, via `sessionStorage`. Recarregar a mesma aba não soma.
- Serviço fora do ar: o contador some em silêncio, sem quebrar a página.
- Para zerar, troca-se o namespace.

**Efeito do nome, ajustado a pedido do dono.** `text-shadow` do `.name` reduzido para `0 0 10px rgba(255,255,255,.16)`, e o `SparkleText` suavizado: densidade 14, `PAD` 14, tamanho `1.2 + rand*2.6`, `shadowBlur` `r*1.6`, alfa `*0.55`. Estava com glow e volume demais. **Não aumente de novo.**
