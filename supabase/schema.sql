-- ============================================================================
-- FocusFriends Database Schema
-- ============================================================================
-- This schema creates all tables, RLS policies, indexes, and triggers needed
-- for the FocusFriends application.
--
-- Instructions:
-- 1. Log in to Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Paste this entire file
-- 5. Click "Run" to execute
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles Table
-- Extends the auth.users table with additional user information
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    total_focus_hours DECIMAL(10, 2) DEFAULT 0.00,
    current_status TEXT DEFAULT 'idle' CHECK (current_status IN ('idle', 'focusing', 'break')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on username for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_current_status ON public.profiles(current_status);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Allow users to read all profiles (needed for social features)
CREATE POLICY "Profiles are viewable by everyone" 
    ON public.profiles
    FOR SELECT 
    USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
    ON public.profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
    ON public.profiles
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- Sessions Table
-- Tracks individual focus sessions with timing and visibility controls
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN end_time IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (end_time - start_time)) / 60
            ELSE NULL
        END
    ) STORED,
    is_public_now BOOLEAN DEFAULT true,
    scheduled_visibility TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON public.sessions(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_is_public ON public.sessions(is_public_now) WHERE is_public_now = true;

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions" 
    ON public.sessions
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can view public sessions from others
CREATE POLICY "Users can view public sessions from others" 
    ON public.sessions
    FOR SELECT 
    USING (
        is_public_now = true 
        AND (
            scheduled_visibility IS NULL 
            OR scheduled_visibility <= NOW()
        )
    );

-- Users can insert their own sessions
CREATE POLICY "Users can insert their own sessions" 
    ON public.sessions
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update their own sessions" 
    ON public.sessions
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete their own sessions" 
    ON public.sessions
    FOR DELETE 
    USING (auth.uid() = user_id);

-- ============================================================================
-- Nudges Table
-- Stores peer-to-peer encouragement interactions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.nudges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('high-five', 'focus-up', 'coffee-break')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_nudges_receiver_id ON public.nudges(receiver_id);
CREATE INDEX IF NOT EXISTS idx_nudges_sender_id ON public.nudges(sender_id);
CREATE INDEX IF NOT EXISTS idx_nudges_created_at ON public.nudges(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.nudges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nudges
-- Users can view nudges they sent
CREATE POLICY "Users can view nudges they sent" 
    ON public.nudges
    FOR SELECT 
    USING (auth.uid() = sender_id);

-- Users can view nudges they received
CREATE POLICY "Users can view nudges they received" 
    ON public.nudges
    FOR SELECT 
    USING (auth.uid() = receiver_id);

-- Users can send nudges
CREATE POLICY "Users can send nudges" 
    ON public.nudges
    FOR INSERT 
    WITH CHECK (auth.uid() = sender_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to update updated_at on sessions
DROP TRIGGER IF EXISTS on_session_updated ON public.sessions;
CREATE TRIGGER on_session_updated
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- HELPER VIEWS (Optional but useful)
-- ============================================================================

-- View for active sessions
CREATE OR REPLACE VIEW public.active_sessions AS
SELECT 
    s.*,
    p.username,
    p.avatar_url
FROM public.sessions s
JOIN public.profiles p ON s.user_id = p.id
WHERE s.end_time IS NULL
ORDER BY s.start_time DESC;

-- View for recent nudges with user details
CREATE OR REPLACE VIEW public.recent_nudges AS
SELECT 
    n.*,
    sender.username AS sender_username,
    sender.avatar_url AS sender_avatar_url,
    receiver.username AS receiver_username,
    receiver.avatar_url AS receiver_avatar_url
FROM public.nudges n
JOIN public.profiles sender ON n.sender_id = sender.id
JOIN public.profiles receiver ON n.receiver_id = receiver.id
ORDER BY n.created_at DESC;

-- ============================================================================
-- REALTIME CONFIGURATION
-- ============================================================================
-- Enable realtime for status updates and nudges
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.nudges;

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================
-- Uncomment the following to add test data:

-- INSERT INTO public.profiles (id, username, avatar_url, current_status)
-- VALUES 
--     ('00000000-0000-0000-0000-000000000001', 'alice', null, 'focusing'),
--     ('00000000-0000-0000-0000-000000000002', 'bob', null, 'break'),
--     ('00000000-0000-0000-0000-000000000003', 'charlie', null, 'idle')
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries after executing the schema to verify everything works:

-- Check that all tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies exist
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
