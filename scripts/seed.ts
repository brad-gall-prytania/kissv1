import sql from "mssql";

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

  await pool.request().query("DELETE FROM contacts_tbl");

  for (const c of CONTACTS) {
    await pool
      .request()
      .input("first_name", sql.NVarChar, c.first_name)
      .input("last_name", sql.NVarChar, c.last_name)
      .input("email", sql.NVarChar, c.email)
      .input("phone", sql.NVarChar, c.phone)
      .input("company", sql.NVarChar, c.company)
      .input("job_title", sql.NVarChar, c.job_title)
      .input("address", sql.NVarChar, c.address)
      .input("city", sql.NVarChar, c.city)
      .input("state", sql.NVarChar, c.state)
      .input("zip", sql.NVarChar, c.zip)
      .input("notes", sql.NVarChar(sql.MAX), c.notes)
      .query(
        `INSERT INTO contacts_tbl
           (first_name, last_name, email, phone, company, job_title, address, city, state, zip, notes)
         VALUES
           (@first_name, @last_name, @email, @phone, @company, @job_title, @address, @city, @state, @zip, @notes)`
      );
  }

  await pool.close();
  console.log(`Seeded ${CONTACTS.length} contacts.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
