
import { MediaItem, Category, XtreamAccount } from '../types';

export const xtreamService = {
  async login(url: string, user: string, pass: string): Promise<any> {
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const apiUrl = `${baseUrl}/player_api.php?username=${user}&password=${pass}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.user_info && data.user_info.auth === 1) {
      return data;
    }
    throw new Error('Authentication failed');
  },

  async getCategories(account: XtreamAccount, action: 'get_live_categories' | 'get_vod_categories' | 'get_series_categories'): Promise<Category[]> {
    const url = `${account.url}/player_api.php?username=${account.username}&password=${account.password}&action=${action}`;
    const response = await fetch(url);
    return await response.json();
  },

  async getStreams(account: XtreamAccount, action: 'get_live_streams' | 'get_vod_streams' | 'get_series', categoryId?: string): Promise<any[]> {
    let url = `${account.url}/player_api.php?username=${account.username}&password=${account.password}&action=${action}`;
    if (categoryId) url += `&category_id=${categoryId}`;
    const response = await fetch(url);
    return await response.json();
  },

  mapToMediaItem(item: any, type: 'movie' | 'tv' | 'live', account: XtreamAccount): MediaItem {
    const id = item.stream_id || item.series_id || item.id;
    let streamUrl = '';
    if (type === 'live') {
      streamUrl = `${account.url}/live/${account.username}/${account.password}/${item.stream_id}.ts`;
    } else if (type === 'movie') {
      streamUrl = `${account.url}/movie/${account.username}/${account.password}/${item.stream_id}.${item.container_extension || 'mp4'}`;
    }

    return {
      id: String(id),
      stream_id: item.stream_id,
      series_id: item.series_id,
      title: item.name || item.title,
      year: parseInt(item.releaseDate || item.last_modified) || new Date().getFullYear(),
      rating: parseFloat(item.rating) || 0,
      type: type,
      genre: [],
      description: item.plot || 'No description',
      posterUrl: item.stream_icon || item.cover || 'https://via.placeholder.com/400x600?text=No+Image',
      backdropUrl: item.backdrop_path?.[0] || item.stream_icon || item.cover || '',
      streamUrl: streamUrl,
      category_id: item.category_id
    };
  }
};
