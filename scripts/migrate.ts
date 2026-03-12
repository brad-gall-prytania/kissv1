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

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'contacts_tbl')
    BEGIN
      CREATE TABLE contacts_tbl (
        id            INT IDENTITY(1,1) PRIMARY KEY,
        first_name    NVARCHAR(255)  NOT NULL,
        last_name     NVARCHAR(255)  NOT NULL,
        email         NVARCHAR(255)  NOT NULL,
        phone         NVARCHAR(50)   NULL,
        company       NVARCHAR(255)  NULL,
        job_title     NVARCHAR(255)  NULL,
        address       NVARCHAR(500)  NULL,
        city          NVARCHAR(100)  NULL,
        state         NVARCHAR(50)   NULL,
        zip           NVARCHAR(20)   NULL,
        notes         NVARCHAR(MAX)  NULL,
        created_at    DATETIME2      NOT NULL DEFAULT GETDATE(),
        updated_at    DATETIME2      NOT NULL DEFAULT GETDATE()
      );
      PRINT 'Table contacts_tbl created.';
    END
    ELSE
      PRINT 'Table contacts_tbl already exists.';
  `);

  await pool.close();
  console.log("Migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
