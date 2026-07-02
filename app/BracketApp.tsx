'use client';

import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import {
  TEAMS, KO, KOby, LEFT_COLS, RIGHT_COLS,
  computeKO, prune, fillRandom, isLeaf, poolFor, slotLabel, winRowColors,
  type MatchResult,
} from './data';

const WIN_RING = 'inset 0 0 0 2px #14B87A';
const LOSE_RING = 'inset 0 0 0 2px #E5484D';

/* ─── Save-image export (self-contained, safe to remove) ──────── */
type ExportScope = 'all' | 'r16' | 'qf' | 'final';
const EXPORT_SCOPE_EXCLUDES: Record<ExportScope, string[]> = {
  all: [],
  r16: ['ROUND OF 32'],
  qf: ['ROUND OF 32', 'ROUND OF 16'],
  final: ['ROUND OF 32', 'ROUND OF 16', 'QUARTER', 'SEMI'],
};

/* ─── State ─────────────────────────────────────────────────── */
interface BracketState {
  slots: Record<string, string>;
  picks: Record<string, string>;
  email: string;
}

interface LockedState {
  slots: Record<string, string>;
  picks: Record<string, string>;
  dates: Record<string, string>;
}

// A friend's picks carried in the share-link URL params — the same params
// /api/share-image consumes, so a shared link doubles as a challenge link
// with zero backend.
interface FriendPicks {
  semis: [string, string, string, string]; // [semiLA, semiLB, semiRA, semiRB]
  champion: string | null;
}

function parseFriendFromUrl(): FriendPicks | null {
  if (typeof window === 'undefined') return null;
  try {
    const p = new URLSearchParams(window.location.search);
    const get = (k: string) => { const v = p.get(k); return v && TEAMS[v] ? v : null; };
    const semiLA = get('semiLA'), semiLB = get('semiLB'), semiRA = get('semiRA'), semiRB = get('semiRB');
    if (!semiLA || !semiLB || !semiRA || !semiRB) return null;
    if (new Set([semiLA, semiLB, semiRA, semiRB]).size !== 4) return null;
    return { semis: [semiLA, semiLB, semiRA, semiRB], champion: get('champion') };
  } catch { return null; }
}

