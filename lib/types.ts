import type { EmblaCarouselType } from "embla-carousel";
import * as React from "react";

// Database Types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Database Schema Types
export interface Database {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string;
          name: string;
          country: string;
          tags: string[];
          description: string;
        };
        Insert: {
          id?: string;
          name: string;
          country: string;
          tags?: string[];
          description: string;
        };
        Update: {
          id?: string;
          name?: string;
          country?: string;
          tags?: string[];
          description?: string;
        };
      };
      user_interests: {
        Row: {
          id: string;
          user_id: string;
          locations_id: string[];
          locations_text: string;
          budget: number;
          priority_level: number;
          activities: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          locations_id: string[];
          locations_text: string;
          budget: number;
          priority_level: number;
          activities: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          locations_id?: string[];
          locations_text?: string;
          budget?: number;
          priority_level?: number;
          activities?: string;
          notes?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
  auth: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
        };
      };
    };
  };
}

// Derived Types
export type Location = Database["public"]["Tables"]["locations"]["Row"];
export type UserInterest = Database["public"]["Tables"]["user_interests"]["Row"];
export type UserInterestInsert = Database["public"]["Tables"]["user_interests"]["Insert"];

// Component Props Types
export interface InterestFormProps {
  locations: Location[];
  userId: string;
}

export interface InterestsListProps {
  userId: string;
  initialInterests: InterestWithLocations[];
}

export interface InterestWithLocations extends UserInterest {
  locations: Location[];
}

// API Types
export interface SearchPackagesParams {
  location_input: string;
  budget_input: string;
  activities_input: string;
  notes_input?: string;
  match_count?: number;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  activities: string[];
  locations: string[];
  rating: number;
  image_url: string;
}

// UI Types
export interface User {
  id: string;
  email: string;
}

// Chart Types
export const THEMES = { light: "", dark: ".dark" } as const;

export interface ChartConfig {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
}

// Toast Types
export interface ToasterToast {
  id: string;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface State {
  toasts: ToasterToast[];
}

// Carousel Types
export type CarouselOptions = {
  align?: "start" | "center" | "end";
  containScroll?: boolean;
  direction?: "ltr" | "rtl";
  dragFree?: boolean;
  dragThreshold?: number;
  inViewThreshold?: number;
  loop?: boolean;
  skipSnaps?: boolean;
  slidesToScroll?: number;
  speed?: number;
  startIndex?: number;
};

export type CarouselPlugin = any; // Simplified for now

export type CarouselApi = EmblaCarouselType;

export type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

export type CarouselContextProps = {
  carouselRef: React.RefObject<HTMLDivElement>;
  api: CarouselApi | undefined;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps; 