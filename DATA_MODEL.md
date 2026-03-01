# Atomic CRM - Data Model Documentation

**Project**: MiriolMarketing CRM
**Based on**: atomic-crm by Marmelab
**Version**: 1.0
**Last Updated**: 2025-11-16

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Entity Relationships](#entity-relationships)
4. [Table Specifications](#table-specifications)
5. [Views](#views)
6. [Enumerations & Constants](#enumerations--constants)
7. [Security & Permissions](#security--permissions)
8. [File Storage](#file-storage)
9. [TypeScript Types](#typescript-types)

---

## Overview

The Atomic CRM data model is designed to manage customer relationships, sales pipelines, and team collaboration. It consists of 7 core tables that work together to provide a comprehensive CRM solution.

### Core Entities

- **Sales** - Sales team members (users)
- **Companies** - Business organizations
- **Contacts** - Individual people within companies
- **Deals** - Sales opportunities in pipeline
- **Tasks** - To-do items and reminders
- **Notes** - Contact and deal notes with status tracking
- **Tags** - Categorization labels

### Technology Stack

- **Database**: PostgreSQL (via Supabase)
- **ORM/Query Layer**: Supabase Client
- **Row-Level Security**: Enabled on all tables
- **Storage**: Supabase Storage for file attachments
- **Auth**: Supabase Auth with JWT

---

## Database Schema

### Schema Diagram (Simplified)

```
auth.users (Supabase Auth)
    ↓ (user_id)
┌─────────────┐
│    sales    │
└──────┬──────┘
       │
       ├── (sales_id) → companies
       ├── (sales_id) → contacts
       ├── (sales_id) → deals
       ├── (sales_id) → contactNotes
       └── (sales_id) → dealNotes

┌──────────────┐
│  companies   │
└──────┬───────┘
       │
       ├── (company_id) → contacts
       └── (company_id) → deals

┌──────────────┐
│   contacts   │
└──────┬───────┘
       │
       ├── (contact_id) → tasks
       ├── (contact_id) → contactNotes
       └── (tags[]) → tags

┌──────────────┐
│    deals     │
└──────┬───────┘
       │
       ├── (contact_ids[]) → contacts
       └── (deal_id) → dealNotes

┌──────────────┐
│     tags     │
└──────────────┘
```

---

## Entity Relationships

### Relationship Matrix

| Entity | Relates To | Relationship Type | Foreign Key |
|--------|-----------|-------------------|-------------|
| **sales** | auth.users | 1:1 | user_id → auth.users(id) |
| **companies** | sales | N:1 | sales_id → sales(id) |
| **contacts** | companies | N:1 | company_id → companies(id) |
| **contacts** | sales | N:1 | sales_id → sales(id) |
| **contacts** | tags | N:M | tags[] (array of tag IDs) |
| **deals** | companies | N:1 | company_id → companies(id) |
| **deals** | contacts | N:M | contact_ids[] (array of contact IDs) |
| **deals** | sales | N:1 | sales_id → sales(id) |
| **tasks** | contacts | N:1 | contact_id → contacts(id) |
| **contactNotes** | contacts | N:1 | contact_id → contacts(id) |
| **contactNotes** | sales | N:1 | sales_id → sales(id) |
| **dealNotes** | deals | N:1 | deal_id → deals(id) |
| **dealNotes** | sales | N:1 | sales_id → sales(id) |

### Cascade Rules

**ON DELETE CASCADE** is configured for:
- contacts → contactNotes
- contacts → tasks
- companies → contacts
- companies → deals
- deals → dealNotes

---

## Table Specifications

### 1. sales

Sales team members (system users).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | bigint | NOT NULL | auto | Primary key |
| **first_name** | text | NOT NULL | - | First name |
| **last_name** | text | NOT NULL | - | Last name |
| **email** | text | NOT NULL | - | Email (synced from auth.users) |
| **administrator** | boolean | NOT NULL | - | Admin privileges flag |
| **user_id** | uuid | NOT NULL | - | FK to auth.users(id) |
| **avatar** | jsonb | NULL | - | Profile picture |
| **disabled** | boolean | NOT NULL | FALSE | Account disabled flag |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE INDEX: user_id (uq__sales__user_id)

**Triggers:**
- `on_auth_user_created`: Auto-creates sales record when user signs up
- `on_auth_user_updated`: Syncs email/name changes from auth.users

**Notes:**
- First user created automatically becomes administrator
- Email field is read-only (managed by trigger)

---

### 2. companies

Business organizations and clients.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | bigint | NOT NULL | auto | Primary key |
| **created_at** | timestamptz | NOT NULL | now() | Creation timestamp |
| **name** | text | NOT NULL | - | Company name |
| **type** | text | NULL | - | Company type (Client, Partner, Supplier, Business Division) |
| **client_type** | text | NULL | - | Client type (only when type='Client') |
| **sector** | text | NULL | - | Industry sector |
| **size** | smallint | NULL | - | Company size (1, 10, 50, 250, 500) |
| **linkedin_url** | text | NULL | - | LinkedIn profile URL |
| **website** | text | NULL | - | Company website |
| **phone_number** | text | NULL | - | Main phone number |
| **address** | text | NULL | - | Street address |
| **zipcode** | text | NULL | - | Postal code |
| **city** | text | NULL | - | City |
| **stateAbbr** | text | NULL | - | State/province abbreviation |
| **country** | text | NULL | - | Country name |
| **sales_id** | bigint | NULL | - | FK to sales(id) - assigned rep |
| **context_links** | json | NULL | - | Additional URLs/resources |
| **description** | text | NULL | - | Company description |
| **revenue** | text | NULL | - | Annual revenue |
| **tax_identifier** | text | NULL | - | Tax ID/VAT number |
| **logo** | jsonb | NULL | - | Company logo file |

**Indexes:**
- PRIMARY KEY: id

**Foreign Keys:**
- sales_id → sales(id)

**Type Values:**
- "Client" - Customer/client company
- "Partner" - Business partner
- "Supplier" - Vendor/supplier
- "Business Division" - Internal business unit

**Client Type Values (only when type='Client'):**
- "Agency" - Advertising/marketing agency
- "Advertiser" - Brand/advertiser
- "Publisher" - Media publisher

**Size Values:**
- 1 = "1 employee"
- 10 = "2-9 employees"
- 50 = "10-49 employees"
- 250 = "50-249 employees"
- 500 = "250 or more employees"

**Note on Conditional Fields:**
The `client_type` field only appears in the UI when `type` is set to "Client". This provides context-specific categorization for client companies.

---

### 3. contacts

Individual people within companies.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | bigint | NOT NULL | auto | Primary key |
| **first_name** | text | NULL | - | First name |
| **last_name** | text | NULL | - | Last name |
| **gender** | text | NULL | - | Gender (male, female, nonbinary) |
| **title** | text | NULL | - | Job title |
| **email_jsonb** | jsonb | NULL | - | Array of {email, type} objects |
| **phone_jsonb** | jsonb | NULL | - | Array of {number, type} objects |
| **background** | text | NULL | - | Professional background notes |
| **avatar** | jsonb | NULL | - | Profile picture |
| **first_seen** | timestamptz | NULL | - | First interaction date |
| **last_seen** | timestamptz | NULL | - | Last interaction date |
| **has_newsletter** | boolean | NULL | - | Newsletter subscription flag |
| **status** | text | NULL | - | Contact status |
| **tags** | bigint[] | NULL | - | Array of tag IDs |
| **company_id** | bigint | NULL | - | FK to companies(id) |
| **sales_id** | bigint | NULL | - | FK to sales(id) |
| **linkedin_url** | text | NULL | - | LinkedIn profile URL |

**Indexes:**
- PRIMARY KEY: id

**Foreign Keys:**
- company_id → companies(id) ON DELETE CASCADE
- sales_id → sales(id)

**Email/Phone Structure:**
```json
// email_jsonb example
[
  {"email": "john@example.com", "type": "Work"},
  {"email": "john.doe@gmail.com", "type": "Home"}
]

// phone_jsonb example
[
  {"number": "+1-555-0100", "type": "Work"},
  {"number": "+1-555-0101", "type": "Mobile"}
]
```

**Valid Types for Email/Phone:**
- "Work"
- "Home"
- "Other"

**Gender Values:**
- "male" (He/Him)
- "female" (She/Her)
- "nonbinary" (They/Them)

---

### 4. deals

Sales opportunities in pipeline.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | bigint | NOT NULL | auto | Primary key |
| **name** | text | NOT NULL | - | Deal name/title |
| **company_id** | bigint | NULL | - | FK to companies(id) |
| **contact_ids** | bigint[] | NULL | - | Array of contact IDs |
| **category** | text | NULL | - | Deal category/type |
| **stage** | text | NOT NULL | - | Pipeline stage |
| **description** | text | NULL | - | Deal description |
| **amount** | bigint | NULL | - | Deal value (in cents) |
| **created_at** | timestamptz | NOT NULL | now() | Creation timestamp |
| **updated_at** | timestamptz | NOT NULL | now() | Last update timestamp |
| **archived_at** | timestamptz | NULL | - | Archive timestamp |
| **expected_closing_date** | timestamptz | NULL | - | Expected close date |
| **sales_id** | bigint | NULL | - | FK to sales(id) |
| **index** | smallint | NULL | - | Position in stage column |

**Indexes:**
- PRIMARY KEY: id

**Foreign Keys:**
- company_id → companies(id) ON DELETE CASCADE
- sales_id → sales(id)

**Pipeline Stages (Default):**
- "opportunity" - Opportunity
- "proposal-sent" - Proposal Sent
- "in-negociation" - In Negotiation
- "won" - Won
- "lost" - Lost
- "delayed" - Delayed

**Categories (Default):**
- "Other"
- "Copywriting"
- "Print project"
- "UI Design"
- "Website design"

**Amount Field:**
- Stored in cents/smallest currency unit
- Example: $1,234.56 = 123456

---

### 5. contactNotes

Notes and interactions with contacts.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | bigint | NOT NULL | auto | Primary key |
| **contact_id** | bigint | NOT NULL | - | FK to contacts(id) |
| **text** | text | NULL | - | Note content |
| **date** | timestamptz | NULL | now() | Note date/time |
| **sales_id** | bigint | NULL | - | FK to sales(id) - author |
| **status** | text | NULL | - | Contact temperature |
| **attachments** | jsonb[] | NULL | - | Array of file attachments |

**Indexes:**
- PRIMARY KEY: id

**Foreign Keys:**
- contact_id → contacts(id) ON DELETE CASCADE
- sales_id → sales(id) ON DELETE CASCADE

**Status Values (Default):**
- "cold" - Cold (blue)
- "warm" - Warm (yellow)
- "hot" - Hot (red)
- "in-contract" - In Contract (green)

---

### 6. dealNotes

Notes and updates for deals.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | bigint | NOT NULL | auto | Primary key |
| **deal_id** | bigint | NOT NULL | - | FK to deals(id) |
| **type** | text | NULL | - | Note type |
| **text** | text | NULL | - | Note content |
| **date** | timestamptz | NULL | now() | Note date/time |
| **sales_id** | bigint | NULL | - | FK to sales(id) - author |
| **attachments** | jsonb[] | NULL | - | Array of file attachments |

**Indexes:**
- PRIMARY KEY: id

**Foreign Keys:**
- deal_id → deals(id) ON DELETE CASCADE
- sales_id → sales(id)

---

### 7. tasks

To-do items and reminders for contacts.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | bigint | NOT NULL | auto | Primary key |
| **contact_id** | bigint | NOT NULL | - | FK to contacts(id) |
| **type** | text | NULL | - | Task type |
| **text** | text | NULL | - | Task description |
| **due_date** | timestamptz | NOT NULL | - | Due date/time |
| **done_date** | timestamptz | NULL | - | Completion timestamp |
| **sales_id** | bigint | NULL | - | FK to sales(id) - assignee |

**Indexes:**
- PRIMARY KEY: id

**Foreign Keys:**
- contact_id → contacts(id) ON DELETE CASCADE

**Task Types (Default):**
- "None"
- "Email"
- "Demo"
- "Lunch"
- "Meeting"
- "Follow-up"
- "Thank you"
- "Ship"
- "Call"

---

### 8. tags

Categorization labels for contacts.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | bigint | NOT NULL | auto | Primary key |
| **name** | text | NOT NULL | - | Tag name |
| **color** | text | NOT NULL | - | Hex color code |

**Indexes:**
- PRIMARY KEY: id

**Color Format:**
- Hex color code (e.g., "#ff5733")

---

## Views

### companies_summary

Augmented company data with relationship counts.

**Columns:**
- All columns from `companies` table
- `nb_deals` (bigint) - Count of deals for this company
- `nb_contacts` (bigint) - Count of contacts at this company

**SQL:**
```sql
SELECT
  c.*,
  count(distinct d.id) as nb_deals,
  count(distinct co.id) as nb_contacts
FROM companies c
LEFT JOIN deals d ON c.id = d.company_id
LEFT JOIN contacts co ON c.id = co.company_id
GROUP BY c.id
```

---

### contacts_summary

Augmented contact data with computed fields.

**Columns:**
- All columns from `contacts` table
- `company_name` (text) - Name of associated company
- `nb_tasks` (bigint) - Count of tasks for this contact
- `email_fts` (text) - Full-text search field for emails
- `phone_fts` (text) - Full-text search field for phone numbers

**SQL:**
```sql
SELECT
  co.id,
  co.first_name,
  co.last_name,
  co.gender,
  co.title,
  co.email_jsonb,
  jsonb_path_query_array(co.email_jsonb, '$[*].email')::text as email_fts,
  co.phone_jsonb,
  jsonb_path_query_array(co.phone_jsonb, '$[*].number')::text as phone_fts,
  co.background,
  co.avatar,
  co.first_seen,
  co.last_seen,
  co.has_newsletter,
  co.status,
  co.tags,
  co.company_id,
  co.sales_id,
  co.linkedin_url,
  c.name as company_name,
  count(distinct t.id) as nb_tasks
FROM contacts co
LEFT JOIN tasks t ON co.id = t.contact_id
LEFT JOIN companies c ON co.company_id = c.id
GROUP BY co.id, c.name
```

---

### init_state

System initialization status check.

**Columns:**
- `is_initialized` (bigint) - Count of sales records

**Purpose:**
- Determines if system has been initialized
- Used during onboarding flow

---

## Enumerations & Constants

### Company Sectors (Default)

```typescript
[
  "Communication Services",
  "Consumer Discretionary",
  "Consumer Staples",
  "Energy",
  "Financials",
  "Health Care",
  "Industrials",
  "Information Technology",
  "Materials",
  "Real Estate",
  "Utilities"
]
```

### Company Sizes

| Value | Display |
|-------|---------|
| 1 | 1 employee |
| 10 | 2-9 employees |
| 50 | 10-49 employees |
| 250 | 50-249 employees |
| 500 | 250 or more employees |

### Deal Stages

| Value | Label | Description |
|-------|-------|-------------|
| opportunity | Opportunity | Initial stage |
| proposal-sent | Proposal Sent | Proposal submitted |
| in-negociation | In Negotiation | Active negotiations |
| won | Won | Deal closed successfully |
| lost | Lost | Deal lost |
| delayed | Delayed | Temporarily on hold |

### Deal Categories

```typescript
["Other", "Copywriting", "Print project", "UI Design", "Website design"]
```

### Contact/Note Statuses

| Value | Label | Color | Description |
|-------|-------|-------|-------------|
| cold | Cold | #7dbde8 | Low engagement |
| warm | Warm | #e8cb7d | Moderate engagement |
| hot | Hot | #e88b7d | High engagement |
| in-contract | In Contract | #a4e87d | Contract signed |

### Task Types

```typescript
["None", "Email", "Demo", "Lunch", "Meeting", "Follow-up", "Thank you", "Ship", "Call"]
```

### Contact Genders

| Value | Label | Icon |
|-------|-------|------|
| male | He/Him | Mars |
| female | She/Her | Venus |
| nonbinary | They/Them | NonBinary |

---

## Security & Permissions

### Row Level Security (RLS)

**All tables have RLS enabled.**

### Access Policies

**For authenticated users:**
- ✅ SELECT (read) - All tables
- ✅ INSERT (create) - All tables
- ✅ UPDATE - companies, contacts, contactNotes, deals, dealNotes, sales, tasks
- ✅ DELETE - companies, contacts, contactNotes, deals, dealNotes, tasks

**Current Implementation:**
- All authenticated users have full CRUD access
- No user-specific or role-based restrictions (yet)

**Recommendation for Production:**
Consider implementing:
- Sales rep can only access their own data
- Admins have full access
- Read-only access for certain roles

---

## File Storage

### Storage Bucket

**Bucket Name:** `attachments`
**Access:** Public read

### Supported File Types

Files are stored as JSONB with structure:

```typescript
{
  src: string;      // URL to file
  title: string;    // File name
  path?: string;    // Storage path
  rawFile: File;    // Original file object
  type?: string;    // MIME type
}
```

### Usage

- **Company logos:** `companies.logo`
- **Contact avatars:** `contacts.avatar`
- **Sales avatars:** `sales.avatar`
- **Note attachments:** `contactNotes.attachments[]`
- **Deal note attachments:** `dealNotes.attachments[]`

### Storage Policies

```sql
-- Authenticated users can:
SELECT  - Read attachments
INSERT  - Upload attachments
DELETE  - Delete attachments
```

---

## TypeScript Types

### Core Types

```typescript
// Sales Team Member
type Sale = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  administrator: boolean;
  user_id: string;
  avatar?: RAFile;
  disabled?: boolean;
};

// Company Types
type CompanyType = "Client" | "Partner" | "Supplier" | "Business Division";
type ClientType = "Agency" | "Advertiser" | "Publisher";

// Company
type Company = {
  id: number;
  created_at: string;
  name: string;
  logo: RAFile;
  type?: CompanyType;
  client_type?: ClientType;
  sector: string;
  size: 1 | 10 | 50 | 250 | 500;
  linkedin_url: string;
  website: string;
  phone_number: string;
  address: string;
  zipcode: string;
  city: string;
  stateAbbr: string;
  country: string;
  sales_id: number;
  description: string;
  revenue: string;
  tax_identifier: string;
  context_links?: string[];
  nb_contacts?: number;  // from view
  nb_deals?: number;     // from view
};

// Contact
type Contact = {
  id: number;
  first_name: string;
  last_name: string;
  title: string;
  company_id: number;
  email_jsonb: EmailAndType[];
  phone_jsonb: PhoneNumberAndType[];
  avatar?: Partial<RAFile>;
  linkedin_url?: string | null;
  first_seen: string;
  last_seen: string;
  has_newsletter: boolean;
  tags: number[];
  gender: string;
  sales_id: number;
  status: string;
  background: string;
  nb_tasks?: number;      // from view
  company_name?: string;  // from view
};

// Email/Phone structures
type EmailAndType = {
  email: string;
  type: "Work" | "Home" | "Other";
};

type PhoneNumberAndType = {
  number: string;
  type: "Work" | "Home" | "Other";
};

// Deal
type Deal = {
  id: number;
  name: string;
  company_id: number;
  contact_ids: number[];
  category: string;
  stage: string;
  description: string;
  amount: number;  // in cents
  created_at: string;
  updated_at: string;
  archived_at?: string;
  expected_closing_date: string;
  sales_id: number;
  index: number;
};

// Contact Note
type ContactNote = {
  id: number;
  contact_id: number;
  text: string;
  date: string;
  sales_id: number;
  status: string;
  attachments?: AttachmentNote[];
};

// Deal Note
type DealNote = {
  id: number;
  deal_id: number;
  text: string;
  date: string;
  sales_id: number;
  attachments?: AttachmentNote[];
};

// Task
type Task = {
  id: number;
  contact_id: number;
  type: string;
  text: string;
  due_date: string;
  done_date?: string | null;
  sales_id?: number;
};

// Tag
type Tag = {
  id: number;
  name: string;
  color: string;  // hex color
};

// File/Attachment
interface RAFile {
  src: string;
  title: string;
  path?: string;
  rawFile: File;
  type?: string;
}

type AttachmentNote = RAFile;
```

---

## Data Migration History

### Migration Timeline

1. **20240730075029** - Initial database schema
   - Created all core tables
   - Set up foreign keys and constraints
   - Configured RLS policies
   - Created views

2. **20240730075425** - User triggers
   - Added auto-creation of sales records from auth.users
   - Added unique constraint on sales.user_id

3. **20240806124555** - Task sales assignment
   - Added sales_id to tasks table

4. **20240807082449** - Removed acquisition field
   - Removed contacts.acquisition column

5. **20240808141826** - Init state configuration
   - Added init_state view

6. **20240813084010** - Tags policy
   - Updated tags RLS policies

7. **20241104153231** - Sales policies
   - Updated sales RLS policies

8. **20250109152531** - Email JSONB conversion
   - Converted contacts.email to email_jsonb
   - Supports multiple emails per contact

9. **20250113132531** - Phone JSONB conversion
   - Converted phone_1/phone_2 to phone_jsonb
   - Supports multiple phones per contact

10. **20251116015104** - Add company type fields
   - Added `type` field to companies (Client, Partner, Supplier, Business Division)
   - Added `client_type` field (Agency, Advertiser, Publisher)
   - Client type only applicable when type='Client'
   - Customization for MiriolMarketing

---

## Best Practices & Conventions

### Field Naming

- Use snake_case for database columns
- Use camelCase for TypeScript properties
- Suffix array fields with plural (e.g., `tags`, `contact_ids`)
- Suffix JSONB fields with `_jsonb` for clarity

### Timestamps

- Always use `timestamptz` (timezone aware)
- Default to `now()` for created_at fields
- Update `updated_at` via application logic

### IDs

- All IDs are `bigint` auto-increment
- Foreign keys match parent table ID type
- Use arrays for many-to-many relationships

### JSONB Usage

- Use for flexible/nested data (emails, phones, files)
- Include full-text search fields in views
- Validate structure in application layer

### Soft Deletes

- Use `archived_at` for deals (preserves history)
- Hard deletes with CASCADE for child records
- Consider adding deleted_at for other tables

---

## Future Considerations

### Potential Enhancements

1. **Audit Trail**
   - Add created_by/updated_by fields
   - Track all changes with history table

2. **Custom Fields**
   - Add JSONB column for user-defined fields
   - Create field definition table

3. **Team/Territory Management**
   - Add teams table
   - Assign sales to teams
   - Territory-based access control

4. **Activity Tracking**
   - Comprehensive activity log table
   - Email tracking integration
   - Call logging

5. **Advanced RLS**
   - User-specific data access
   - Role-based permissions
   - Team-based visibility

6. **Data Validation**
   - Check constraints for enums
   - Phone/email format validation
   - Required field enforcement

7. **Performance**
   - Add indexes for common queries
   - Materialized views for reports
   - Partitioning for large tables

---

## Database Maintenance

### Regular Tasks

- **Backups**: Daily automated backups via Supabase
- **Monitoring**: Track table sizes and query performance
- **Cleanup**: Archive old deals periodically
- **Optimization**: Review and update indexes based on usage

### Migration Process

1. Create new migration file in `supabase/migrations/`
2. Test locally with `npx supabase db reset`
3. Deploy to production with `npx supabase db push`
4. Update this documentation

---

## Support & Resources

**Database Migrations**: `supabase/migrations/`
**TypeScript Types**: `src/components/atomic-crm/types.ts`
**Default Config**: `src/components/atomic-crm/root/defaultConfiguration.ts`
**Supabase Docs**: https://supabase.com/docs

---

**Document Version**: 1.0
**Created**: 2025-11-16
**Author**: Claude Code
**Organization**: Miriol Digital Solutions
**Project**: MiriolMarketing CRM
