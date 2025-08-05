# Library Store Backend API

This is the backend API for the Library Store application built with Express.js and SQLite.

## Deployment on Render

### Prerequisites
- Node.js 16 or higher
- Git repository with your code

### Steps to Deploy on Render

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Fix sqlite3 deployment issues"
   git push origin main
   ```

2. **Create a new Web Service on Render**
   - Go to https://render.com
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the backend folder as the root directory

3. **Configure the service**
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid if preferred)

4. **Environment Variables**
   Add these environment variables in Render:
   - `NODE_ENV`: `production`
   - `PORT`: `3000` (Render will provide its own port, but this is a fallback)

### Troubleshooting

#### SQLite3 Binary Issues
The configuration files included should resolve the "invalid ELF header" error by ensuring the sqlite3 package is rebuilt for the Linux environment on Render.

#### Database Persistence
Note that SQLite databases in `/tmp` directory are ephemeral on Render's free tier. For production use, consider:
- Upgrading to a paid Render plan with persistent storage
- Using a cloud database service like PostgreSQL
- Implementing regular database backups

### Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

### API Endpoints

- `GET /` - Health check
- `GET /books` - Get all books
- `GET /books/:id` - Get a specific book
- `POST /books` - Create a new book
- `PUT /books/:id` - Update a book
- `DELETE /books/:id` - Delete a book
