# Contributing to Afribitools

Thank you for your interest in contributing to Afribitools! This document provides guidelines for contributing.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/tools.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## 📝 Code Style

- Use TypeScript for type safety
- Follow existing code formatting (Prettier/ESLint)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## 🏗️ Project Structure

When adding new features:

### Adding a New Module

1. Create module directory: `app/[module-name]/`
2. Add components: `components/modules/[module-name]/`
3. Add types: Update `types/index.ts`
4. Add to site config: Update `config/site.ts`
5. Create API routes if needed: `app/api/[module-name]/`

### Example Module Structure
```
app/
  my-module/
    page.tsx              # Main page
    layout.tsx           # Optional layout
components/
  modules/
    my-module/
      Component1.tsx
      Component2.tsx
lib/
  my-module/
    logic.ts             # Business logic
    types.ts             # Module-specific types
```

## 🧪 Testing

Before submitting a PR:

1. Test your changes locally
2. Ensure no TypeScript errors: `npm run build`
3. Check linting: `npm run lint`
4. Test all affected features
5. Test on mobile if UI changes

## 📋 Pull Request Guidelines

### PR Title Format
```
[Module] Brief description

Examples:
- [Fastlight] Add support for Google Sheets import
- [Core] Improve error handling in file upload
- [UI] Fix responsive layout on mobile
```

### PR Description Template
```markdown
## What does this PR do?
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How to Test
Steps to test the changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No console errors
```

## 💡 Feature Requests

For new module ideas:

1. Open an issue with the "Feature Request" label
2. Describe the use case and problem it solves
3. Provide examples of expected behavior
4. Discuss implementation approach

## 🐛 Bug Reports

When reporting bugs:

1. Use the "Bug" label
2. Provide clear reproduction steps
3. Include error messages/screenshots
4. Note your environment (OS, browser, Node version)
5. Check if the issue already exists

### Bug Report Template
```markdown
**Describe the bug**
Clear description of what's wrong

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Node: [e.g. 18.17.0]
```

## 🎨 Design Guidelines

When modifying UI:

- Follow the Bitcoin-themed dark design
- Use existing color variables from Tailwind config
- Maintain accessibility (contrast ratios, keyboard navigation)
- Test responsive behavior on mobile
- Use existing components when possible

### Color Usage
- `bitcoin` (#F7931A): Primary actions, highlights
- `status-success`: Valid/success states
- `status-error`: Errors/invalid states
- `status-warning`: Warnings/fixed states
- `status-pending`: Loading/pending states

## 📚 Documentation

Update docs when:

- Adding new features
- Changing API endpoints
- Modifying configuration
- Adding new dependencies
- Changing environment variables

## 🔒 Security

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email security concerns to: security@afribit.africa
3. Include detailed description and reproduction steps
4. Allow time for patch before public disclosure

## 📜 Code of Conduct

- Be respectful and constructive
- Welcome newcomers and help them learn
- Focus on what's best for the community
- Show empathy towards other contributors

## 🌟 Recognition

Contributors will be:
- Listed in the README
- Credited in release notes
- Appreciated in the community

## 📞 Getting Help

- Open a discussion on GitHub
- Join our community chat (link in README)
- Check existing issues and documentation

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Afribitools! 🙏⚡
