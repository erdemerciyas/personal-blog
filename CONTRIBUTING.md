# 🤝 Contributing to Personal Blog Platform

Thank you for your interest in contributing to this project! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Security](#security)

## 📜 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to extremeecu34@gmail.com.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 8+
- MongoDB (local or cloud)
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/extremeecu.git
   cd extremeecu
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/erdemerciyas/extremeecu.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## 🛠️ Contributing Guidelines

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(portfolio): add project filtering functionality
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
```

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful variable and function names
- Add comments for complex logic
- Follow React/Next.js best practices

### Testing

- Write tests for new features
- Ensure existing tests pass
- Test on multiple browsers/devices
- Verify responsive design

## 🔄 Pull Request Process

### Before Submitting

1. **Sync with upstream**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow coding standards
   - Add tests if applicable

4. **Test your changes**
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

### Pull Request Template

When creating a PR, please include:

- **Description**: What does this PR do?
- **Type**: Feature, Bug Fix, Documentation, etc.
- **Testing**: How was this tested?
- **Screenshots**: If UI changes are involved
- **Breaking Changes**: Any breaking changes?
- **Related Issues**: Link to related issues

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer review
3. **Testing**: Manual testing if needed
4. **Approval**: Maintainer approval required
5. **Merge**: Squash and merge to main

## 🐛 Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Environment**: OS, Browser, Node.js version
- **Steps to Reproduce**: Clear reproduction steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Error Messages**: Full error messages/stack traces

### Feature Requests

For feature requests, please include:

- **Problem**: What problem does this solve?
- **Solution**: Proposed solution
- **Alternatives**: Alternative solutions considered
- **Use Cases**: Real-world use cases
- **Priority**: How important is this feature?

## 🔒 Security

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead:
1. Email: extremeecu34@gmail.com
2. Subject: [SECURITY] Vulnerability Report
3. Include detailed description and steps to reproduce

### Security Guidelines

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Follow OWASP security guidelines
- Validate all user inputs
- Use HTTPS in production
- Keep dependencies updated

## 📚 Development Resources

### Project Structure
```
src/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/                # Utilities and configurations
├── models/             # Database models
├── types/              # TypeScript types
└── hooks/              # Custom React hooks
```

### Key Technologies

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Deployment**: Vercel
- **Image Storage**: Cloudinary

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run dev:turbo        # Start with Turbo mode

# Building
npm run build            # Production build
npm run build:analyze    # Bundle analysis

# Quality
npm run lint             # ESLint check
npm run lint:fix         # Fix ESLint issues
npm run type-check       # TypeScript check

# Testing
npm run test:config      # Test configuration
npm run security:check   # Security audit
```

## 🎯 Areas for Contribution

### High Priority
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] Mobile responsiveness
- [ ] SEO enhancements
- [ ] Test coverage

### Medium Priority
- [ ] New portfolio layouts
- [ ] Advanced filtering options
- [ ] Dark mode improvements
- [ ] Internationalization
- [ ] PWA features

### Low Priority
- [ ] Additional themes
- [ ] Social media integrations
- [ ] Analytics dashboard
- [ ] Comment system
- [ ] Newsletter integration

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- CHANGELOG.md for significant contributions
- GitHub contributors page
- Project documentation

## 📞 Getting Help

- **Documentation**: Check README.md and docs/
- **Issues**: Search existing issues first
- **Discussions**: Use GitHub Discussions for questions
- **Email**: extremeecu34@gmail.com for urgent matters

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to make this project better! 🚀