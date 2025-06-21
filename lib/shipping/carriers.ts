// Shipping carrier integrations and tracking utilities

export interface TrackingEvent {
  timestamp: string;
  status: string;
  description: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: 'in_transit' | 'delivered' | 'exception' | 'pending' | 'unknown';
  estimatedDelivery?: string;
  actualDelivery?: string;
  events: TrackingEvent[];
  lastUpdated: string;
}

export interface ShippingCarrier {
  name: string;
  code: string;
  apiEndpoint: string;
  trackingUrlTemplate: string;
  supportedServices: string[];
}

// Supported shipping carriers
export const CARRIERS: Record<string, ShippingCarrier> = {
  ups: {
    name: 'UPS',
    code: 'ups',
    apiEndpoint: 'https://onlinetools.ups.com/api',
    trackingUrlTemplate: 'https://www.ups.com/track?tracknum={trackingNumber}',
    supportedServices: ['ground', 'air', 'express'],
  },
  fedex: {
    name: 'FedEx',
    code: 'fedex',
    apiEndpoint: 'https://apis.fedex.com',
    trackingUrlTemplate: 'https://www.fedex.com/fedextrack/?tracknumbers={trackingNumber}',
    supportedServices: ['ground', 'express', 'overnight'],
  },
  usps: {
    name: 'USPS',
    code: 'usps',
    apiEndpoint: 'https://secure.shippingapis.com/ShippingAPI.dll',
    trackingUrlTemplate: 'https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1={trackingNumber}',
    supportedServices: ['priority', 'express', 'ground'],
  },
  dhl: {
    name: 'DHL',
    code: 'dhl',
    apiEndpoint: 'https://api-eu.dhl.com',
    trackingUrlTemplate: 'https://www.dhl.com/en/express/tracking.html?AWB={trackingNumber}',
    supportedServices: ['express', 'economy'],
  },
};

// Tracking number validation patterns
export const TRACKING_PATTERNS: Record<string, RegExp> = {
  ups: /^1Z[0-9A-Z]{16}$/,
  fedex: /^[0-9]{12,14}$/,
  usps: /^(94|93|92|94|95)[0-9]{20}$/,
  dhl: /^[0-9]{10,11}$/,
};

export class TrackingService {
  private apiKeys: Record<string, string>;

  constructor(apiKeys: Record<string, string>) {
    this.apiKeys = apiKeys;
  }

  // Detect carrier from tracking number
  detectCarrier(trackingNumber: string): string | null {
    const cleanNumber = trackingNumber.replace(/\s/g, '').toUpperCase();
    
    for (const [carrier, pattern] of Object.entries(TRACKING_PATTERNS)) {
      if (pattern.test(cleanNumber)) {
        return carrier;
      }
    }
    
    return null;
  }

  // Get tracking URL for a carrier
  getTrackingUrl(carrier: string, trackingNumber: string): string {
    const carrierInfo = CARRIERS[carrier];
    if (!carrierInfo) {
      throw new Error(`Unsupported carrier: ${carrier}`);
    }
    
    return carrierInfo.trackingUrlTemplate.replace('{trackingNumber}', trackingNumber);
  }

