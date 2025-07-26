import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { withAdmin } from '@/lib/api/middleware';
import {
  successResponse,
  handleServerError,
  handleDatabaseError,
  errorResponse,
} from '@/lib/api/index';

// POST /api/products/upload - Upload a product image (admin only)
export async function POST(req: NextRequest) {
  return withAdmin(req, async (req, session) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });

      // Check if the request is multipart/form-data
      const contentType = req.headers.get('content-type') || '';
      if (!contentType.includes('multipart/form-data')) {
        return errorResponse('Request must be multipart/form-data', 400);
      }

      // Parse the form data
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return errorResponse('No file provided', 400);
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return errorResponse('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.', 400);
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return errorResponse('File size exceeds the 5MB limit', 400);
      }

      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      return successResponse({
        url: publicUrlData.publicUrl,
        path: filePath,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      return handleServerError(error as Error);
    }
  });
}