// Compact local-time kickoff label, e.g. "Jun 27 · 3:00 PM" — falls back to
// nothing (not "Invalid Date") if the ISO string is missing or unparseable.
function formatKickoff(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${time}`;
}

// A match only counts as "anticipated" if the user actually recorded their
// own pick for it (state.picks, never overwritten by the real result) —
// slots inherited from a diverged earlier guess don't count.
function pickVerdict(matchId: string, userPicks: Record<string, string>, lockedPicks: Record<string, string>): 'correct' | 'wrong' | null {
  const real = lockedPicks[matchId];
  const mine = userPicks[matchId];
  if (!real || !mine) return null;
  return mine === real ? 'correct' : 'wrong';
}

function loadState(): BracketState {
  if (typeof window === 'undefined') return { slots: {}, picks: {}, email: '' };
  try {
    const s = JSON.parse(localStorage.getItem('wc26bracket2') || '{}');
    return { slots: s.slots || {}, picks: s.picks || {}, email: s.email || '' };
  } catch { return { slots: {}, picks: {}, email: '' }; }
}

function saveState(s: BracketState) {
  try { localStorage.setItem('wc26bracket2', JSON.stringify(s)); } catch {}
}

/* ─── Confetti ───────────────────────────────────────────────── */
const CONFETTI_COLORS = ['#FF5A3C','#2D6BFF','#14B87A','#FFC23C','#FF3D8B'];
const confettiPieces = Array.from({ length: 90 }, () => ({
  left: (Math.random() * 100).toFixed(2) + '%',
  width: (6 + Math.random() * 8).toFixed(0) + 'px',
  height: (9 + Math.random() * 11).toFixed(0) + 'px',
  background: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
  borderRadius: Math.random() < 0.5 ? '2px' : '50%',
  duration: (2.6 + Math.random() * 2.6).toFixed(2),
  delay: (Math.random() * 2.8).toFixed(2),
}));

/* ─── Helpers ────────────────────────────────────────────────── */
const team = (code: string) => {
  const t = TEAMS[code];
  return { code, name: t?.n ?? code, flag: t?.f ?? '' };
};

/* ─── Main component ─────────────────────────────────────────── */
export function BracketApp() {
  const [state, setStateRaw] = useState<BracketState>({ slots: {}, picks: {}, email: '' });
  const [locked, setLocked] = useState<LockedState>({ slots: {}, picks: {}, dates: {} });
  const [showChampion, setShowChampion] = useState(false);
  const [showSponsor, setShowSponsor]   = useState(false);
  const [sponsorDone, setSponsorDone]   = useState(false);
  const [sponsorSaving, setSponsorSaving] = useState(false);
  const [sponsorError, setSponsorError] = useState('');
  const [spCompany, setSpCompany]       = useState('');
  const [spName, setSpName]             = useState('');
  const [spEmail, setSpEmail]           = useState('');
  const [sponsors, setSponsors]         = useState<Sponsor[]>([]);
  const [emailDone, setEmailDone]       = useState(false);
  const [emailSaving, setEmailSaving]   = useState(false);
  const [emailError, setEmailError]     = useState('');
  const [showLoad, setShowLoad]         = useState(false);
  const [loadEmail, setLoadEmail]       = useState('');
  const [loadStatus, setLoadStatus]     = useState<'idle' | 'loading' | 'notfound' | 'error' | 'done'>('idle');
  const [shareNotice, setShareNotice]   = useState('');
  const [friend, setFriend]             = useState<FriendPicks | null>(null);
  const [challengeDismissed, setChallengeDismissed] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [savingImage, setSavingImage]   = useState(false);
  const [exportScope, setExportScope]   = useState<ExportScope>('all');
  const bracketRef = useRef<HTMLDivElement>(null);
  const bracketContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setStateRaw(loadState()); setFriend(parseFriendFromUrl()); }, []);
  useEffect(() => {
    fetch('/api/locked')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setLocked({ slots: data.slots || {}, picks: data.picks || {}, dates: data.dates || {} }); })
      .catch(() => {});
  }, []);
  useEffect(() => {
    fetch('/api/sponsors')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.sponsors) setSponsors(data.sponsors); })
      .catch(() => {});
  }, []);

  const commit = (patch: Partial<BracketState>) => {
    setStateRaw(prev => {
      const next = { ...prev, ...patch };
      saveState(next);
      return next;
    });
  };

  const { slots, picks, email } = state;
  const effSlots = { ...slots, ...locked.slots };
  const effPicks = { ...picks, ...locked.picks };
  const res = computeKO(effSlots, effPicks);
  const used = new Set(Object.values(effSlots));
  const made = Object.keys(effSlots).length + Object.keys(effPicks).length;
  const total = 64;
  const pct = Math.max(2, Math.round(made / total * 100));

  const champCode = res['M104']?.winner ?? null;
  const runCode   = res['M104']?.loser   ?? null;
  const thirdCode = res['M103']?.winner  ?? null;
  const champion  = champCode ? team(champCode) : null;
  // Share unlocks once the Final Four is known (own picks + already-locked
  // real results combined) rather than waiting for a full champion pick —
  // that's the point in the bracket where drop-off is highest but there's
  // already a shareable "who's in your final four" moment.
  const semisKnown = !!(res['M101']?.a && res['M101']?.b && res['M102']?.a && res['M102']?.b);
  const canShare  = semisKnown;
  // Which semifinal slots are already real (locked results resolved the same
  // way from locked-only data) vs. the user's own prediction — used to badge
  // 🔒 real teams vs. chosen ones in the champion modal's final-four card.
  const lockedOnlyRes = computeKO(locked.slots, locked.picks);
  const realSemis = new Set(
    [lockedOnlyRes['M101']?.a, lockedOnlyRes['M101']?.b, lockedOnlyRes['M102']?.a, lockedOnlyRes['M102']?.b]
      .filter((c): c is string => !!c)
  );

  const selectSlot = (key: string, code: string) => {
    if (locked.slots[key]) return;
    const newSlots = { ...slots };
    if (code) newSlots[key] = code; else delete newSlots[key];
    const mergedSlots = { ...newSlots, ...locked.slots };
    const prunedPicks = prune(mergedSlots, { ...picks, ...locked.picks });
    for (const id of Object.keys(locked.picks)) delete prunedPicks[id];
    commit({ slots: newSlots, picks: prunedPicks });
  };
  const clearSlot = (key: string) => {
    if (locked.slots[key]) return;
    const newSlots = { ...slots }; delete newSlots[key];
    const mergedSlots = { ...newSlots, ...locked.slots };
    const prunedPicks = prune(mergedSlots, { ...picks, ...locked.picks });
    for (const id of Object.keys(locked.picks)) delete prunedPicks[id];
    commit({ slots: newSlots, picks: prunedPicks });
  };
  const pick = (id: string, code: string) => {
    if (locked.picks[id]) return;
    const mergedSlots = { ...slots, ...locked.slots };
    const newPicks = prune(mergedSlots, { ...picks, ...locked.picks, [id]: code });
    for (const lid of Object.keys(locked.picks)) delete newPicks[lid];
    const isChamp = id === 'M104' && newPicks['M104'] === code;
    commit({ picks: newPicks });
    if (isChamp) setShowChampion(true);
  };
  const doReset = () => {
    commit({ slots: {}, picks: {} });
    setShowChampion(false);
    setEmailDone(false);
  };
  const doAutofill = () => {
    const r = fillRandom();
    for (const key of Object.keys(locked.slots)) delete r.slots[key];
    for (const id of Object.keys(locked.picks)) delete r.picks[id];
    commit(r);
    setShowChampion(true);
    setEmailDone(false);
  };

  const scrollToBracket = () => {
    const el = bracketRef.current;
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 58;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const share = async (net: string) => {
    const rSemiL = res['M101'];
    const rSemiR = res['M102'];
    const hasFullCard = !!(champCode && rSemiL?.a && rSemiL?.b && rSemiL?.winner && rSemiR?.a && rSemiR?.b && rSemiR?.winner);

    let text: string;
    if (champion) {
      text = `My 2026 World Cup champion: ${champion.name}! 🏆 Think you can beat my bracket? #PickTheCup`;
    } else if (semisKnown) {
      // Split the 4 semifinalists into "already real" (resolved the same way
      // from locked-only data) vs. "my own pick" so the text stays honest
      // about what's actually the user's prediction vs. what's already fact.
      const lockedRes = computeKO(locked.slots, locked.picks);
      const semiCodes = [rSemiL!.a!, rSemiL!.b!, rSemiR!.a!, rSemiR!.b!];
      const isLockedReal = (id: string, side: 'a' | 'b', code: string) => lockedRes[id]?.[side] === code;
      const realNames = [
        isLockedReal('M101', 'a', rSemiL!.a!), isLockedReal('M101', 'b', rSemiL!.b!),
        isLockedReal('M102', 'a', rSemiR!.a!), isLockedReal('M102', 'b', rSemiR!.b!),
      ].map((real, i) => real ? team(semiCodes[i]).name : null).filter((n): n is string => !!n);
      const pickNames = semiCodes.map(c => team(c).name).filter(n => !realNames.includes(n));
      if (realNames.length === 4) {
        text = `World Cup 2026 final four is set: ${realNames.join(', ')} 🔥 Pick who wins it #PickTheCup`;
      } else if (pickNames.length === 4) {
        text = `My 2026 World Cup final four: ${pickNames.join(' · ')} 🔥 Who's in yours? #PickTheCup`;
      } else {
        text = `World Cup 2026: ${realNames.join(' & ')} are through — I've got ${pickNames.join(' & ')} joining them 🔥 Pick yours #PickTheCup`;
      }
    } else {
      text = 'My 2026 World Cup bracket! 🏆 #PickTheCup';
    }
    const baseUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0].split('?')[0] : 'https://pick-the-cup.vercel.app';

    // Personalized share image: /api/share-image renders the full "road to
    // the title" card (semi-finalists, finalists, champion) once there's a
    // champion, or a "final four" card once just the 4 semifinalists are
    // known — matches the in-app champion modal. Cache-bust too, so X/Threads
    // always do a fresh og:image scrape.
    const params = new URLSearchParams({ share: Date.now().toString(36) });
    if (hasFullCard) {
      params.set('semiLA', rSemiL!.a!);
      params.set('semiLB', rSemiL!.b!);
      params.set('semiLW', rSemiL!.winner!);
      params.set('semiRA', rSemiR!.a!);
      params.set('semiRB', rSemiR!.b!);
      params.set('semiRW', rSemiR!.winner!);
      params.set('champion', champCode!);
    } else if (semisKnown) {
      params.set('semiLA', rSemiL!.a!);
      params.set('semiLB', rSemiL!.b!);
      params.set('semiRA', rSemiR!.a!);
      params.set('semiRB', rSemiR!.b!);
    }
    const url = `${baseUrl}?${params.toString()}`;

    /* Instagram disabled for now — not working.
    if (net === 'instagram') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          const imgRes = await fetch(shareImageUrl);
          const blob = await imgRes.blob();
          const file = new File([blob], 'pick-the-cup.png', { type: blob.type || 'image/png' });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ title: 'Pick The Cup', text, files: [file] });
            return;
          }
        } catch {}
        try { await navigator.share({ title: 'Pick The Cup', text, url }); return; } catch {}
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(`${text} ${url}`);
          setShareNotice('Link copied — paste it into your Instagram post!');
        } catch {
          setShareNotice(`Copy this link to share: ${url}`);
        }
      }
      return;
    }
    */

    setShareNotice('');
    if (net === 'copy') {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setShareNotice('Link copied — send it to a friend and dare them to beat you!');
      } catch {
        setShareNotice(`Copy this link: ${url}`);
      }
      return;
    }
    const enc = encodeURIComponent(text);
    let href = '';
    // X's web intent unfurls og:image automatically from the shared URL.
    if (net === 'x')            href = `https://twitter.com/intent/tweet?text=${enc}&url=${encodeURIComponent(url)}`;
    // Threads' intent only takes one `text` param, so fold the link in —
    // it still unfurls the og:image once posted.
    else if (net === 'threads') href = `https://www.threads.net/intent/post?text=${encodeURIComponent(text + ' ' + url)}`;
    // WhatsApp/Telegram: where friend-to-friend challenges actually happen —
    // both unfurl the og:image from the link.
    else if (net === 'whatsapp') href = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    else if (net === 'telegram') href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${enc}`;
    /* Facebook disabled for now — not working.
    else if (net === 'facebook') href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${enc}`;
    */
    try { window.open(href, '_blank', 'noopener'); } catch {}
  };

  const submitSponsor = async () => {
    if (!spCompany || !spName || !spEmail.includes('@')) return;
    setSponsorSaving(true);
    setSponsorError('');
    try {
      const r = await fetch('/api/sponsor-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: spCompany, name: spName, email: spEmail }),
      });
      if (!r.ok) throw new Error('inquiry failed');
      setSponsorDone(true);
    } catch {
      setSponsorError('Could not submit — try again.');
    } finally {
      setSponsorSaving(false);
    }
  };
  const submitEmail = async () => {
    if (!email.includes('@')) return;
    setEmailSaving(true);
    setEmailError('');
    try {
      const r = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, slots, picks }),
      });
      if (!r.ok) throw new Error('save failed');
      setEmailDone(true);
    } catch {
      setEmailError('Could not save — try again.');
    } finally {
      setEmailSaving(false);
    }
  };

  const doLoad = async () => {
    if (!loadEmail.includes('@')) return;
    setLoadStatus('loading');
    try {
      const r = await fetch('/api/predictions?email=' + encodeURIComponent(loadEmail));
      const data = await r.json();
      if (!r.ok) throw new Error('load failed');
      if (!data.found) { setLoadStatus('notfound'); return; }
      commit({ slots: data.slots || {}, picks: data.picks || {}, email: loadEmail });
      setLoadStatus('done');
    } catch {
      setLoadStatus('error');
    }
  };

  // Save-image export: temporarily narrows which columns render (via
  // exportScope), waits a couple of frames for the DOM to repaint, screenshots
  // the bracket content node, then restores the full view. Self-contained —
  // safe to delete this function + its state/UI wiring without touching
  // anything else.
  const doSaveImage = async (scope: ExportScope) => {
    setShowSaveMenu(false);
    setSavingImage(true);
    setExportScope(scope);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    try {
      const node = bracketContentRef.current;
      if (node) {
        const dataUrl = await toPng(node, { backgroundColor: '#FFFDF5', pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `pick-the-cup-bracket-${scope}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch {
      // best-effort export; no dedicated error UI for this nice-to-have
    } finally {
      setExportScope('all');
      setSavingImage(false);
    }
  };
  const visibleLeftCols = LEFT_COLS.filter(c => !EXPORT_SCOPE_EXCLUDES[exportScope].includes(c.title));
  const visibleRightCols = RIGHT_COLS.filter(c => !EXPORT_SCOPE_EXCLUDES[exportScope].includes(c.title));

  return (
    <div style={{ minHeight: '100vh', background: '#FFFDF5', fontFamily: "var(--font-archivo), sans-serif", color: '#161616' }}>
      <Hero onBuild={scrollToBracket} onSurprise={doAutofill} />
      <StickyHeader
        pct={pct} made={made} total={total}
        canShare={canShare}
        onReset={doReset} onAutofill={doAutofill}
        onShare={() => canShare && setShowChampion(true)}
        onLoad={() => { setShowLoad(true); setLoadStatus('idle'); }}
        onSaveImage={() => setShowSaveMenu(true)}
      />
      <InstructionBand />
      {friend && !challengeDismissed && (
        <ChallengeBanner friend={friend} onBuild={scrollToBracket} onDismiss={() => setChallengeDismissed(true)} />
      )}

      {/* BRACKET */}
      <div ref={bracketRef} id="bracket" style={{ overflowX: 'auto', padding: '16px 20px 44px', display: 'flex', justifyContent: 'safe center' }}>
        <div ref={bracketContentRef} style={{ display: 'flex', gap: 8, alignItems: 'stretch', minWidth: exportScope === 'all' ? 1660 : undefined, height: exportScope === 'all' ? 880 : undefined, flex: 'none', width: 'max-content' }}>
          {/* Left side */}
          {visibleLeftCols.map((col, ci) => (
            <BracketColumn
              key={col.title + ci}
              title={col.title}
              matchIds={col.matches}
              res={res} slots={effSlots} used={used}
              lockedSlots={locked.slots} lockedPicks={locked.picks}
              userPicks={picks} dates={locked.dates}
              side="left" colIdx={ci} colCount={visibleLeftCols.length}
              isFinal={false}
              onPick={pick} onSelect={selectSlot} onClear={clearSlot}
            />
          ))}

          {/* Center: Final + 3rd */}
          <CenterColumn
            res={res} used={used}
            lockedPicks={locked.picks}
            userPicks={picks} dates={locked.dates}
            onPick={pick}
          />

          {/* Right side */}
          {visibleRightCols.map((col, ci) => (
            <BracketColumn
              key={col.title + ci}
              title={col.title}
              matchIds={col.matches}
              res={res} slots={effSlots} used={used}
              lockedSlots={locked.slots} lockedPicks={locked.picks}
              userPicks={picks} dates={locked.dates}
              side="right" colIdx={ci} colCount={visibleRightCols.length}
              isFinal={false}
              onPick={pick} onSelect={selectSlot} onClear={clearSlot}
            />
          ))}
        </div>
      </div>

      <SponsorStrip sponsors={sponsors} onOpenSponsor={() => { setShowSponsor(true); setSponsorDone(false); }} />
      <Footer />

      {/* Modals */}
      {showSponsor && (
        <SponsorModal
          done={sponsorDone} saving={sponsorSaving} error={sponsorError} onClose={() => setShowSponsor(false)}
          company={spCompany} name={spName} email={spEmail}
          onCompany={setSpCompany} onName={setSpName} onEmail={setSpEmail}
          onSubmit={submitSponsor}
        />
      )}
      {showChampion && (
        <ChampionModal
          res={res} champion={champion}
          friend={friend} realSemis={realSemis}
          emailDone={emailDone} emailSaving={emailSaving} emailError={emailError} email={email}
          onEmailChange={e => commit({ email: e.target.value })}
          onEmailSubmit={submitEmail}
          onClose={() => setShowChampion(false)}
          onShare={share}
          shareNotice={shareNotice}
        />
      )}
      {showLoad && (
        <LoadModal
          loadEmail={loadEmail} status={loadStatus}
          onEmailChange={setLoadEmail}
          onLoad={doLoad}
          onClose={() => setShowLoad(false)}
        />
      )}
      {showSaveMenu && (
        <SaveImageModal
          saving={savingImage}
          onSave={doSaveImage}
          onClose={() => setShowSaveMenu(false)}
        />
      )}
    </div>
  );
}

/* ─── Hero ───────────────────────────────────────────────────── */
function Hero({ onBuild, onSurprise }: { onBuild: () => void; onSurprise: () => void }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: '#FFFDF5', borderBottom: '3px solid #161616' }}>
      <div style={{ position:'absolute', top:42, left:'14%', width:13, height:13, borderRadius:3, background:'#FFC23C', border:'2px solid #161616' }} className="anim-float-1" />
      <div style={{ position:'absolute', top:90, left:'23%', width:11, height:11, borderRadius:'50%', background:'#FF3D8B' }} className="anim-float-2" />
      <div style={{ position:'absolute', top:60, right:'16%', width:15, height:9, borderRadius:2, background:'#14B87A', border:'2px solid #161616' }} className="anim-float-3" />
      <div style={{ position:'absolute', top:120, right:'24%', width:10, height:10, borderRadius:'50%', background:'#2D6BFF' }} className="anim-float-4" />
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '42px 20px 46px', textAlign: 'center', position: 'relative' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#161616', color:'#fff', borderRadius:999, padding:'7px 15px', fontFamily:"var(--font-space-mono), monospace", fontSize:11, letterSpacing:'.08em' }}>
          <span style={{ fontSize:14 }}>🏆</span> FIFA WORLD CUP 2026 · 48 NATIONS
        </div>
        <h1 style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:'clamp(36px,6.4vw,64px)', lineHeight:.96, margin:'18px 0 0', letterSpacing:'-.015em' }}>
          Predict the entire<br />World Cup.
        </h1>
        <p style={{ maxWidth:540, margin:'18px auto 0', fontSize:16.5, lineHeight:1.55, color:'#56524b' }}>
          Call every knockout match from the Round of 32 to the final whistle. Crown your champion, then dare your friends to beat your bracket.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginTop:28 }}>
          <button onClick={onBuild} style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:16, color:'#fff', background:'#FF3D8B', border:'3px solid #161616', borderRadius:14, padding:'15px 26px', cursor:'pointer', boxShadow:'4px 4px 0 #161616' }}>
            ⚽ Build my bracket →
          </button>
          {/* "Surprise me" hidden for now — irrelevant while real results are locked in
          <button onClick={onSurprise} style={{ fontFamily:"var(--font-archivo), sans-serif", fontWeight:800, fontSize:16, color:'#161616', background:'#fff', border:'3px solid #161616', borderRadius:14, padding:'15px 24px', cursor:'pointer', boxShadow:'4px 4px 0 #FFC23C' }}>
            🎲 Surprise me
          </button>
          */}
        </div>
        <div style={{ display:'flex', gap:18, justifyContent:'center', flexWrap:'wrap', marginTop:22, fontFamily:"var(--font-space-mono), monospace", fontSize:12, color:'#9b978f' }}>
          <span>✓ Free &amp; instant</span><span>✓ No signup to play</span><span>✓ 64 picks to glory</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Sticky Header ──────────────────────────────────────────── */
function StickyHeader({ pct, made, total, canShare, onReset, onAutofill, onShare, onLoad, onSaveImage }: {
  pct: number; made: number; total: number; canShare: boolean;
  onReset: () => void; onAutofill: () => void; onShare: () => void; onLoad: () => void; onSaveImage: () => void;
}) {
  return (
    <div style={{ position:'sticky', top:0, zIndex:30, background:'#2D6BFF', borderBottom:'3px solid #161616', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:8, left:'38%', width:9, height:9, borderRadius:2, background:'#FFC23C' }} className="anim-float-1" />
      <div style={{ position:'absolute', top:26, left:'55%', width:7, height:7, borderRadius:'50%', background:'#FF3D8B' }} className="anim-float-2" />
      <div style={{ position:'absolute', top:14, left:'72%', width:11, height:6, borderRadius:2, background:'#14B87A' }} className="anim-float-3" />
      <div style={{ maxWidth:1320, margin:'0 auto', padding:'13px 20px', display:'flex', flexWrap:'wrap', alignItems:'center', gap:16, position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:'#FFC23C', border:'2.5px solid #161616', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:'2px 2px 0 #161616' }}>🏆</div>
          <div>
            <div style={{ fontFamily:"var(--font-archivo-black), sans-serif", color:'#fff', fontSize:19, lineHeight:.95, letterSpacing:'-.01em' }}>PICK THE CUP</div>
            <div style={{ fontFamily:"var(--font-space-mono), monospace", color:'#cfe0ff', fontSize:10, letterSpacing:'.08em', marginTop:2 }}>WORLD CUP 2026 · KNOCKOUT BRACKET</div>
          </div>
        </div>
        <div style={{ flex:1, minWidth:180 }}>
          <div style={{ background:'rgba(255,255,255,.2)', border:'2px solid #161616', borderRadius:999, height:15, overflow:'hidden' }}>
            <div style={{ height:'100%', background:'#FFC23C', borderRadius:999, transition:'width .4s ease', width: pct + '%' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:5, fontFamily:"var(--font-space-mono), monospace", fontSize:10.5, color:'#dce7ff' }}>
            <span>YOUR BRACKET</span>
            <span style={{ color:'#fff', fontWeight:700 }}>{made} / {total} PICKS</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button onClick={onLoad} style={{ fontFamily:"var(--font-archivo), sans-serif", fontWeight:800, fontSize:12, color:'#161616', background:'#fff', border:'2.5px solid #161616', borderRadius:11, padding:'9px 13px', cursor:'pointer', boxShadow:'2px 2px 0 #161616' }}>📥 Load</button>
          <button onClick={onSaveImage} style={{ fontFamily:"var(--font-archivo), sans-serif", fontWeight:800, fontSize:12, color:'#161616', background:'#fff', border:'2.5px solid #161616', borderRadius:11, padding:'9px 13px', cursor:'pointer', boxShadow:'2px 2px 0 #161616' }}>💾 Save</button>
          <button onClick={onReset} style={{ fontFamily:"var(--font-archivo), sans-serif", fontWeight:800, fontSize:12, color:'#161616', background:'#fff', border:'2.5px solid #161616', borderRadius:11, padding:'9px 13px', cursor:'pointer', boxShadow:'2px 2px 0 #161616' }}>Reset</button>
          {/* "Surprise me" hidden for now — irrelevant while real results are locked in
          <button onClick={onAutofill} style={{ fontFamily:"var(--font-archivo), sans-serif", fontWeight:800, fontSize:12, color:'#161616', background:'#FF3D8B', border:'2.5px solid #161616', borderRadius:11, padding:'9px 13px', cursor:'pointer', boxShadow:'2px 2px 0 #161616' }}>🎲 Surprise me</button>
          */}
          <button onClick={onShare} style={{ fontFamily:"var(--font-archivo), sans-serif", fontWeight:800, fontSize:12, color: canShare ? '#161616' : '#9b978f', background: canShare ? '#FFC23C' : '#efece4', border: `2.5px solid ${canShare ? '#161616' : '#c8c4ba'}`, borderRadius:11, padding:'9px 13px', cursor: canShare ? 'pointer' : 'not-allowed', boxShadow: canShare ? '2px 2px 0 #161616' : 'none' }}>
            {canShare ? '📲 Share' : '🔒 Share'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Instruction Band ───────────────────────────────────────── */
function InstructionBand() {
  return (
    <div style={{ background:'#fff', borderBottom:'3px solid #161616' }}>
      <div style={{ maxWidth:1320, margin:'0 auto', padding:'14px 20px', display:'flex', flexWrap:'wrap', alignItems:'center', gap:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:24, height:24, borderRadius:'50%', background:'#2D6BFF', color:'#fff', fontFamily:"var(--font-archivo-black), sans-serif", fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #161616' }}>1</div>
          <div style={{ fontSize:13.5, color:'#56524b', lineHeight:1.4 }}><b style={{ color:'#161616' }}>Fill the Round of 32</b> — pick who comes out of each group from the dropdowns.</div>
        </div>
        <div style={{ width:1, height:26, background:'#e0ddd3' }} />
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:24, height:24, borderRadius:'50%', background:'#14B87A', color:'#fff', fontFamily:"var(--font-archivo-black), sans-serif", fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #161616' }}>2</div>
          <div style={{ fontSize:13.5, color:'#56524b', lineHeight:1.4 }}><b style={{ color:'#161616' }}>Tap a team</b> to send them through. Winner advances, loser drops out — all the way to the Final. 👉</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Bracket Column ─────────────────────────────────────────── */
function BracketColumn({ title, matchIds, res, slots, used, lockedSlots, lockedPicks, userPicks, dates, side, colIdx, colCount, isFinal, onPick, onSelect, onClear }: {
  title: string; matchIds: string[];
  res: Record<string, MatchResult>; slots: Record<string, string>; used: Set<string>;
  lockedSlots: Record<string, string>; lockedPicks: Record<string, string>;
  userPicks: Record<string, string>; dates: Record<string, string>;
  side: 'left' | 'right'; colIdx: number; colCount: number; isFinal: boolean;
  onPick: (id: string, code: string) => void;
  onSelect: (key: string, code: string) => void;
  onClear: (key: string) => void;
}) {
  return (
    <div style={{ display:'flex', flexDirection:'column', flex:'none', width:156 }}>
      <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:10, color:'#9b978f', textAlign:'center', letterSpacing:'.06em', marginBottom:4, height:14 }}>{title}</div>
      <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
        {matchIds.map((id, p) => {
          const m = KOby[id];
          const mr = res[id];
          // connector logic
          const BK = '#161616';
          const conns: React.CSSProperties[] = [];
          if (side === 'left') {
            conns.push({ position:'absolute', top:'50%', right:-7, width:11, height:2, background:BK, transform:'translateY(-50%)' });
            if (colIdx > 0) conns.push({ position:'absolute', top:'50%', left:-7, width:11, height:2, background:BK, transform:'translateY(-50%)' });
            if (p < matchIds.length - 1 && p % 2 === 0) conns.push({ position:'absolute', top:'50%', right:-7, width:2, height:'100%', background:BK });
          } else {
            conns.push({ position:'absolute', top:'50%', left:-7, width:11, height:2, background:BK, transform:'translateY(-50%)' });
            if (colIdx < colCount - 1) conns.push({ position:'absolute', top:'50%', right:-7, width:11, height:2, background:BK, transform:'translateY(-50%)' });
            if (p < matchIds.length - 1 && p % 2 === 0) conns.push({ position:'absolute', top:'50%', left:-7, width:2, height:'100%', background:BK });
          }
          const verdict = pickVerdict(id, userPicks, lockedPicks);
          const cardBorder = verdict === 'correct' ? '#14B87A' : verdict === 'wrong' ? '#E5484D' : '#161616';
          const kickoff = formatKickoff(dates[id]);
          return (
            <div key={id} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              {conns.map((c, i) => <div key={i} style={c} />)}
              <div style={{ width:148 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontFamily:"var(--font-space-mono), monospace", fontSize:8.5, color:'#c3bfb5', paddingLeft:3, marginBottom:2 }}>
                  <span>{id}</span>
                  {kickoff && <span>{kickoff}</span>}
                </div>
                <div style={{ border:`2.5px solid ${cardBorder}`, borderRadius:12, background:'#fff', boxShadow:`3px 3px 0 ${cardBorder}`, overflow:'hidden' }}>
                  <MatchSlot matchId={id} side="a" slot={m.a} mr={mr} slots={slots} used={used} lockedSlots={lockedSlots} lockedPicks={lockedPicks} isFinal={isFinal} onPick={onPick} onSelect={onSelect} onClear={onClear} />
                  <div style={{ height:2, background:'#161616' }} />
                  <MatchSlot matchId={id} side="b" slot={m.b} mr={mr} slots={slots} used={used} lockedSlots={lockedSlots} lockedPicks={lockedPicks} isFinal={isFinal} onPick={onPick} onSelect={onSelect} onClear={onClear} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Match Slot ─────────────────────────────────────────────── */
function MatchSlot({ matchId, side, slot, mr, slots, used, lockedSlots, lockedPicks, isFinal, onPick, onSelect, onClear }: {
  matchId: string; side: 'a' | 'b';
  slot: { r: string; p: string };
  mr: MatchResult; slots: Record<string, string>; used: Set<string>;
  lockedSlots: Record<string, string>; lockedPicks: Record<string, string>; isFinal: boolean;
  onPick: (id: string, code: string) => void;
  onSelect: (key: string, code: string) => void;
  onClear: (key: string) => void;
}) {
  const key = matchId + '|' + side;
  const code = mr[side];
  const leaf = isLeaf(slot.r);
  const isLockedLeaf = leaf && !!lockedSlots[key];
  const isLockedPick = !!lockedPicks[matchId];
  const isLocked = isLockedLeaf || isLockedPick;

  if (leaf && !code) {
    const pool = poolFor(slot.p).filter(c => !used.has(c));
    const opts = pool.map(c => { const t = team(c); return { code: c, label: t.flag + ' ' + t.name }; });
    return (
      <select
        value=""
        onChange={e => onSelect(key, e.target.value)}
        style={{ width:'100%', fontFamily:"var(--font-archivo), sans-serif", fontWeight:700, fontSize: isFinal ? 13 : 10.5, padding: isFinal ? '12px 18px 12px 10px' : '8px 16px 8px 7px', border:'none', background:'#FBFAF6', color:'#8a857c', cursor:'pointer', outline:'none' }}
      >
        <option value="">{slotLabel(slot.p)}</option>
        {opts.map(o => <option key={o.code} value={o.code}>{o.label}</option>)}
      </select>
    );
  }

  const resolved = !!code;
  const isWin  = !!(mr.winner && code && code === mr.winner);
  const isLose = !!(mr.winner && resolved && code !== mr.winner);
  const t = resolved ? team(code!) : null;
  const bothFilled = !!(mr.a && mr.b);
  const txt  = resolved ? (isFinal ? t!.name : t!.code) : slot.p;
  const flag = resolved ? t!.flag : '';
  const editable = leaf && resolved && !isLockedLeaf;
  const clickable = resolved && bothFilled && !isLockedPick;

  let rowStyle: React.CSSProperties = { display:'flex', alignItems:'center', gap:6, padding: isFinal ? '13px 14px' : '8px 8px', cursor: clickable ? 'pointer' : 'default', fontFamily:"var(--font-archivo), sans-serif", lineHeight:1, transition:'background .15s' };
  if (isWin) {
    const wc = winRowColors(code!);
    rowStyle = { ...rowStyle, background: wc.background, color: wc.color, textShadow: wc.textShadow, fontWeight:900, boxShadow: isFinal ? `${WIN_RING}, inset 0 0 0 4px #FFC23C` : WIN_RING };
  }
  else if (isLose)       rowStyle = { ...rowStyle, background:'#fff', color:'#161616', fontWeight:800, opacity:.4, textDecoration:'line-through', boxShadow: LOSE_RING };
  else if (resolved)     rowStyle = { ...rowStyle, background:'#fff', color:'#161616', fontWeight:800 };
  else                   rowStyle = { ...rowStyle, background:'#fbfaf6', color:'#bdb8ae', fontWeight:700, fontStyle:'italic' };

  return (
    <div onClick={clickable ? () => onPick(matchId, code!) : undefined} style={rowStyle} title={isLocked ? 'Actual result' : undefined}>
      <span style={{ fontSize: isFinal ? 22 : 15, flex:'none', width: isFinal ? 'auto' : 17 }}>{flag}</span>
      <span style={{ flex:1, fontSize: isFinal ? 15 : 12, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{txt}</span>
      {isWin && <span style={{ flex:'none', fontSize:12, fontWeight:900 }}>✓</span>}
      {isLocked && <span style={{ flex:'none', fontSize:10, opacity:.75 }}>🔒</span>}
      {editable && (
        <button
          onClick={e => { e.stopPropagation(); onClear(key); }}
          style={{ flex:'none', width:17, height:17, border:'1.5px solid #161616', borderRadius:5, background:'#fff', cursor:'pointer', fontSize:8, padding:0 }}
        >✎</button>
      )}
    </div>
  );
}

/* ─── Center Column (Final + 3rd) ────────────────────────────── */
function CenterColumn({ res, used, lockedPicks, userPicks, dates, onPick }: {
  res: Record<string, MatchResult>; used: Set<string>;
  lockedPicks: Record<string, string>;
  userPicks: Record<string, string>; dates: Record<string, string>;
  onPick: (id: string, code: string) => void;
}) {
  const finalRes = res['M104'];
  const thirdRes = res['M103'];
  const finalM   = KOby['M104'];
  const thirdM   = KOby['M103'];
  const finalLocked = !!lockedPicks['M104'];
  const thirdLocked = !!lockedPicks['M103'];
  const finalVerdict = pickVerdict('M104', userPicks, lockedPicks);
  const thirdVerdict = pickVerdict('M103', userPicks, lockedPicks);
  const finalBorder = finalVerdict === 'correct' ? '#14B87A' : finalVerdict === 'wrong' ? '#E5484D' : '#161616';
  const thirdBorder = thirdVerdict === 'correct' ? '#14B87A' : thirdVerdict === 'wrong' ? '#E5484D' : '#161616';
  const finalKickoff = formatKickoff(dates['M104']);
  const thirdKickoff = formatKickoff(dates['M103']);

  const FinalSlot = ({ side }: { side: 'a' | 'b' }) => {
    const code = finalRes?.[side] ?? null;
    const isWin  = !!(finalRes?.winner && code && code === finalRes.winner);
    const isLose = !!(finalRes?.winner && code && code !== finalRes.winner);
    const t = code ? team(code) : null;
    const both = !!(finalRes?.a && finalRes?.b);
    const clickable = !!(code && both && !finalLocked);
    let rowStyle: React.CSSProperties = { display:'flex', alignItems:'center', gap:6, padding:'13px 14px', cursor: clickable ? 'pointer' : 'default', fontFamily:"var(--font-archivo), sans-serif", lineHeight:1, transition:'background .15s' };
    if (isWin) {
      const wc = winRowColors(code!);
      rowStyle = { ...rowStyle, background: wc.background, color: wc.color, textShadow: wc.textShadow, fontWeight:900, boxShadow:`${WIN_RING}, inset 0 0 0 4px #FFC23C` };
    }
    else if (isLose) rowStyle = { ...rowStyle, background:'#fff', color:'#161616', fontWeight:800, opacity:.4, textDecoration:'line-through', boxShadow: LOSE_RING };
    else if (code) rowStyle = { ...rowStyle, background:'#fff', color:'#161616', fontWeight:800 };
    else rowStyle = { ...rowStyle, background:'#fbfaf6', color:'#bdb8ae', fontWeight:700, fontStyle:'italic' };
    return (
      <div onClick={clickable ? () => onPick('M104', code!) : undefined} style={rowStyle} title={finalLocked ? 'Actual result' : undefined}>
        <span style={{ fontSize:22, flex:'none' }}>{t?.flag ?? ''}</span>
        <span style={{ flex:1, fontSize:15, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t?.name ?? finalM[side].p}</span>
        {isWin && <span style={{ flex:'none', fontSize:15, fontWeight:900 }}>✓</span>}
        {finalLocked && <span style={{ flex:'none', fontSize:13, opacity:.75 }}>🔒</span>}
      </div>
    );
  };

  const ThirdSlot = ({ side }: { side: 'a' | 'b' }) => {
    const code = thirdRes?.[side] ?? null;
    const isWin  = !!(thirdRes?.winner && code && code === thirdRes.winner);
    const isLose = !!(thirdRes?.winner && code && code !== thirdRes.winner);
    const t = code ? team(code) : null;
    const both = !!(thirdRes?.a && thirdRes?.b);
    const clickable = !!(code && both && !thirdLocked);
    let rowStyle: React.CSSProperties = { display:'flex', alignItems:'center', gap:6, padding:'8px 8px', cursor: clickable ? 'pointer' : 'default', fontFamily:"var(--font-archivo), sans-serif", lineHeight:1, transition:'background .15s' };
    if (isWin) {
      const wc = winRowColors(code!);
      rowStyle = { ...rowStyle, background: wc.background, color: wc.color, textShadow: wc.textShadow, fontWeight:900, boxShadow: WIN_RING };
    }
    else if (isLose) rowStyle = { ...rowStyle, background:'#fff', color:'#161616', fontWeight:800, opacity:.4, textDecoration:'line-through', boxShadow: LOSE_RING };
    else if (code) rowStyle = { ...rowStyle, background:'#fff', color:'#161616', fontWeight:800 };
    else rowStyle = { ...rowStyle, background:'#fbfaf6', color:'#bdb8ae', fontWeight:700, fontStyle:'italic' };
    return (
      <div onClick={clickable ? () => onPick('M103', code!) : undefined} style={rowStyle} title={thirdLocked ? 'Actual result' : undefined}>
        <span style={{ fontSize:15, flex:'none', width:17 }}>{t?.flag ?? ''}</span>
        <span style={{ flex:1, fontSize:12, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t?.name ?? (side === 'a' ? thirdM.a.p : thirdM.b.p)}</span>
        {isWin && <span style={{ flex:'none', fontSize:11, fontWeight:900 }}>✓</span>}
        {thirdLocked && <span style={{ flex:'none', fontSize:10, opacity:.75 }}>🔒</span>}
      </div>
    );
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:'none', width:236, justifyContent:'center', gap:18, padding:'0 6px' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:13, color:'#FF3D8B', letterSpacing:'.08em' }}>🏆 THE FINAL</div>
        <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:9, color:'#9b978f', marginTop:2 }}>M104 · {finalKickoff || '07/19/2026'}</div>
      </div>
      <div style={{ border:`3px solid ${finalBorder}`, borderRadius:16, background:'linear-gradient(160deg,#FFF6E2,#fff)', boxShadow:`5px 5px 0 ${finalBorder}`, overflow:'hidden' }}>
        <FinalSlot side="a" />
        <div style={{ height:2.5, background:'#161616' }} />
        <FinalSlot side="b" />
      </div>
      <div style={{ marginTop:8, textAlign:'center' }}>
        <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:9, color:'#9b978f', marginBottom:4 }}>3RD PLACE · M103{thirdKickoff ? ` · ${thirdKickoff}` : ''}</div>
        <div style={{ border:`2px solid ${thirdBorder}`, borderRadius:11, background:'#fff', boxShadow:`2px 2px 0 ${thirdBorder}`, overflow:'hidden' }}>
          <ThirdSlot side="a" />
          <div style={{ height:1.5, background:'#161616' }} />
          <ThirdSlot side="b" />
        </div>
      </div>
    </div>
  );
}

/* ─── Challenge Banner ───────────────────────────────────────── */
function ChallengeBanner({ friend, onBuild, onDismiss }: {
  friend: FriendPicks;
  onBuild: () => void;
  onDismiss: () => void;
}) {
  const champ = friend.champion ? team(friend.champion) : null;
  return (
    <div style={{ background:'#FF3D8B', borderBottom:'3px solid #161616' }}>
      <div style={{ maxWidth:1320, margin:'0 auto', padding:'16px 20px', display:'flex', flexWrap:'wrap', alignItems:'center', gap:14, position:'relative' }}>
        <div style={{ flex:'1 1 260px', minWidth:220 }}>
          <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:10, letterSpacing:'.12em', color:'#ffd6e8' }}>⚔️ YOU&apos;VE BEEN CHALLENGED</div>
          <div style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:19, color:'#fff', marginTop:3, lineHeight:1.1 }}>
            {champ
              ? <>A friend says {champ.flag} {champ.name} takes the cup. Prove them wrong 👇</>
              : <>A friend called their Final Four. Think you know better? 👇</>}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
          {friend.semis.map(c => {
            const t = team(c);
            const isChamp = c === friend.champion;
            return (
              <div key={c} style={{ display:'flex', alignItems:'center', gap:5, background: isChamp ? 'linear-gradient(135deg,#FFD23C,#FFB01F)' : '#fff', border:'2.5px solid #161616', borderRadius:10, padding:'6px 10px', boxShadow:'2px 2px 0 #161616' }}>
                <span style={{ fontSize:16 }}>{t.flag}</span>
                <span style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:12, color:'#161616' }}>{t.code}</span>
                {isChamp && <span style={{ fontSize:12 }}>👑</span>}
              </div>
            );
          })}
        </div>
        <button onClick={onBuild} style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:14, color:'#161616', background:'#FFC23C', border:'2.5px solid #161616', borderRadius:12, padding:'11px 18px', cursor:'pointer', boxShadow:'3px 3px 0 #161616', whiteSpace:'nowrap' }}>
          ⚽ Beat their bracket
        </button>
        <button onClick={onDismiss} aria-label="Dismiss challenge" style={{ width:28, height:28, borderRadius:'50%', border:'2.5px solid #161616', background:'#fff', cursor:'pointer', fontWeight:900, fontSize:12, boxShadow:'2px 2px 0 #161616', flex:'none' }}>✕</button>
      </div>
    </div>
  );
}

