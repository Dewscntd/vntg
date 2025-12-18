'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Info } from 'lucide-react';
import { SEASONS, COLLECTION_YEARS } from '@/lib/data/product-options';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ActiveSeason {
  season: string;
  year: number;
  updatedAt?: string;
}

export default function SeasonalSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeSeason, setActiveSeason] = useState<ActiveSeason | null>(null);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchActiveSeason();
  }, []);

  const fetchActiveSeason = async () => {
    try {
      setFetching(true);
      const response = await fetch('/api/settings/seasonal');
      if (response.ok) {
        const data = await response.json();
        const season = data.data?.season;
        if (season) {
          setActiveSeason(season);
          setSelectedSeason(season.season);
          setSelectedYear(season.year.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching active season:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!selectedSeason || !selectedYear) {
      alert('Please select both season and year');
      return;
    }

    setLoading(true);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/settings/seasonal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          season: selectedSeason,
          year: parseInt(selectedYear),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setActiveSeason(data.data.season);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update seasonal settings');
      }
    } catch (error) {
      console.error('Error updating seasonal settings:', error);
      alert('Failed to update seasonal settings');
    } finally {
      setLoading(false);
    }
  };

  const getSeasonIcon = (season: string) => {
    const seasonObj = SEASONS.find((s) => s.value === season);
    return seasonObj?.icon || '';
  };

  const getSeasonLabel = (season: string) => {
    const seasonObj = SEASONS.find((s) => s.value === season);
    return seasonObj?.label || season;
  };

  if (fetching) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Seasonal Collection Settings</h1>
            <p className="mt-1 text-gray-600">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Seasonal Collection Settings</h1>
          </div>
          <p className="mt-1 text-gray-600">Manage the active seasonal collection for your store</p>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              Seasonal settings updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Current Active Collection */}
        {activeSeason && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Current Active Collection</CardTitle>
              <CardDescription>This is the currently active seasonal collection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getSeasonIcon(activeSeason.season)}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900">
                      {getSeasonLabel(activeSeason.season)} {activeSeason.year}
                    </h3>
                    {activeSeason.updatedAt && (
                      <p className="mt-1 text-sm text-blue-700">
                        Active since: {new Date(activeSeason.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Change Season */}
        <Card>
          <CardHeader>
            <CardTitle>Change Season</CardTitle>
            <CardDescription>Update the active seasonal collection for your store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="season">Season</Label>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASONS.map((season) => (
                      <SelectItem key={season.value} value={season.value}>
                        {season.icon} {season.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="year">Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLECTION_YEARS.map((year) => (
                      <SelectItem key={year.value} value={year.value.toString()}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Products will only show in shop if they match the active season or are marked as
                "All Season". This helps you showcase seasonal collections to your customers.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={loading || !selectedSeason || !selectedYear}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
