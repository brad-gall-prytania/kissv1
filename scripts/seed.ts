import sql from "mssql";

const COMPANIES = [
  { name: "Acme Corp", phone: "555-0100", email: "info@acme.com", website: "https://acme.com", address: "100 Main St", city: "New York", state: "NY", zip: "10001", notes: "" },
  { name: "TechStart", phone: "555-0200", email: "hello@techstart.io", website: "https://techstart.io", address: "200 Innovation Blvd", city: "San Francisco", state: "CA", zip: "94105", notes: "Early-stage startup" },
  { name: "BlueSky Logistics", phone: "555-0300", email: "contact@bluesky.com", website: "https://bluesky.com", address: "300 Harbor Dr", city: "Chicago", state: "IL", zip: "60601", notes: "" },
  { name: "Meridian Health", phone: "555-0400", email: "admin@meridian.org", website: "https://meridian.org", address: "400 Medical Center Dr", city: "Boston", state: "MA", zip: "02115", notes: "Healthcare provider" },
  { name: "GreenLeaf Energy", phone: "555-0500", email: "sales@greenleaf.co", website: "https://greenleaf.co", address: "500 Solar Way", city: "Austin", state: "TX", zip: "73301", notes: "" },
  { name: "Summit Software", phone: "555-0600", email: "info@summit.dev", website: "https://summit.dev", address: "600 Code Ave", city: "Seattle", state: "WA", zip: "98101", notes: "" },
  { name: "Atlas Financial", phone: "555-0700", email: "contact@atlas.finance", website: "https://atlas.finance", address: "700 Wall St", city: "New York", state: "NY", zip: "10005", notes: "" },
  { name: "Oakridge University", phone: "555-0800", email: "it@oakridge.edu", website: "https://oakridge.edu", address: "800 Campus Rd", city: "Durham", state: "NC", zip: "27701", notes: "Academic institution" },
  { name: "Nova AI", phone: "555-0900", email: "hello@nova.ai", website: "https://nova.ai", address: "900 AI Blvd", city: "Palo Alto", state: "CA", zip: "94301", notes: "" },
  { name: "Coastal Consulting", phone: "555-1000", email: "info@coastal.biz", website: "https://coastal.biz", address: "1000 Beach Rd", city: "Miami", state: "FL", zip: "33101", notes: "" },
];

// company name -> contacts for that company
const CONTACTS = [
  { first_name: "Alice", last_name: "Johnson", email: "alice.johnson@acme.com", phone: "555-0101", company: "Acme Corp", job_title: "CEO", address: "100 Main St", city: "New York", state: "NY", zip: "10001", notes: "Primary decision maker" },
  { first_name: "Bob", last_name: "Smith", email: "bob.smith@techstart.io", phone: "555-0102", company: "TechStart", job_title: "CTO", address: "200 Innovation Blvd", city: "San Francisco", state: "CA", zip: "94105", notes: "Interested in enterprise plan" },
  { first_name: "Carol", last_name: "Williams", email: "carol.w@bluesky.com", phone: "555-0103", company: "BlueSky Logistics", job_title: "VP Operations", address: "300 Harbor Dr", city: "Chicago", state: "IL", zip: "60601", notes: "" },
  { first_name: "David", last_name: "Brown", email: "david.brown@meridian.org", phone: "555-0104", company: "Meridian Health", job_title: "IT Director", address: "400 Medical Center Dr", city: "Boston", state: "MA", zip: "02115", notes: "Needs HIPAA compliance docs" },
  { first_name: "Eva", last_name: "Martinez", email: "eva.m@greenleaf.co", phone: "555-0105", company: "GreenLeaf Energy", job_title: "Procurement Manager", address: "500 Solar Way", city: "Austin", state: "TX", zip: "73301", notes: "Budget cycle ends Q4" },
  { first_name: "Frank", last_name: "Lee", email: "frank.lee@summit.dev", phone: "555-0106", company: "Summit Software", job_title: "Lead Developer", address: "600 Code Ave", city: "Seattle", state: "WA", zip: "98101", notes: "Referred by Bob Smith" },
  { first_name: "Grace", last_name: "Kim", email: "grace.kim@atlas.finance", phone: "555-0107", company: "Atlas Financial", job_title: "CFO", address: "700 Wall St", city: "New York", state: "NY", zip: "10005", notes: "Prefers email contact" },
  { first_name: "Henry", last_name: "Davis", email: "henry.d@oakridge.edu", phone: "555-0108", company: "Oakridge University", job_title: "Dean of IT", address: "800 Campus Rd", city: "Durham", state: "NC", zip: "27701", notes: "Academic licensing inquiry" },
  { first_name: "Iris", last_name: "Patel", email: "iris.patel@nova.ai", phone: "555-0109", company: "Nova AI", job_title: "Product Manager", address: "900 AI Blvd", city: "Palo Alto", state: "CA", zip: "94301", notes: "Demo scheduled for next week" },
  { first_name: "Jack", last_name: "Thompson", email: "jack.t@coastal.biz", phone: "555-0110", company: "Coastal Consulting", job_title: "Managing Partner", address: "1000 Beach Rd", city: "Miami", state: "FL", zip: "33101", notes: "Met at trade show" },
];

