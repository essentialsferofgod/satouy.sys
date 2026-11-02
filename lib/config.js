// =====================================================================
//  EDITE AQUI: todo o conteúdo do portfólio fica neste arquivo.
// =====================================================================

export const profile = {
  name: "Satouy",

  // Frases do efeito de digitação. Entram em rodízio: digita, segura,
  // apaga e passa para a próxima. Com uma frase só, ele digita e para.
  phrases: [
    "The most valuable currency in the world is time.",
    "Preciso de uma sala cheia de espelhos para que eu possa estar rodeado de vencedores.",
  ],

  // Selos ao lado do nome. São decorativos — você mesmo escolhe quais exibir.
  // Disponíveis hoje: "developer", "verified". Remova da lista para esconder.
  // "color" é a cor do selo e do brilho dele. Troque à vontade.
  badges: [
    { id: "developer", label: "Developer", color: "#8b7cff" },
    { id: "verified",  label: "Verified",  color: "#3ba3ff" },
  ],

  location: "Em algum lugar do espaço",

  // true: o card usa o seu avatar do Discord e acompanha quando você troca lá.
  // false: usa o arquivo em `avatar` abaixo.
  useDiscordAvatar: true,
  // Mostrado enquanto o Discord não responde, e quando useDiscordAvatar é false.
  // Coloque um .png ou .webp quadrado de 512x512 em /public.
  avatar: "/avatar.svg",
  // ID numérico do Discord. A presença ao vivo exige estar no servidor
  // https://discord.gg/lanyard — é o bot que lê o status.
  discordId: "901320854489694298",
};


// ---------------------------------------------------------------------
//  FUNDO
//  kind: "shader" | "video" | "image" | "none"
//    shader -> o fundo WebGL animado que já vem no projeto
//    video  -> coloque um .mp4 em /public/background e aponte em src
//    image  -> uma imagem fixa (ou animada em .webp) em /public/background
//    none   -> só a cor de fundo, com grão e vinheta
//  scrim: 0 a 1. Véu escuro sobre a mídia. Suba se o texto ficar difícil de ler.
//  poster: imagem mostrada antes do vídeo carregar e em "movimento reduzido".
// ---------------------------------------------------------------------
export const background = {
  kind: "video",
  src: "/background/loop-soft.mp4",                    // ex.: "/background/loop.mp4"
  poster: "/background/poster-soft.jpg",                 // ex.: "/background/loop.jpg"
  scrim: 0.18,
  grain: true,
  vignette: true,
  // efeito por cima do fundo: "dust" | "snow" | "rain" | "none"
  effect: "dust",
};

// Cada ícone leva para a página do link e brilha na cor da marca no hover.
// O texto do tooltip é lido do próprio caminho da URL (ex.: instagram.com/fulano -> @fulano).
export const socials = [
  // Com url vazia, o ícone aparece apagado e sem link, marcado como "em breve".
  { id: "instagram", label: "Instagram", url: "" },
  { id: "tiktok",    label: "TikTok",    url: "" },
  { id: "spotify",   label: "Spotify",   url: "" },
  { id: "github",    label: "GitHub",    url: "https://github.com/essentialsferofgod" },
  { id: "discord",   label: "Discord",   url: "" },
  { id: "youtube",   label: "YouTube",   url: "" },
  { id: "twitch",    label: "Twitch",    url: "https://www.twitch.tv/satouyaim" },
];

// ---------------------------------------------------------------------
//  CONTADOR DE VISITAS
//  Usa o Abacus (abacus.jasoncameron.dev): gratuito, sem cadastro e sem
//  back-end. Conta uma vez por aba aberta.
//  ATENÇÃO: o namespace fica visível no código do site, então qualquer
//  pessoa que o descubra pode inflar o número. É enfeite, não métrica.
//  Para zerar, basta trocar o namespace por outro nome qualquer.
// ---------------------------------------------------------------------
export const viewCounter = {
  enabled: true,
  namespace: "satouy-portfolio-lab",
  key: "visits",
};

export const brandColors = {
  instagram: "#E4405F", tiktok: "#25F4EE", spotify: "#1DB954", github: "#F0F6FC",
  discord: "#5865F2", youtube: "#FF2B2B", twitch: "#9146FF", pinterest: "#E60023", x: "#FFFFFF",
};

// Playlist: coloque os arquivos em /public/music e liste aqui.
export const playlist = [
  { title: "DILEMMA", artist: "Nemzzz ft. Central Cee", src: "/music/dilemma.mp3" },
];
