import { Instrument_Serif, Inter_Tight } from "next/font/google";
import "./globals.css";

// ---------------------------------------------------------------------
//  FONTES
//  Para trocar a fonte do nome, troque só a importação e o nome abaixo.
//  Boas alternativas no Google Fonts, todas gratuitas:
//    Instrument_Serif  -> editorial, elegante (atual)
//    Anton             -> condensada e pesada, cara de pôster
//    Archivo_Black     -> grotesca grossa, bem sólida
//    Bodoni_Moda       -> serifada de alto contraste, luxo
//    Unbounded         -> geométrica moderna, mais tecnológica
//  Se o build reclamar "Unknown font", é porque o Next 14 não conhece
//  aquele nome: escolha outro da lista acima.
//  Ex.: import { Anton } from "next/font/google";
//       const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
// ---------------------------------------------------------------------
const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const ui = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata = {
  title: "Satouy",
  description: "The most valuable currency in the world is time.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${ui.variable}`}>
      <body>{children}</body>
    </html>
  );
}
