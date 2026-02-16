
import { MediaItem, MediaType, CastMember } from '../types';

const API_KEY = 'a802f089da38a5e3671c9563615bfdee';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Genre mapping for Movies and TV
const GENRES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adv", 10762: "Kids", 10763: "News", 10764: "Reality",
  10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics"
};

const getGenreNames = (ids: number[] = []): string[] => {
  return ids.map(id => GENRES[id]).filter(Boolean).slice(0, 3);
};

// Helper to map TMDB response to our MediaItem type
const mapResultToMediaItem = (item: any): MediaItem => {
  const isMovie = item.title ? true : false;
  const releaseDate = item.release_date || item.first_air_date;
  
  return {
    id: item.id.toString(),
    title: item.title || item.name,
    originalTitle: item.original_title || item.original_name,
    year: new Date(releaseDate || Date.now()).getFullYear(),
    releaseDate: releaseDate, // Store full date
    rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : 0,
    // Calculate App Rating (out of 5) based on TMDB vote (out of 10)
    appRating: item.vote_average ? Number((item.vote_average / 2).toFixed(1)) : 0,
    duration: '', // Fetched in details
    type: isMovie ? 'movie' : 'tv',
    genre: getGenreNames(item.genre_ids),
    description: item.overview || 'No description available.',
    posterUrl: item.poster_path 
      ? `${IMAGE_BASE_URL}/w500${item.poster_path}` 
      : 'https://via.placeholder.com/400x600?text=No+Image',
    backdropUrl: item.backdrop_path 
      ? `${IMAGE_BASE_URL}/w1280${item.backdrop_path}` 
      : item.poster_path 
        ? `${IMAGE_BASE_URL}/w780${item.poster_path}`
        : 'https://via.placeholder.com/800x450?text=No+Image',
    isTrending: false,
    cast: []
  };
};

// "Latest Movies" - Uses Now Playing
export const fetchNowPlaying = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=${page}`);
    const data = await response.json();
    return data.results.map(mapResultToMediaItem);
  } catch (error) {
    console.error("Error fetching now playing:", error);
    return [];
  }
};

// "Latest TV Shows" - Uses On The Air
export const fetchLatestTV = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&language=en-US&page=${page}`);
    const data = await response.json();
    return data.results.map(mapResultToMediaItem);
  } catch (error) {
    console.error("Error fetching latest TV:", error);
    return [];
  }
};

// "Latest Releases" - Combines Movies and TV, sorted by date
export const fetchNewReleases = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const [movies, tv] = await Promise.all([
      fetchNowPlaying(page),
      fetchLatestTV(page)
    ]);
    
    // Combine and sort by release date descending (newest first)
    const combined = [...movies, ...tv].sort((a, b) => {
      const dateA = new Date(a.releaseDate || 0).getTime();
      const dateB = new Date(b.releaseDate || 0).getTime();
      return dateB - dateA;
    });

    return combined;
  } catch (error) {
    console.error("Error fetching new releases:", error);
    return [];
  }
};

export const fetchTrending = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}&page=${page}`);
    const data = await response.json();
    return data.results.map(mapResultToMediaItem);
  } catch (error) {
    console.error("Error fetching trending:", error);
    return [];
  }
};

export const fetchPopular = async (type: MediaType = 'movie', page: number = 1): Promise<MediaItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/${type}/popular?api_key=${API_KEY}&language=en-US&page=${page}`);
    const data = await response.json();
    return data.results.map(mapResultToMediaItem);
  } catch (error) {
    console.error(`Error fetching popular ${type}:`, error);
    return [];
  }
};

