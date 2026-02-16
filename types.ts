
export type MediaType = 'movie' | 'tv' | 'live';

export interface CastMember {
  name: string;
  role: string;
  image: string;
}

export interface MediaItem {
  id: string;
  stream_id?: number;
  series_id?: number;
  title: string;
  // Added optional originalTitle to support TMDB data
  originalTitle?: string;
  year: number;
  rating: number;
  appRating?: number;
  duration?: string;
  type: MediaType;
  genre: string[];
  description: string;
  posterUrl: string;
  backdropUrl: string;
  streamUrl?: string;
  // Added trailer and search metadata support
  trailerUrl?: string;
  trailerKey?: string;
  isSearchEmbed?: boolean;
  // Added isTrending flag for local mock data and categorizing
  isTrending?: boolean;
  cast?: CastMember[];
  releaseDate?: string;
  category_id?: string;
}

export type ViewState = 'home' | 'live' | 'movies' | 'series' | 'profile';

export interface XtreamAccount {
  username: string;
  password?: string;
  url: string;
  status: string;
  exp_date: string;
  max_connections: string;
  active_connections: string;
}

export interface User {
  name: string;
  email: string;
  joined: string;
  account?: XtreamAccount;
}

export interface Category {
  id: string;
  name: string;
}