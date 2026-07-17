import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function success<T>(res: Response, data: T, pagination?: PaginationMeta) {
  return res.json({
    success: true,
    data,
    message: 'ok',
    ...(pagination ? { pagination } : {}),
  });
}

export function error(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: { field: string; message: string }[]
) {
  return res.status(statusCode).json({
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  });
}
