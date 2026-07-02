import type { Metadata } from "next";
import { BracketApp } from "./BracketApp";

const IMAGE_PARAMS = ['champion', 'semiLA', 'semiLB', 'semiLW', 'semiRA', 'semiRB', 'semiRW'] as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const hasSemis = params.semiLA && params.semiLB && params.semiRA && params.semiRB;
  // Final-four shares carry semi params but no champion yet — they still need
  // the personalized card, not the generic homepage preview.
  if (!params.champion && !hasSemis) return {};
  const query = new URLSearchParams();
  for (const key of IMAGE_PARAMS) {
    if (params[key]) query.set(key, params[key]!);
  }
  const imageUrl = `/api/share-image?${query.toString()}`;
  const title = 'Can you beat this World Cup 2026 bracket? ⚔️';
  const description = params.champion
    ? 'A friend called the whole tournament — champion included. Build your bracket and prove them wrong.'
    : 'A friend called their Final Four. Build your bracket and see who knows ball.';
  return {
    title,
    description,
    openGraph: { title, description, images: [imageUrl] },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
  };
}

export default function Home() {
  return <BracketApp />;
}
