/**
 * CMS Template Versions API Route
 *
 * Handles version history and restoration.
 * GET - List all versions of a template
 * POST - Create a new version / Restore to a previous version
 */

import { NextRequest, NextResponse } from 'next/server';
import { CMSTemplateVersion } from '@/types/cms-templates';
import { templatesStore, versionsStore } from '../../route';

interface RouteParams {
  params: Promise<{
    templateId: string;
  }>;
}

/**
 * GET /api/cms/templates/[templateId]/versions
 * List all versions of a template
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId } = await params;
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const template = templatesStore.get(templateId);

    if (!template || template.is_deleted) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    const versions = versionsStore.get(templateId) || [];

    // Sort by version number descending (most recent first)
    const sortedVersions = [...versions].sort((a, b) => b.version_number - a.version_number);

    // Paginate
    const total = sortedVersions.length;
    const paginatedVersions = sortedVersions.slice(offset, offset + limit);

    // Add metadata to each version
    const versionsWithMeta = paginatedVersions.map((v) => ({
      ...v,
      is_current: v.id === template.current_version_id,
      is_published: v.id === template.published_version_id,
    }));

    return NextResponse.json({
      success: true,
      data: {
        versions: versionsWithMeta,
        pagination: {
          total,
          offset,
          limit,
          has_more: offset + limit < total,
        },
      },
    });
  } catch (error) {
    console.error('Error listing versions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list versions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cms/templates/[templateId]/versions
 * Create a new version or restore to a previous version
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId } = await params;
    const body = await request.json();
    const { action, version_id, content, change_summary } = body;

    const template = templatesStore.get(templateId);

    if (!template || template.is_deleted) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    const versions = versionsStore.get(templateId) || [];
    const maxVersionNumber = versions.reduce((max, v) => Math.max(max, v.version_number), 0);
    const now = new Date().toISOString();

    let newVersion: CMSTemplateVersion;

    if (action === 'restore' && version_id) {
      // Restore to a previous version
      const targetVersion = versions.find((v) => v.id === version_id);

      if (!targetVersion) {
        return NextResponse.json(
          { success: false, error: 'Version not found' },
          { status: 404 }
        );
      }

      // Create new version from the target version's content
      newVersion = {
        id: `version-${crypto.randomUUID()}`,
        template_id: templateId,
        version_number: maxVersionNumber + 1,
        version_name: `Restored from v${targetVersion.version_number}`,
        content: { ...targetVersion.content },
        sections_count: targetVersion.sections_count,
        change_summary: change_summary || `Restored from version ${targetVersion.version_number}`,
        change_type: 'revert',
        parent_version_id: template.current_version_id,
        based_on_version_id: version_id,
        is_published: false,
        published_at: null,
        created_by: null,
        is_valid: true,
        validation_errors: null,
        content_hash: '',
        created_at: now,
      };
    } else {
      // Create new version with provided content
      if (!content) {
        return NextResponse.json(
          { success: false, error: 'Content is required for creating a new version' },
          { status: 400 }
        );
      }

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
        change_summary: change_summary || 'New version created',
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
    }

    // Add new version
    versions.push(newVersion);
    versionsStore.set(templateId, versions);

    // Update template
    template.current_version_id = newVersion.id;
    template.updated_at = now;

    // If was published, mark as having unpublished changes
    if (template.status === 'published') {
      template.status = 'draft';
    }

    templatesStore.set(templateId, template);

    return NextResponse.json({
      success: true,
      data: {
        version: newVersion,
        template,
      },
      message:
        action === 'restore'
          ? 'Version restored successfully'
          : 'New version created successfully',
    });
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create version' },
      { status: 500 }
    );
  }
}
