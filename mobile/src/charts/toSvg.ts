import type { Prim, Scene } from './scene';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const r2 = (n: number) => Math.round(n * 100) / 100;

function one(p: Prim): string {
  switch (p.k) {
    case 'line':
      return `<line x1="${r2(p.x1)}" y1="${r2(p.y1)}" x2="${r2(p.x2)}" y2="${r2(p.y2)}" stroke="${p.stroke}" stroke-width="${p.w}"${p.dash ? ` stroke-dasharray="${p.dash}"` : ''}${p.op != null ? ` opacity="${p.op}"` : ''} stroke-linecap="round"/>`;
    case 'path':
      return `<path d="${p.d}" fill="${p.fill ?? 'none'}"${p.stroke ? ` stroke="${p.stroke}" stroke-width="${p.w ?? 1}"` : ''}${p.dash ? ` stroke-dasharray="${p.dash}"` : ''}${p.op != null ? ` opacity="${p.op}"` : ''} stroke-linejoin="round" stroke-linecap="round"/>`;
    case 'circle':
      return `<circle cx="${r2(p.cx)}" cy="${r2(p.cy)}" r="${p.r}" fill="${p.fill ?? 'none'}"${p.stroke ? ` stroke="${p.stroke}" stroke-width="${p.w ?? 1}"` : ''}${p.op != null ? ` opacity="${p.op}"` : ''}/>`;
    case 'text': {
      const fam = p.font === 'display' ? 'Georgia, serif' : 'Helvetica, Arial, sans-serif';
      const weight = p.font === 'bold' ? 700 : 400;
      return `<text x="${r2(p.x)}" y="${r2(p.y + p.size * 0.35)}" font-size="${p.size}" fill="${p.fill}" text-anchor="${p.anchor ?? 'middle'}" font-family="${fam}" font-weight="${weight}"${p.op != null ? ` opacity="${p.op}"` : ''}>${esc(p.s)}</text>`;
    }
  }
}

/** Plain SVG string of a scene (used for previews/tests, not by the app UI). */
export function sceneToSvg(scene: Scene, background = '#0B0B0C'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${scene.w} ${scene.h}" width="${scene.w * 2}" height="${scene.h * 2}"><rect width="${scene.w}" height="${scene.h}" fill="${background}"/>${scene.prims.map(one).join('')}</svg>`;
}
