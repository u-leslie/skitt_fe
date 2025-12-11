# AWS EC2 Deployment - Skitt

Simple EC2-based deployment for Skitt on AWS Free Tier.

## Quick Overview

- **Backend**: Deploy on EC2 instance with RDS PostgreSQL
- **Frontend**: Deploy on EC2 instance (can be same or separate)
- **Database**: RDS PostgreSQL (db.t2.micro - free tier)
- **No Redis**: Simple deployment without caching layer

## Architecture

```
┌─────────────────┐         ┌─────────────────┐
│  Backend EC2    │         │  Frontend EC2   │
│  (t2.micro)     │         │  (t2.micro)     │
│                 │         │                 │
│  Port: 3001     │         │  Port: 4000     │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │                           │
         │         ┌─────────────────▼──┐
         │         │  Backend API        │
         │         │  (Port 3001)        │
         │         └─────────────────────┘
         │
         │ PostgreSQL
         │
┌────────▼────────┐
│  RDS PostgreSQL │
│  (db.t2.micro)  │
└─────────────────┘
```

## Deployment Steps

### 1. Backend Deployment

See [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) for complete instructions.

Quick steps:
1. Launch EC2 instance (t2.micro, Amazon Linux 2023)
2. Create RDS PostgreSQL (db.t2.micro)
3. Configure security groups
4. Deploy backend:
   ```bash
   cd backend
   # Create .env file with RDS credentials
   ./deploy-ec2.sh
   ```

### 2. Frontend Deployment

See [frontend/DEPLOYMENT.md](frontend/DEPLOYMENT.md) for complete instructions.

Quick steps:
1. Launch EC2 instance (t2.micro, Amazon Linux 2023) - can be same as backend
2. Configure security groups
3. Deploy frontend:
   ```bash
   cd frontend
   # Create .env file with backend API URL
   ./deploy-ec2.sh
   ```

## Files Created

### Backend
- `backend/deploy-ec2.sh` - Deployment script
- `backend/docker-compose.prod.yml` - Production Docker Compose config
- `backend/DEPLOYMENT.md` - Complete deployment guide

### Frontend
- `frontend/deploy-ec2.sh` - Deployment script
- `frontend/docker-compose.prod.yml` - Production Docker Compose config
- `frontend/DEPLOYMENT.md` - Complete deployment guide

## Cost (Free Tier)

- **EC2 t2.micro**: 750 hours/month free
- **RDS db.t2.micro**: 750 hours/month free
- **Data Transfer**: 15 GB/month free
- **Total**: $0/month (within free tier limits)

**Note**: Free tier valid for 12 months from account creation.

## Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=production
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=skitt_db
DB_USER=skitt_admin
DB_PASSWORD=your-secure-password
```

### Frontend (.env)
```env
NODE_ENV=production
PORT=4000
NEXT_PUBLIC_API_URL=http://your-backend-ip:3001
```

## Access URLs

After deployment:
- **Frontend**: `http://your-frontend-ec2-ip:4000`
- **Backend API**: `http://your-backend-ec2-ip:3001/api/flags`
- **API Docs**: `http://your-backend-ec2-ip:3001/api-docs`
- **Health Check**: `http://your-backend-ec2-ip:3001/health`

## Maintenance

### Update Backend
```bash
cd backend
git pull
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Update Frontend
```bash
cd frontend
git pull
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### View Logs
```bash
# Backend
cd backend
docker-compose -f docker-compose.prod.yml logs -f

# Frontend
cd frontend
docker-compose -f docker-compose.prod.yml logs -f
```

## Troubleshooting

See individual deployment guides:
- [Backend Troubleshooting](backend/DEPLOYMENT.md#troubleshooting)
- [Frontend Troubleshooting](frontend/DEPLOYMENT.md#troubleshooting)

## Security Notes

1. **Firewall**: Restrict SSH (port 22) to your IP only
2. **RDS**: Keep database in private subnet, no public access
3. **Secrets**: Use AWS Secrets Manager or SSM Parameter Store for production
4. **HTTPS**: Set up SSL certificate (Let's Encrypt) with Nginx for production

## Next Steps

- Set up custom domain with Route 53
- Configure CloudWatch for monitoring
- Set up automated backups
- Enable SSL/TLS certificates
- Configure auto-scaling (if needed)
