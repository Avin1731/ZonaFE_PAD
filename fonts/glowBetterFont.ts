// src/fonts/glowBetterFont.ts
import localFont from 'next/font/local';

// Muat file font dari folder ini
export const glowBetter = localFont({
  src: './GlowBetter.otf', 
  display: 'swap',
  variable: '--font-glow-better', // Opsional, tapi bagus untuk nanti
});