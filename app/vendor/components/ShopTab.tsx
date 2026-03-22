'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {useProfile} from '@/hooks/use-profile';
import {updateProfile} from '@/lib/server/actions/auth';
import {
  deleteVendorProductImage,
  uploadVendorProductImage,
} from '@/lib/server/actions/vendor';
import {useQueryClient} from '@tanstack/react-query';
import {Loader2, Save, Store, Trash2, Upload} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';

export function ShopTab() {
  const {data: profile} = useProfile();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    shop_name: '',
    shop_description: '',
    shop_address: '',
    shop_slug: '',
    shop_logo_url: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        shop_name: profile.shop_name || '',
        shop_description: profile.shop_description || '',
        shop_address: profile.shop_address || '',
        shop_slug: profile.shop_slug || '',
        shop_logo_url: profile.shop_logo_url || '',
      });
    }
  }, [profile]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleShopNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm(prev => ({
      ...prev,
      shop_name: name,
      shop_slug: generateSlug(name),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      // Note: We're reusing product image actions for simplicity
      const res = await uploadVendorProductImage(formData);
      setUploading(false);

      if (res.success) {
        setForm(prev => ({...prev, shop_logo_url: res.url!}));
        toast.success('Logo uploaded successfully');
      } else {
        toast.error(res.error || 'Upload failed');
      }
    }
  };

  const handleRemoveImage = async () => {
    if (form.shop_logo_url) {
      setUploading(true);
      const res = await deleteVendorProductImage(form.shop_logo_url);
      setUploading(false);
      if (res.success) {
        setForm(prev => ({...prev, shop_logo_url: ''}));
        toast.success('Logo removed');
      } else {
        setForm(prev => ({...prev, shop_logo_url: ''}));
        console.warn('Failed to delete from storage:', res.error);
      }
    }
  };

  const handleSave = async () => {
    if (!form.shop_name || !form.shop_description || !form.shop_address) {
      toast.error('Please fill in all shop details');
      return;
    }

    setSaving(true);
    const res = await updateProfile({
      shop_name: form.shop_name,
      shop_description: form.shop_description,
      shop_address: form.shop_address,
      shop_logo_url: form.shop_logo_url,
      shop_slug: form.shop_slug || generateSlug(form.shop_name),
    });
    setSaving(false);

    if (res.success) {
      toast.success('Shop details updated successfully');
      queryClient.invalidateQueries({queryKey: ['profile']});
    } else {
      toast.error(res.error || 'Failed to update shop details');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Shop Details
              </h2>
              <p className="text-sm text-muted-foreground">
                Set up your shop information to start adding products
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <Label>Shop Logo (Optional)</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden relative group">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : form.shop_logo_url ? (
                  <>
                    <img
                      src={form.shop_logo_url}
                      alt="Shop Logo"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-6 h-6 text-white" />
                    </button>
                  </>
                ) : (
                  <Store className="w-10 h-10 text-muted-foreground/30" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Label
                    htmlFor="shop-logo"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors text-sm font-medium ${
                      uploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                    <Upload className="w-4 h-4" />
                    {uploading
                      ? 'Uploading...'
                      : form.shop_logo_url
                        ? 'Change Logo'
                        : 'Upload Logo'}
                  </Label>
                  <input
                    type="file"
                    id="shop-logo"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {form.shop_logo_url && !uploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive h-9"
                      onClick={handleRemoveImage}>
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  A recognizable logo helps customers identify your brand. Max:
                  2MB.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shop_name">Shop Name</Label>
                <Input
                  id="shop_name"
                  value={form.shop_name}
                  onChange={handleShopNameChange}
                  placeholder="e.g. Sweet Delights Bakery"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop_slug">Shop URL Identifier (Slug)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    /gift-shop/
                  </span>
                  <Input
                    id="shop_slug"
                    value={form.shop_slug}
                    onChange={e =>
                      setForm({
                        ...form,
                        shop_slug: generateSlug(e.target.value),
                      })
                    }
                    placeholder="cakeshop"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  This will be used in your shop's URL.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shop_description">Shop Description</Label>
              <Textarea
                id="shop_description"
                value={form.shop_description}
                onChange={e =>
                  setForm({...form, shop_description: e.target.value})
                }
                placeholder="Describe your legacy, quality, and what makes your shop special..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shop_address">
                Shop Address / Business Location
              </Label>
              <Input
                id="shop_address"
                value={form.shop_address}
                onChange={e => setForm({...form, shop_address: e.target.value})}
                placeholder="e.g. 123 Bakery Lane, New York, NY"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="hero"
                className="w-full sm:w-auto px-8"
                onClick={handleSave}
                disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Shop Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
