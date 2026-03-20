import sql from "mssql";

async function migrate() {
  const pool = await sql.connect({
    user: process.env.AZURE_SQL_USER,
    password: process.env.AZURE_SQL_PASSWORD,
    database: process.env.AZURE_SQL_DATABASE,
    server: process.env.AZURE_SQL_SERVER!,
    port: parseInt(process.env.AZURE_SQL_PORT || "1433"),
    options: { encrypt: true, trustServerCertificate: false },
  });

  // 1. Create companies_tbl
  await pool.request().query(`
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
  `);

  // 2. Migrate contacts_tbl: add company_id FK, drop old company column
  //    Only runs if company_id column does not yet exist.
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT * FROM sys.columns
      WHERE object_id = OBJECT_ID('contacts_tbl') AND name = 'company_id'
    )
    BEGIN
      -- Add the FK column
      ALTER TABLE contacts_tbl ADD company_id INT NULL;

      -- Populate company_id from existing company names:
      -- Insert distinct company names into companies_tbl, then map back.
      INSERT INTO companies_tbl (name)
        SELECT DISTINCT company
        FROM contacts_tbl
        WHERE company IS NOT NULL AND company <> '';

      UPDATE c
        SET c.company_id = co.id
        FROM contacts_tbl c
        INNER JOIN companies_tbl co ON co.name = c.company;

      -- Add the foreign key constraint
      ALTER TABLE contacts_tbl
        ADD CONSTRAINT FK_contacts_company
        FOREIGN KEY (company_id) REFERENCES companies_tbl(id);

      -- Drop old company column
      ALTER TABLE contacts_tbl DROP COLUMN company;

      PRINT 'Migrated contacts_tbl: added company_id FK, dropped company column.';
    END
    ELSE
      PRINT 'contacts_tbl already has company_id column.';
  `);

  await pool.close();
  console.log("Migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
