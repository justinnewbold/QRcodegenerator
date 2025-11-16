# CI/CD Pipeline Documentation

This project uses GitHub Actions for automated testing, building, and deployment.

## Workflows

### 1. **CI/CD with Auto-Fix** (`ci-cd.yml`)

Runs on every push to any branch and on pull requests to main.

**What it does:**
- ✅ Runs ESLint with auto-fix
- ✅ Runs TypeScript type checking
- ✅ Runs Jest tests with coverage
- ✅ Builds the Next.js application
- 🔧 Auto-commits and pushes lint fixes (if any)
- 🚀 Deploys to Vercel production (only on main branch)

**Auto-Fix Loop:**
If linting issues are found that can be auto-fixed, the workflow will:
1. Run `npm run lint:fix`
2. Commit the changes with message: "chore: auto-fix linting issues [skip ci]"
3. Push the commit back to the branch
4. The `[skip ci]` tag prevents infinite loops

**Error Handling:**
- If type errors are found, the workflow fails and shows errors in the summary
- If tests fail, the workflow fails and shows test output in the summary
- If build fails, the workflow fails and shows build errors in the summary
- Coverage reports are uploaded as artifacts for review

### 2. **Preview Deployment** (`preview.yml`)

Runs on pull request events (opened, synchronized, reopened).

**What it does:**
- Builds the application
- Deploys a preview to Vercel
- Comments on the PR with the preview URL

## Required Secrets

To enable deployments, add these secrets to your GitHub repository:

### Vercel Secrets

1. **VERCEL_TOKEN**
   - Get from: https://vercel.com/account/tokens
   - Create a new token with deployment permissions

2. **VERCEL_ORG_ID**
   - Find in: Vercel project settings → General → Organization ID
   - Or run: `vercel whoami` (requires Vercel CLI)

3. **VERCEL_PROJECT_ID**
   - Find in: Vercel project settings → General → Project ID
   - Or check `.vercel/project.json` after running `vercel link`

### How to Add Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with its value

## Local Testing

Run the same checks locally before pushing:

```bash
# Run all CI checks
npm run ci

# Individual checks
npm run lint          # Check linting
npm run lint:fix      # Fix linting issues
npm run type-check    # Check TypeScript types
npm run test          # Run tests
npm run test:coverage # Run tests with coverage
npm run build         # Build the application
```

## Deployment Flow

### Main Branch
```
Push to main → Run tests → Build → Deploy to production
```

### Feature Branches
```
Push to branch → Run tests → Build → (No deployment)
```

### Pull Requests
```
Open PR → Run tests → Build → Deploy preview → Comment PR with URL
```

## Monitoring

- **Build Status**: Check the Actions tab in GitHub
- **Coverage Reports**: Download from workflow artifacts
- **Deployment Status**: Check Vercel dashboard
- **Error Logs**: View in GitHub Actions summary

## Troubleshooting

### Tests Failing
- Check the test output in the GitHub Actions summary
- Run tests locally: `npm test`
- Fix failing tests and push again

### Build Failing
- Check the build log in the GitHub Actions summary
- Run build locally: `npm run build`
- Fix build errors and push again

### Type Errors
- Check the type check output in the GitHub Actions summary
- Run type check locally: `npm run type-check`
- Fix type errors and push again

### Deployment Failing
- Verify Vercel secrets are set correctly
- Check Vercel dashboard for deployment logs
- Ensure the Vercel project is properly configured

## Benefits

✅ **Automated Testing**: Every push is tested automatically
✅ **Auto-Fix**: Linting issues are fixed automatically
✅ **Fast Feedback**: Know immediately if something breaks
✅ **Safe Deployments**: Only deploy if all tests pass
✅ **Preview URLs**: Test changes before merging
✅ **Coverage Tracking**: Monitor test coverage over time
