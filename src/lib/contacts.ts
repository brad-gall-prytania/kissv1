import sql from "mssql";
import { getDb } from "./db";
import type { Contact, ContactInput } from "./types";

export async function getAllContacts(): Promise<Contact[]> {
  const pool = await getDb();
  const result = await pool
    .request()
    .query<Contact>("SELECT * FROM contacts_tbl ORDER BY last_name, first_name");
  return result.recordset;
}

export async function getContactById(id: number): Promise<Contact | null> {
  const pool = await getDb();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query<Contact>("SELECT * FROM contacts_tbl WHERE id = @id");
  return result.recordset[0] || null;
}

export async function createContact(data: ContactInput): Promise<Contact> {
  const pool = await getDb();
  const result = await pool
    .request()
    .input("first_name", sql.NVarChar, data.first_name)
    .input("last_name", sql.NVarChar, data.last_name)
    .input("email", sql.NVarChar, data.email)
    .input("phone", sql.NVarChar, data.phone)
    .input("company", sql.NVarChar, data.company)
    .input("job_title", sql.NVarChar, data.job_title)
    .input("address", sql.NVarChar, data.address)
    .input("city", sql.NVarChar, data.city)
    .input("state", sql.NVarChar, data.state)
    .input("zip", sql.NVarChar, data.zip)
    .input("notes", sql.NVarChar(sql.MAX), data.notes)
    .query<Contact>(
      `INSERT INTO contacts_tbl
         (first_name, last_name, email, phone, company, job_title, address, city, state, zip, notes)
       OUTPUT INSERTED.*
       VALUES
         (@first_name, @last_name, @email, @phone, @company, @job_title, @address, @city, @state, @zip, @notes)`
    );
  return result.recordset[0];
}

export async function updateContact(
  id: number,
  data: ContactInput
): Promise<Contact | null> {
  const pool = await getDb();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .input("first_name", sql.NVarChar, data.first_name)
    .input("last_name", sql.NVarChar, data.last_name)
    .input("email", sql.NVarChar, data.email)
    .input("phone", sql.NVarChar, data.phone)
    .input("company", sql.NVarChar, data.company)
    .input("job_title", sql.NVarChar, data.job_title)
    .input("address", sql.NVarChar, data.address)
    .input("city", sql.NVarChar, data.city)
    .input("state", sql.NVarChar, data.state)
    .input("zip", sql.NVarChar, data.zip)
    .input("notes", sql.NVarChar(sql.MAX), data.notes)
    .query<Contact>(
      `UPDATE contacts_tbl SET
         first_name = @first_name, last_name = @last_name, email = @email,
         phone = @phone, company = @company, job_title = @job_title,
         address = @address, city = @city, state = @state, zip = @zip,
         notes = @notes, updated_at = GETDATE()
       OUTPUT INSERTED.*
       WHERE id = @id`
    );
  return result.recordset[0] || null;
}

export async function deleteContact(id: number): Promise<boolean> {
  const pool = await getDb();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("DELETE FROM contacts_tbl WHERE id = @id");
  return (result.rowsAffected[0] ?? 0) > 0;
}
