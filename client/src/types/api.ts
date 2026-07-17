export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: { field: string; message: string }[];
}
