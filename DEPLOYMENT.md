# Frontend Deployment Guide (AWS EC2)

Simple deployment guide for Skitt Frontend on AWS EC2 Free Tier.

## Prerequisites

1. **EC2 Instance** (t2.micro, Amazon Linux 2023) - can be same or different from backend
2. **Backend API** running and accessible (see backend/DEPLOYMENT.md)
3. **Docker** installed on EC2

## Step 1: Setup EC2 Instance

SSH into your EC2 instance and install Docker:

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install -y git

# Log out and back in for Docker group changes
exit
```

## Step 2: Configure EC2 Security Group

1. Go to **EC2 → Security Groups → Your EC2 security group**
2. Add inbound rules:
   - **SSH (22)**: Your IP only
   - **Custom TCP (4000)**: 0.0.0.0/0 (or your IP for security)

## Step 3: Deploy Frontend

1. Clone repository:
   ```bash
   cd /home/ec2-user
   git clone <your-repository-url> skitt
   cd skitt/frontend
   ```

2. Create `.env` file:
   ```bash
   nano .env
   ```

3. Add the following content to `.env` with your backend API URL:
   ```env
   NODE_ENV=production
   PORT=4000
   NEXT_PUBLIC_API_URL=http://your-backend-ec2-ip:3001
   ```

   **Important**: Replace `your-backend-ec2-ip` with the actual public IP of your backend EC2 instance (e.g., `http://54.123.45.67:3001`).

4. Deploy:
   ```bash
   chmod +x deploy-ec2.sh
   ./deploy-ec2.sh
   ```

   Or manually:
   ```bash
   docker-compose -f docker-compose.prod.yml build
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Step 4: Verify Deployment

```bash
# Check health
curl http://localhost:4000

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

Access from browser:
- **Frontend**: `http://your-ec2-public-ip:4000`

## Architecture Options

### Option 1: Separate EC2 Instances (Recommended)
- **Backend EC2**: Runs backend API (port 3001)
- **Frontend EC2**: Runs frontend (port 4000)
- Frontend connects to backend via backend's public IP

### Option 2: Same EC2 Instance
- Both backend and frontend on same EC2 instance
- Use different ports (3001 for backend, 4000 for frontend)
- Frontend uses `http://localhost:3001` or `http://127.0.0.1:3001` for NEXT_PUBLIC_API_URL

## Maintenance

### View logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Restart service
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Update application
```bash
git pull
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Stop service
```bash
docker-compose -f docker-compose.prod.yml down
```

## Troubleshooting

### Cannot connect to backend API
- Verify NEXT_PUBLIC_API_URL in .env is correct
- Check backend is running and accessible
- Check EC2 security groups allow traffic
- Test backend directly: `curl http://backend-ip:3001/health`

### Container not starting
- Check logs: `docker-compose -f docker-compose.prod.yml logs`
- Verify .env file has correct values
- Ensure Docker is running: `sudo systemctl status docker`

### Port already in use
- Check what's using the port: `sudo lsof -i :4000`
- Stop conflicting services or change port in docker-compose.prod.yml

### Build fails
- Ensure Node.js version is compatible (18+)
- Check Docker has enough memory allocated
- Review build logs: `docker-compose -f docker-compose.prod.yml build --no-cache`
