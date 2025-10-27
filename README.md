# Project 3

A Node.js application

## Prerequisites

- Node.js (v14 or higher recommended)
- PostgreSQL database
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gang62_project3
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your database credentials:
```env
DB_USER=your_database_user
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_database_password
DB_PORT=5432
```

## Usage

Run the example script:
```bash
node example.js
```

Or use npm:
```bash
npm start
```

## Development Guidelines

### **Commit Message Standards**

For those actively pushing to the repository, we maintain a simple standard for commit messages:

**`<type>(<scope>): <short summary>`**

#### **1. Type (required)**
Indicates the purpose of the change:

- `feat` – a new feature
- `fix` – a bug fix
- `docs` – documentation only
- `style` – formatting (no code logic change)
- `refactor` – code change that improves structure but not behavior
- `perf` – performance improvement
- `test` – adding or fixing tests
- `chore` – maintenance, build tasks, dependencies

#### **2. Scope (optional)**
Area of the project the change affects. Examples:
- `backend`, `frontend`, `db`, `scripts`, `ui`, `dao`

#### **3. Summary (required)**
- Short description (like "Add…", "Fix…", "Update…")
- Keep under 50 characters if possible

#### **Examples:**
```
fix(backend): correct calculation for peak days
feat(frontend): add dashboard page with sales chart
docs(readme): update installation instructions
chore(deps): update maven dependencies
```

### **Pull Request Template**

```markdown
# Summary

Brief description of what this PR accomplishes.

# Changes

* **Category 1**
  * Specific change 1
  * Specific change 2

* **Category 2**
  * Specific change 1
  * Specific change 2

# Testing

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Manual testing completed
- [ ] Database operations work correctly

# Security

- [ ] No hardcoded credentials
- [ ] No sensitive data in code
- [ ] Database connections use manual input
```

## Authors

- Jonah Coffelt
- Michael Nguyen
- David Zhang
- Zane Jacob