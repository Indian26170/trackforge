import axios from 'axios';

let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};

const api = axios.create({ baseURL: '/api', withCredentials: true });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const skip = ['/auth/login', '/auth/refresh'].includes(original.url);

    if (error.response?.status === 401 && !original._retry && !skip) {
      original._retry = true;
      refreshing ??= api.post('/auth/refresh').finally(() => {
        refreshing = null;
      });
      try {
        const { data } = await refreshing;
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        setAccessToken(null);
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
