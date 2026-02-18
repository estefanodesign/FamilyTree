-- ============================================
-- Rumpun Keluarga Cimbu Kanan - Database Schema
-- ============================================
-- Jalankan script ini di Supabase SQL Editor
-- (https://supabase.com/dashboard → SQL Editor)
-- ============================================

-- Hapus tabel lama jika ada (untuk reset)
DROP TABLE IF EXISTS parent_child CASCADE;
DROP TABLE IF EXISTS people CASCADE;

-- 1. Tabel utama: people (anggota keluarga)
CREATE TABLE people (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT DEFAULT '',
  birth_date TEXT,
  death_date TEXT,
  gender TEXT NOT NULL DEFAULT 'other' CHECK (gender IN ('male', 'female', 'other')),
  photo TEXT,
  bio TEXT,
  occupation TEXT,
  location TEXT,
  spouse_id TEXT REFERENCES people(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabel relasi: parent_child (hubungan orangtua-anak)
CREATE TABLE parent_child (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  parent_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  child_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

-- 3. Index untuk performa query
CREATE INDEX idx_parent_child_parent ON parent_child(parent_id);
CREATE INDEX idx_parent_child_child ON parent_child(child_id);
CREATE INDEX idx_people_spouse ON people(spouse_id);

-- 4. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS people_updated_at ON people;
CREATE TRIGGER people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 5. Row Level Security (RLS) - Nonaktifkan untuk saat ini
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_child ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa membaca dan menulis (public access)
CREATE POLICY "Allow all on people" ON people FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on parent_child" ON parent_child FOR ALL USING (true) WITH CHECK (true);

-- 6. Tabel Activity Log
CREATE TABLE activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id TEXT REFERENCES people(id) ON DELETE SET NULL,
  person_name TEXT NOT NULL,
  action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on activity_logs" ON activity_logs FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- SELESAI! Tabel siap digunakan.
-- ============================================
