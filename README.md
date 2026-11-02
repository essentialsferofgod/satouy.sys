# portfolio-lab

Portfólio pessoal em Next.js 14 (App Router) com fundo shader WebGL, partículas, cursor custom, card 3D de vidro, presença do Discord/Spotify ao vivo e player de música com playlist.

## Rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Personalizar (tudo em `lib/config.js`)

- `profile`: nome, frase (efeito de digitação), localização, avatar (coloque em `/public`).
- `socials`: cada ícone leva para a página do link (nova aba). O tooltip mostra o @usuario lido do caminho da URL, e o hover brilha na cor da marca (`brandColors`).
- `playlist`: coloque seus `.mp3` em `/public/music` e liste em `playlist`.
- `discordId`: ID numérico do seu Discord. Entre no servidor https://discord.gg/lanyard para a presença ao vivo (Discord + Spotify) funcionar. Vazio = modo demo.

## Trocar o fundo

O fundo é uma camada só, escolhida em `lib/config.js` no objeto `background`:

- `kind: "shader"` — o fundo WebGL animado que já vem no projeto.
- `kind: "video"` — um `.mp4` seu em `/public/background`. H.264, sem áudio, 1920x1080, loop de 10 a 20s, até 4 MB. Gere um `poster` (.jpg do primeiro quadro): ele aparece enquanto o vídeo carrega e substitui o vídeo para quem usa movimento reduzido.
- `kind: "image"` — um `.webp` ou `.jpg`. Um `.webp` animado também funciona.
- `kind: "none"` — só a cor de fundo, com grão e vinheta.

O `scrim` (0 a 1) é o véu escuro entre a mídia e o texto. Se o texto ficar difícil de ler sobre o seu fundo, aumente. `grain` e `vignette` ligam a textura de grão e o escurecimento das bordas.

O interruptor "Fundo animado" no painel de configurações desliga a mídia e deixa só a cor de fundo.

## Avatar e ícone da aba

- **Avatar do card:** coloque um `.png` ou `.webp` quadrado de 512x512 em `/public` e aponte em `profile.avatar` no `lib/config.js`. O `avatar.svg` atual é placeholder.
- **Ícone da aba (favicon):** coloque um `icon.png` de 512x512 dentro da pasta `app/`. O Next 14 gera o favicon sozinho, sem configuração nenhuma.

## Recursos

- Tela "clique para entrar" (libera o áudio, que os navegadores bloqueiam sem clique).
- Painel de configurações (engrenagem): liga/desliga shader, partículas, cursor e card 3D; salvo no navegador.
- Cursor custom e inclinação 3D só em dispositivos com mouse.

## Estrutura

`components/` (um arquivo por efeito), `lib/config.js` (conteúdo), `lib/icons.js` (ícones SVG das marcas), `app/globals.css` (visual).

## Dependências

`@paper-design/shaders` dá o brilho metálico aos botões. O `import()` é dinâmico e protegido, mas **o Next resolve a importação no build**: sem o pacote instalado o build quebra. Se quiser removê-lo, apague também a importação em `components/LiquidButton.jsx` — o botão continua bonito com o aro em conic-gradient do CSS.

Use apenas músicas e imagens que você tem direito de usar.
