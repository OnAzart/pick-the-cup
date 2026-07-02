// Round-weighted bracket scoring (future.md item 4): a correct pick is worth
// more the deeper the round — calling the Final right beats sweeping the
// Round of 32. Weights double per round; the 3rd-place match counts like a
// quarterfinal (it's a consolation game, not a semifinal-tier call).
//
//   R32 (M73-M88)   1 pt  × 16 matches = 16
//   R16 (M89-M96)   2 pts ×  8 matches = 16
//   QF  (M97-M100)  4 pts ×  4 matches = 16
//   SF  (M101-102)  8 pts ×  2 matches = 16
//   3rd (M103)      4 pts
//   Final (M104)   16 pts
//                          max total = 84

export function matchPoints(matchId: string): number {
  const n = Number(matchId.slice(1));
  if (n >= 73 && n <= 88) return 1;
  if (n >= 89 && n <= 96) return 2;
  if (n >= 97 && n <= 100) return 4;
  if (n === 101 || n === 102) return 8;
  if (n === 103) return 4;
  if (n === 104) return 16;
  return 0;
}

// A user's pick for a match scores iff it names the real winner — their raw
// saved pick, independent of whether their bracket path to that match was
// right (standard bracket-pool scoring: a correct champion call counts even
// with a busted semifinal).
export function scoreBracket(
  userPicks: Record<string, string>,
  realPicks: Record<string, string>,
): number {
  let score = 0;
  for (const [id, winner] of Object.entries(realPicks)) {
    if (userPicks[id] === winner) score += matchPoints(id);
  }
  return score;
}

// Points available from matches that have actually finished — the "out of"
// denominator the leaderboard shows while the tournament is still running.
export function maxScoreSoFar(realPicks: Record<string, string>): number {
  return Object.keys(realPicks).reduce((sum, id) => sum + matchPoints(id), 0);
}
