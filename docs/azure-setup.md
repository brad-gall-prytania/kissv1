# Azure Setup Guide

Step-by-step instructions to provision the Azure resources needed for kissv1.

---

## 1. Azure SQL Database

1. Log into [Azure Portal](https://portal.azure.com)
2. Search **SQL databases** > **Create**
3. **Resource group:** Create new → `rg-kissv1`
4. **Database name:** `kissv1`
5. **Server:** Create new
   - Server name: `kissv1-sql-<unique>` (e.g., `kissv1-sql-bgall`)
   - Location: East US (or your preferred region)
   - Authentication: **SQL authentication**
   - Admin login: `kissv1admin`
   - Password: `<strong password>`
6. **Compute + storage:** Click "Configure database"
   - For learning: **Basic** tier (5 DTUs, ~$5/month) or **Free** tier if available
7. **Networking** tab:
   - Connectivity method: **Public endpoint**
   - Allow Azure services: **Yes**
   - Add current client IP: **Yes** (for local dev)
8. **Review + Create** > **Create**
9. After deployment, go to the SQL database > **Connection strings**
   - Copy the ADO.NET connection string
   - Fill in `.env.local` with server, database, user, password values

### Run the migration and seed

```bash
npm run db:migrate
npm run db:seed
```

---

## 2. Microsoft Entra ID App Registration

1. In Azure Portal, search **App registrations** > **New registration**
2. **Name:** `kissv1-app`
3. **Supported account types:** "Accounts in this organizational directory only" (single tenant)
4. **Redirect URI:**
   - Platform: **Web**
   - URI: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
5. Click **Register**
6. From the **Overview** page, copy:
   - **Application (client) ID** → `AUTH_MICROSOFT_ENTRA_ID_ID` in `.env.local`
   - **Directory (tenant) ID** → used in the issuer URL
7. Go to **Certificates & secrets** > **New client secret**
   - Description: `kissv1 dev`
   - Expiry: 6 months (or custom)
   - Copy the secret **VALUE** (not ID) → `AUTH_MICROSOFT_ENTRA_ID_SECRET` in `.env.local`
8. Set issuer in `.env.local`:
   ```
   AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/<TENANT_ID>/v2.0
   ```
9. Go to **API permissions:**
   - Should already have **Microsoft Graph > User.Read**
   - If not: Add permission > Microsoft Graph > Delegated > User.Read
   - Click **Grant admin consent**

### For production

Add a second Redirect URI for your Azure Web App URL:
```
https://your-app-name.azurewebsites.net/api/auth/callback/microsoft-entra-id
```

---

## 3. Azure Web App

1. In Azure Portal, search **App Services** > **Create** > **Web App**
2. **Resource group:** `rg-kissv1` (same as SQL)
3. **Name:** `kissv1-<unique>` (becomes `kissv1-<unique>.azurewebsites.net`)
4. **Runtime stack:** Node 20 LTS
5. **Operating system:** Linux
6. **Region:** Same as SQL database
7. **Pricing:** Free F1 (for learning) or Basic B1 (~$13/month)
8. **Review + Create** > **Create**

### After deployment

9. Go to **Configuration** > **Application settings** and add all env vars:
   - `AZURE_SQL_SERVER`
   - `AZURE_SQL_DATABASE`
   - `AZURE_SQL_USER`
   - `AZURE_SQL_PASSWORD`
   - `AZURE_SQL_PORT` = `1433`
   - `AUTH_SECRET` (generate with `npx auth secret`)
   - `AUTH_MICROSOFT_ENTRA_ID_ID`
   - `AUTH_MICROSOFT_ENTRA_ID_SECRET`
   - `AUTH_MICROSOFT_ENTRA_ID_ISSUER`
   - `AUTH_URL` = `https://kissv1-<unique>.azurewebsites.net`
   - `NEXTAUTH_URL` = `https://kissv1-<unique>.azurewebsites.net`

10. Go to **Configuration** > **General settings**
    - Startup command: `node .next/standalone/server.js`

---

## 4. GitHub Actions OIDC Setup (for CI/CD)

To use the GitHub Actions deploy workflow with OIDC (no stored passwords):

1. In the Entra ID app registration, go to **Certificates & secrets** > **Federated credentials**
2. **Add credential:**
   - Federated credential scenario: **GitHub Actions deploying Azure resources**
   - Organization: `brad-gall-prytania`
   - Repository: `kissv1`
   - Entity type: Branch → `main`
   - Name: `github-actions-deploy`
3. In your GitHub repo, go to **Settings** > **Secrets and variables** > **Actions** and add:
   - `AZURE_CLIENT_ID` = Application (client) ID
   - `AZURE_TENANT_ID` = Directory (tenant) ID
   - `AZURE_SUBSCRIPTION_ID` = Your Azure subscription ID
