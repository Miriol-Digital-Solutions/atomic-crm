# Team Setup - Manual Steps Required

Some team collaboration features require admin access and manual configuration through the GitHub web interface. Follow these steps to complete the setup.

---

## 1. Create GitHub Project Board

GitHub Projects provide kanban-style task management integrated with your repository.

### Steps:

1. **Go to your organization**: https://github.com/Miriol-Digital-Solutions
2. **Click "Projects"** tab
3. **Click "New project"**
4. **Select "Board" template**
5. **Name it**: "Miriol CRM Development"
6. **Click "Create project"**

### Configure the Project:

1. **Add columns** (customize as needed):
   - Backlog
   - Todo
   - In Progress
   - In Review
   - Done

2. **Link to repository**:
   - Click Settings (⚙️) in the project
   - Under "Manage access", add the atomic-crm repository

3. **Configure automation** (optional):
   - Auto-add new issues and PRs
   - Auto-move to "Done" when issues/PRs close
   - Auto-move to "In Progress" when PRs are opened

### Alternative: Repository-level Project

You can also create a repository-specific project:

1. Go to: https://github.com/Miriol-Digital-Solutions/atomic-crm
2. Click "Projects" tab
3. Click "New project"
4. Follow same steps as above

---

## 2. Configure Branch Protection Rules

Protect the `main` branch to ensure code quality and prevent accidental changes.

### Steps:

1. **Go to repository settings**: https://github.com/Miriol-Digital-Solutions/atomic-crm/settings
2. **Navigate to**: Branches → Add branch protection rule
3. **Branch name pattern**: `main`

### Recommended Settings:

#### Pull Request Requirements
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **1** (or more for critical projects)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners

#### Status Checks
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - **Select required checks**:
    - ✅ ESLint (🔬 ESLint)
    - ✅ Test (🔎 Test)
    - ✅ Build (🔨 Build)

#### Additional Protections
- ✅ **Require conversation resolution before merging**
- ✅ **Require linear history** (optional, enforces squash/rebase)
- ✅ **Do not allow bypassing the above settings** (even for admins)

#### Optional Settings
- ⬜ Require signed commits (for higher security)
- ⬜ Require deployments to succeed before merging
- ⬜ Lock branch (only if you want read-only)

### For `develop` Branch (if used):

Repeat the same process but with slightly relaxed rules:
- Require approvals: **1**
- Allow force pushes for maintainers (optional)

---

## 3. Configure Repository Settings

Fine-tune repository settings for optimal team collaboration.

### General Settings

Go to: https://github.com/Miriol-Digital-Solutions/atomic-crm/settings

#### Features
- ✅ **Issues** - Enable issue tracking
- ✅ **Preserve this repository** - For GitHub Archive Program
- ✅ **Discussions** - Enable for team discussions (optional)
- ⬜ **Projects** - If using repository-level projects
- ✅ **Wiki** - For detailed documentation (optional)

#### Pull Requests
- ✅ **Allow squash merging** (recommended)
- ✅ **Allow rebase merging**
- ⬜ **Allow merge commits** (disable for cleaner history)
- ✅ **Always suggest updating pull request branches**
- ✅ **Allow auto-merge**
- ✅ **Automatically delete head branches** after merge

#### Archives
- ⬜ Include Git LFS objects in archives

#### Danger Zone
- **Visibility**: Keep as **Private** (recommended for business use)
- **Transfer ownership**: Not needed
- **Archive repository**: Not needed
- **Delete repository**: Not needed

---

## 4. Set Up Required Labels

Organize issues and PRs with labels. Many are already created, but you can add custom ones:

Go to: https://github.com/Miriol-Digital-Solutions/atomic-crm/labels

### Recommended Labels:

**Type:**
- `bug` (red) - Something isn't working
- `enhancement` (blue) - New feature or request
- `question` (purple) - Further information is requested
- `documentation` (yellow) - Documentation improvements

**Priority:**
- `priority: critical` (dark red) - Needs immediate attention
- `priority: high` (orange) - Should be addressed soon
- `priority: medium` (yellow) - Normal priority
- `priority: low` (light gray) - Nice to have

**Status:**
- `needs-triage` (gray) - Needs review and categorization
- `in-progress` (green) - Currently being worked on
- `blocked` (red) - Cannot proceed due to dependencies
- `ready-for-review` (blue) - Ready for code review

**Area:**
- `area: frontend` - Frontend/UI related
- `area: backend` - Backend/API related
- `area: database` - Database related
- `area: deployment` - Deployment/DevOps
- `area: testing` - Testing related

---

## 5. Configure Dependabot

Enable automated dependency updates to keep packages current and secure.

Go to: https://github.com/Miriol-Digital-Solutions/atomic-crm/settings/security_analysis

### Steps:

1. **Enable Dependabot alerts**
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates

2. **Create Dependabot config** (optional for version updates):

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  # npm dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5
    reviewers:
      - "Miriol-Digital-Solutions/crm-team"
    labels:
      - "dependencies"
      - "automated"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
    labels:
      - "dependencies"
      - "github-actions"