/* ─── Sponsor Strip ──────────────────────────────────────────── */
interface Sponsor { name: string; tag: string; logo: string; bg: string; fg: string; url: string; }

function SponsorStrip({ sponsors, onOpenSponsor }: { sponsors: Sponsor[]; onOpenSponsor: () => void }) {
  return (
    <div style={{ background:'#fff', borderTop:'3px solid #161616' }}>
      <div style={{ maxWidth:1320, margin:'0 auto', padding:'34px 20px 38px' }}>
        <div style={{ textAlign:'center', marginBottom:22 }}>
          <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:11, letterSpacing:'.12em', color:'#9b978f' }}>OFFICIAL PARTNERS</div>
          <div style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:20, marginTop:4 }}>Powering Pick The Cup 2026</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14 }}>
          {sponsors.map(s => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none', background:'#FFFDF5', border:'2.5px solid #161616', borderRadius:16, boxShadow:'3px 3px 0 #161616', padding:'16px 12px', display:'flex', flexDirection:'column', alignItems:'center', gap:7 }}>
              <div style={{ width:44, height:44, borderRadius:11, border:'2px solid #161616', background:s.bg, color:s.fg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontFamily:"var(--font-archivo-black), sans-serif" }}>{s.logo}</div>
              <div style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:15, letterSpacing:'.01em', color:'#161616' }}>{s.name}</div>
              <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:9.5, color:'#9b978f', textAlign:'center' }}>{s.tag}</div>
            </a>
          ))}
          <div onClick={onOpenSponsor} style={{ border:'2.5px dashed #c8c4ba', borderRadius:16, padding:'16px 12px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, textAlign:'center', cursor:'pointer' }}>
            <div style={{ fontSize:22 }}>＋</div>
            <div style={{ fontFamily:"var(--font-archivo), sans-serif", fontWeight:800, fontSize:13, color:'#56524b' }}>Become a<br/>sponsor</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */
function Footer() {
  return (
    <div style={{ background:'#161616', color:'#cfcfcf' }}>
      <div style={{ maxWidth:1320, margin:'0 auto', padding:20, display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'#FFC23C', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🏆</div>
          <span style={{ fontFamily:"var(--font-archivo-black), sans-serif", color:'#fff', fontSize:14 }}>PICK THE CUP</span>
          <span style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:10, color:'#8a8f97' }}>· #PickTheCup 2026</span>
        </div>
        <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:10, color:'#8a8f97' }}>⚡ A fan-made prediction game</div>
      </div>
    </div>
  );
}

