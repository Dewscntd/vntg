/**
 * CMS Template Duplicate API Route
 *
 * Handles duplicating templates.
 * POST - Create a duplicate of a template
 */

import { NextRequest, NextResponse } from 'next/server';
import { CMSTemplate, CMSTemplateVersion } from '@/types/cms-templates';
import { templatesStore, versionsStore } from '../../route';

interface RouteParams {
  params: Promise<{
    templateId: string;
  }>;
}

/**
 * POST /api/cms/templates/[templateId]/duplicate
 * Create a duplicate of a template
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId } = await params;
    const body = await request.json();
    const { name, slug } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const sourceTemplate = templatesStore.get(templateId);

    if (!sourceTemplate || sourceTemplate.is_deleted) {
      return NextResponse.json(
        { success: false, error: 'Source template not found' },
        { status: 404 }
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

    // Get source version
    const sourceVersions = versionsStore.get(templateId) || [];
    const sourceVersion = sourceVersions.find((v) => v.id === sourceTemplate.current_version_id);

    if (!sourceVersion) {
      return NextResponse.json(
        { success: false, error: 'Source template has no content' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newTemplateId = `template-${crypto.randomUUID()}`;
    const newVersionId = `version-${crypto.randomUUID()}`;

    // Create new template
    const newTemplate: CMSTemplate = {
      id: newTemplateId,
      name,
      slug,
      description: sourceTemplate.description
        ? `Copy of: ${sourceTemplate.description}`
        : `Duplicated from ${sourceTemplate.name}`,
      category: sourceTemplate.category,
      tags: [...sourceTemplate.tags],
      thumbnail_url: sourceTemplate.thumbnail_url,
      current_version_id: newVersionId,
      published_version_id: null,
      status: 'draft',
      scheduled_publish_at: null,
      scheduled_unpublish_at: null,
      published_at: null,
      unpublished_at: null,
      created_by: null, // Would be set from auth
      updated_by: null,
      published_by: null,
      metadata: { ...sourceTemplate.metadata, duplicated_from: templateId },
      view_count: 0,
      last_viewed_at: null,
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
      created_at: now,
      updated_at: now,
    };

    // Create initial version with copied content
    const newVersion: CMSTemplateVersion = {
      id: newVersionId,
      template_id: newTemplateId,
      version_number: 1,
      version_name: 'Initial version (duplicated)',
      content: {
        ...sourceVersion.content,
        id: `homepage-${newTemplateId}`,
        created_at: now,
        updated_at: now,
        status: 'draft',
      },
      sections_count: sourceVersion.sections_count,
      change_summary: `Duplicated from template: ${sourceTemplate.name}`,
      change_type: 'duplicate',
      parent_version_id: null,
      based_on_version_id: sourceVersion.id,
      is_published: false,
      published_at: null,
      created_by: null,
      is_valid: true,
      validation_errors: null,
      content_hash: '',
      created_at: now,
    };

    // Store new template and version
    templatesStore.set(newTemplateId, newTemplate);
    versionsStore.set(newTemplateId, [newVersion]);

    return NextResponse.json({
      success: true,
      data: {
        template: newTemplate,
        version: newVersion,
      },
      message: 'Template duplicated successfully',
    });
  } catch (error) {
    console.error('Error duplicating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to duplicate template' },
      { status: 500 }
    );
  }
}
