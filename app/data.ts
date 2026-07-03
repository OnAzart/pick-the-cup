export type TeamCode = string;

export interface Team {
  n: string;
  f: string;
}

export const TEAMS: Record<string, Team> = {
  MEX:{n:'Mexico',f:'🇲🇽'}, RSA:{n:'South Africa',f:'🇿🇦'}, KOR:{n:'South Korea',f:'🇰🇷'}, CZE:{n:'Czechia',f:'🇨🇿'},
  SUI:{n:'Switzerland',f:'🇨🇭'}, CAN:{n:'Canada',f:'🇨🇦'}, BIH:{n:'Bosnia-Herzegovina',f:'🇧🇦'}, QAT:{n:'Qatar',f:'🇶🇦'},
  BRA:{n:'Brazil',f:'🇧🇷'}, MAR:{n:'Morocco',f:'🇲🇦'}, SCO:{n:'Scotland',f:'🏴'}, HAI:{n:'Haiti',f:'🇭🇹'},
  USA:{n:'United States',f:'🇺🇸'}, AUS:{n:'Australia',f:'🇦🇺'}, PAR:{n:'Paraguay',f:'🇵🇾'}, TUR:{n:'Turkey',f:'🇹🇷'},
  GER:{n:'Germany',f:'🇩🇪'}, CIV:{n:'Ivory Coast',f:'🇨🇮'}, ECU:{n:'Ecuador',f:'🇪🇨'}, CUW:{n:'Curaçao',f:'🇨🇼'},
  NED:{n:'Netherlands',f:'🇳🇱'}, JPN:{n:'Japan',f:'🇯🇵'}, SWE:{n:'Sweden',f:'🇸🇪'}, TUN:{n:'Tunisia',f:'🇹🇳'},
  BEL:{n:'Belgium',f:'🇧🇪'}, EGY:{n:'Egypt',f:'🇪🇬'}, IRN:{n:'Iran',f:'🇮🇷'}, NZL:{n:'New Zealand',f:'🇳🇿'},
  ESP:{n:'Spain',f:'🇪🇸'}, CPV:{n:'Cape Verde',f:'🇨🇻'}, URU:{n:'Uruguay',f:'🇺🇾'}, KSA:{n:'Saudi Arabia',f:'🇸🇦'},
  FRA:{n:'France',f:'🇫🇷'}, NOR:{n:'Norway',f:'🇳🇴'}, SEN:{n:'Senegal',f:'🇸🇳'}, IRQ:{n:'Iraq',f:'🇮🇶'},
  ARG:{n:'Argentina',f:'🇦🇷'}, AUT:{n:'Austria',f:'🇦🇹'}, ALG:{n:'Algeria',f:'🇩🇿'}, JOR:{n:'Jordan',f:'🇯🇴'},
  COL:{n:'Colombia',f:'🇨🇴'}, POR:{n:'Portugal',f:'🇵🇹'}, COD:{n:'Congo DR',f:'🇨🇩'}, UZB:{n:'Uzbekistan',f:'🇺🇿'},
  ENG:{n:'England',f:'🇬🇧'}, CRO:{n:'Croatia',f:'🇭🇷'}, GHA:{n:'Ghana',f:'🇬🇭'}, PAN:{n:'Panama',f:'🇵🇦'},
};

