import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// Standard API response structure
export type ApiResponse<T = any> = {
  status: 'success' | 'error';
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
};

// Success response
export function successResponse<T>(data: T, status = 200): NextResponse {
  const response: ApiResponse<T> = {
    status: 'success',
    data,
  };
  return NextResponse.json(response, { status });
}

// Error response
export function errorResponse(
  message: string,
  status = 400,
  code?: string,
  details?: any
): NextResponse {
  const response: ApiResponse = {
    status: 'error',
    error: {
      message,
      code,
      details,
    },
  };
  return NextResponse.json(response, { status });
}

// Handle validation errors from Zod
export function handleZodError(error: ZodError): NextResponse {
  return errorResponse(
    'Validation error',
    400,
    'VALIDATION_ERROR',
    error.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }))
  );
}

// Handle database errors
export function handleDatabaseError(error: Error): NextResponse {
  console.error('Database error:', error);
  return errorResponse(
    'Database operation failed',
    500,
    'DATABASE_ERROR'
  );
}

// Handle unauthorized access
export function handleUnauthorized(message = 'Unauthorized'): NextResponse {
  return errorResponse(message, 401, 'UNAUTHORIZED');
}

// Handle not found
export function handleNotFound(message = 'Resource not found'): NextResponse {
  return errorResponse(message, 404, 'NOT_FOUND');
}

// Handle server errors
export function handleServerError(error: Error): NextResponse {
  console.error('Server error:', error);
  return errorResponse(
    'Internal server error',
    500,
    'SERVER_ERROR'
  );
}

// Check if user is authenticated
export function isAuthenticated(session: any): boolean {
  return !!session?.user;
}

// Check if user is an admin
export function isAdmin(session: any): boolean {
  return !!session?.user && session.user.user_metadata?.role === 'admin';
}
