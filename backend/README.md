# Bullets Backend API

A RESTful API backend for the Bullets notes application, built with Node.js, Express, and MongoDB.

## Features

- 📝 **Notes Management** - Create, read, update, delete notes with nested bullets
- 📁 **Folders** - Organize notes into folders with hierarchical structure
- 🏷️ **Tags** - Tag bullets for easy filtering and organization
- 👥 **People/Mentions** - Mention people in bullets
- 🔍 **Search & Filter** - Search notes and filter by tags/folders

## Prerequisites

- Node.js 18+
- MongoDB 6+ (local or MongoDB Atlas)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/bullets

# CORS - Frontend URL(s)
CORS_ORIGIN=http://localhost:8080,http://localhost:5173
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas** - Update `MONGODB_URI` in `.env` with your Atlas connection string.

### 4. Seed Database (Optional)

```bash
npm run seed
```

### 5. Start Server

**Development (with hot reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Notes
- `GET /api/notes` - Get all notes (with optional filters)
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `PATCH /api/notes/:id/pin` - Toggle pin status

### Bullets (nested under notes)
- `POST /api/notes/:id/bullets` - Add bullet to note
- `PUT /api/notes/:id/bullets/:bulletId` - Update bullet
- `DELETE /api/notes/:id/bullets/:bulletId` - Delete bullet

### Folders
- `GET /api/folders` - Get all folders
- `GET /api/folders/:id` - Get single folder
- `POST /api/folders` - Create folder
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder

### Tags
- `GET /api/tags` - Get all tags
- `GET /api/tags/:id` - Get single tag
- `POST /api/tags` - Create tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag
- `GET /api/tags/:id/bullets` - Get all bullets with this tag

### People
- `GET /api/people` - Get all people
- `GET /api/people/:id` - Get single person
- `POST /api/people` - Create person
- `PUT /api/people/:id` - Update person
- `DELETE /api/people/:id` - Delete person
- `GET /api/people/:id/bullets` - Get all bullets mentioning this person

## Query Parameters

### GET /api/notes

| Parameter | Type | Description |
|-----------|------|-------------|
| `folderId` | string | Filter by folder ID |
| `tagId` | string | Filter by tag ID |
| `search` | string | Search in title and bullet content |

## Request/Response Examples

### Create a Note

```bash
curl -X POST http://localhost:3001/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Note",
    "folderId": null,
    "color": "yellow",
    "bullets": [
      {
        "content": "First bullet point",
        "type": "bullet",
        "indent": 0
      }
    ]
  }'
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "My New Note",
    "color": "yellow",
    "isPinned": false,
    "bullets": [...],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js      # MongoDB connection
│   ├── controllers/
│   │   ├── noteController.js
│   │   ├── folderController.js
│   │   ├── tagController.js
│   │   └── personController.js
│   ├── middleware/
│   │   └── errorHandler.js  # Error handling
│   ├── models/
│   │   ├── Note.js
│   │   ├── Folder.js
│   │   ├── Tag.js
│   │   ├── Person.js
│   │   └── index.js
│   ├── routes/
│   │   ├── noteRoutes.js
│   │   ├── folderRoutes.js
│   │   ├── tagRoutes.js
│   │   ├── personRoutes.js
│   │   └── index.js
│   ├── scripts/
│   │   └── seed.js          # Database seeding
│   └── index.js             # Entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bullets
CORS_ORIGIN=https://your-frontend-domain.com
```

### Platforms

- **Railway** - Connect GitHub repo, add MongoDB plugin
- **Render** - Create Web Service, add MongoDB Atlas
- **Heroku** - Deploy with MongoDB Atlas add-on
- **DigitalOcean App Platform** - Connect repo, add managed MongoDB

## License

MIT

