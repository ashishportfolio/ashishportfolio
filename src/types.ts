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
  case_study_banner?: string;
  longDescription?: string;
  show_directive?: boolean;
  show_overview?: boolean;
  show_challenge?: boolean;
  show_approach?: boolean;
  show_execution?: boolean;
  show_outcome?: boolean;
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
  profile_section_image?: string;
  profile_title?: string;
  profile_subtitle_1?: string;
  profile_desc_1?: string;
  profile_subtitle_2?: string;
  profile_desc_2?: string;
  profile_headline?: string;
  contact_bg?: string;
  work_hero_bg?: string;
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

export interface AvailabilitySlot {
  id: string;
  day_of_week?: number; // 0-6 (Sunday-Saturday)
  date?: string; // "YYYY-MM-DD" for specific dates
  start_time: string; // "09:00"
  end_time: string; // "10:00"
  is_active: boolean;
}

export interface Booking {
  id: string;
  date: string; // "YYYY-MM-DD"
  time_slot: string; // "09:00"
  name: string;
  email: string;
  phone: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at?: string;
}
