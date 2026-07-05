import axios from 'axios';

import { env } from '@/config/env';

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  timeout: 15000,
});