/* ─── Sponsor Modal ──────────────────────────────────────────── */
function SponsorModal({ done, saving, error, onClose, company, name, email, onCompany, onName, onEmail, onSubmit }: {
  done: boolean; saving: boolean; error: string; onClose: () => void;
  company: string; name: string; email: string;
  onCompany: (v: string) => void; onName: (v: string) => void; onEmail: (v: string) => void;
  onSubmit: () => void;
}) {
  const valid = company && name && email.includes('@');
  return (
    <div style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(22,22,22,.62)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, overflow:'auto' }}>
      <div style={{ position:'relative', width:'100%', maxWidth:460, background:'#FFFDF5', border:'3px solid #161616', borderRadius:22, boxShadow:'8px 8px 0 #161616', overflow:'hidden' }}>
        <button onClick={onClose} style={{ position:'absolute', top:12, right:12, width:32, height:32, borderRadius:'50%', border:'2.5px solid #161616', background:'#fff', cursor:'pointer', fontWeight:900, fontSize:15, boxShadow:'2px 2px 0 #161616', zIndex:2 }}>✕</button>
        <div style={{ background:'#2D6BFF', borderBottom:'3px solid #161616', padding:'20px 22px', position:'relative', overflow:'hidden' }}>
          <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:11, letterSpacing:'.1em', color:'#cfe0ff' }}>PARTNER WITH PICK THE CUP</div>
          <div style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:24, color:'#fff', marginTop:4, lineHeight:1.05 }}>Put your brand in front of the whole tournament 🏆</div>
        </div>
        {done ? (
          <div style={{ padding:'32px 22px', textAlign:'center' }}>
            <div style={{ fontSize:52 }}>🎉</div>
            <h3 style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:22, margin:'8px 0 6px' }}>Slot reserved!</h3>
            <p style={{ fontSize:14, color:'#56524b', margin:'0 0 18px', lineHeight:1.5 }}>Thanks {name} — we&apos;ll email {email} within 24h to set up {company}&apos;s placement.</p>
            <button onClick={onClose} style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:14, color:'#fff', background:'#161616', border:'2.5px solid #161616', borderRadius:13, padding:'12px 22px', cursor:'pointer', boxShadow:'3px 3px 0 #FFC23C' }}>Done</button>
          </div>
        ) : (
          <div style={{ padding:'18px 22px 22px' }}>
            <div style={{ display:'flex', gap:9, marginBottom:16 }}>
              {[{v:'12.4k',l:'BRACKETS',c:'#2D6BFF'},{v:'86k',l:'MATCH PICKS',c:'#FF3D8B'},{v:'7min',l:'AVG ON PAGE',c:'#14B87A'}].map(s => (
                <div key={s.l} style={{ flex:1, background:'#fff', border:'2px solid #161616', borderRadius:12, padding:'10px 8px', textAlign:'center', boxShadow:'2px 2px 0 #161616' }}>
                  <div style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:18, color:s.c }}>{s.v}</div>
                  <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:8.5, color:'#9b978f' }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:16 }}>
              {[['🪧','Your logo in the partner strip under the bracket'],['📲','"Powered by" lockup on every shared bracket image'],['🎟️','"Matchday presented by" banner between rounds']].map(([icon,text]) => (
                <div key={text} style={{ display:'flex', gap:9, alignItems:'center', fontSize:13, color:'#161616' }}><span style={{ fontSize:15 }}>{icon}</span>{text}</div>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#FFF6E2', border:'2.5px solid #161616', borderRadius:14, padding:'12px 16px', marginBottom:16 }}>
              <div>
                <div style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:26, color:'#161616', lineHeight:1 }}>$100<span style={{ fontSize:13, color:'#9b978f', fontFamily:"var(--font-space-mono), monospace" }}> / tournament</span></div>
                <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:9, color:'#B8860B', marginTop:2 }}>LAUNCH PRICE · LIMITED SLOTS</div>
              </div>
              <div style={{ fontSize:30 }}>🤝</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              <input value={company} onChange={e => onCompany(e.target.value)} placeholder="Company name" style={{ fontFamily:"var(--font-archivo), sans-serif", fontSize:14, padding:'11px 13px', border:'2.5px solid #161616', borderRadius:12, outline:'none', background:'#fff' }} />
              <div style={{ display:'flex', gap:9 }}>
                <input value={name} onChange={e => onName(e.target.value)} placeholder="Your name" style={{ flex:1, minWidth:0, fontFamily:"var(--font-archivo), sans-serif", fontSize:14, padding:'11px 13px', border:'2.5px solid #161616', borderRadius:12, outline:'none', background:'#fff' }} />
                <input value={email} onChange={e => onEmail(e.target.value)} placeholder="Work email" style={{ flex:1, minWidth:0, fontFamily:"var(--font-archivo), sans-serif", fontSize:14, padding:'11px 13px', border:'2.5px solid #161616', borderRadius:12, outline:'none', background:'#fff' }} />
              </div>
              <button onClick={onSubmit} disabled={!valid || saving} style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:15, color: valid ? '#fff' : '#9b978f', background: saving ? '#9b978f' : valid ? '#14B87A' : '#efece4', border: `2.5px solid ${valid ? '#161616' : '#c8c4ba'}`, borderRadius:13, padding:13, cursor: (valid && !saving) ? 'pointer' : 'not-allowed', boxShadow: valid ? '3px 3px 0 #161616' : 'none' }}>
                {saving ? 'Submitting…' : 'Reserve my slot → $100'}
              </button>
              {error && <div style={{ color:'#D6336C', fontSize:11.5, fontWeight:700, textAlign:'center' }}>{error}</div>}
              <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:9.5, color:'#9b978f', textAlign:'center' }}>Mock checkout — no real payment taken.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Champion Modal ─────────────────────────────────────────── */
