'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {Edit, Eye, Package, Trash2, Upload} from 'lucide-react';
import React, {useState} from 'react';
import {initialProducts, Product} from './mock';
import {SecurityModal} from './SecurityModal';

export function ProductsTab() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [verifyAction, setVerifyAction] = useState<null | string>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    status: 'active',
    image: '',
    category: 'all',
    type: 'digital',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm(prev => ({...prev, image: reader.result as string}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.price) return;
    if (editingProduct) {
      setProducts(
        products.map(p =>
          p.id === editingProduct
            ? {
                ...p,
                name: productForm.name,
                price: Number(productForm.price),
                description: productForm.description,
                status: productForm.status as any,
                image: productForm.image,
                category: productForm.category,
                type: productForm.type as any,
              }
            : p,
        ),
      );
    } else {
      setProducts([
        ...products,
        {
          id: Date.now(),
          name: productForm.name,
          price: Number(productForm.price),
          sold: 0,
          status: productForm.status as any,
          description: productForm.description,
          image: productForm.image,
          category: productForm.category,
          type: productForm.type as any,
        },
      ]);
    }
    setProductForm({
      name: '',
      price: '',
      description: '',
      status: 'active',
      image: '',
      category: 'all',
      type: 'digital',
    });
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  const handleConfirmAction = (password: string) => {
    if (verifyAction?.startsWith('delete-product-')) {
      const id = Number(verifyAction.split('-')[2]);
      setProducts(products.filter(p => p.id !== id));
    }
    setVerifyAction(null);
  };

  return (
    <div className="space-y-4">
      <SecurityModal
        isOpen={!!verifyAction}
        onClose={() => setVerifyAction(null)}
        onConfirm={handleConfirmAction}
      />

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowAddProduct(!showAddProduct);
            setEditingProduct(null);
            setProductForm({
              name: '',
              price: '',
              description: '',
              status: 'active',
              image: '',
              category: 'all',
              type: 'digital',
            });
          }}>
          {showAddProduct ? 'Cancel' : 'Add Product'}
        </Button>
      </div>

      {(showAddProduct || editingProduct) && (
        <Card className="border-primary/20">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-foreground">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input
                  value={productForm.name}
                  onChange={e =>
                    setProductForm({...productForm, name: e.target.value})
                  }
                  placeholder="e.g. Spa Gift Card"
                />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={productForm.price}
                  onChange={e =>
                    setProductForm({...productForm, price: e.target.value})
                  }
                  placeholder="50"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Product Image</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted">
                    {productForm.image ? (
                      <img
                        src={productForm.image}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor="product-image"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors text-sm font-medium">
                      <Upload className="w-4 h-4" />
                      {productForm.image ? 'Change Image' : 'Upload Image'}
                    </Label>
                    <input
                      type="file"
                      id="product-image"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Recommended size: 800x800px. JPG, PNG or WebP.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={productForm.category}
                  onValueChange={v =>
                    setProductForm({...productForm, category: v})
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="spa">Spa</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={productForm.type}
                  onValueChange={v =>
                    setProductForm({...productForm, type: v})
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={productForm.description}
                  onChange={e =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Product description"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={productForm.status}
                  onValueChange={v =>
                    setProductForm({...productForm, status: v})
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="hero" size="sm" onClick={handleSaveProduct}>
                Save Product
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddProduct(false);
                  setEditingProduct(null);
                }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {products.map(p => (
        <Card key={p.id} className="border-border">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg border border-border overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${p.price} · {p.sold} sold
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Badge variant={p.status === 'active' ? 'secondary' : 'outline'}>
                {p.status}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingProduct(p.id);
                  setProductForm({
                    name: p.name,
                    price: String(p.price),
                    description: p.description,
                    status: p.status,
                    image: p.image || '',
                    category: p.category || 'all',
                    type: p.type || 'digital',
                  });
                  setShowAddProduct(false);
                }}>
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setProducts(
                    products.map(pr =>
                      pr.id === p.id
                        ? {
                            ...pr,
                            status: pr.status === 'active' ? 'draft' : 'active',
                          }
                        : pr,
                    ),
                  )
                }>
                <Eye className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setVerifyAction(`delete-product-${p.id}`)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
