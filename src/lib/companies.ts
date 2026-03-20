import sql from "mssql";
import { getDb } from "./db";
import type { Company, CompanyInput } from "./types";

export async function getAllCompanies(): Promise<Company[]> {
  const pool = await getDb();
  const result = await pool
    .request()
    .query<Company>("SELECT * FROM companies_tbl ORDER BY name");
  return result.recordset;
}

export async function getCompanyById(id: number): Promise<Company | null> {
  const pool = await getDb();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query<Company>("SELECT * FROM companies_tbl WHERE id = @id");
  return result.recordset[0] || null;
}

export async function createCompany(data: CompanyInput): Promise<Company> {
  const pool = await getDb();
  const result = await pool
    .request()
    .input("name", sql.NVarChar, data.name)
    .input("phone", sql.NVarChar, data.phone)
    .input("email", sql.NVarChar, data.email)
    .input("website", sql.NVarChar, data.website)
    .input("address", sql.NVarChar, data.address)
    .input("city", sql.NVarChar, data.city)
    .input("state", sql.NVarChar, data.state)
    .input("zip", sql.NVarChar, data.zip)
    .input("notes", sql.NVarChar(sql.MAX), data.notes)
    .query<Company>(
      `INSERT INTO companies_tbl
         (name, phone, email, website, address, city, state, zip, notes)
       OUTPUT INSERTED.*
       VALUES
         (@name, @phone, @email, @website, @address, @city, @state, @zip, @notes)`
    );
  return result.recordset[0];
}

export async function updateCompany(
  id: number,
  data: CompanyInput
): Promise<Company | null> {
  const pool = await getDb();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .input("name", sql.NVarChar, data.name)
    .input("phone", sql.NVarChar, data.phone)
    .input("email", sql.NVarChar, data.email)
    .input("website", sql.NVarChar, data.website)
    .input("address", sql.NVarChar, data.address)
    .input("city", sql.NVarChar, data.city)
    .input("state", sql.NVarChar, data.state)
    .input("zip", sql.NVarChar, data.zip)
    .input("notes", sql.NVarChar(sql.MAX), data.notes)
    .query<Company>(
      `UPDATE companies_tbl SET
         name = @name, phone = @phone, email = @email,
         website = @website, address = @address, city = @city,
         state = @state, zip = @zip, notes = @notes,
         updated_at = GETDATE()
       OUTPUT INSERTED.*
       WHERE id = @id`
    );
  return result.recordset[0] || null;
}

export async function deleteCompany(id: number): Promise<boolean> {
  const pool = await getDb();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("DELETE FROM companies_tbl WHERE id = @id");
  return (result.rowsAffected[0] ?? 0) > 0;
}
