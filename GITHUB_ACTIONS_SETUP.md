# 🚀 GitHub Actions CI/CD Setup Guide

## 📋 Required GitHub Secrets

Repository Settings > Secrets and variables > Actions'da şu secrets'ları ekleyin:

### 🔐 Authentication Secrets
```
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app
```

### 🚀 Vercel Deployment Secrets (Optional)
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-organization-id
VERCEL_PROJECT_ID=your-project-id
```

## 🔧 How to Get Vercel Secrets

1. **VERCEL_TOKEN**:
   - Go to https://vercel.com/account/tokens
   - Create new token
   - Copy the token

2. **VERCEL_ORG_ID & VERCEL_PROJECT_ID**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Link your project
   vercel link
   
   # Get project info
   vercel project ls
   ```

## 🧪 Testing CI/CD Locally

```bash
# Test environment validation
npm run test:config

# Test build process
npm run build

# Test linting
npm run lint

# Test TypeScript
npm run type-check

# Test security
npm run security:test
```

## 🔍 Troubleshooting

### Common Issues:

1. **"Some jobs were not successful"**
   - Check GitHub Secrets are properly set
   - Verify environment variables
   - Check build logs for specific errors

2. **Build Failures**
   - Run `npm run build` locally first
   - Check TypeScript errors: `npm run type-check`
   - Check ESLint errors: `npm run lint`

3. **Deployment Failures**
   - Verify Vercel secrets are correct
   - Check Vercel project is properly linked
   - Ensure domain is correctly configured

### Debug Commands:

```bash
# Check environment
node scripts/validate-env.js

# Check configuration
npm run test:config

# Build with verbose output
npm run build -- --debug

# Security audit
npm run security:test
```

## 📊 Pipeline Status

Current pipeline includes:

- ✅ **Code Quality**: ESLint, TypeScript, Prettier
- ✅ **Security**: Audit, vulnerability scanning
- ✅ **Build**: Next.js production build
- ✅ **Testing**: Configuration validation
- ✅ **Deployment**: Automatic Vercel deployment (main branch)
- ✅ **Performance**: Bundle analysis, performance testing

## 🎯 Success Criteria

For a successful pipeline run:

1. All environment variables must be present
2. Code must pass ESLint checks (warnings allowed)
3. TypeScript must compile without errors
4. Build must complete successfully
5. Security tests must pass
6. Deployment must succeed (if on main branch)

## 🔄 Workflow Triggers

- **Push to main**: Full pipeline + deployment
- **Push to develop**: Full pipeline (no deployment)
- **Pull Request**: Full pipeline + performance testing

## 📈 Monitoring

Monitor your CI/CD pipeline:

- GitHub Actions tab in your repository
- Vercel dashboard for deployment status
- Build logs for detailed information
- Security reports for vulnerability status

---

💡 **Tip**: Always test locally before pushing to ensure CI/CD success!