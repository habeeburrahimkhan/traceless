-- TraceLess Supabase schema
-- Run this in Supabase SQL Editor (Dashboard -> SQL -> New query)

-- Documents metadata
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  size VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  max_views INT NOT NULL,
  views_count INT DEFAULT 0,
  otp_email VARCHAR(255) DEFAULT '',
  otp_code VARCHAR(6),
  require_watermark BOOLEAN DEFAULT TRUE,
  require_email_verification BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active',
  decryption_key VARCHAR(255) NOT NULL,
  storage_path VARCHAR(255) NOT NULL
);

-- Activity audit logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR(255) PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  document_id VARCHAR(255) NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  ip_address VARCHAR(50) NOT NULL,
  location VARCHAR(255) DEFAULT '',
  details TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_otp_code ON documents(otp_code);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);

-- Storage bucket (create in Dashboard -> Storage -> New bucket)
-- Name: traceless-files
-- Public: OFF (private bucket; API uses service role key)
