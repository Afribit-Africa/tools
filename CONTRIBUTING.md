# Contributing to Afribitools

Thank you for your interest in contributing to Afribitools. This document provides comprehensive guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Making Changes](#making-changes)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Review Process](#review-process)
- [Issue Guidelines](#issue-guidelines)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

Before contributing, ensure you have the following installed:

- Node.js 18 or higher
- npm 9 or higher
- Git
- A code editor (VS Code recommended)
- PostgreSQL client (optional, for database inspection)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/tools.git
cd tools
```

3. Add the upstream repository as a remote:

```bash
git remote add upstream https://github.com/Afribit-Africa/tools.git
```

4. Keep your fork synchronized:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

## Development Setup

### Install Dependencies

```bash
npm install
```

### Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Required variables for development:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-key
```

### Database Setup

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate
```

### Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Project Architecture

### Directory Structure

```
afribitools/
├── app/                      # Next.js App Router
│   ├── fastlight/           # Fastlight module pages
│   ├── cbaf/                # CBAF module pages
│   └── api/                 # API route handlers
├── components/              # React components
│   ├── ui/                  # Shared UI components
│   └── modules/             # Module-specific components
├── lib/                     # Business logic and utilities
│   ├── blink/              # Blink API integration
│   ├── db/                 # Database client and schema
│   └── parsers/            # File parsing utilities
├── types/                   # TypeScript type definitions
├── config/                  # Application configuration
├── migrations/              # Database migrations
└── public/                  # Static assets
```

### Key Technologies

- **Next.js 16**: React framework with App Router
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first styling
- **Drizzle ORM**: Type-safe database access
- **NextAuth.js**: Authentication
- **Blink API**: Lightning address verification

### Module Structure

Each module follows a consistent structure:

```
app/[module-name]/
├── page.tsx                 # Main page
├── layout.tsx              # Optional layout wrapper
└── [feature]/              # Feature-specific pages
    └── page.tsx

components/modules/[module-name]/
├── ComponentName.tsx       # UI components
└── index.ts               # Re-exports

lib/[module-name]/
├── api.ts                  # API functions
├── utils.ts               # Helper functions
└── types.ts               # Module-specific types
```

## Making Changes

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes

Examples:

```bash
git checkout -b feature/batch-export-filtering
git checkout -b fix/validation-table-scroll
git checkout -b docs/api-endpoint-documentation
```

### Commit Messages

Write clear, descriptive commit messages:

```
<type>: <short description>

<optional longer description>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:

```
feat: add provider selection to Fastlight

Allow users to choose between Blink, Fedi, or custom providers
for Lightning address verification.

fix: correct pagination in validation table

The table was not properly scrolling when displaying more than
1000 rows. Added virtual scrolling for performance.
```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define explicit types for function parameters and return values
- Avoid `any` type; use `unknown` if type is truly unknown
- Use interfaces for object shapes, types for unions/primitives

```typescript
// Good
interface MerchantData {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'pending' | 'inactive';
}

function validateMerchant(data: MerchantData): boolean {
  return data.status === 'active';
}

// Avoid
function validateMerchant(data: any): any {
  return data.status === 'active';
}
```

### React Components

- Use functional components with hooks
- Define prop types with interfaces
- Keep components focused and single-purpose
- Extract complex logic into custom hooks

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({
  label,
  onClick,
  variant = 'primary',
  disabled = false
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-${variant}`}
    >
      {label}
    </button>
  );
}
```

### Styling

- Use Tailwind CSS utility classes
- Follow the established dark theme pattern:
  - Container: `bg-black`
  - Cards: `bg-white/5 backdrop-blur-xl border border-white/10`
  - Text: `text-white` (primary), `text-gray-400` (secondary)
- Avoid inline styles; use Tailwind classes

### File Naming

- React components: PascalCase (`ValidationTable.tsx`)
- Utilities and hooks: camelCase (`useValidation.ts`)
- Constants: SCREAMING_SNAKE_CASE
- CSS/config files: kebab-case

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- ValidationTable.test.tsx
```

### Writing Tests

- Write tests for new features and bug fixes
- Place test files adjacent to the code they test
- Use descriptive test names

```typescript
describe('validateLightningAddress', () => {
  it('returns valid for correct Blink address format', () => {
    const result = validateLightningAddress('user@blink.sv');
    expect(result.isValid).toBe(true);
  });

  it('returns invalid for addresses with whitespace', () => {
    const result = validateLightningAddress(' user@blink.sv ');
    expect(result.isValid).toBe(false);
    expect(result.suggestion).toBe('user@blink.sv');
  });
});
```

## Submitting Changes

### Pull Request Process

1. Ensure your code passes all tests:

```bash
npm run lint
npm run build
npm test
```

2. Update documentation if needed

3. Push your branch to your fork:

```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request on GitHub

5. Fill out the PR template with:
   - Description of changes
   - Related issue numbers
   - Screenshots (for UI changes)
   - Testing steps

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Related Issues
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
Describe how to test the changes

## Screenshots
If applicable, add screenshots

## Checklist
- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No console errors or warnings
```

## Review Process

### What Reviewers Look For

- Code correctness and completeness
- Adherence to style guidelines
- Test coverage
- Performance implications
- Security considerations
- Documentation accuracy

### Responding to Feedback

- Address all review comments
- Push additional commits to the same branch
- Mark conversations as resolved when addressed
- Ask for clarification if feedback is unclear

### Merge Requirements

Pull requests must meet these criteria before merging:

- At least one approving review
- All CI checks passing
- No merge conflicts
- Up-to-date with main branch

## Issue Guidelines

### Reporting Bugs

Include the following information:

- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS information
- Screenshots if applicable
- Error messages from console

### Feature Requests

Include the following:

- Clear description of the feature
- Use case and motivation
- Proposed implementation (optional)
- Mockups or examples (optional)

### Issue Labels

- `bug`: Something is not working
- `enhancement`: New feature request
- `documentation`: Documentation improvements
- `good first issue`: Suitable for new contributors
- `help wanted`: Extra attention needed
- `priority: high`: Urgent issues
- `module: fastlight`: Fastlight-specific
- `module: cbaf`: CBAF-specific

---

## Questions?

If you have questions about contributing, feel free to:

- Open a GitHub Discussion
- Create an issue with the `question` label
- Reach out via email at tools@afribit.africa

Thank you for contributing to Afribitools and supporting the Bitcoin circular economy.
