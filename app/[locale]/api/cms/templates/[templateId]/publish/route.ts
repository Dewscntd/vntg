/**
 * CMS Template Publish API Route
 *
 * Handles publishing and unpublishing templates.
 * POST - Publish template
 * DELETE - Unpublish template
 */

import { NextRequest, NextResponse } from 'next/server';
import { templatesStore, versionsStore } from '../../route';

interface RouteParams {
  params: Promise<{
    templateId: string;
  }>;
}

/**
 * POST /api/cms/templates/[templateId]/publish
 * Publish a template version
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId } = await params;
    const body = await request.json().catch(() => ({}));
    const { version_id, scheduled_for, timezone } = body;

    const template = templatesStore.get(templateId);

    if (!template || template.is_deleted) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    const versions = versionsStore.get(templateId) || [];

    // Determine which version to publish
    const targetVersionId = version_id || template.current_version_id;
    const targetVersion = versions.find((v) => v.id === targetVersionId);

    if (!targetVersion) {
      return NextResponse.json(
        { success: false, error: 'Version not found' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    // Handle scheduled publishing
    if (scheduled_for) {
      const scheduledDate = new Date(scheduled_for);
      if (scheduledDate <= new Date()) {
        return NextResponse.json(
          { success: false, error: 'Scheduled time must be in the future' },
          { status: 400 }
        );
      }

      template.scheduled_publish_at = scheduledDate.toISOString();
      template.status = 'scheduled';
      templatesStore.set(templateId, template);

      return NextResponse.json({
        success: true,
        data: {
          template,
          scheduled_for: template.scheduled_publish_at,
        },
        message: 'Template scheduled for publishing',
      });
    }

    // Immediate publish
    // Unpublish previous version if exists
    if (template.published_version_id) {
      const previousVersion = versions.find((v) => v.id === template.published_version_id);
      if (previousVersion) {
        previousVersion.is_published = false;
      }
    }

    // Publish target version
    targetVersion.is_published = true;
    targetVersion.published_at = now;

    // Update template
    template.published_version_id = targetVersion.id;
    template.published_at = now;
    template.status = 'published';
    template.scheduled_publish_at = null;
    template.updated_at = now;

    versionsStore.set(templateId, versions);
    templatesStore.set(templateId, template);

    return NextResponse.json({
      success: true,
      data: {
        template,
        published_version: targetVersion,
      },
      message: 'Template published successfully',
    });
  } catch (error) {
    console.error('Error publishing template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cms/templates/[templateId]/publish
 * Unpublish a template
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

    if (template.status !== 'published' && template.status !== 'scheduled') {
      return NextResponse.json(
        { success: false, error: 'Template is not published or scheduled' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const versions = versionsStore.get(templateId) || [];

    // Unpublish current published version
    if (template.published_version_id) {
      const publishedVersion = versions.find((v) => v.id === template.published_version_id);
      if (publishedVersion) {
        publishedVersion.is_published = false;
      }
    }

    // Update template
    template.published_version_id = null;
    template.unpublished_at = now;
    template.status = 'draft';
    template.scheduled_publish_at = null;
    template.scheduled_unpublish_at = null;
    template.updated_at = now;

    versionsStore.set(templateId, versions);
    templatesStore.set(templateId, template);

    return NextResponse.json({
      success: true,
      data: { template },
      message: 'Template unpublished successfully',
    });
  } catch (error) {
    console.error('Error unpublishing template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unpublish template' },
      { status: 500 }
    );
  }
}
