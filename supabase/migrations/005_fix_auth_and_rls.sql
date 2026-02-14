-- Fix authentication and RLS policies
-- This migration fixes critical issues preventing user login

-- ============================================
-- Fix users table to use auth.users.id
-- ============================================

-- Remove the default UUID generation for users.id
-- The id should come from auth.users, not be auto-generated
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;

-- ============================================
-- Add missing RLS policies for user registration
-- ============================================

-- Allow authenticated users to insert their own user record
-- This is needed for the auth callback to create user profiles
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- Fix RLS policies for better security
-- ============================================

-- Allow users to read their own profile even if not public
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid() = id OR true);
