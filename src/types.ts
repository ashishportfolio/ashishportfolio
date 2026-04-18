export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  year: string;
  client: string;
  role: string;
  description: string;
  image: string;
  video?: string;
  overview: string;
  challenge: string;
  approach: string;
  execution: string;
  outcome: string;
  is_featured: boolean;
  image_overview?: string;
  image_challenge?: string;
  image_approach?: string;
  image_execution?: string;
  image_outcome?: string;
  hover_video?: string;
}

export interface HeroMedia {
  id: string;
  image: string;
  video?: string;
  order_index: number;
}

export interface ArchiveMedia {
  id: string;
  image: string;
  video?: string;
  order_index: number;
}

export interface AboutContent {
  id: string;
  image: string;
  connect_image?: string;
}

export interface ClientLogo {
  id: string;
  name: string;
  logo?: string;
  order_index: number;
}

export interface Service {
  title: string;
  items: string[];
}

export interface SiteContent {
  key: string;
  value: string;
}
