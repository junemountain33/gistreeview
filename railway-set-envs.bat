@echo off
cd backend
railway variables set DATABASE_URL="postgresql://neondb_owner:npg_cF9uYIZ7kMna@ep-hidden-union-a1gsrhx1-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
railway variables set UPLOAD_DIR="/tmp/uploads"
echo Environment variables have been set
cd ..