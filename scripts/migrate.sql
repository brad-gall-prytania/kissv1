-- =============================================================
-- KISS Contacts — Migration: Add companies_tbl, convert FK
-- Safe to re-run (idempotent). Execute in SSMS against your DB.
-- =============================================================

-- 1. Create companies_tbl if it does not exist
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'companies_tbl')
BEGIN
  CREATE TABLE companies_tbl (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    name          NVARCHAR(255)  NOT NULL,
    phone         NVARCHAR(50)   NULL,
    email         NVARCHAR(255)  NULL,
    website       NVARCHAR(500)  NULL,
    address       NVARCHAR(500)  NULL,
    city          NVARCHAR(100)  NULL,
    state         NVARCHAR(50)   NULL,
    zip           NVARCHAR(20)   NULL,
    notes         NVARCHAR(MAX)  NULL,
    created_at    DATETIME2      NOT NULL DEFAULT GETDATE(),
    updated_at    DATETIME2      NOT NULL DEFAULT GETDATE()
  );
  PRINT 'Table companies_tbl created.';
END
ELSE
  PRINT 'Table companies_tbl already exists.';
GO

-- 2a. Add company_id column to contacts_tbl (if not already present)
IF NOT EXISTS (
  SELECT * FROM sys.columns
  WHERE object_id = OBJECT_ID('contacts_tbl') AND name = 'company_id'
)
BEGIN
  ALTER TABLE contacts_tbl ADD company_id INT NULL;
  PRINT 'Added company_id column to contacts_tbl.';
END
ELSE
  PRINT 'contacts_tbl already has company_id column.';
GO

-- 2b. Migrate existing company names into companies_tbl and back-fill company_id
--     Only runs if the old 'company' text column still exists.
IF EXISTS (
  SELECT * FROM sys.columns
  WHERE object_id = OBJECT_ID('contacts_tbl') AND name = 'company'
)
BEGIN
  -- Insert distinct company names that aren't already in companies_tbl
  INSERT INTO companies_tbl (name)
    SELECT DISTINCT c.company
    FROM contacts_tbl c
    WHERE c.company IS NOT NULL
      AND c.company <> ''
      AND NOT EXISTS (
        SELECT 1 FROM companies_tbl co WHERE co.name = c.company
      );

  -- Back-fill company_id from the newly created company rows
  UPDATE c
    SET c.company_id = co.id
    FROM contacts_tbl c
    INNER JOIN companies_tbl co ON co.name = c.company
    WHERE c.company_id IS NULL;

  PRINT 'Migrated existing company names into companies_tbl and back-filled company_id.';
END
ELSE
  PRINT 'Old company column already removed — nothing to migrate.';
GO

-- 2c. Add FK constraint (if not already present)
IF NOT EXISTS (
  SELECT * FROM sys.foreign_keys WHERE name = 'FK_contacts_company'
)
BEGIN
  ALTER TABLE contacts_tbl
    ADD CONSTRAINT FK_contacts_company
    FOREIGN KEY (company_id) REFERENCES companies_tbl(id);
  PRINT 'Added FK_contacts_company constraint.';
END
ELSE
  PRINT 'FK_contacts_company constraint already exists.';
GO

-- 2d. Drop the old company text column (if still present)
IF EXISTS (
  SELECT * FROM sys.columns
  WHERE object_id = OBJECT_ID('contacts_tbl') AND name = 'company'
)
BEGIN
  ALTER TABLE contacts_tbl DROP COLUMN company;
  PRINT 'Dropped old company column from contacts_tbl.';
END
ELSE
  PRINT 'Old company column already removed.';
GO
