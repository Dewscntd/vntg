'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { BrandSelector } from '@/components/ui/brand-selector';
import { SizeSelector } from '@/components/ui/size-selector';
import { MaterialSelector } from '@/components/ui/material-selector';
import { peakeesCategories } from '@/lib/data/peakees-categories';
import { CONDITIONS } from '@/lib/data/product-options';
import { useTranslations } from '@/lib/hooks/use-translations';
import { ArrowLeft, Upload, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  discount_percent: string;
  inventory_count: string;
  category_id: string;
  is_featured: boolean;
  specifications: {
    size: string;
    condition: string;
    brand: string;
    materials: string[];
  };
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    discount_percent: '0',
    inventory_count: '',
    category_id: '',
    is_featured: false,
    specifications: {
      size: '',
      condition: '',
      brand: '',
      materials: [],
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Fetch from API but filter out unwanted categories
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        const allCategories = data.data?.categories || [];
        
        // Filter out unwanted categories
        const unwantedNames = ['Sports', 'Electronics', 'Home', 'Gardening', 'sports', 'electronics', 'home', 'gardening'];
        const filteredCategories = allCategories.filter((cat: any) => 
          !unwantedNames.some(unwanted => 
            cat.name.toLowerCase().includes(unwanted.toLowerCase())
          )
        );
        
        setCategories(filteredCategories);
        console.log('Available categories for product creation:', filteredCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecificationChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value,
      },
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, upload image if provided
      let imageUrl = '';
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);

        const imageResponse = await fetch('/api/products/upload', {
          method: 'POST',
          body: imageFormData,
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          imageUrl = imageData.data?.url || '';
        }
      }

      // Create product
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discount_percent: parseFloat(formData.discount_percent),
        inventory_count: parseInt(formData.inventory_count),
        category_id: formData.category_id,
        is_featured: formData.is_featured,
        image_url: imageUrl || '',
        specifications: {
          ...formData.specifications,
          materials: formData.specifications.materials.join(', '), // Convert array to string
        },
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        router.push('/admin/products');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/products">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="mt-1 text-gray-600">Create a new product for your store</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="price">Price / מחיר (₪) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="1"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="discount_percent">Discount Percentage</Label>
                  <Input
                    id="discount_percent"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percent}
                    onChange={(e) => handleInputChange('discount_percent', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="inventory_count">Inventory Count *</Label>
                  <Input
                    id="inventory_count"
                    type="number"
                    min="0"
                    value={formData.inventory_count}
                    onChange={(e) => handleInputChange('inventory_count', e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category_id">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleInputChange('category_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) =>
                    handleInputChange('is_featured', checked as boolean)
                  }
                />
                <Label htmlFor="is_featured">Featured Product</Label>
              </div>
            </CardContent>
          </Card>

          {/* Product Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Product Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Size Selection */}
              <SizeSelector
                value={formData.specifications.size || ''}
                onValueChange={(value) => handleSpecificationChange('size', value)}
                category={categories.find(c => c.id === formData.category_id)?.name || ''}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Condition */}
                <div>
                  <Label htmlFor="condition">Condition / מצב *</Label>
                  <Select
                    value={formData.specifications.condition || ''}
                    onValueChange={(value) => handleSpecificationChange('condition', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition / בחר מצב" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand */}
                <div>
                  <Label htmlFor="brand">Brand / מותג</Label>
                  <BrandSelector
                    value={formData.specifications.brand || ''}
                    onValueChange={(value) => handleSpecificationChange('brand', value)}
                    placeholder="Select brand / בחר מותג"
                  />
                </div>
              </div>

              {/* Materials */}
              <MaterialSelector
                value={formData.specifications.materials || []}
                onValueChange={(value) => handleSpecificationChange('materials', value)}
                maxSelections={3}
              />
            </CardContent>
          </Card>

          {/* Product Image */}
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Product preview"
                      className="h-64 w-full rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <Label htmlFor="image" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload product image
                          </span>
                          <span className="mt-1 block text-sm text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </span>
                        </Label>
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link href="/admin/products">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