// Drawn-approximation flag backgrounds (dominant colors/bands, not photographic
// flags) — ported from the "Flag Winners Test" design exploration. Covers all
// 48 real 2026 teams; 11 of them (RSA, CZE, BIH, SCO, HAI, CUW, CPV, IRQ, JOR,
// COD, UZB) aren't in the design's fictional draw so were authored to match
// its style for this real one.
export const FLAG_BG: Record<string, string> = {
  MEX:'linear-gradient(90deg,#006847 0 33%,#fff 33% 66%,#CE1126 66%)',
  RSA:'linear-gradient(135deg,#000 0 20%,#FFB612 20% 35%,#007749 35% 65%,#DE3831 65% 85%,#001489 85%)',
  KOR:'linear-gradient(135deg,#fff 0 100%)',
  CZE:'linear-gradient(135deg,#11457E 0 30%,#fff 30% 65%,#D7141A 65%)',
  SUI:'linear-gradient(135deg,#D52B1E 0 100%)',
  CAN:'linear-gradient(90deg,#D80621 0 25%,#fff 25% 75%,#D80621 75%)',
  BIH:'linear-gradient(135deg,#002395 0 55%,#FECB00 55%)',
  QAT:'linear-gradient(135deg,#8D1B3D 0 100%)',
  BRA:'linear-gradient(135deg,#009C3B 0 100%)',
  MAR:'linear-gradient(135deg,#C1272D 0 100%)',
  SCO:'linear-gradient(135deg,#0065BD 0 38%,#fff 38% 62%,#0065BD 62%)',
  HAI:'linear-gradient(180deg,#00209F 0 50%,#D21034 50%)',
  USA:'linear-gradient(180deg,#B22234 0 20%,#fff 20% 40%,#B22234 40% 60%,#fff 60% 80%,#3C3B6E 80%)',
  AUS:'linear-gradient(135deg,#00247D 0 100%)',
  PAR:'linear-gradient(180deg,#D52B1E 0 33%,#fff 33% 66%,#0038A8 66%)',
  TUR:'linear-gradient(135deg,#E30A17 0 100%)',
  GER:'linear-gradient(180deg,#000 0 33%,#DD0000 33% 66%,#FFCE00 66%)',
  CIV:'linear-gradient(90deg,#F77F00 0 33%,#fff 33% 66%,#009E60 66%)',
  ECU:'linear-gradient(180deg,#FFDD00 0 50%,#034EA2 50% 75%,#ED1C24 75%)',
  CUW:'linear-gradient(180deg,#002B7F 0 40%,#F9E814 40% 55%,#002B7F 55%)',
  NED:'linear-gradient(180deg,#AE1C28 0 33%,#fff 33% 66%,#21468B 66%)',
  JPN:'radial-gradient(circle 11px at 50% 50%,#BC002D 99%,#fff 100%)',
  SWE:'linear-gradient(135deg,#006AA7 0 100%)',
  TUN:'linear-gradient(135deg,#E70013 0 100%)',
  BEL:'linear-gradient(90deg,#000 0 33%,#FAE042 33% 66%,#ED2939 66%)',
  EGY:'linear-gradient(180deg,#CE1126 0 33%,#fff 33% 66%,#000 66%)',
  IRN:'linear-gradient(180deg,#239F40 0 33%,#fff 33% 66%,#DA0000 66%)',
  NZL:'linear-gradient(135deg,#00247D 0 100%)',
  ESP:'linear-gradient(180deg,#AA151B 0 25%,#F1BF00 25% 75%,#AA151B 75%)',
  CPV:'linear-gradient(180deg,#003893 0 60%,#fff 60% 68%,#CF2027 68% 76%,#fff 76% 84%,#003893 84%)',
  URU:'linear-gradient(180deg,#fff 0 25%,#0038A8 25% 50%,#fff 50% 75%,#0038A8 75%)',
  KSA:'linear-gradient(135deg,#0B5B32 0 100%)',
  FRA:'linear-gradient(90deg,#0055A4 0 33%,#fff 33% 66%,#EF4135 66%)',
  NOR:'linear-gradient(135deg,#EF2B2D 0 55%,#002868 55% 78%,#fff 78%)',
  SEN:'linear-gradient(90deg,#00853F 0 33%,#FDEF42 33% 66%,#E31B23 66%)',
  IRQ:'linear-gradient(180deg,#CE1126 0 33%,#fff 33% 66%,#000 66%)',
  ARG:'linear-gradient(180deg,#74ACDF 0 33%,#fff 33% 66%,#74ACDF 66%)',
  AUT:'linear-gradient(180deg,#ED2939 0 33%,#fff 33% 66%,#ED2939 66%)',
  ALG:'linear-gradient(90deg,#006233 0 50%,#fff 50%)',
  JOR:'linear-gradient(135deg,#000 0 33%,#fff 33% 66%,#007A3D 66%)',
  COL:'linear-gradient(180deg,#FCD116 0 50%,#003893 50% 75%,#CE1126 75%)',
  POR:'linear-gradient(90deg,#006600 0 40%,#FF0000 40%)',
  COD:'linear-gradient(135deg,#007FFF 0 38%,#F7D618 38% 44%,#CE1021 44% 56%,#F7D618 56% 62%,#007FFF 62%)',
  UZB:'linear-gradient(180deg,#0099B5 0 33%,#fff 33% 66%,#1EB53A 66%)',
  ENG:'linear-gradient(90deg,rgba(255,255,255,0) 0 43%,#CE1124 43% 57%,rgba(255,255,255,0) 57%),linear-gradient(180deg,#fff 0 30%,#CE1124 30% 70%,#fff 70%)',
  CRO:'linear-gradient(180deg,#FF0000 0 33%,#fff 33% 66%,#0093DD 66%)',
  GHA:'linear-gradient(180deg,#CE1126 0 33%,#FCD116 33% 66%,#006B3F 66%)',
  PAN:'linear-gradient(135deg,#CF142B 0 50%,#00205B 50%)',
};

