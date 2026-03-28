'use client';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {StickyFooter} from '@/components/ui/sticky-footer';
import {Textarea} from '@/components/ui/textarea';
import {useIsMobile} from '@/hooks/use-mobile';
import {useProfile} from '@/hooks/use-profile';
import {updateProfile} from '@/lib/server/actions/auth';
import {
  deleteVendorProductImage,
  uploadVendorProductImage,
} from '@/lib/server/actions/vendor';
import {cn} from '@/lib/utils';
import {useQueryClient} from '@tanstack/react-query';
import {ExternalLink, Loader2, Save, Store, Trash2, Upload} from 'lucide-react';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';

export function ShopTab() {
  const {data: profile} = useProfile();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
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

      const res = await uploadVendorProductImage(formData);
      setUploading(false);

      if (res.success) {
        setForm(prev => ({...prev, shop_logo_url: res.url!}));
        toast.success('Logo uploaded');
      } else {
        toast.error(res.error || 'Upload failed');
      }
    }
  };

  const handleRemoveImage = async () => {
    if (form.shop_logo_url) {
      setUploading(true);
      await deleteVendorProductImage(form.shop_logo_url);
      setUploading(false);
      setForm(prev => ({...prev, shop_logo_url: ''}));
      toast.success('Logo removed');
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
      toast.success('Shop details updated');
      queryClient.invalidateQueries({queryKey: ['profile']});
    } else {
      toast.error(res.error || 'Failed to update');
    }
  };

  const shopUrl = form.shop_slug ? `/gift-shop/${form.shop_slug}` : null;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header Card */}
      <div className="rounded-xl bg-card border border-border p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-base md:text-lg font-bold text-foreground">
              Shop Details
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Set up your shop information
            </p>
          </div>
          {shopUrl && (
            <Link href={shopUrl} target="_blank">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Shop</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Logo Upload */}
        <div className="space-y-3 mb-6">
          <Label>Shop Logo</Label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden relative group">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              ) : form.shop_logo_url ? (
                <>
                  <img
                    src={form.shop_logo_url}
                    alt="Shop Logo"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 md:transition-opacity">
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </>
              ) : (
                <Store className="w-8 h-8 text-muted-foreground/30" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Label
                  htmlFor="shop-logo"
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg',
                    'bg-primary/10 text-primary hover:bg-primary/20',
                    'cursor-pointer transition-colors text-sm font-medium',
                    uploading && 'opacity-50 cursor-not-allowed',
                  )}>
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : form.shop_logo_url ? 'Change' : 'Upload'}
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
                    className="text-destructive h-10"
                    onClick={handleRemoveImage}>
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Max 2MB. Helps customers identify your brand.
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shop_name">Shop Name</Label>
              <Input
                id="shop_name"
                value={form.shop_name}
                onChange={handleShopNameChange}
                placeholder="e.g. Sweet Delights Bakery"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop_slug">Shop URL</Label>
              <div className="flex items-center">
                <span className="hidden md:flex items-center px-3 h-11 bg-muted border border-r-0 border-border rounded-l-md text-sm text-muted-foreground">
                  /gift-shop/
                </span>
                <Input
                  id="shop_slug"
                  value={form.shop_slug}
                  onChange={e =>
                    setForm({...form, shop_slug: generateSlug(e.target.value)})
                  }
                  placeholder="my-shop"
                  className={cn('h-11', 'md:rounded-l-none')}
                />
              </div>
              <p className="text-[10px] text-muted-foreground md:hidden">
                URL: /gift-shop/{form.shop_slug || 'your-shop'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shop_description">Shop Description</Label>
            <Textarea
              id="shop_description"
              value={form.shop_description}
              onChange={e => setForm({...form, shop_description: e.target.value})}
              placeholder="Describe your shop, what you sell, and what makes you special..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shop_address">Business Address</Label>
            <Input
              id="shop_address"
              value={form.shop_address}
              onChange={e => setForm({...form, shop_address: e.target.value})}
              placeholder="e.g. 123 Main Street, Lagos, Nigeria"
              className="h-11"
            />
          </div>
        </div>

        {/* Desktop Save Button */}
        <div className="hidden md:flex justify-end pt-6">
          <Button
            variant="hero"
            className="px-8"
            onClick={handleSave}
            disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Mobile Sticky Save Button */}
      {isMobile && (
        <StickyFooter>
          <Button
            variant="hero"
            className="w-full h-12"
            onClick={handleSave}
            disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </StickyFooter>
      )}
    </div>
  );
}
