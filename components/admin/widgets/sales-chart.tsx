'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

interface SalesData {
  period: string;
  revenue: number;
  orders: number;
  customers: number;
  date: string;
}

interface SalesChartProps {
  data: SalesData[];
  loading?: boolean;
}

export function SalesChart({ data, loading }: SalesChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('area');
  const [timeRange, setTimeRange] = useState('7d');
  const [metric, setMetric] = useState<'revenue' | 'orders' | 'customers'>('revenue');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getMetricConfig = () => {
    switch (metric) {
      case 'revenue':
        return {
          label: 'Revenue',
          color: '#10b981',
          formatter: formatCurrency,
          icon: TrendingUp
        };
      case 'orders':
        return {
          label: 'Orders',
          color: '#3b82f6',
          formatter: formatNumber,
          icon: BarChart3
        };
      case 'customers':
        return {
          label: 'New Customers',
          color: '#8b5cf6',
          formatter: formatNumber,
          icon: Activity
        };
      default:
        return {
          label: 'Revenue',
          color: '#10b981',
          formatter: formatCurrency,
          icon: TrendingUp
        };
    }
  };

  const metricConfig = getMetricConfig();
  const Icon = metricConfig.icon;

  // Calculate totals and growth
  const currentPeriodTotal = data.reduce((sum, item) => sum + item[metric], 0);
  const previousPeriodTotal = data.length > 7 ? 
    data.slice(0, Math.floor(data.length / 2)).reduce((sum, item) => sum + item[metric], 0) : 0;
  
  const growth = previousPeriodTotal > 0 ? 
    ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Sales Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="period" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={metricConfig.formatter}
            />
            <Tooltip 
              formatter={(value) => [metricConfig.formatter(value as number), metricConfig.label]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey={metric}
              stroke={metricConfig.color}
              strokeWidth={3}
              dot={{ fill: metricConfig.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: metricConfig.color, strokeWidth: 2 }}
            />
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="period" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={metricConfig.formatter}
            />
            <Tooltip 
              formatter={(value) => [metricConfig.formatter(value as number), metricConfig.label]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey={metric}
              fill={metricConfig.color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
      
      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metricConfig.color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={metricConfig.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="period" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={metricConfig.formatter}
            />
            <Tooltip 
              formatter={(value) => [metricConfig.formatter(value as number), metricConfig.label]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={metric}
              stroke={metricConfig.color}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#gradient-${metric})`}
              dot={{ fill: metricConfig.color, strokeWidth: 2, r: 4 }}
            />
          </AreaChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon className="h-5 w-5 mr-2 text-gray-600" />
            <CardTitle>Sales Overview</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={metric} onValueChange={(value: any) => setMetric(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
                <SelectItem value="customers">Customers</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mt-2">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {metricConfig.formatter(currentPeriodTotal)}
            </p>
            <p className="text-sm text-gray-600">
              Total {metricConfig.label.toLowerCase()}
            </p>
          </div>
          {growth !== 0 && (
            <div className={`flex items-center text-sm ${
              growth > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${growth < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(growth).toFixed(1)}% vs previous period
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
