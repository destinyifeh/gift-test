import * as z from 'zod';

export const createVendorSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessUrl: z.string().optional().or(z.literal('')),
  businessLogo: z.string().optional(),
  businessDescription: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  address: z.object({
    street: z.string().min(2, 'Street is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    zip: z.string().min(1, 'Zip code is required'),
  }),
  acceptedGiftCards: z.array(z.number()).max(5, 'You can only select up to 5 gift cards (Flex Card is always included)').default([]),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
