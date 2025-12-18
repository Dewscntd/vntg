/**
 * CMS Template Detail API Route
 *
 * Handles operations on individual templates.
 * GET - Get template by ID
 * PATCH - Update template
 * DELETE - Delete template (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { CMSTemplateVersion } from '@/types/cms-templates';
import { templatesStore, versionsStore } from '../route';

interface RouteParams {
  params: Promise<{
    templateId: string;
  }>;
}

/**
 * GET /api/cms/templates/[templateId]
 * Get a single template with its current version
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId } = await params;

    const template = templatesStore.get(templateId);

    if (!template || template.is_deleted) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Get versions
    const versions = versionsStore.get(templateId) || [];
    const currentVersion = versions.find((v) => v.id === template.current_version_id);
    const publishedVersion = template.published_version_id
      ? versions.find((v) => v.id === template.published_version_id)
      : null;

    // Increment view count
    template.view_count++;
    template.last_viewed_at = new Date().toISOString();
    templatesStore.set(templateId, template);

    return NextResponse.json({
      success: true,
      data: {
        template,
        current_version: currentVersion || null,
        published_version: publishedVersion || null,
        versions_count: versions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/cms/templates/[templateId]
 * Update a template
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId } = await params;
    const body = await request.json();
    const { name, description, category, tags, content, change_summary } = body;

    const template = templatesStore.get(templateId);

    if (!template || template.is_deleted) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    // Update template metadata
    if (name !== undefined) template.name = name;
    if (description !== undefined) template.description = description;
    if (category !== undefined) template.category = category;
    if (tags !== undefined) template.tags = tags;
    template.updated_at = now;

    // If content is provided, create a new version
    let newVersion: CMSTemplateVersion | null = null;
    if (content) {
      const versions = versionsStore.get(templateId) || [];
      const maxVersionNumber = versions.reduce((max, v) => Math.max(max, v.version_number), 0);

      newVersion = {
        id: `version-${crypto.randomUUID()}`,
        template_id: templateId,
        version_number: maxVersionNumber + 1,
        version_name: null,
        content: {
          id: `homepage-${templateId}`,
          sections: content.sections || [],
          status: 'draft',
          created_at: now,
          updated_at: now,
          metadata: content.metadata || {},
        },
        sections_count: content.sections?.length || 0,
        change_summary: change_summary || 'Content updated',
        change_type: 'edit',
        parent_version_id: template.current_version_id,
        based_on_version_id: null,
        is_published: false,
        published_at: null,
        created_by: null,
        is_valid: true,
        validation_errors: null,
        content_hash: '',
        created_at: now,
      };

      versions.push(newVersion);
      versionsStore.set(templateId, versions);

      // Update current version reference
      template.current_version_id = newVersion.id;

      // If template was published, mark it as modified
      if (template.status === 'published') {
        template.status = 'draft';
      }
    }

    templatesStore.set(templateId, template);

    return NextResponse.json({
      success: true,
      data: {
        template,
        new_version: newVersion,
      },
      message: 'Template updated successfully',
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cms/templates/[templateId]
 * Soft delete a template
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId } = await params;

    const template = templatesStore.get(templateId);

    if (!template || template.is_deleted) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    // Soft delete
    template.is_deleted = true;
    template.deleted_at = now;
    template.status = 'archived';
    templatesStore.set(templateId, template);

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
