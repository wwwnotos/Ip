export enum ContentType {
  LIVE = 'live',
  VOD = 'vod',
  SERIES = 'series'
}

export interface UserCredentials {
  url: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  user_info: {
    username: string;
    status: string;
    exp_date: string;
    is_trial: string;
    active_cons: string;
    created_at: string;
    max_connections: string;
  };
  server_info: {
    url: string;
    port: string;
    https_port: string;
    server_protocol: string;
    rtmp_port: string;
    timezone: string;
    timestamp_now: number;
    time_now: string;
  };
}

export interface StreamItem {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon?: string;
  epg_channel_id?: string;
  added: string;
  category_id: string;
  rating?: string;
  rating_5based?: number;
  backdrop_path?: string[];
  container_extension?: string;
}

export interface Category {
  category_id: string;
  category_name: string;
  parent_id: number;
}