export const fetchTopRated = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`);
    const data = await response.json();
    return data.results.map(mapResultToMediaItem);
  } catch (error) {
    console.error("Error fetching top rated:", error);
    return [];
  }
};

export const searchMedia = async (query: string, page: number = 1): Promise<MediaItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`);
    const data = await response.json();
    
    // Filter out people and items without images
    const items = data.results
      .filter((item: any) => item.media_type !== 'person' && (item.poster_path || item.backdrop_path))
      .map(mapResultToMediaItem);

    // Sort by Latest (Year Descending)
    return items.sort((a: MediaItem, b: MediaItem) => b.year - a.year);
  } catch (error) {
    console.error("Error searching:", error);
    return [];
  }
};

// New function to fetch media by Genre ID (Discover) sorted by Popularity with Pagination
export const fetchMediaByGenre = async (genreId: number, type: MediaType = 'movie', page: number = 1): Promise<MediaItem[]> => {
  try {
    // Sort by popularity.desc for better accuracy
    const sortBy = 'popularity.desc';
    // Adding vote_count.gte=10 to filter out complete noise/garbage data
    const response = await fetch(`${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_genres=${genreId}&sort_by=${sortBy}&vote_count.gte=10&page=${page}&language=en-US`);
    
    const data = await response.json();
    return data.results.map(mapResultToMediaItem);
  } catch (error) {
    console.error(`Error fetching by genre ${genreId}:`, error);
    return [];
  }
};

export const fetchMediaDetails = async (id: string, type: MediaType): Promise<MediaItem | null> => {
  try {
    const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=credits,videos,images`);
    const data = await response.json();

    const baseItem = mapResultToMediaItem(data);

    // Enrich with details
    const director = data.credits?.crew?.find((p: any) => p.job === 'Director')?.name;
    const cast: CastMember[] = data.credits?.cast?.slice(0, 10).map((actor: any) => ({
      name: actor.name,
      role: actor.character,
      image: actor.profile_path 
        ? `${IMAGE_BASE_URL}/w185${actor.profile_path}` 
        : 'https://via.placeholder.com/100x100?text=User'
    })) || [];

    // Format Duration
    let duration = '';
    if (type === 'movie' && data.runtime) {
      const h = Math.floor(data.runtime / 60);
      const m = data.runtime % 60;
      duration = `${h}h ${m}m`;
    } else if (type === 'tv' && data.episode_run_time?.length > 0) {
      duration = `${data.episode_run_time[0]}m avg`;
    } else if (type === 'tv') {
      duration = `${data.number_of_seasons} Season${data.number_of_seasons > 1 ? 's' : ''}`;
    }

    // --- Trailer Logic ---
    let trailerUrl = '';
    let trailerKey = '';
    let isSearchEmbed = false;
    const videos = data.videos?.results || [];
    
    // 1. Broaden search to find *any* valid video key before fallback
    // Priority: Trailer > Teaser > Clip > Featurette > Opening Credits > Any
    const validVideo = videos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') 
                    || videos.find((v: any) => v.site === 'YouTube' && v.type === 'Teaser')
                    || videos.find((v: any) => v.site === 'YouTube' && (v.type === 'Clip' || v.type === 'Featurette' || v.type === 'Opening Credits' || v.type === 'Behind the Scenes'))
                    || videos.find((v: any) => v.site === 'YouTube'); // Fallback to ANY YouTube video
    
    if (validVideo) {
        trailerUrl = `https://www.youtube.com/watch?v=${validVideo.key}`;
        trailerKey = validVideo.key;
        isSearchEmbed = false;
    } else {
        // 2. FALLBACK: "Find another way"
        // If absolutely no video ID found from API, use the YouTube Search Embed method.
        // We set the trailerKey to the SEARCH QUERY, and flag it.
        const query = `${baseItem.title} ${baseItem.year} Official Trailer`;
        trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        trailerKey = query; // This will be used in the list param
        isSearchEmbed = true;
    }

    return {
      ...baseItem,
      duration,
      cast,
      trailerUrl,
      trailerKey,
      isSearchEmbed,
      genre: data.genres?.map((g: any) => g.name) || baseItem.genre,
    };

  } catch (error) {
    console.error("Error fetching details:", error);
    return null;
  }
};
