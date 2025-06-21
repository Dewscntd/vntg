import { createClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';

// Types for query parameters
export type QueryOptions = {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
};

// Generic database query function
export async function query<T>(
  table: keyof Database['public']['Tables'],
  options: QueryOptions = {},
  isServer = false
): Promise<T[]> {
  const supabase = isServer ? createServerClient() : createClient();
  const { limit = 10, offset = 0, orderBy, orderDirection = 'desc', filters = {} } = options;

  let query = supabase.from(table).select('*');

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });

  // Apply ordering
  if (orderBy) {
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error(`Error querying ${table}:`, error);
    throw new Error(`Failed to query ${table}: ${error.message}`);
  }

  return data as T[];
}

// Get a single record by ID
export async function getById<T>(
  table: keyof Database['public']['Tables'],
  id: string,
  isServer = false
): Promise<T | null> {
  const supabase = isServer ? createServerClient() : createClient();
  
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Record not found
      return null;
    }
    console.error(`Error getting ${table} by ID:`, error);
    throw new Error(`Failed to get ${table} by ID: ${error.message}`);
  }

  return data as T;
}

// Insert a new record
export async function insert<T>(
  table: keyof Database['public']['Tables'],
  data: any,
  isServer = false
): Promise<T> {
  const supabase = isServer ? createServerClient() : createClient();
  
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error(`Error inserting into ${table}:`, error);
    throw new Error(`Failed to insert into ${table}: ${error.message}`);
  }

  return result as T;
}

// Update a record
export async function update<T>(
  table: keyof Database['public']['Tables'],
  id: string,
  data: any,
  isServer = false
): Promise<T> {
  const supabase = isServer ? createServerClient() : createClient();
  
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating ${table}:`, error);
    throw new Error(`Failed to update ${table}: ${error.message}`);
  }

  return result as T;
}

// Delete a record
export async function remove(
  table: keyof Database['public']['Tables'],
  id: string,
  isServer = false
): Promise<void> {
  const supabase = isServer ? createServerClient() : createClient();
  
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting from ${table}:`, error);
    throw new Error(`Failed to delete from ${table}: ${error.message}`);
  }
}

// Count records
export async function count(
  table: keyof Database['public']['Tables'],
  filters: Record<string, any> = {},
  isServer = false
): Promise<number> {
  const supabase = isServer ? createServerClient() : createClient();
  
  let query = supabase.from(table).select('*', { count: 'exact', head: true });

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });

  const { count: result, error } = await query;

  if (error) {
    console.error(`Error counting ${table}:`, error);
    throw new Error(`Failed to count ${table}: ${error.message}`);
  }

  return result || 0;
}
