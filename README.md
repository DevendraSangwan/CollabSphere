# CollabSphere

CollabSphere is a collaboration and productivity web app inspired by GitHub, Notion, and Asana. It lets users create projects, invite collaborators, add notes, upload files, and use AI to explain code or generate documentation.

## Features

- JWT-based user authentication
- Project creation and listing
- Public/private project support
- Project member invites by email
- Markdown-style notes with rendering in the UI
- File upload support with preview for images
- AI-based code explanation and documentation using Google Gemini
- Public shareable project page
- Basic project analytics such as member count, note count, file count, and total size
- In-memory MongoDB support for local development

## Tech stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT authentication
- Multer for file uploads
- Google Gemini API
- Static frontend served by the backend

## Project structure

```text
collabsphere/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── ...
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── uploads/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── node_modules/
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Add your environment values if needed:
   - `PORT=5000`
   - `JWT_SECRET=your-secret-key`
   - `GEMINI_API_KEY=your-gemini-key`
   - optional `MONGO_URI` if you want to use your own MongoDB

4. Start the app:
   ```bash
   npm start
   ```

5. Open the app in the browser:
   ```text
   http://localhost:5000
   ```

## Main API routes

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Projects
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects/:id/members`
- `GET /api/projects/:id/analytics`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /public/:projectId` for public share page

### Notes
- `POST /api/notes`
- `GET /api/notes/project/:projectId`

### Files
- `POST /api/files/upload`
- `GET /api/files/project/:projectId`

### AI
- `POST /api/ai/explain`
- `POST /api/ai/document`

## Notes

- If no MongoDB URL is provided, the app automatically starts an in-memory MongoDB instance for local development.
- Uploaded files are stored in the `uploads/` folder.
- The app is designed as a simple full-stack portfolio project and can be expanded further with a React frontend, better dashboard UI, and production deployment.

## Future improvements

- Move frontend to a full React/Vite app
- Add richer dashboard analytics
- Improve markdown editor experience
- Add real team collaboration flows
- Add deployment configuration for hosting services
# CollabSphere