function ChampionModal({ res, champion, friend, realSemis, emailDone, emailSaving, emailError, email, onEmailChange, onEmailSubmit, onClose, onShare, shareNotice }: {
  res: Record<string, MatchResult>;
  champion: { name: string; flag: string } | null;
  friend: FriendPicks | null;
  realSemis: Set<string>;
  emailDone: boolean; emailSaving: boolean; emailError: string; email: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailSubmit: () => void;
  onClose: () => void;
  onShare: (net: string) => void;
  shareNotice: string;
}) {
  const rSemiL = res['M101'];
  const rSemiR = res['M102'];
  const rFinal = res['M104'];

  const fbox = (code: string | null, variant: 'green'|'dimBig'|'plain'|'out') => {
    const t = code ? team(code) : null;
    let boxStyle: React.CSSProperties;
    let nameStyle: React.CSSProperties = { fontFamily:"var(--font-archivo-black), sans-serif", fontSize:11, color:'#161616' };
    let check = '';
    if (variant === 'green') {
      boxStyle = { display:'flex', alignItems:'center', justifyContent:'center', gap:5, flex:'none', width:108, height:40, border:'2.5px solid #161616', borderRadius:11, background:'#17C988', boxShadow:'3px 3px 0 #161616' };
      nameStyle = { ...nameStyle, fontSize:14, color:'#fff' };
      check = '✓';
    } else if (variant === 'dimBig') {
      boxStyle = { display:'flex', alignItems:'center', justifyContent:'center', gap:5, flex:'none', width:108, height:40, border:'2.5px solid #161616', borderRadius:11, background:'#fff', boxShadow:'3px 3px 0 #161616', opacity:.42 };
      nameStyle = { ...nameStyle, fontSize:14, textDecoration:'line-through' };
    } else if (variant === 'plain') {
      boxStyle = { display:'flex', alignItems:'center', justifyContent:'center', gap:5, flex:'none', width:70, height:40, border:'2px solid #161616', borderRadius:9, background:'#fff', boxShadow:'2px 2px 0 #161616' };
    } else {
      boxStyle = { display:'flex', alignItems:'center', justifyContent:'center', gap:5, flex:'none', width:70, height:40, border:'2px solid #161616', borderRadius:9, background:'#fff', opacity:.42 };
      nameStyle = { ...nameStyle, textDecoration:'line-through' };
    }
    return (
      <div style={boxStyle}>
        <span style={{ fontSize: variant === 'green' || variant === 'dimBig' ? 17 : 15 }}>{t?.flag ?? ''}</span>
        <span style={nameStyle}>{t?.code ?? ''}</span>
        {check && <span style={{ fontSize:12, fontWeight:900, color:'#fff' }}>{check}</span>}
      </div>
    );
  };

  // Before the semi itself has a winner picked, both semifinalists are still
  // "in it" — only mark a side "out" once there's an actual winner to compare against.
  const semiVar = (code: string | null, winner: string | null) => (!winner || code === winner) ? 'plain' : 'out';
  const finVar  = (code: string | null) => code === rFinal?.winner ? 'green' : 'dimBig';

  return (
    <div style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(22,22,22,.62)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, overflow:'auto' }}>
      {/* Confetti */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        {confettiPieces.map((c, i) => (
          <div key={i} style={{ position:'absolute', top:-30, left:c.left, width:c.width, height:c.height, background:c.background, borderRadius:c.borderRadius, animation:`conffall ${c.duration}s linear ${c.delay}s infinite`, opacity:.92 }} />
        ))}
      </div>
      <div style={{ position:'relative', width:'100%', maxWidth:430, background:'#FFFDF5', border:'3px solid #161616', borderRadius:24, boxShadow:'8px 8px 0 #161616', padding:22 }}>
        <button onClick={onClose} style={{ position:'absolute', top:12, right:12, width:32, height:32, borderRadius:'50%', border:'2.5px solid #161616', background:'#fff', cursor:'pointer', fontWeight:900, fontSize:15, boxShadow:'2px 2px 0 #161616', zIndex:2 }}>✕</button>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:12, color:'#FF3D8B', letterSpacing:'.1em', fontWeight:700 }}>
            {champion ? '🎉 BRACKET LOCKED 🎉' : '🔥 FINAL FOUR SET 🔥'}
          </div>
          <h2 style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:26, margin:'8px 0 4px', lineHeight:1.02 }}>
            {champion ? <>Bold call — here&apos;s your road to the title</> : <>Who takes it from here? Finish your bracket</>}
          </h2>
        </div>

        {/* C2 Funnel Card */}
        <div style={{ margin:'14px 0 16px', background:'#FBF6E8', border:'3px solid #161616', borderRadius:18, boxShadow:'5px 5px 0 #161616', padding:'18px 16px 16px', display:'flex', flexDirection:'column' }}>
          <div style={{ textAlign:'center', marginBottom:8 }}>
            <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:10, letterSpacing:'.14em', color:'#9b978f' }}>FIFA WORLD CUP 2026</div>
            <div style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:20, color:'#FF3D8B', marginTop:2 }}>
              {champion ? '🏆 MY ROAD TO THE TITLE' : '🔥 MY FINAL FOUR'}
            </div>
          </div>

          {/* Semi-finalists */}
          <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:8.5, letterSpacing:'.12em', color:'#9b978f', textAlign:'center', marginBottom:8 }}>SEMI-FINALISTS</div>
          {champion ? (
            <div style={{ display:'flex' }}>
              <div style={{ flex:1, display:'flex', justifyContent:'space-around', alignItems:'center' }}>
                {fbox(rSemiL?.a ?? null, semiVar(rSemiL?.a ?? null, rSemiL?.winner ?? null) as 'plain'|'out')}
                {fbox(rSemiL?.b ?? null, semiVar(rSemiL?.b ?? null, rSemiL?.winner ?? null) as 'plain'|'out')}
              </div>
              <div style={{ flex:1, display:'flex', justifyContent:'space-around', alignItems:'center' }}>
                {fbox(rSemiR?.a ?? null, semiVar(rSemiR?.a ?? null, rSemiR?.winner ?? null) as 'plain'|'out')}
                {fbox(rSemiR?.b ?? null, semiVar(rSemiR?.b ?? null, rSemiR?.winner ?? null) as 'plain'|'out')}
              </div>
            </div>
          ) : (
            // Final-four state: only 4 teams to show, so each gets a big
            // colored chip (mirrors the /api/share-image final-four card) —
            // real qualified teams badged 🔒, the user's own picks "MY PICK".
            <div style={{ display:'flex', gap:7 }}>
              {([rSemiL?.a, rSemiL?.b, rSemiR?.a, rSemiR?.b] as (string | null | undefined)[]).map((code, i) => {
                const accents = [
                  { bg:'#FFC23C', fg:'#161616' }, { bg:'#2D6BFF', fg:'#fff' },
                  { bg:'#FF3D8B', fg:'#fff' },    { bg:'#14B87A', fg:'#fff' },
                ][i];
                const t = code ? team(code) : null;
                const isReal = !!code && realSemis.has(code);
                return (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, border:'2.5px solid #161616', borderRadius:12, background:accents.bg, boxShadow:'3px 3px 0 #161616', padding:'9px 4px' }}>
                    <span style={{ fontSize:24 }}>{t?.flag ?? ''}</span>
                    <span style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:13, color:accents.fg }}>{t?.code ?? ''}</span>
                    <span style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:7, letterSpacing:'.08em', color:accents.fg, opacity:.85 }}>{isReal ? '🔒 QUALIFIED' : 'MY PICK'}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Connectors: semis → finalists (only drawn once the funnel continues) */}
          {champion && (
            <div style={{ display:'flex' }}>
              {[0,1].map(i => (
                <div key={i} style={{ flex:1, position:'relative', height:18 }}>
                  <div style={{ position:'absolute', top:0, left:'25%', width:2, height:8, background:'#161616', transform:'translateX(-50%)' }} />
                  <div style={{ position:'absolute', top:0, left:'75%', width:2, height:8, background:'#161616', transform:'translateX(-50%)' }} />
                  <div style={{ position:'absolute', top:8, left:'25%', right:'25%', height:2, background:'#161616' }} />
                  <div style={{ position:'absolute', top:8, left:'50%', bottom:0, width:2, background:'#161616', transform:'translateX(-50%)' }} />
                </div>
              ))}
            </div>
          )}

          {/* Finalists + champion — only meaningful once M101/M102 actually
              have winners, i.e. once there's a champion at all. Before that,
              the "final four" card stops at the semi-finalists above. */}
          {champion && (
            <>
              {/* Finalists */}
              <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:8.5, letterSpacing:'.12em', color:'#9b978f', textAlign:'center', margin:'6px 0 8px' }}>FINALISTS</div>
              <div style={{ display:'flex' }}>
                <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
                  {fbox(rSemiL?.winner ?? null, finVar(rSemiL?.winner ?? null) as 'green'|'dimBig')}
                </div>
                <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
                  {fbox(rSemiR?.winner ?? null, finVar(rSemiR?.winner ?? null) as 'green'|'dimBig')}
                </div>
              </div>

              {/* Connectors: finalists → champion */}
              <div style={{ position:'relative', height:18 }}>
                <div style={{ position:'absolute', top:0, left:'25%', width:2, height:8, background:'#161616', transform:'translateX(-50%)' }} />
                <div style={{ position:'absolute', top:0, left:'75%', width:2, height:8, background:'#161616', transform:'translateX(-50%)' }} />
                <div style={{ position:'absolute', top:8, left:'25%', right:'25%', height:2, background:'#161616' }} />
                <div style={{ position:'absolute', top:8, left:'50%', bottom:0, width:2, background:'#161616', transform:'translateX(-50%)' }} />
              </div>

              {/* Champion */}
              <div style={{ display:'flex', justifyContent:'center', marginTop:4 }}>
                <div style={{ border:'3px solid #161616', borderRadius:14, background:'linear-gradient(135deg,#FFD23C,#FFB01F)', boxShadow:'4px 4px 0 #161616', padding:'10px 18px', display:'flex', alignItems:'center', gap:11, whiteSpace:'nowrap' }}>
                  <span style={{ fontSize:30 }}>{champion.flag}</span>
                  <div style={{ textAlign:'left' }}>
                    <div style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:21, color:'#161616', lineHeight:1 }}>{champion.name}</div>
                    <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:9, color:'#6b5a16', letterSpacing:'.1em', marginTop:2 }}>WORLD CHAMPION</div>
                  </div>
                  <span style={{ fontSize:26 }}>👑</span>
                </div>
              </div>
            </>
          )}

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'2px solid #161616', paddingTop:11, marginTop:16 }}>
            <span style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:13, color:'#161616' }}>PICK THE CUP</span>
            <span style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:10, color:'#9b978f' }}>#PickTheCup</span>
          </div>
        </div>

        {friend && <CompareStrip friend={friend} res={res} />}

        {/* Share buttons */}
        <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:11, color:'#56524b', textAlign:'center', marginBottom:9 }}>
          {friend ? 'SHARE THE RIVALRY' : 'CHALLENGE YOUR FRIENDS'}
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:8 }}>
          <button onClick={() => onShare('whatsapp')} style={{ flex:1, fontFamily:"var(--font-archivo), sans-serif", fontWeight:900, fontSize:14, color:'#fff', background:'#25D366', border:'2.5px solid #161616', borderRadius:13, padding:'11px 6px', cursor:'pointer', boxShadow:'3px 3px 0 #161616' }}>WhatsApp</button>
          <button onClick={() => onShare('telegram')} style={{ flex:1, fontFamily:"var(--font-archivo), sans-serif", fontWeight:900, fontSize:14, color:'#fff', background:'#229ED9', border:'2.5px solid #161616', borderRadius:13, padding:'11px 6px', cursor:'pointer', boxShadow:'3px 3px 0 #161616' }}>Telegram</button>
          <button onClick={() => onShare('copy')}     style={{ flex:1, fontFamily:"var(--font-archivo), sans-serif", fontWeight:900, fontSize:14, color:'#161616', background:'#FFC23C', border:'2.5px solid #161616', borderRadius:13, padding:'11px 6px', cursor:'pointer', boxShadow:'3px 3px 0 #161616' }}>🔗 Copy</button>
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          {/* Instagram & Facebook disabled for now — not working */}
          <button onClick={() => onShare('x')}         style={{ flex:1, fontFamily:"var(--font-archivo), sans-serif", fontWeight:900, fontSize:14, color:'#fff', background:'#161616', border:'2.5px solid #161616', borderRadius:13, padding:'11px 6px', cursor:'pointer', boxShadow:'3px 3px 0 #161616' }}>𝕏 Post</button>
          <button onClick={() => onShare('threads')}   style={{ flex:1, fontFamily:"var(--font-archivo), sans-serif", fontWeight:900, fontSize:14, color:'#161616', background:'#fff', border:'2.5px solid #161616', borderRadius:13, padding:'11px 6px', cursor:'pointer', boxShadow:'3px 3px 0 #161616' }}>@ Threads</button>
        </div>
        {shareNotice && <div style={{ textAlign:'center', fontSize:11.5, fontWeight:700, color:'#0E9E68', marginBottom:14 }}>{shareNotice}</div>}

        {/* Email capture */}
        <div style={{ borderTop:'2px dashed #d9d5cc', paddingTop:14 }}>
          {emailDone ? (
            <div style={{ textAlign:'center', fontWeight:800, color:'#0E9E68', fontSize:14 }}>✓ Saved! Use this email to reload &amp; fix your bracket anytime.</div>
          ) : (
            <>
              <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:11, color:'#56524b', marginBottom:8 }}>📬 SAVE MY BRACKET TO THIS EMAIL (&amp; JOIN THE LEADERBOARD)</div>
              <div style={{ display:'flex', gap:8 }}>
                <input value={email} onChange={onEmailChange} placeholder="you@email.com" style={{ flex:1, fontFamily:"var(--font-archivo), sans-serif", fontSize:14, padding:'11px 13px', border:'2.5px solid #161616', borderRadius:12, outline:'none', background:'#fff' }} />
                <button onClick={onEmailSubmit} disabled={emailSaving} style={{ fontFamily:"var(--font-archivo), sans-serif", fontWeight:800, fontSize:13, color:'#fff', background: emailSaving ? '#9b978f' : '#14B87A', border:'2.5px solid #161616', borderRadius:12, padding:'11px 15px', cursor: emailSaving ? 'not-allowed' : 'pointer', boxShadow:'2px 2px 0 #161616' }}>{emailSaving ? 'Saving…' : 'Save'}</button>
              </div>
              {emailError && <div style={{ color:'#D6336C', fontSize:11.5, marginTop:6, fontWeight:700 }}>{emailError}</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Compare Strip (you vs. the friend whose link you opened) ── */
function CompareStrip({ friend, res }: { friend: FriendPicks; res: Record<string, MatchResult> }) {
  const mySemis = [res['M101']?.a, res['M101']?.b, res['M102']?.a, res['M102']?.b]
    .filter((c): c is string => !!c);
  const myChampion = res['M104']?.winner ?? null;
  const mySet = new Set(mySemis);
  const friendSet = new Set(friend.semis);
  const overlap = friend.semis.filter(c => mySet.has(c)).length;
  const bothChamps = !!(myChampion && friend.champion);
  const sameChamp = bothChamps && myChampion === friend.champion;

  const verdict = bothChamps
    ? (sameChamp ? `Same champion — great minds 🤝` : `Different champions — one of you is wrong 🔥`)
    : `You share ${overlap} of 4 semifinalists`;

  const chipRow = (semis: string[], champ: string | null, otherSet: Set<string>, otherChamp: string | null) => (
    <div style={{ display:'flex', alignItems:'center', gap:5, flexWrap:'wrap' }}>
      {semis.map(c => {
        const t = team(c);
        const shared = otherSet.has(c);
        return (
          <div key={c} style={{ display:'flex', alignItems:'center', gap:4, background: shared ? '#E7F8F0' : '#fff', border:`2px solid ${shared ? '#14B87A' : '#161616'}`, borderRadius:8, padding:'4px 7px' }}>
            <span style={{ fontSize:13 }}>{t.flag}</span>
            <span style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:10, color:'#161616' }}>{t.code}</span>
          </div>
        );
      })}
      {champ && (
        <div style={{ display:'flex', alignItems:'center', gap:4, background: otherChamp === champ ? '#E7F8F0' : 'linear-gradient(135deg,#FFD23C,#FFB01F)', border:'2px solid #161616', borderRadius:8, padding:'4px 7px' }}>
          <span style={{ fontSize:11 }}>👑</span>
          <span style={{ fontSize:13 }}>{team(champ).flag}</span>
          <span style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:10, color:'#161616' }}>{team(champ).code}</span>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ margin:'0 0 16px', background:'#fff', border:'3px solid #161616', borderRadius:16, boxShadow:'4px 4px 0 #161616', padding:'13px 14px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:14, color:'#161616' }}>⚔️ YOU vs YOUR FRIEND</span>
        <span style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:9, color:'#9b978f' }}>{overlap}/4 IN COMMON</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ flex:'none', width:38, fontFamily:"var(--font-space-mono), monospace", fontSize:9, fontWeight:700, color:'#2D6BFF' }}>YOU</span>
          {chipRow(mySemis, myChampion, friendSet, friend.champion)}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ flex:'none', width:38, fontFamily:"var(--font-space-mono), monospace", fontSize:9, fontWeight:700, color:'#FF3D8B' }}>THEM</span>
          {chipRow(friend.semis, friend.champion, mySet, myChampion)}
        </div>
      </div>
      <div style={{ fontFamily:"var(--font-space-mono), monospace", fontSize:9.5, color:'#56524b', marginTop:9, textAlign:'center' }}>{verdict}</div>
    </div>
  );
}

