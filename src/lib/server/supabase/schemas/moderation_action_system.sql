-- Moderation & Action System Migration

-- 1. ADD MISSING JOIN DATES TO PROFILES
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. ADD USER SYSTEM PENALTY CONTROLS
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
ADD COLUMN IF NOT EXISTS wallet_status TEXT DEFAULT 'active' CHECK (wallet_status IN ('active', 'restricted')),
ADD COLUMN IF NOT EXISTS suspension_end TIMESTAMP WITH TIME ZONE;

-- 3. ADD ANOMALY FLAGS TO GIFTS
ALTER TABLE public.creator_support 
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS flag_reason TEXT;

-- 4. CREATE MODERATION TICKET ENGINE
CREATE TABLE IF NOT EXISTS public.moderation_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type TEXT NOT NULL CHECK (target_type IN ('user', 'campaign', 'gift', 'wallet')),
    target_id TEXT NOT NULL,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Ensure Row Level Security exists on moderation_tickets if necessary, 
-- or explicitly trust the backend Server Actions which execute in service_role mode.

-- 5. CREATE ADMIN AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