// Flags whose FLAG_BG is solid/near-solid white — need dark text instead of
// the white-text-on-scrim treatment every other (darker) flag gets.
// (ENG now renders a St George cross, so its text sits on the red band
// and gets the regular white-text treatment — but skip the dark scrim,
// which would just gray out the white field.)
export const LIGHT_FLAGS = new Set(['KOR']);
const NO_SCRIM_FLAGS = new Set(['ENG']);

export interface WinRowColors { background: string; color: string; textShadow: string; }

// Winning-team row treatment: the team's own flag colors as background (with
// a dark scrim for legibility, skipped for near-white flags), falling back to
// flat green if a code somehow isn't in FLAG_BG.
export function winRowColors(code: string): WinRowColors {
  const flagBg = FLAG_BG[code];
  if (!flagBg) return { background: '#17C988', color: '#fff', textShadow: 'none' };
  const light = LIGHT_FLAGS.has(code);
  const scrim = light || NO_SCRIM_FLAGS.has(code) ? '' : 'linear-gradient(rgba(10,10,10,.30),rgba(10,10,10,.30)), ';
  return { background: scrim + flagBg, color: light ? '#161616' : '#fff', textShadow: light ? 'none' : '1px 1px 0 rgba(0,0,0,.35)' };
}

// Real 2026 World Cup group draw, matching football-data.org (see app/api/cron/sync-results).
export const GROUPS: Record<string, string[]> = {
  A:['MEX','RSA','KOR','CZE'], B:['SUI','CAN','BIH','QAT'], C:['BRA','MAR','SCO','HAI'],
  D:['USA','AUS','PAR','TUR'], E:['GER','CIV','ECU','CUW'], F:['NED','JPN','SWE','TUN'],
  G:['BEL','EGY','IRN','NZL'], H:['ESP','CPV','URU','KSA'], I:['FRA','NOR','SEN','IRQ'],
  J:['ARG','AUT','ALG','JOR'], K:['COL','POR','COD','UZB'], L:['ENG','CRO','GHA','PAN'],
};

export interface KOSlot { r: string; p: string; }
export interface KOMatch { id: string; a: KOSlot; b: KOSlot; }