/* ─── Load Modal ─────────────────────────────────────────────── */
function LoadModal({ loadEmail, status, onEmailChange, onLoad, onClose }: {
  loadEmail: string; status: 'idle' | 'loading' | 'notfound' | 'error' | 'done';
  onEmailChange: (v: string) => void;
  onLoad: () => void;
  onClose: () => void;
}) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(22,22,22,.62)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, overflow:'auto' }}>
      <div style={{ position:'relative', width:'100%', maxWidth:400, background:'#FFFDF5', border:'3px solid #161616', borderRadius:22, boxShadow:'8px 8px 0 #161616', overflow:'hidden' }}>
        <button onClick={onClose} style={{ position:'absolute', top:12, right:12, width:32, height:32, borderRadius:'50%', border:'2.5px solid #161616', background:'#fff', cursor:'pointer', fontWeight:900, fontSize:15, boxShadow:'2px 2px 0 #161616', zIndex:2 }}>✕</button>
        <div style={{ padding:'26px 22px 22px' }}>
          <div style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:20, marginBottom:6 }}>📥 Load your bracket</div>
          <p style={{ fontSize:13.5, color:'#56524b', lineHeight:1.5, margin:'0 0 16px' }}>Enter the email you saved your bracket with — this replaces your current picks.</p>
          <div style={{ display:'flex', gap:8 }}>
            <input value={loadEmail} onChange={e => onEmailChange(e.target.value)} placeholder="you@email.com" style={{ flex:1, fontFamily:"var(--font-archivo), sans-serif", fontSize:14, padding:'11px 13px', border:'2.5px solid #161616', borderRadius:12, outline:'none', background:'#fff' }} />
            <button onClick={onLoad} disabled={status === 'loading'} style={{ fontFamily:"var(--font-archivo), sans-serif", fontWeight:800, fontSize:13, color:'#fff', background: status === 'loading' ? '#9b978f' : '#2D6BFF', border:'2.5px solid #161616', borderRadius:12, padding:'11px 15px', cursor: status === 'loading' ? 'not-allowed' : 'pointer', boxShadow:'2px 2px 0 #161616' }}>{status === 'loading' ? 'Loading…' : 'Load'}</button>
          </div>
          {status === 'notfound' && <div style={{ color:'#D6336C', fontSize:11.5, marginTop:8, fontWeight:700 }}>No saved bracket for that email.</div>}
          {status === 'error'    && <div style={{ color:'#D6336C', fontSize:11.5, marginTop:8, fontWeight:700 }}>Could not load — try again.</div>}
          {status === 'done'     && <div style={{ color:'#0E9E68', fontSize:11.5, marginTop:8, fontWeight:700 }}>✓ Loaded!</div>}
        </div>
      </div>
    </div>
  );
}

