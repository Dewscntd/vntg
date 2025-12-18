/**
 * CMS Templates API Route
 *
 * Handles template listing and creation.
 * GET - List templates with filtering/pagination
 * POST - Create new template
 */

import { NextRequest, NextResponse } from 'next/server';
import { Section } from '@/types/cms';
import {
  CMSTemplate,
  CMSTemplateVersion,
  TemplateStatus,
  TemplateCategory,
} from '@/types/cms-templates';

// Check if we're using stubs
const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === 'true';

// In-memory store for templates (in production, this would be in the database)
const templatesStore = new Map<string, CMSTemplate>();
const versionsStore = new Map<string, CMSTemplateVersion[]>();

// Initialize with sample templates
function initializeSampleTemplates() {
  if (templatesStore.size > 0) return;

  const now = new Date().toISOString();

  // Sample template 1: Default Homepage
  const template1: CMSTemplate = {
    id: 'template-default-homepage',
    name: 'Default Homepage',
    slug: 'default-homepage',
    description: 'A classic homepage layout with hero, products, and categories',
    category: 'custom',
    tags: ['homepage', 'default', 'classic'],
    thumbnail_url: null,
    current_version_id: 'version-1',
    published_version_id: 'version-1',
    status: 'published',
    scheduled_publish_at: null,
    scheduled_unpublish_at: null,
    published_at: now,
    unpublished_at: null,
    created_by: null,
    updated_by: null,
    published_by: null,
    metadata: {},
    view_count: 0,
    last_viewed_at: null,
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
    created_at: now,
    updated_at: now,
  };

  // Sample template 2: Seasonal Sale
  const template2: CMSTemplate = {
    id: 'template-seasonal-sale',
    name: 'Seasonal Sale',
    slug: 'seasonal-sale',
    description: 'Perfect for holiday and seasonal promotions',
    category: 'seasonal',
    tags: ['sale', 'seasonal', 'promotion'],
    thumbnail_url: null,
    current_version_id: 'version-2',
    published_version_id: null,
    status: 'draft',
    scheduled_publish_at: null,
    scheduled_unpublish_at: null,
    published_at: null,
    unpublished_at: null,
    created_by: null,
    updated_by: null,
    published_by: null,
    metadata: {},
    view_count: 0,
    last_viewed_at: null,
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
    created_at: now,
    updated_at: now,
  };

  templatesStore.set(template1.id, template1);
  templatesStore.set(template2.id, template2);

  // Sample versions
  const version1: CMSTemplateVersion = {
    id: 'version-1',
    template_id: template1.id,
    version_number: 1,
    version_name: 'Initial version',
    content: {
      id: 'homepage-1',
      sections: [],
      status: 'published',
      created_at: now,
      updated_at: now,
      metadata: {},
    },
    sections_count: 0,
    change_summary: 'Initial template creation',
    change_type: 'create',
    parent_version_id: null,
    based_on_version_id: null,
    is_published: true,
    published_at: now,
    created_by: null,
    is_valid: true,
    validation_errors: null,
    content_hash: '',
    created_at: now,
  };

  versionsStore.set(template1.id, [version1]);
}

// Initialize on module load
initializeSampleTemplates();

/**
 * GET /api/cms/templates
 * List templates with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const status = searchParams.get('status') as TemplateStatus | null;
    const category = searchParams.get('category') as TemplateCategory | null;
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sortBy = searchParams.get('sort_by') || 'updated_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // Get all templates from store
    let templates = Array.from(templatesStore.values()).filter((t) => !t.is_deleted);

    // Apply filters
    if (status) {
      templates = templates.filter((t) => t.status === status);
    }
    if (category) {
      templates = templates.filter((t) => t.category === category);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort
    templates.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'view_count':
          comparison = a.view_count - b.view_count;
          break;
        case 'updated_at':
        default:
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Paginate
    const total = templates.length;
    const offset = (page - 1) * limit;
    const paginatedTemplates = templates.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        templates: paginatedTemplates,
        pagination: {
          total,
          page,
          limit,
          has_more: offset + limit < total,
        },
      },
    });
  } catch (error) {
    console.error('Error listing templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cms/templates
 * Create a new template
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, category, tags, content } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existingTemplate = Array.from(templatesStore.values()).find(
      (t) => t.slug === slug && !t.is_deleted
    );
    if (existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'A template with this slug already exists' },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const templateId = `template-${crypto.randomUUID()}`;
    const versionId = `version-${crypto.randomUUID()}`;

    // Create template
    const template: CMSTemplate = {
      id: templateId,
      name,
      slug,
      description: description || null,
      category: category || 'custom',
      tags: tags || [],
      thumbnail_url: null,
      current_version_id: versionId,
      published_version_id: null,
      status: 'draft',
      scheduled_publish_at: null,
      scheduled_unpublish_at: null,
      published_at: null,
      unpublished_at: null,
      created_by: null, // Would be set from auth
      updated_by: null,
      published_by: null,
      metadata: {},
      view_count: 0,
      last_viewed_at: null,
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
      created_at: now,
      updated_at: now,
    };

    // Create initial version
    const sections = content?.sections || [];
    const version: CMSTemplateVersion = {
      id: versionId,
      template_id: templateId,
      version_number: 1,
      version_name: 'Initial version',
      content: {
        id: `homepage-${templateId}`,
        sections,
        status: 'draft',
        created_at: now,
        updated_at: now,
        metadata: content?.metadata || {},
      },
      sections_count: sections.length,
      change_summary: 'Template created',
      change_type: 'create',
      parent_version_id: null,
      based_on_version_id: null,
      is_published: false,
      published_at: null,
      created_by: null,
      is_valid: true,
      validation_errors: null,
      content_hash: '',
      created_at: now,
    };

    // Store template and version
    templatesStore.set(templateId, template);
    versionsStore.set(templateId, [version]);

    return NextResponse.json({
      success: true,
      data: {
        template,
        version,
      },
      message: 'Template created successfully',
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

// Export stores for use by other routes
export { templatesStore, versionsStore };