// Round-of-32 leaves match the real, FIFA-published 2026 draw (verified
// against football-data.org's synced fixtures — see app/api/locked). The
// win:/lose: cascade below (M89 onward) was already correct.
export const KO: KOMatch[] = [
  {id:'M74',a:{r:'g:E:1',p:'1E'},b:{r:'w:0',p:'3ABCDF'}},
  {id:'M77',a:{r:'g:I:1',p:'1I'},b:{r:'w:1',p:'3CDFGH'}},
  {id:'M73',a:{r:'g:B:2',p:'2B'},b:{r:'g:A:2',p:'2A'}},
  {id:'M75',a:{r:'g:F:1',p:'1F'},b:{r:'g:C:2',p:'2C'}},
  {id:'M83',a:{r:'g:K:2',p:'2K'},b:{r:'g:L:2',p:'2L'}},
  {id:'M84',a:{r:'g:H:1',p:'1H'},b:{r:'g:J:2',p:'2J'}},
  {id:'M81',a:{r:'g:D:1',p:'1D'},b:{r:'w:4',p:'3BEFIJ'}},
  {id:'M82',a:{r:'g:G:1',p:'1G'},b:{r:'w:5',p:'3AEHIJ'}},
  {id:'M76',a:{r:'g:C:1',p:'1C'},b:{r:'g:F:2',p:'2F'}},
  {id:'M78',a:{r:'g:E:2',p:'2E'},b:{r:'g:I:2',p:'2I'}},
  {id:'M79',a:{r:'g:A:1',p:'1A'},b:{r:'w:2',p:'3CEFHI'}},
  {id:'M80',a:{r:'g:L:1',p:'1L'},b:{r:'w:3',p:'3EHIJK'}},
  {id:'M86',a:{r:'g:J:1',p:'1J'},b:{r:'g:H:2',p:'2H'}},
  {id:'M88',a:{r:'g:D:2',p:'2D'},b:{r:'g:G:2',p:'2G'}},
  {id:'M85',a:{r:'g:B:1',p:'1B'},b:{r:'w:6',p:'3EFGIJ'}},
  {id:'M87',a:{r:'g:K:1',p:'1K'},b:{r:'w:7',p:'3DEIJL'}},
  {id:'M89',a:{r:'win:M74',p:'W74'},b:{r:'win:M77',p:'W77'}},
  {id:'M90',a:{r:'win:M73',p:'W73'},b:{r:'win:M75',p:'W75'}},
  {id:'M93',a:{r:'win:M83',p:'W83'},b:{r:'win:M84',p:'W84'}},
  {id:'M94',a:{r:'win:M81',p:'W81'},b:{r:'win:M82',p:'W82'}},
  {id:'M91',a:{r:'win:M76',p:'W76'},b:{r:'win:M78',p:'W78'}},
  {id:'M92',a:{r:'win:M79',p:'W79'},b:{r:'win:M80',p:'W80'}},
  {id:'M95',a:{r:'win:M86',p:'W86'},b:{r:'win:M88',p:'W88'}},
  {id:'M96',a:{r:'win:M85',p:'W85'},b:{r:'win:M87',p:'W87'}},
  {id:'M97',a:{r:'win:M89',p:'W89'},b:{r:'win:M90',p:'W90'}},
  {id:'M98',a:{r:'win:M93',p:'W93'},b:{r:'win:M94',p:'W94'}},
  {id:'M99',a:{r:'win:M91',p:'W91'},b:{r:'win:M92',p:'W92'}},
  {id:'M100',a:{r:'win:M95',p:'W95'},b:{r:'win:M96',p:'W96'}},
  {id:'M101',a:{r:'win:M97',p:'W97'},b:{r:'win:M98',p:'W98'}},
  {id:'M102',a:{r:'win:M99',p:'W99'},b:{r:'win:M100',p:'W100'}},
  {id:'M104',a:{r:'win:M101',p:'W101'},b:{r:'win:M102',p:'W102'}},
  {id:'M103',a:{r:'lose:M101',p:'RU101'},b:{r:'lose:M102',p:'RU102'}},
];

export const KOby = KO.reduce<Record<string, KOMatch>>((o, m) => { o[m.id] = m; return o; }, {});

export const LEFT_COLS = [
  {title:'ROUND OF 32', matches:['M74','M77','M73','M75','M83','M84','M81','M82']},
  {title:'ROUND OF 16', matches:['M89','M90','M93','M94']},
  {title:'QUARTER',     matches:['M97','M98']},
  {title:'SEMI',        matches:['M101']},
];
export const RIGHT_COLS = [
  {title:'SEMI',        matches:['M102']},
  {title:'QUARTER',     matches:['M99','M100']},
  {title:'ROUND OF 16', matches:['M91','M92','M95','M96']},
  {title:'ROUND OF 32', matches:['M76','M78','M79','M80','M86','M88','M85','M87']},
];

