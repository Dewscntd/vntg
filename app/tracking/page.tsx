'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrackingTimeline, TrackingProgress } from '@/components/tracking/tracking-timeline';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Package, ExternalLink, RefreshCw, AlertCircle, Truck } from 'lucide-react';
import { CARRIERS } from '@/lib/shipping/carriers';

interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  events: Array<{
    timestamp: string;
    status: string;
    description: string;
    location?: string;
    city?: string;
    state?: string;
    country?: string;
  }>;
  lastUpdated: string;
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('tracking') || '');
  const [carrier, setCarrier] = useState(searchParams.get('carrier') || '');
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        ...(carrier && { carrier }),
      });

      const response = await fetch(`/api/tracking/${encodeURIComponent(trackingNumber)}?${params}`);

      if (response.ok) {
        const data = await response.json();
        setTrackingInfo(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Tracking information not found');
        setTrackingInfo(null);
      }
    } catch (err) {
      setError('Failed to fetch tracking information. Please try again.');
      setTrackingInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (trackingInfo) {
      handleTrack();
    }
  };

  const getCarrierTrackingUrl = (carrier: string, trackingNumber: string) => {
    const carrierInfo = CARRIERS[carrier];
    if (carrierInfo) {
      return carrierInfo.trackingUrlTemplate.replace('{trackingNumber}', trackingNumber);
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Track Your Package</h1>
          <p className="text-gray-600">
            Enter your tracking number to get real-time updates on your shipment
          </p>
        </div>

        {/* Tracking Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Track Package</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Label htmlFor="trackingNumber">Tracking Number</Label>
                  <Input
                    id="trackingNumber"
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                  />
                </div>

                <div>
                  <Label htmlFor="carrier">Carrier (Optional)</Label>
                  <Select value={carrier} onValueChange={setCarrier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-detect" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      {Object.entries(CARRIERS).map(([code, info]) => (
                        <SelectItem key={code} value={code}>
                          {info.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleTrack} disabled={loading} className="flex-1 md:flex-none">
                  {loading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Track Package
                </Button>

                {trackingInfo && (
                  <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tracking Results */}
        {trackingInfo && (
          <div className="space-y-6">
            {/* Package Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Package Information</span>
                  </CardTitle>

                  {getCarrierTrackingUrl(trackingInfo.carrier, trackingInfo.trackingNumber) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = getCarrierTrackingUrl(
                          trackingInfo.carrier,
                          trackingInfo.trackingNumber
                        );
                        if (url) window.open(url, '_blank');
                      }}
                    >
                      <ExternalLink className="mr-1 h-4 w-4" />
                      View on {CARRIERS[trackingInfo.carrier]?.name}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-mono font-medium">{trackingInfo.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Carrier</p>
                    <p className="font-medium">
                      {CARRIERS[trackingInfo.carrier]?.name || trackingInfo.carrier}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium">
                      {new Date(trackingInfo.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Tracker */}
            <TrackingProgress
              status={trackingInfo.status}
              estimatedDelivery={trackingInfo.estimatedDelivery}
              actualDelivery={trackingInfo.actualDelivery}
            />

            {/* Timeline */}
            <TrackingTimeline events={trackingInfo.events} currentStatus={trackingInfo.status} />
          </div>
        )}

        {/* Help Section */}
        {!trackingInfo && !loading && (
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Tracking Number Formats:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• UPS: 1Z followed by 16 characters (e.g., 1Z999AA1234567890)</li>
                    <li>• FedEx: 12-14 digits (e.g., 1234 5678 9012)</li>
                    <li>• USPS: 20-22 digits starting with 94, 93, 92, or 95</li>
                    <li>• DHL: 10-11 digits (e.g., 1234567890)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Can't find your tracking number?</h4>
                  <p className="text-sm text-gray-600">
                    Check your shipping confirmation email or contact customer support for
                    assistance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
