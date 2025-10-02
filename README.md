# Casaway Prelaunch Web Application

A modern Next.js 15 web application serving as the pre-launch marketing and onboarding platform for the Casaway home swapping service.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Maps API key
- Google OAuth credentials

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd casaway-prelaunch-build
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## 📚 Documentation

For comprehensive development documentation, see:
**[DEVELOPMENT_DOCUMENTATION.md](./DEVELOPMENT_DOCUMENTATION.md)**

## 🏗️ Architecture

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Maps**: Google Maps API + React Leaflet
- **Authentication**: NextAuth.js + Google OAuth
- **Real-time**: Socket.IO Client

## 🔧 Key Features

### Core Functionality
- ✅ Landing page with marketing content
- ✅ User registration and onboarding
- ✅ Profile management and completion
- ✅ Home listing creation and management
- ✅ Social features (posts, stories, comments)
- ✅ Real-time messaging system
- ✅ Interactive map integration
- ✅ Admin panel for user management
- ✅ SEO optimization and social sharing

### Page Structure
- **Landing**: Marketing homepage
- **Auth**: Login/register pages
- **Profile**: User profile management
- **Listings**: Property listing system
- **Messages**: Real-time chat interface
- **Map**: Interactive location features
- **Admin**: Administrative tools

## 🛠️ Development

### Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm start            # Production server
npm run lint         # ESLint checking
```

### Environment Variables
```bash
NEXT_PUBLIC_API_BASE_URL=https://casaway-backend.onrender.com
NEXT_PUBLIC_APP_URL=https://casaway-prelaunch.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key
```

### Project Structure
```
app/
├── components/          # Reusable UI components
├── contexts/           # React contexts
├── services/           # API services
├── utils/              # Utility functions
├── [pages]/            # Next.js pages
└── layout.tsx          # Root layout
```

## 🎨 UI/UX Features

### Design System
- **Tailwind CSS 4**: Utility-first styling
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme switching support
- **Accessibility**: WCAG compliance
- **Performance**: Optimized loading and rendering

### Components
- **Authentication**: Login/register forms
- **Navigation**: Header, footer, mobile nav
- **Content**: Posts, listings, profiles
- **Modals**: Confirmation dialogs, forms
- **Forms**: Data input and validation

## 🗺️ Map Integration

### Google Maps API
- Property location visualization
- Interactive markers and popups
- Geocoding and address search
- Directions and navigation

### React Leaflet
- Alternative open-source mapping
- Custom styling and markers
- Offline tile support
- Performance optimization

## 🔐 Authentication

### Features
- Google OAuth integration
- Traditional email/password
- Session management
- Route protection
- User context management

### Implementation
- NextAuth.js framework
- JWT token handling
- Secure cookie management
- OAuth callback handling

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Features
- Touch-friendly interfaces
- Optimized layouts for each device
- Progressive enhancement
- Performance optimization

## 🚀 Deployment

### Vercel (Recommended)
- Automatic deployments from git
- Preview deployments for branches
- Environment variable management
- Built-in analytics and monitoring

### Manual Deployment
```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

## 📊 SEO & Performance

### SEO Features
- Comprehensive meta tags
- Open Graph and Twitter Cards
- Structured data (JSON-LD)
- Sitemap generation
- Robots.txt configuration

### Performance
- Next.js Image optimization
- Code splitting and lazy loading
- Static generation where possible
- Core Web Vitals optimization

## 🧪 Testing

### Testing Strategy
- Component testing
- Integration testing
- End-to-end testing
- Performance testing

### Tools
- Jest for unit testing
- React Testing Library
- Cypress for E2E testing
- Lighthouse for performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For development questions and issues:
- Check [DEVELOPMENT_DOCUMENTATION.md](./DEVELOPMENT_DOCUMENTATION.md)
- Review existing GitHub issues
- Contact the development team

---

**Built with ❤️ by the Casaway Development Team**