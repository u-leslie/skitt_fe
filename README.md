# Skitt Frontend - Feature Flags & Experiment Platform

A modern Next.js frontend application for managing feature flags, users, and A/B experiments.

## 🚀 Features

- **Dashboard**: Overview with metrics, charts, and top feature flags
- **Feature Flags Management**: Create, update, enable/disable feature flags
- **User Management**: Manage users and their attributes
- **Experiment Management**: Create and manage A/B experiments
- **Real-time Updates**: Automatic data refresh after mutations
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with Tailwind CSS and Heroicons

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Heroicons

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see backend README)

## 🔧 Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:4000`

## 📁 Project Structure

```
frontend/
├── app/
│   ├── flags/          # Feature flags page
│   ├── users/          # Users page
│   ├── experiments/    # Experiments page
│   ├── layout.tsx      # Root layout with navbar
│   ├── page.tsx        # Dashboard page
│   └── globals.css     # Global styles
├── components/
│   ├── Navbar.tsx      # Navigation component
│   ├── FlagModal.tsx   # Feature flag create/edit modal
│   ├── UserModal.tsx   # User create/edit modal
│   └── ExperimentModal.tsx # Experiment create/edit modal
├── lib/
│   └── api.ts         # API client and types
└── public/            # Static assets
```

## 🎨 Pages

### Dashboard (`/`)
- Overview statistics (total flags, users, experiments, etc.)
- Top feature flags by usage
- Charts and visualizations

### Feature Flags (`/flags`)
- List all feature flags
- Create new flags
- Edit existing flags
- Enable/disable flags
- Delete flags

### Users (`/users`)
- List all users
- Create new users
- Edit user information
- Manage user attributes (JSON)
- Delete users

### Experiments (`/experiments`)
- List all experiments
- Create new experiments
- Edit experiment configuration
- Set variant percentages
- Manage experiment status
- Delete experiments

## 💻 Development

### Available Scripts

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### API Integration

The frontend communicates with the backend API through the `lib/api.ts` file. All API calls are typed and use Axios for HTTP requests.

### Styling

The application uses Tailwind CSS for styling. Custom colors and utilities can be configured in `tailwind.config.js`.

## 🔗 Backend Integration

Make sure the backend API is running and accessible at the URL specified in `NEXT_PUBLIC_API_URL`. The frontend expects:

- Backend running on `http://localhost:3001` (default)
- CORS enabled on the backend
- All API endpoints available at `/api/*`

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |

## 🎯 Features in Detail

### Feature Flags
- Unique key-based identification
- Enable/disable toggle
- Rich descriptions
- Real-time status updates

### Users
- UUID-based user IDs
- Email and name management
- Custom JSON attributes
- User-flag assignments

### Experiments
- A/B test configuration
- Variant percentage distribution
- Status management (draft, running, paused, completed)
- Date range configuration
- Linked to feature flags

### Dashboard
- Real-time metrics
- Visual charts (Recharts)
- Top flags by usage
- Event tracking statistics

## 🐛 Troubleshooting

### API Connection Issues
- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is enabled on backend

### Build Errors
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 📝 License

ISC

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all components
3. Follow Tailwind CSS conventions
4. Keep components modular and reusable

