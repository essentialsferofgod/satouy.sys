/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // O projeto não usa next/image — todas as imagens são <img> comum.
  // Isto desliga a Image Optimization API e remove a rota /_next/image,
  // que é onde mora o alerta crítico GHSA-2464-fhr4-w9xw (RCE via SVG,
  // afeta toda a linha 14.x, sem correção dentro do 14).
  // Sem a rota, a falha não é alcançável. Não remova sem motivo.
  images: { unoptimized: true },
};

export default nextConfig;
