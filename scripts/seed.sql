-- =============================================================
-- KISS Contacts — Seed Data
-- Clears existing data and inserts 10 companies + 10 contacts.
-- Execute in SSMS against your DB.
-- =============================================================

-- Clear in FK-safe order
DELETE FROM contacts_tbl;
DELETE FROM companies_tbl;
GO

-- Reset identity seeds so IDs start at 1
DBCC CHECKIDENT ('companies_tbl', RESEED, 0);
DBCC CHECKIDENT ('contacts_tbl', RESEED, 0);
GO

-- Insert companies
INSERT INTO companies_tbl (name, phone, email, website, address, city, state, zip, notes) VALUES
  (N'Acme Corp',           N'555-0100', N'info@acme.com',           N'https://acme.com',       N'100 Main St',          N'New York',      N'NY', N'10001', N''),
  (N'TechStart',           N'555-0200', N'hello@techstart.io',      N'https://techstart.io',   N'200 Innovation Blvd',  N'San Francisco', N'CA', N'94105', N'Early-stage startup'),
  (N'BlueSky Logistics',   N'555-0300', N'contact@bluesky.com',     N'https://bluesky.com',    N'300 Harbor Dr',        N'Chicago',       N'IL', N'60601', N''),
  (N'Meridian Health',     N'555-0400', N'admin@meridian.org',      N'https://meridian.org',   N'400 Medical Center Dr', N'Boston',       N'MA', N'02115', N'Healthcare provider'),
  (N'GreenLeaf Energy',    N'555-0500', N'sales@greenleaf.co',      N'https://greenleaf.co',   N'500 Solar Way',        N'Austin',        N'TX', N'73301', N''),
  (N'Summit Software',     N'555-0600', N'info@summit.dev',         N'https://summit.dev',     N'600 Code Ave',         N'Seattle',       N'WA', N'98101', N''),
  (N'Atlas Financial',     N'555-0700', N'contact@atlas.finance',   N'https://atlas.finance',  N'700 Wall St',          N'New York',      N'NY', N'10005', N''),
  (N'Oakridge University', N'555-0800', N'it@oakridge.edu',         N'https://oakridge.edu',   N'800 Campus Rd',        N'Durham',        N'NC', N'27701', N'Academic institution'),
  (N'Nova AI',             N'555-0900', N'hello@nova.ai',           N'https://nova.ai',        N'900 AI Blvd',          N'Palo Alto',     N'CA', N'94301', N''),
  (N'Coastal Consulting',  N'555-1000', N'info@coastal.biz',        N'https://coastal.biz',    N'1000 Beach Rd',        N'Miami',         N'FL', N'33101', N'');
GO

-- Insert contacts with company_id FK lookups
INSERT INTO contacts_tbl (first_name, last_name, email, phone, company_id, job_title, address, city, state, zip, notes) VALUES
  (N'Alice', N'Johnson',  N'alice.johnson@acme.com',    N'555-0101', (SELECT id FROM companies_tbl WHERE name = N'Acme Corp'),           N'CEO',                 N'100 Main St',          N'New York',      N'NY', N'10001', N'Primary decision maker'),
  (N'Bob',   N'Smith',    N'bob.smith@techstart.io',    N'555-0102', (SELECT id FROM companies_tbl WHERE name = N'TechStart'),           N'CTO',                 N'200 Innovation Blvd',  N'San Francisco', N'CA', N'94105', N'Interested in enterprise plan'),
  (N'Carol', N'Williams', N'carol.w@bluesky.com',       N'555-0103', (SELECT id FROM companies_tbl WHERE name = N'BlueSky Logistics'),   N'VP Operations',       N'300 Harbor Dr',        N'Chicago',       N'IL', N'60601', N''),
  (N'David', N'Brown',    N'david.brown@meridian.org',  N'555-0104', (SELECT id FROM companies_tbl WHERE name = N'Meridian Health'),     N'IT Director',         N'400 Medical Center Dr', N'Boston',       N'MA', N'02115', N'Needs HIPAA compliance docs'),
  (N'Eva',   N'Martinez', N'eva.m@greenleaf.co',        N'555-0105', (SELECT id FROM companies_tbl WHERE name = N'GreenLeaf Energy'),    N'Procurement Manager', N'500 Solar Way',        N'Austin',        N'TX', N'73301', N'Budget cycle ends Q4'),
  (N'Frank', N'Lee',      N'frank.lee@summit.dev',      N'555-0106', (SELECT id FROM companies_tbl WHERE name = N'Summit Software'),     N'Lead Developer',      N'600 Code Ave',         N'Seattle',       N'WA', N'98101', N'Referred by Bob Smith'),
  (N'Grace', N'Kim',      N'grace.kim@atlas.finance',   N'555-0107', (SELECT id FROM companies_tbl WHERE name = N'Atlas Financial'),     N'CFO',                 N'700 Wall St',          N'New York',      N'NY', N'10005', N'Prefers email contact'),
  (N'Henry', N'Davis',    N'henry.d@oakridge.edu',      N'555-0108', (SELECT id FROM companies_tbl WHERE name = N'Oakridge University'), N'Dean of IT',          N'800 Campus Rd',        N'Durham',        N'NC', N'27701', N'Academic licensing inquiry'),
  (N'Iris',  N'Patel',    N'iris.patel@nova.ai',        N'555-0109', (SELECT id FROM companies_tbl WHERE name = N'Nova AI'),             N'Product Manager',     N'900 AI Blvd',          N'Palo Alto',     N'CA', N'94301', N'Demo scheduled for next week'),
  (N'Jack',  N'Thompson', N'jack.t@coastal.biz',        N'555-0110', (SELECT id FROM companies_tbl WHERE name = N'Coastal Consulting'),  N'Managing Partner',    N'1000 Beach Rd',        N'Miami',         N'FL', N'33101', N'Met at trade show');
GO

PRINT 'Seeded 10 companies and 10 contacts.';
GO
