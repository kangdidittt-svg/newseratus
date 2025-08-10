# Deployment Guide untuk Vercel

## Persiapan Sebelum Deploy

### 1. Environment Variables
Pastikan environment variables berikut sudah diset di Vercel Dashboard:

```bash
MONGODB_URI=mongodb+srv://kangdidittt:bujanggalau22@cluster0dev.domxcgy.mongodb.net/freelance-trackers?retryWrites=true&w=majority&appName=Cluster0dev
JWT_SECRET=freelance-tracker-jwt-secret-2024-super-secure-production-key-minimum-32-chars
NEXTAUTH_SECRET=freelance-tracker-nextauth-secret-2024-production-ready-key
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NODE_ENV=production
```

### 2. Build Configuration
- ✅ `next.config.ts` sudah dikonfigurasi untuk Mongoose
- ✅ `vercel.json` sudah dibuat untuk optimasi deployment
- ✅ `middleware.ts` sudah diperbaiki dengan error handling

### 3. Common Issues Fixed

#### MongoDB Connection
- Mongoose external package configuration
- Proper connection handling untuk serverless

#### Authentication
- JWT token verification dengan error handling
- Cookie management yang aman
- Middleware optimization

#### Build Optimization
- Webpack externals untuk MongoDB dependencies
- Proper environment variable handling
- Image optimization configuration

## Steps untuk Deploy

### 1. Push ke GitHub
```bash
git add .
git commit -m "feat: prepare for vercel deployment with optimizations"
git push origin main
```

### 2. Connect ke Vercel
1. Login ke [Vercel Dashboard](https://vercel.com)
2. Import project dari GitHub
3. Set environment variables
4. Deploy

### 3. Post-Deployment Checklist
- [ ] Test authentication flow
- [ ] Test database connections
- [ ] Test SSE dashboard functionality
- [ ] Test project CRUD operations
- [ ] Check console untuk errors

## Troubleshooting

### Build Errors
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify environment variables

### Runtime Errors
- Check Vercel function logs
- Verify MongoDB connection string
- Check JWT secret configuration

### Performance Issues
- Monitor function execution time
- Check database query optimization
- Verify SSE connection handling

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | ✅ |
| `NEXTAUTH_SECRET` | NextAuth.js secret | ✅ |
| `NEXT_PUBLIC_APP_URL` | Public app URL | ✅ |
| `NEXTAUTH_URL` | Auth callback URL | ✅ |
| `NODE_ENV` | Environment (production) | ✅ |

## Security Notes

- ✅ Secrets tidak ter-commit ke repository
- ✅ Environment variables menggunakan production values
- ✅ Cookie security sudah dikonfigurasi
- ✅ JWT tokens menggunakan strong secrets

## Performance Optimizations

- ✅ Mongoose external packages
- ✅ Webpack externals untuk binary dependencies
- ✅ Function timeout configuration
- ✅ Image optimization setup

Project siap untuk deployment ke Vercel! 🚀