/* ─── Save Image Modal ───────────────────────────────────────── */
function SaveImageModal({ saving, onSave, onClose }: {
  saving: boolean;
  onSave: (scope: ExportScope) => void;
  onClose: () => void;
}) {
  const options: { scope: ExportScope; label: string; desc: string }[] = [
    { scope: 'all',   label: '🏆 Full bracket',      desc: 'Round of 32 through the Final' },
    { scope: 'r16',   label: '🥈 Since Round of 16',  desc: 'Round of 16 through the Final' },
    { scope: 'qf',    label: '🥉 Since Quarterfinals', desc: 'Quarterfinals through the Final' },
    { scope: 'final', label: '🎖️ Final only',        desc: 'Just the championship match' },
  ];
  return (
    <div style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(22,22,22,.62)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, overflow:'auto' }}>
      <div style={{ position:'relative', width:'100%', maxWidth:400, background:'#FFFDF5', border:'3px solid #161616', borderRadius:22, boxShadow:'8px 8px 0 #161616', overflow:'hidden' }}>
        <button onClick={onClose} disabled={saving} style={{ position:'absolute', top:12, right:12, width:32, height:32, borderRadius:'50%', border:'2.5px solid #161616', background:'#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight:900, fontSize:15, boxShadow:'2px 2px 0 #161616', zIndex:2 }}>✕</button>
        <div style={{ padding:'26px 22px 22px' }}>
          <div style={{ fontFamily:"var(--font-archivo-black), sans-serif", fontSize:20, marginBottom:6 }}>💾 Save bracket image</div>
          <p style={{ fontSize:13.5, color:'#56524b', lineHeight:1.5, margin:'0 0 16px' }}>Downloads a PNG — no posting, just a file you can send anyone.</p>
          <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {options.map(o => (
              <button
                key={o.scope}
                onClick={() => onSave(o.scope)}
                disabled={saving}
                style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:2, textAlign:'left', fontFamily:"var(--font-archivo), sans-serif", background:'#fff', border:'2.5px solid #161616', borderRadius:12, padding:'11px 14px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow:'2px 2px 0 #161616', opacity: saving ? .6 : 1 }}
              >
                <span style={{ fontWeight:800, fontSize:14 }}>{o.label}</span>
                <span style={{ fontSize:11, color:'#9b978f' }}>{o.desc}</span>
              </button>
            ))}
          </div>
          {saving && <div style={{ color:'#2D6BFF', fontSize:11.5, marginTop:12, fontWeight:700, textAlign:'center' }}>Generating image…</div>}
        </div>
      </div>
    </div>
  );
}
