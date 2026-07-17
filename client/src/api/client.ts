import axios from 'axios';
import type { ApiResponse, ApiError } from '@/types/api';

const client = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const apiError: ApiError = error.response.data?.error || {
        code: 'UNKNOWN_ERROR',
        message: error.message || '请求失败',
      };

      switch (error.response.status) {
        case 401:
          console.error('[API] 未授权');
          break;
        case 404:
          console.error('[API] 资源不存在');
          break;
        case 500:
          console.error('[API] 服务器错误');
          break;
      }

      return Promise.reject(apiError);
    }
    return Promise.reject({
      code: 'NETWORK_ERROR',
      message: '网络连接异常',
    });
  }
);

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
  const response = await client.get<ApiResponse<T>>(url, { params });
  return response.data;
}

export async function post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
  const response = await client.post<ApiResponse<T>>(url, data);
  return response.data;
}

export async function put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
  const response = await client.put<ApiResponse<T>>(url, data);
  return response.data;
}

export async function patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
  const response = await client.patch<ApiResponse<T>>(url, data);
  return response.data;
}

export async function del<T>(url: string): Promise<ApiResponse<T>> {
  const response = await client.delete<ApiResponse<T>>(url);
  return response.data;
}

export default client;
