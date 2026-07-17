import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[source]);
      // req.query 是只读 getter，需要存储到自定义属性上
      if (source === 'query') {
        (req as any).validatedQuery = data;
      } else {
        req[source] = data;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return _res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '请求参数校验失败', details },
        });
      }
      next(err);
    }
  };
}
