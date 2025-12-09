# CI/CD Workflows Explained - Complete Guide

This document explains every line of the CI and CD workflows for both backend and frontend.

---

## 📋 Table of Contents

1. [Backend CI Workflow](#backend-ci-workflow)
2. [Backend CD Workflow](#backend-cd-workflow)
3. [Frontend CI Workflow](#frontend-ci-workflow)
4. [Frontend CD Workflow](#frontend-cd-workflow)
5. [Key Concepts](#key-concepts)
6. [Workflow Comparison](#workflow-comparison)

---

## 🔵 Backend CI Workflow

**File:** `backend/.github/workflows/ci.yml`

### Line-by-Line Explanation

```yaml
name: CI
```
**What it does:** Names the workflow "CI" (appears in GitHub Actions tab)

```yaml
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]
```
**What it does:** Defines when the workflow runs
- **Triggers on:** Push to `main` or `dev` branches
- **Triggers on:** Pull requests targeting `main` or `dev`
- **Purpose:** Run checks on every code change

```yaml
jobs:
  lint-and-test:
    name: Lint, Type Check & Build
    runs-on: ubuntu-latest
```
**What it does:** Defines a job that:
- **Job name:** "Lint, Type Check & Build" (visible in Actions)
- **Runs on:** Latest Ubuntu runner (GitHub-hosted virtual machine)
- **Purpose:** Single job that runs all checks sequentially

```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4
```
**What it does:** 
- Checks out your repository code into the runner
- **Version:** Uses v4 of the checkout action (latest stable)
- **Result:** Code is available at `/home/runner/work/repo-name/repo-name`

```yaml
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: "18"
      cache: "npm"
```
**What it does:**
- Installs Node.js version 18
- **Cache:** Caches `node_modules` to speed up future runs
- **Benefit:** Faster builds (skips npm install if dependencies unchanged)

```yaml
  - name: Install dependencies
    run: npm ci
```
**What it does:**
- **`npm ci`:** Clean install (removes node_modules first)
- **Why `npm ci` not `npm install`:** 
  - Faster
  - More reliable (uses exact versions from package-lock.json)
  - Fails if package-lock.json is out of sync

```yaml
  - name: Type check
    run: npm run type-check
```
**What it does:**
- Runs TypeScript type checking without building
- **Command:** `tsc --noEmit` (checks types, doesn't generate files)
- **Purpose:** Catch type errors before building

```yaml
  - name: Build
    run: npm run build
```
**What it does:**
- Compiles TypeScript to JavaScript
- **Output:** Creates `dist/` directory with compiled code
- **Purpose:** Verify code compiles successfully

```yaml
  - name: Check for build artifacts
    run: |
      if [ ! -d "dist" ]; then
        echo "❌ Build failed: dist directory not found"
        exit 1
      fi
      echo "✅ Build successful: dist directory exists"
```
**What it does:**
- **Verifies:** `dist/` directory was created
- **If missing:** Fails the workflow (exit 1)
- **If exists:** Prints success message
- **Purpose:** Double-check that build actually worked

---

## 🐳 Backend CD Workflow

**File:** `backend/.github/workflows/cd.yml`

### Line-by-Line Explanation

```yaml
name: CD
```
**What it does:** Names the workflow "CD" (Continuous Deployment)

```yaml
on:
  push:
    branches:
      - main
      - dev
    paths-ignore:
      - "**.md"
      - ".gitignore"
```
**What it does:**
- **Triggers:** Only on push to `main` or `dev` (not PRs)
- **paths-ignore:** Skips workflow if only markdown or .gitignore changed
- **Purpose:** Don't rebuild Docker if only docs changed

```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
```
**What it does:**
- **REGISTRY:** GitHub Container Registry URL
- **IMAGE_NAME:** Auto-detects repo name (e.g., `u-leslie/skitt_be`)
- **Purpose:** Reusable variables for image naming

```yaml
jobs:
  build-and-push:
    name: Build and Push Docker Image
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
```
**What it does:**
- **Job name:** "Build and Push Docker Image"
- **permissions:**
  - `contents: read` - Read repository code
  - `packages: write` - Push images to GitHub Container Registry
- **Purpose:** Minimal permissions (security best practice)

```yaml
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
```
**What it does:** Same as CI - gets your code

```yaml
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
```
**What it does:**
- **Buildx:** Advanced Docker build tool
- **Features:** Multi-platform builds, better caching
- **Purpose:** Faster, more efficient Docker builds

```yaml
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
```
**What it does:**
- **Logs in:** Authenticates to GitHub Container Registry
- **username:** GitHub username (auto-detected)
- **password:** Auto-generated GitHub token (no setup needed!)
- **Purpose:** Allows pushing images to `ghcr.io`

```yaml
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
```
**What it does:** Creates image tags automatically
- **type=ref,event=branch:** Tags with branch name (`main` or `dev`)
- **type=sha,prefix={{branch}}-:** Tags with commit SHA (`main-abc1234`)
- **type=raw,value=latest:** Tags as `latest` (only for main branch)
- **Result:** Image gets multiple tags for easy reference

**Example tags created:**
- `ghcr.io/u-leslie/skitt_be:main`
- `ghcr.io/u-leslie/skitt_be:main-abc1234`
- `ghcr.io/u-leslie/skitt_be:latest` (if main branch)

```yaml
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```
**What it does:**
- **context:** Build context (current directory)
- **file:** Path to Dockerfile
- **push: true:** Push to registry (not just build)
- **tags:** Uses tags from metadata step
- **labels:** Adds metadata labels to image
- **cache-from/cache-to:** Uses GitHub Actions cache
  - **type=gha:** GitHub Actions cache
  - **mode=max:** Maximum cache layers
  - **Benefit:** Faster builds (reuses layers from previous builds)

```yaml
      - name: Image digest
        run: echo "Image pushed with digest ${{ steps.meta.outputs.digest }}"
```
**What it does:**
- Prints the image digest (SHA256 hash)
- **Purpose:** Logging/debugging (shows exact image version)

---

## 🟢 Frontend CI Workflow

**File:** `frontend/.github/workflows/ci.yml`

### Differences from Backend CI

```yaml
  - name: Lint
    run: npm run lint
```
**What it does:**
- Runs ESLint to check code quality
- **Backend doesn't have this:** Backend uses TypeScript only
- **Purpose:** Catch code style issues, unused variables, etc.

```yaml
  - name: Build
    run: npm run build
    env:
      NEXT_PUBLIC_API_URL: http://localhost:3001
```
**What it does:**
- Builds Next.js application
- **env:** Sets environment variable for build
- **NEXT_PUBLIC_API_URL:** Required by Next.js (public env vars)
- **Purpose:** Next.js needs this at build time (not runtime)

```yaml
  - name: Check for build artifacts
    run: |
      if [ ! -d ".next" ]; then
        echo "❌ Build failed: .next directory not found"
        exit 1
      fi
      echo "✅ Build successful: .next directory exists"
```
**What it does:**
- Checks for `.next/` directory (Next.js build output)
- **Different from backend:** Backend checks `dist/`, frontend checks `.next/`

---

## 🟢 Frontend CD Workflow

**File:** `frontend/.github/workflows/cd.yml`

### Differences from Backend CD

```yaml
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NEXT_PUBLIC_API_URL=${{ secrets.NEXT_PUBLIC_API_URL || 'http://localhost:3001' }
```
**What it does:**
- **build-args:** Passes build arguments to Dockerfile
- **NEXT_PUBLIC_API_URL:** Can be set via GitHub secret, defaults to localhost
- **Purpose:** Allows configuring API URL at build time
- **Why:** Next.js bakes env vars into the build

**Everything else is identical to backend CD workflow.**

---

## 🔑 Key Concepts

### CI vs CD

**CI (Continuous Integration):**
- **When:** Every push and PR
- **Purpose:** Verify code quality
- **Does:** Lint, type-check, build
- **Doesn't:** Deploy or build Docker images

**CD (Continuous Deployment):**
- **When:** Push to main/dev only
- **Purpose:** Create deployable artifacts
- **Does:** Builds Docker images, pushes to registry
- **Doesn't:** Run on PRs (only on merge)

### GitHub Actions Syntax

```yaml
${{ github.repository }}     # Auto variable: "username/repo-name"
${{ github.actor }}          # Auto variable: GitHub username
${{ secrets.GITHUB_TOKEN }}  # Auto token (no setup needed!)
${{ steps.meta.outputs.tags }} # Output from previous step
```

### Docker Image Tags Explained

**Example:** `ghcr.io/u-leslie/skitt_be:main-abc1234`

- **`ghcr.io`:** GitHub Container Registry
- **`u-leslie/skitt_be`:** Repository name
- **`main`:** Branch name
- **`abc1234`:** First 7 characters of commit SHA

**Why multiple tags?**
- **Branch tag (`main`):** Easy to pull latest from branch
- **SHA tag (`main-abc1234`):** Exact version (reproducible)
- **`latest`:** Convenience tag (always points to main)

### Caching Strategy

**npm cache:**
```yaml
cache: "npm"
```
- Caches `node_modules` between runs
- **Benefit:** Faster installs (skips unchanged packages)

**Docker cache:**
```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```
- Caches Docker layers between builds
- **Benefit:** Faster builds (reuses unchanged layers)

---

## 📊 Workflow Comparison

| Feature | Backend CI | Frontend CI | Backend CD | Frontend CD |
|---------|-----------|-------------|-----------|-------------|
| **Triggers** | Push/PR | Push/PR | Push to main/dev | Push to main/dev |
| **Type Check** | ✅ | ❌ (Next.js handles it) | N/A | N/A |
| **Lint** | ❌ | ✅ | N/A | N/A |
| **Build** | ✅ (TypeScript) | ✅ (Next.js) | N/A | N/A |
| **Docker Build** | ❌ | ❌ | ✅ | ✅ |
| **Push Image** | ❌ | ❌ | ✅ | ✅ |
| **Build Args** | N/A | N/A | ❌ | ✅ (API URL) |

---

## 🎯 What Happens When...

### You Push to a Feature Branch

1. **CI runs** (both repos)
   - Type checks
   - Lints (frontend)
   - Builds
   - ✅ Passes or ❌ Fails

2. **CD does NOT run** (only on main/dev)

### You Create a Pull Request

1. **CI runs automatically**
   - Shows status on PR
   - Blocks merge if fails

2. **CD does NOT run** (prevents building images for untested code)

### You Push to `main` or `dev`

1. **CI runs first**
   - Verifies code quality

2. **CD runs after**
   - Builds Docker image
   - Pushes to GitHub Container Registry
   - Tags with branch + SHA

### You Merge PR to `main`

1. **CI runs on merge commit**
2. **CD builds production image**
3. **Image tagged as:**
   - `:main`
   - `:latest`
   - `:main-{sha}`

---

## 🔍 Debugging Workflows

### View Logs

1. Go to **Actions** tab
2. Click on workflow run
3. Click on job
4. Click on step to see logs

### Common Issues

**CI fails on type-check:**
- Fix TypeScript errors locally first
- Run `npm run type-check` before pushing

**CI fails on lint:**
- Run `npm run lint` locally
- Fix errors or use `--fix` flag

**CD fails on Docker build:**
- Test Docker build locally: `docker build -t test .`
- Check Dockerfile syntax

**CD fails on push:**
- Verify permissions (packages: write)
- Check if registry is accessible

---

## 🚀 Optimization Tips

### Faster CI

1. **Use npm cache** (already done ✅)
2. **Parallel jobs** (if you add tests later)
3. **Skip on docs-only changes** (use paths-ignore)

### Faster CD

1. **Use Docker cache** (already done ✅)
2. **Multi-stage builds** (already in Dockerfile ✅)
3. **Build only changed services** (advanced)

---

## 📚 Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Buildx](https://docs.docker.com/build/buildx/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

---

**Now you understand every line of your CI/CD workflows! 🎉**

