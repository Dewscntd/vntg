'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Save, Settings, Store, CreditCard, Globe, Shield, Bell } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    store: {
      name: 'VNTG',
      description: 'Modern Israeli E-commerce Platform',
      email: 'contact@vntg.com',
      phone: '+972-XX-XXX-XXXX',
      address: 'Tel Aviv, Israel',
      currency: 'ILS',
      language: 'he',
      timezone: 'Asia/Jerusalem',
    },
    payments: {
      stripeEnabled: true,
      testMode: false,
      acceptedCards: ['visa', 'mastercard', 'isracard'],
      taxRate: 17,
      freeShippingThreshold: 200,
    },
    notifications: {
      orderNotifications: true,
      lowStockAlerts: true,
      customerEmails: true,
      adminEmails: true,
    },
    security: {
      requireAccountForCheckout: false,
      enableRateLimiting: true,
      sessionTimeout: 30,
      twoFactorAuth: false,
    },
  });

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (session.user.email !== 'michaelvx@gmail.com') {
      router.push('/');
      return;
    }

    setUser(session.user);
    setLoading(false);
  };

  const handleSave = async (category: string) => {
    setSaving(true);
    try {
      // In a real implementation, you would save to your settings table
      // For now, we'll just simulate a save
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(`${category} settings saved successfully!`);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="h-96 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure your store settings and preferences</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Store
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Information
              </CardTitle>
              <CardDescription>
                Configure basic store information and localization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={settings.store.name}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        store: { ...prev.store, name: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Contact Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={settings.store.email}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        store: { ...prev.store, email: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Phone Number</Label>
                  <Input
                    id="storePhone"
                    value={settings.store.phone}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        store: { ...prev.store, phone: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={settings.store.currency}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        store: { ...prev.store, currency: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  value={settings.store.description}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      store: { ...prev.store, description: e.target.value },
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeAddress">Address</Label>
                <Textarea
                  id="storeAddress"
                  value={settings.store.address}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      store: { ...prev.store, address: e.target.value },
                    }))
                  }
                  rows={2}
                />
              </div>

              <Button
                onClick={() => handleSave('Store')}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Store Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Configuration
              </CardTitle>
              <CardDescription>Manage payment methods and tax settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Stripe Payments</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable Stripe payment processing
                      </p>
                    </div>
                    <Switch
                      checked={settings.payments.stripeEnabled}
                      onCheckedChange={(checked: boolean) =>
                        setSettings((prev) => ({
                          ...prev,
                          payments: { ...prev.payments, stripeEnabled: checked },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Test Mode</Label>
                      <p className="text-sm text-muted-foreground">Use Stripe test keys</p>
                    </div>
                    <Switch
                      checked={settings.payments.testMode}
                      onCheckedChange={(checked: boolean) =>
                        setSettings((prev) => ({
                          ...prev,
                          payments: { ...prev.payments, testMode: checked },
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={settings.payments.taxRate}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          payments: { ...prev.payments, taxRate: parseInt(e.target.value) },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="freeShipping">Free Shipping Threshold (₪)</Label>
                    <Input
                      id="freeShipping"
                      type="number"
                      value={settings.payments.freeShippingThreshold}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          payments: {
                            ...prev.payments,
                            freeShippingThreshold: parseInt(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Accepted Card Types</Label>
                <div className="flex gap-2">
                  {settings.payments.acceptedCards.map((card) => (
                    <Badge key={card} variant="secondary">
                      {card}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handleSave('Payment')}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Payment Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure email notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Order Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified of new orders</p>
                  </div>
                  <Switch
                    checked={settings.notifications.orderNotifications}
                    onCheckedChange={(checked: boolean) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, orderNotifications: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when products are low in stock
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.lowStockAlerts}
                    onCheckedChange={(checked: boolean) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, lowStockAlerts: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Customer Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Send order confirmations to customers
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.customerEmails}
                    onCheckedChange={(checked: boolean) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, customerEmails: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Admin Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive admin notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.adminEmails}
                    onCheckedChange={(checked: boolean) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, adminEmails: checked },
                      }))
                    }
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave('Notification')}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
              <CardDescription>Manage security settings and authentication options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Account for Checkout</Label>
                    <p className="text-sm text-muted-foreground">
                      Force users to create account before checkout
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.requireAccountForCheckout}
                    onCheckedChange={(checked: boolean) =>
                      setSettings((prev) => ({
                        ...prev,
                        security: { ...prev.security, requireAccountForCheckout: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable API rate limiting protection
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.enableRateLimiting}
                    onCheckedChange={(checked: boolean) =>
                      setSettings((prev) => ({
                        ...prev,
                        security: { ...prev.security, enableRateLimiting: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Enable 2FA for admin accounts</p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked: boolean) =>
                      setSettings((prev) => ({
                        ...prev,
                        security: { ...prev.security, twoFactorAuth: checked },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      security: { ...prev.security, sessionTimeout: parseInt(e.target.value) },
                    }))
                  }
                  className="w-32"
                />
              </div>

              <Button
                onClick={() => handleSave('Security')}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
