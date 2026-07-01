import type { Metadata } from "next";
import { BracketApp } from "./BracketApp";

const IMAGE_PARAMS = ['champion', 'semiLA', 'semiLB', 'semiLW', 'semiRA', 'semiRB', 'semiRW'] as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  if (!params.champion) return {};
  const query = new URLSearchParams();
  for (const key of IMAGE_PARAMS) {
    if (params[key]) query.set(key, params[key]!);
  }
  const imageUrl = `/api/share-image?${query.toString()}`;
  return {
    openGraph: { images: [imageUrl] },
    twitter: { images: [imageUrl] },
  };
}

export default function Home() {
  return <BracketApp />;
}