```

---

## 6. Set Up Team Access

Organize team members with appropriate permissions.

Go to: https://github.com/Miriol-Digital-Solutions/atomic-crm/settings/access

### Create Teams (Organization level):

1. Go to: https://github.com/orgs/Miriol-Digital-Solutions/teams
2. Create teams:

**@Miriol-Digital-Solutions/crm-admins**
- Role: Admin
- Members: Project leads, senior developers

**@Miriol-Digital-Solutions/crm-developers**
- Role: Write
- Members: All developers

**@Miriol-Digital-Solutions/crm-reviewers**
- Role: Write (with review privileges)
- Members: Senior developers, tech leads

**@Miriol-Digital-Solutions/crm-viewers**
- Role: Read
- Members: Stakeholders, clients (if applicable)

### Assign Teams to Repository:

1. Go to repository settings → Collaborators and teams
2. Add each team with appropriate role
3. Update `.github/CODEOWNERS` with actual team names

---

## 7. Configure Webhooks (Optional)

Set up webhooks for external integrations (Slack, Discord, etc.).

Go to: https://github.com/Miriol-Digital-Solutions/atomic-crm/settings/hooks

### Slack Integration Example:

1. **Get Slack webhook URL** from your Slack workspace
2. **Add webhook** in GitHub
3. **Select events**: Pull requests, Issues, Pushes
4. **Test webhook** to verify

### Discord Integration Example:

1. **Create webhook** in Discord channel settings
2. **Use format**: `https://discord.com/api/webhooks/...../github`
3. **Configure events** similar to Slack

---

## 8. Set Up GitHub Secrets

Configure secrets for CI/CD workflows.

Go to: https://github.com/Miriol-Digital-Solutions/atomic-crm/settings/secrets/actions

### Required Secrets (for production deployment):

**Supabase Secrets:**
- `SUPABASE_ACCESS_TOKEN` - From Supabase account settings
- `SUPABASE_DB_PASSWORD` - Database password
- `SUPABASE_PROJECT_ID` - Project reference ID
- `SUPABASE_URL` - Your project URL
- `SUPABASE_ANON_KEY` - Anonymous/public key

**Deployment Secrets (if using GitHub Pages):**
- `DEPLOY_TOKEN` - GitHub personal access token (optional)

**Email Integration (optional):**
- `POSTMARK_WEBHOOK_USER` - For email capture
- `POSTMARK_WEBHOOK_PASSWORD`
- `POSTMARK_WEBHOOK_AUTHORIZED_IPS`

### How to Add Secrets:

1. Click "New repository secret"
2. Enter name (e.g., `SUPABASE_URL`)
3. Enter value
4. Click "Add secret"

**Security Notes:**
- Never commit secrets to code
- Rotate secrets periodically
- Use environment-specific secrets
- Limit access to secrets

---

## 9. Enable GitHub Actions

Ensure GitHub Actions are enabled and configured.

Go to: https://github.com/Miriol-Digital-Solutions/atomic-crm/settings/actions

### Recommended Settings:

**General:**
- ✅ **Allow all actions and reusable workflows**
- ✅ **Allow GitHub Actions to create and approve pull requests**

**Workflow Permissions:**
- ✅ **Read and write permissions**
- ✅ **Allow GitHub Actions to create and approve pull requests**

**Workflow run retention:**
- **90 days** (or customize)

---

## 10. Additional Repository Configuration

### Topics

Add topics to make repository discoverable:

1. Go to repository homepage
2. Click ⚙️ next to "About"
3. Add topics:
   - `crm`
   - `react`
   - `typescript`
   - `supabase`
   - `customer-relationship-management`
   - `miriol`
   - `atomic-crm`

### Description

Update repository description:
```
CRM system for MiriolMarketing - A modern, open-source customer relationship management platform built with React, TypeScript, and Supabase
```

### Website

Add project website:
- Production URL (when deployed)
- Or: `https://www.miriol.com`

### Social Preview

Upload a social preview image (1280×640px):
- Company logo with project name
- Or screenshot of the application

---

## Verification Checklist

After completing the manual steps, verify:

- [ ] GitHub Project board created and linked
- [ ] Branch protection enabled on `main`
- [ ] Repository settings configured
- [ ] Required labels created
- [ ] Dependabot enabled
- [ ] Team access configured
- [ ] Webhooks set up (if needed)
- [ ] GitHub Secrets added (for production)
- [ ] GitHub Actions enabled
- [ ] Topics and description added

---

## What's Already Complete

✅ **Issue templates** - Bug report, feature request, question
✅ **Pull request template** - With comprehensive checklist
✅ **CODEOWNERS file** - Automatic review assignment
✅ **CONTRIBUTING.md** - Enhanced with Miriol workflow
✅ **GitHub Actions workflows** - CI/CD already configured
✅ **Repository forked and cloned** - Ready for development

---

## Need Help?

If you encounter issues with any of these steps:

1. Check GitHub documentation: https://docs.github.com
2. Contact GitHub support
3. Ask in the team discussion
4. Open an issue in the repository

---

**Next Steps:**

Once these manual steps are complete, the team collaboration infrastructure will be fully set up and ready for development!

**Document Version**: 1.0
**Created**: 2025-11-16
**Organization**: Miriol Digital Solutions
**Repository**: atomic-crm
