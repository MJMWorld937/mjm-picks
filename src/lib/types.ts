// Abstrakte Produktstruktur — das Frontend kennt keinen konkreten Affiliate-Anbieter.

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  hue: 'violet' | 'cyan' | 'green' | 'amber';
  sort_order: number;
  /** null = Hauptbereich; sonst Unterbereich der Eltern-Kategorie */
  parent_id: string | null;
}

export interface EditorialContent {
  summary: string;
  recommendation: string;
  suited_for: string;
  not_suited_for: string;
  pros: string[];
  cons: string[];
  verdict: string;
}

export interface AffiliateProduct {
  id: string;
  pickNo: number;
  slug: string;
  title: string;
  brand: string;
  asin: string | null;
  featured: boolean;
  sortOrder: number;
  source: 'manual' | 'api';
  imageUrl: string | null;
  imageSource: 'press' | 'own' | 'none' | 'api';
  categories: Category[];
  editorial: EditorialContent;
}

export interface AffiliateOffer {
  /** null = noch kein Link hinterlegt */
  url: string | null;
  label: string;
  providerName: string;
}

// ---------- PICKS-Quellensystem (v1) ----------
export interface SourceItemPublic {
  id: string;
  productId: string;
  url: string;
  title: string;
  authorChannel: string;
  publishedAt: string | null;
  contentType: 'LAB_TEST' | 'EDITORIAL_REVIEW' | 'YOUTUBE_REVIEW' | 'COMMUNITY_THREAD' | 'MANUFACTURER' | 'DATABASE';
  sourceName: string;
  sourceTier: 'S' | 'A' | 'B';
}

export interface CommunityPattern {
  productId: string;
  issueType: string;
  positive: boolean;
  summary: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ProductConflict {
  productId: string;
  claimCategory: string;
  sideA: string;
  sideB: string;
  explanationCandidates: string[];
  note: string;
}

export interface PicksScore {
  productId: string;
  p: number;
  i: number;
  c: number;
  k: number;
  s: number;
  total: number;
  confidencePct: number;
  methodologyVersion: string;
  rankingGroup: string | null;
  rankingPosition: number | null;
  rankingTotal: number | null;
}
