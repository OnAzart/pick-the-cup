import type { Metadata } from "next";
import { BracketApp } from "./BracketApp";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ champion?: string }>;
}): Promise<Metadata> {
  const { champion } = await searchParams;
  if (!champion) return {};
  const imageUrl = `/api/share-image?champion=${encodeURIComponent(champion)}`;
  return {
    openGraph: { images: [imageUrl] },
    twitter: { images: [imageUrl] },
  };
}

export default function Home() {
  return <BracketApp />;
}
