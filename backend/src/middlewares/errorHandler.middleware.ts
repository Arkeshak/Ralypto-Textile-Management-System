import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Unhandled Application Error:', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation error: Please review input fields.',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'A duplicate record already exists (e.g. SKU, code, or phone number already in use).',
      });
      return;
    }
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
};
