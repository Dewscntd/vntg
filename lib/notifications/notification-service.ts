// Notification service for multi-channel notifications

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  subject?: string;
  content: string;
  variables: string[];
}

export interface NotificationPreferences {
  emailOrderUpdates: boolean;
  emailMarketing: boolean;
  emailPromotions: boolean;
  smsOrderUpdates: boolean;
  smsDeliveryAlerts: boolean;
  pushOrderUpdates: boolean;
  pushPromotions: boolean;
}

export interface NotificationData {
  userId?: string;
  type: 'email' | 'sms' | 'push';
  channel: string;
  templateId: string;
  recipient: string;
  subject?: string;
  variables: Record<string, any>;
  scheduledFor?: string;
}

export class NotificationService {
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Email templates
    this.templates.set('order_confirmation', {
      id: 'order_confirmation',
      name: 'Order Confirmation',
      type: 'email',
      subject: 'Order Confirmation - {{orderNumber}}',
      content: `
        <h1>Thank you for your order!</h1>
        <p>Hi {{customerName}},</p>
        <p>We've received your order {{orderNumber}} and it's being processed.</p>
        <p><strong>Order Total:</strong> {{total}}</p>
        <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
        <p>You can track your order at: {{trackingUrl}}</p>
      `,
      variables: ['customerName', 'orderNumber', 'total', 'estimatedDelivery', 'trackingUrl'],
    });

    this.templates.set('order_shipped', {
      id: 'order_shipped',
      name: 'Order Shipped',
      type: 'email',
      subject: 'Your order {{orderNumber}} has shipped!',
      content: `
        <h1>Your order is on its way!</h1>
        <p>Hi {{customerName}},</p>
        <p>Great news! Your order {{orderNumber}} has been shipped.</p>
        <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
        <p><strong>Carrier:</strong> {{carrier}}</p>
        <p>Track your package: {{trackingUrl}}</p>
      `,
      variables: ['customerName', 'orderNumber', 'trackingNumber', 'carrier', 'trackingUrl'],
    });

    this.templates.set('order_delivered', {
      id: 'order_delivered',
      name: 'Order Delivered',
      type: 'email',
      subject: 'Your order {{orderNumber}} has been delivered!',
      content: `
        <h1>Your order has been delivered!</h1>
        <p>Hi {{customerName}},</p>
        <p>Your order {{orderNumber}} has been successfully delivered.</p>
        <p>We hope you love your purchase! Please consider leaving a review.</p>
        <p><a href="{{reviewUrl}}">Leave a Review</a></p>
      `,
      variables: ['customerName', 'orderNumber', 'reviewUrl'],
    });

    // SMS templates
    this.templates.set('sms_order_shipped', {
      id: 'sms_order_shipped',
      name: 'SMS Order Shipped',
      type: 'sms',
      content: 'Your order {{orderNumber}} has shipped! Track it here: {{trackingUrl}}',
      variables: ['orderNumber', 'trackingUrl'],
    });

    this.templates.set('sms_delivery_alert', {
      id: 'sms_delivery_alert',
      name: 'SMS Delivery Alert',
      type: 'sms',
      content: 'Your order {{orderNumber}} will be delivered today between {{timeWindow}}',
      variables: ['orderNumber', 'timeWindow'],
    });