  // Track package with UPS
  async trackUPS(trackingNumber: string): Promise<TrackingInfo> {
    const apiKey = this.apiKeys.ups;
    if (!apiKey) {
      throw new Error('UPS API key not configured');
    }

    try {
      // Mock implementation - replace with actual UPS API call
      const mockData: TrackingInfo = {
        trackingNumber,
        carrier: 'ups',
        status: 'in_transit',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        events: [
          {
            timestamp: new Date().toISOString(),
            status: 'in_transit',
            description: 'Package is in transit',
            location: 'Distribution Center',
            city: 'Atlanta',
            state: 'GA',
            country: 'US',
          },
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            status: 'shipped',
            description: 'Package shipped from origin',
            location: 'Origin Facility',
            city: 'Los Angeles',
            state: 'CA',
            country: 'US',
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      return mockData;
    } catch (error) {
      console.error('UPS tracking error:', error);
      throw new Error('Failed to track UPS package');
    }
  }

  // Track package with FedEx
  async trackFedEx(trackingNumber: string): Promise<TrackingInfo> {
    const apiKey = this.apiKeys.fedex;
    if (!apiKey) {
      throw new Error('FedEx API key not configured');
    }

    try {
      // Mock implementation - replace with actual FedEx API call
      const mockData: TrackingInfo = {
        trackingNumber,
        carrier: 'fedex',
        status: 'in_transit',
        estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        events: [
          {
            timestamp: new Date().toISOString(),
            status: 'in_transit',
            description: 'On FedEx vehicle for delivery',
            location: 'Local Facility',
            city: 'New York',
            state: 'NY',
            country: 'US',
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      return mockData;
    } catch (error) {
      console.error('FedEx tracking error:', error);
      throw new Error('Failed to track FedEx package');
    }
  }

  // Track package with USPS
  async trackUSPS(trackingNumber: string): Promise<TrackingInfo> {
    const apiKey = this.apiKeys.usps;
    if (!apiKey) {
      throw new Error('USPS API key not configured');
    }

    try {
      // Mock implementation - replace with actual USPS API call
      const mockData: TrackingInfo = {
        trackingNumber,
        carrier: 'usps',
        status: 'delivered',
        actualDelivery: new Date().toISOString(),
        events: [
          {
            timestamp: new Date().toISOString(),
            status: 'delivered',
            description: 'Delivered to mailbox',
            location: 'Mailbox',
            city: 'Chicago',
            state: 'IL',
            country: 'US',
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      return mockData;
    } catch (error) {
      console.error('USPS tracking error:', error);
      throw new Error('Failed to track USPS package');
    }
  }

  // Track package with DHL
  async trackDHL(trackingNumber: string): Promise<TrackingInfo> {
    const apiKey = this.apiKeys.dhl;
    if (!apiKey) {
      throw new Error('DHL API key not configured');
    }

    try {
      // Mock implementation - replace with actual DHL API call
      const mockData: TrackingInfo = {
        trackingNumber,
        carrier: 'dhl',
        status: 'in_transit',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        events: [
          {
            timestamp: new Date().toISOString(),
            status: 'in_transit',
            description: 'Shipment is in transit',
            location: 'DHL Facility',
            city: 'Miami',
            state: 'FL',
            country: 'US',
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      return mockData;
    } catch (error) {
      console.error('DHL tracking error:', error);
      throw new Error('Failed to track DHL package');
    }
  }

  // Universal tracking method
  async trackPackage(trackingNumber: string, carrier?: string): Promise<TrackingInfo> {
    const detectedCarrier = carrier || this.detectCarrier(trackingNumber);
    
    if (!detectedCarrier) {
      throw new Error('Unable to detect carrier from tracking number');
    }

    switch (detectedCarrier) {
      case 'ups':
        return this.trackUPS(trackingNumber);
      case 'fedex':
        return this.trackFedEx(trackingNumber);
      case 'usps':
        return this.trackUSPS(trackingNumber);
      case 'dhl':
        return this.trackDHL(trackingNumber);
      default:
        throw new Error(`Unsupported carrier: ${detectedCarrier}`);
    }
  }

  // Generate tracking number (mock implementation)
  generateTrackingNumber(carrier: string): string {
    const timestamp = Date.now().toString();
    
    switch (carrier) {
      case 'ups':
        return `1Z${timestamp.slice(-16).padStart(16, '0')}`;
      case 'fedex':
        return timestamp.slice(-12).padStart(12, '0');
      case 'usps':
        return `94${timestamp.slice(-20).padStart(20, '0')}`;
      case 'dhl':
        return timestamp.slice(-10).padStart(10, '0');
      default:
        throw new Error(`Unsupported carrier: ${carrier}`);
    }
  }
}

// Create singleton instance
export const trackingService = new TrackingService({
  ups: process.env.UPS_API_KEY || '',
  fedex: process.env.FEDEX_API_KEY || '',
  usps: process.env.USPS_API_KEY || '',
  dhl: process.env.DHL_API_KEY || '',
});

// Utility functions
export function formatTrackingStatus(status: string): string {
  const statusMap: Record<string, string> = {
    in_transit: 'In Transit',
    delivered: 'Delivered',
    exception: 'Exception',
    pending: 'Pending',
    unknown: 'Unknown',
  };
  
  return statusMap[status] || status;
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    in_transit: 'blue',
    delivered: 'green',
    exception: 'red',
    pending: 'yellow',
    unknown: 'gray',
  };
  
  return colorMap[status] || 'gray';
}