async function seed() {
  const pool = await sql.connect({
    user: process.env.AZURE_SQL_USER,
    password: process.env.AZURE_SQL_PASSWORD,
    database: process.env.AZURE_SQL_DATABASE,
    server: process.env.AZURE_SQL_SERVER!,
    port: parseInt(process.env.AZURE_SQL_PORT || "1433"),
    options: { encrypt: true, trustServerCertificate: false },
  });

  // Clear in FK-safe order
  await pool.request().query("DELETE FROM contacts_tbl");
  await pool.request().query("DELETE FROM companies_tbl");

  // Insert companies and build name->id map
  const companyMap = new Map<string, number>();
  for (const co of COMPANIES) {
    const result = await pool
      .request()
      .input("name", sql.NVarChar, co.name)
      .input("phone", sql.NVarChar, co.phone)
      .input("email", sql.NVarChar, co.email)
      .input("website", sql.NVarChar, co.website)
      .input("address", sql.NVarChar, co.address)
      .input("city", sql.NVarChar, co.city)
      .input("state", sql.NVarChar, co.state)
      .input("zip", sql.NVarChar, co.zip)
      .input("notes", sql.NVarChar(sql.MAX), co.notes)
      .query(
        `INSERT INTO companies_tbl
           (name, phone, email, website, address, city, state, zip, notes)
         OUTPUT INSERTED.id
         VALUES
           (@name, @phone, @email, @website, @address, @city, @state, @zip, @notes)`
      );
    companyMap.set(co.name, result.recordset[0].id);
  }

  // Insert contacts with company_id FK
  for (const c of CONTACTS) {
    const companyId = companyMap.get(c.company) ?? null;
    await pool
      .request()
      .input("first_name", sql.NVarChar, c.first_name)
      .input("last_name", sql.NVarChar, c.last_name)
      .input("email", sql.NVarChar, c.email)
      .input("phone", sql.NVarChar, c.phone)
      .input("company_id", sql.Int, companyId)
      .input("job_title", sql.NVarChar, c.job_title)
      .input("address", sql.NVarChar, c.address)
      .input("city", sql.NVarChar, c.city)
      .input("state", sql.NVarChar, c.state)
      .input("zip", sql.NVarChar, c.zip)
      .input("notes", sql.NVarChar(sql.MAX), c.notes)
      .query(
        `INSERT INTO contacts_tbl
           (first_name, last_name, email, phone, company_id, job_title, address, city, state, zip, notes)
         VALUES
           (@first_name, @last_name, @email, @phone, @company_id, @job_title, @address, @city, @state, @zip, @notes)`
      );
  }

  await pool.close();
  console.log(`Seeded ${COMPANIES.length} companies and ${CONTACTS.length} contacts.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