    // Push notification templates
    this.templates.set('push_order_update', {
      id: 'push_order_update',
      name: 'Push Order Update',
      type: 'push',
      subject: 'Order Update',
      content: 'Your order {{orderNumber}} status: {{status}}',
      variables: ['orderNumber', 'status'],
    });
  }

  // Send notification
  async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      const template = this.templates.get(data.templateId);
      if (!template) {
        throw new Error(`Template not found: ${data.templateId}`);
      }

      // Check user preferences
      const canSend = await this.checkUserPreferences(data.userId, data.type, data.channel);
      if (!canSend) {
        console.log(`Notification blocked by user preferences: ${data.userId}`);
        return false;
      }

      // Render template
      const renderedContent = this.renderTemplate(template, data.variables);
      const renderedSubject = template.subject
        ? this.renderTemplate({ ...template, content: template.subject }, data.variables)
        : data.subject;

      // Send based on type
      switch (data.type) {
        case 'email':
          return await this.sendEmail(data.recipient, renderedSubject || '', renderedContent, data);
        case 'sms':
          return await this.sendSMS(data.recipient, renderedContent, data);
        case 'push':
          return await this.sendPushNotification(
            data.recipient,
            renderedSubject || '',
            renderedContent,
            data
          );
        default:
          throw new Error(`Unsupported notification type: ${data.type}`);
      }
    } catch (error) {
      console.error('Notification send error:', error);
      await this.logNotification(
        data,
        'failed',
        error instanceof Error ? error.message : String(error)
      );
      return false;
    }
  }

  // Send email notification
  private async sendEmail(
    recipient: string,
    subject: string,
    content: string,
    data: NotificationData
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipient,
          subject,
          html: content,
          templateId: data.templateId,
          userId: data.userId,
        }),
      });

      const success = response.ok;
      await this.logNotification(data, success ? 'sent' : 'failed');
      return success;
    } catch (error) {
      await this.logNotification(
        data,
        'failed',
        error instanceof Error ? error.message : String(error)
      );
      return false;
    }
  }

  // Send SMS notification
  private async sendSMS(
    recipient: string,
    content: string,
    data: NotificationData
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipient,
          message: content,
          templateId: data.templateId,
          userId: data.userId,
        }),
      });

      const success = response.ok;
      await this.logNotification(data, success ? 'sent' : 'failed');
      return success;
    } catch (error) {
      await this.logNotification(
        data,
        'failed',
        error instanceof Error ? error.message : String(error)
      );
      return false;
    }
  }

  // Send push notification
  private async sendPushNotification(
    recipient: string,
    title: string,
    content: string,
    data: NotificationData
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipient,
          title,
          body: content,
          templateId: data.templateId,
          userId: data.userId,
        }),
      });

      const success = response.ok;
      await this.logNotification(data, success ? 'sent' : 'failed');
      return success;
    } catch (error) {
      await this.logNotification(
        data,
        'failed',
        error instanceof Error ? error.message : String(error)
      );
      return false;
    }
  }

  // Render template with variables
  private renderTemplate(template: NotificationTemplate, variables: Record<string, any>): string {
    let content = template.content;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, String(value));
    }

    return content;
  }

  // Check user notification preferences
  private async checkUserPreferences(
    userId: string | undefined,
    type: string,
    channel: string
  ): Promise<boolean> {
    if (!userId) return true; // Allow notifications for non-authenticated users

    try {
      const response = await fetch(`/api/user/notification-preferences/${userId}`);
      if (!response.ok) return true; // Default to allow if preferences not found

      const preferences = await response.json();

      // Map notification types to preference keys
      const preferenceKey = `${type}${channel.charAt(0).toUpperCase() + channel.slice(1)}`;
      return preferences[preferenceKey] !== false;
    } catch (error) {
      console.error('Error checking user preferences:', error);
      return true; // Default to allow on error
    }
  }

  // Log notification
  private async logNotification(
    data: NotificationData,
    status: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      await fetch('/api/notifications/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: data.userId,
          type: data.type,
          channel: data.channel,
          templateId: data.templateId,
          recipient: data.recipient,
          subject: data.subject,
          status,
          errorMessage,
        }),
      });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  // Schedule notification
  async scheduleNotification(data: NotificationData, scheduledFor: Date): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          scheduledFor: scheduledFor.toISOString(),
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  }

  // Get notification templates
  getTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  // Get template by ID
  getTemplate(id: string): NotificationTemplate | undefined {
    return this.templates.get(id);
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Utility functions for common notifications
export async function sendOrderConfirmation(orderId: string, userEmail: string, orderData: any) {
  return notificationService.sendNotification({
    type: 'email',
    channel: 'order_updates',
    templateId: 'order_confirmation',
    recipient: userEmail,
    variables: {
      customerName: orderData.customerName,
      orderNumber: orderData.orderNumber,
      total: orderData.total,
      estimatedDelivery: orderData.estimatedDelivery,
      trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${orderId}`,
    },
    userId: orderData.userId,
  });
}

export async function sendShippingNotification(
  orderId: string,
  userEmail: string,
  shipmentData: any
) {
  return notificationService.sendNotification({
    type: 'email',
    channel: 'order_updates',
    templateId: 'order_shipped',
    recipient: userEmail,
    variables: {
      customerName: shipmentData.customerName,
      orderNumber: shipmentData.orderNumber,
      trackingNumber: shipmentData.trackingNumber,
      carrier: shipmentData.carrier,
      trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/tracking?tracking=${shipmentData.trackingNumber}`,
    },
    userId: shipmentData.userId,
  });
}

export async function sendDeliveryNotification(orderId: string, userEmail: string, orderData: any) {
  return notificationService.sendNotification({
    type: 'email',
    channel: 'order_updates',
    templateId: 'order_delivered',
    recipient: userEmail,
    variables: {
      customerName: orderData.customerName,
      orderNumber: orderData.orderNumber,
      reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${orderId}/review`,
    },
    userId: orderData.userId,
  });
}