export interface MatchResult {
  a: string | null;
  b: string | null;
  winner: string | null;
  loser: string | null;
}

export function isLeaf(ref: string): boolean {
  return ref.startsWith('g:') || ref.startsWith('w:');
}

export function poolFor(p: string): string[] {
  const letters = p.slice(1).split('');
  const out: string[] = [];
  letters.forEach(l => { (GROUPS[l] || []).forEach(c => out.push(c)); });
  return out;
}

export function slotLabel(p: string): string {
  const r = p[0], L = p.slice(1);
  if (r === '1') return 'Win · ' + L;
  if (r === '2') return '2nd · ' + L;
  return '3rd · ' + L;
}

export function computeKO(slots: Record<string,string>, picks: Record<string,string>): Record<string, MatchResult> {
  const res: Record<string, MatchResult> = {};
  const resolve = (ref: string): string | null => {
    const parts = ref.split(':');
    if (parts[0] === 'win') return res[parts[1]]?.winner ?? null;
    if (parts[0] === 'lose') return res[parts[1]]?.loser ?? null;
    return null;
  };
  for (const m of KO) {
    const a = isLeaf(m.a.r) ? (slots[m.id+'|a'] || null) : resolve(m.a.r);
    const b = isLeaf(m.b.r) ? (slots[m.id+'|b'] || null) : resolve(m.b.r);
    let w = picks[m.id] || null;
    if (w !== a && w !== b) w = null;
    const l = w ? (w === a ? b : a) : null;
    res[m.id] = { a, b, winner: w, loser: l };
  }
  return res;
}

export function prune(slots: Record<string,string>, picks: Record<string,string>): Record<string,string> {
  let p = { ...picks };
  for (let i = 0; i < 12; i++) {
    const res = computeKO(slots, p);
    let changed = false;
    for (const id in p) {
      if (p[id] && res[id] && res[id].winner !== p[id]) {
        delete p[id];
        changed = true;
      }
    }
    if (!changed) break;
  }
  return p;
}

export function fillRandom(): { slots: Record<string,string>; picks: Record<string,string> } {
  const slots: Record<string,string> = {};
  const used = new Set<string>();
  const leaves: Array<{key:string; p:string}> = [];
  KO.forEach(m => {
    if (isLeaf(m.a.r)) leaves.push({key: m.id+'|a', p: m.a.p});
    if (isLeaf(m.b.r)) leaves.push({key: m.id+'|b', p: m.b.p});
  });
  leaves.sort((x, y) => poolFor(x.p).length - poolFor(y.p).length);
  leaves.forEach(s => {
    let pool = poolFor(s.p).filter(c => !used.has(c));
    if (!pool.length) pool = poolFor(s.p);
    const c = pool[Math.floor(Math.random() * pool.length)];
    slots[s.key] = c;
    used.add(c);
  });
  const res: Record<string, MatchResult> = {};
  const picks: Record<string,string> = {};
  const resolve = (ref: string): string | null => {
    const parts = ref.split(':');
    if (parts[0] === 'win') return res[parts[1]]?.winner ?? null;
    if (parts[0] === 'lose') return res[parts[1]]?.loser ?? null;
    return null;
  };
  for (const m of KO) {
    const a = isLeaf(m.a.r) ? slots[m.id+'|a'] : resolve(m.a.r);
    const b = isLeaf(m.b.r) ? slots[m.id+'|b'] : resolve(m.b.r);
    if (a && b) {
      const w = Math.random() < 0.5 ? a : b;
      const l = w === a ? b : a;
      picks[m.id] = w;
      res[m.id] = { a, b, winner: w, loser: l };
    } else {
      res[m.id] = { a: a||null, b: b||null, winner: null, loser: null };
    }
  }
  return { slots, picks };
}
