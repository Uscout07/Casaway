# Casaway Prelaunch Build - Development Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Directory Structure](#directory-structure)
4. [Page Components](#page-components)
5. [Reusable Components](#reusable-components)
6. [Authentication & Authorization](#authentication--authorization)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Styling & UI](#styling--ui)
10. [Third-party Integrations](#third-party-integrations)
11. [Environment Configuration](#environment-configuration)
12. [Development Workflow](#development-workflow)
13. [SEO & Performance](#seo--performance)
14. [Deployment](#deployment)
15. [Troubleshooting](#troubleshooting)

## Project Overview

The Casaway Prelaunch Build is a Next.js 15 web application that serves as the pre-launch marketing and onboarding platform for the Casaway home swapping service. It provides user registration, profile completion, and early access features while the full platform is being developed.

### Key Features
- **Landing Page**: Marketing site with value proposition
- **User Onboarding**: Registration and profile completion flow
- **Authentication**: Google OAuth and traditional login
- **Profile Management**: User profile creation and editing
- **Listing Creation**: Home listing creation and management
- **Social Features**: Posts, stories, comments, likes
- **Messaging**: Real-time chat system
- **Map Integration**: Interactive map for location-based features
- **Admin Panel**: Administrative tools and user management
- **SEO Optimization**: Comprehensive SEO and social media integration

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Maps**: Google Maps API + React Leaflet
- **Authentication**: NextAuth.js + Google OAuth
- **Real-time**: Socket.IO Client
- **Icons**: Lucide React + Iconify
- **Animations**: React Confetti
- **Deployment**: Vercel

## Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Casaway Prelaunch Web                   │
│                      (Next.js 15)                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ API Calls
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                Casaway Backend                              │
│              (Express.js API)                               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ Database Operations
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                   MongoDB                                   │
│              (Primary Database)                             │
└─────────────────────────────────────────────────────────────┘
```

### Next.js App Router Structure
- **App Directory**: Uses Next.js 13+ App Router
- **Server Components**: Default server-side rendering
- **Client Components**: Interactive components with 'use client'
- **Route Groups**: Organized route segments
- **Layout System**: Nested layouts for different sections
- **Loading States**: Built-in loading.tsx files
- **Error Handling**: error.tsx files for error boundaries

### Request Flow
1. **User Request** → Next.js App Router
2. **Route Matching** → Server Component rendering
3. **Data Fetching** → API calls to backend
4. **Authentication** → JWT token validation
5. **Component Rendering** → Server/Client component execution
6. **Response** → HTML/JSON response to browser
7. **Hydration** → Client-side JavaScript activation

## Directory Structure

```
casaway-prelaunch-build/
├── app/                           # Next.js App Router directory
│   ├── admin/                     # Admin panel pages
│   │   └── page.tsx              # Admin dashboard
│   ├── auth/                      # Authentication pages
│   │   ├── callback/             # OAuth callback handling
│   │   │   └── page.tsx         # OAuth callback page
│   │   ├── layout.tsx           # Auth layout wrapper
│   │   └── page.tsx             # Login/Register page
│   ├── complete-profile/         # Profile completion flow
│   │   └── page.tsx             # Profile setup page
│   ├── components/               # Reusable UI components
│   │   ├── confirmDialog.tsx    # Confirmation modal
│   │   ├── createPostForm.tsx   # Post creation form
│   │   ├── ErrorPage.tsx        # Error display component
│   │   ├── filterModal.tsx      # Filtering interface
│   │   ├── FollowersModal.tsx   # Followers list modal
│   │   ├── footer.tsx           # Site footer
│   │   ├── GoogleMap.tsx        # Google Maps integration
│   │   ├── header.tsx           # Site header/navigation
│   │   ├── InstantRedirect.tsx  # Redirect utility
│   │   ├── listingCard.tsx      # Listing display card
│   │   ├── logo.tsx             # Brand logo component
│   │   ├── Map.tsx              # Interactive map component
│   │   ├── mobileNav.tsx        # Mobile navigation
│   │   ├── OnboardingProgress.tsx # Progress indicator
│   │   ├── postCard.tsx         # Post display card
│   │   ├── postModal.tsx        # Post detail modal
│   │   ├── postThumbnail.tsx    # Post preview thumbnail
│   │   ├── profilePage.tsx      # Profile display component
│   │   ├── ProtectedLayout.tsx  # Authentication wrapper
│   │   ├── searchBar.tsx        # Search interface
│   │   ├── Story/               # Story system components
│   │   │   ├── apiServices.ts   # Story API functions
│   │   │   ├── storyFeed.tsx    # Story feed display
│   │   │   ├── storyViewerModal.tsx # Story viewer modal
│   │   │   └── types.ts         # Story type definitions
│   │   ├── storyFeed.tsx        # Main story feed
│   │   ├── storyUpload.tsx      # Story upload interface
│   │   ├── StructuredData.tsx   # SEO structured data
│   │   ├── UserListingsSection.tsx # User listings display
│   │   └── WelcomeLanding.tsx   # Welcome page component
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx      # Authentication context
│   ├── congratulations/         # Success page
│   │   └── page.tsx             # Completion celebration
│   ├── error-page/              # Error handling
│   │   └── page.tsx             # Custom error page
│   ├── error.tsx                # Error boundary
│   ├── favicon.ico              # Site favicon
│   ├── globals.css              # Global styles
│   ├── home/                    # Main application
│   │   ├── layout.tsx           # Home layout
│   │   └── page.tsx             # Home dashboard
│   ├── invite/                  # Invitation system
│   │   └── ambassador/          # Ambassador invites
│   │       └── [name]/          # Dynamic invite pages
│   │           └── page.tsx     # Invite landing page
│   ├── layout.tsx               # Root layout
│   ├── legal/                   # Legal pages
│   │   └── page.tsx             # Legal information
│   ├── listing/                 # Listing management
│   │   ├── [id]/                # Dynamic listing pages
│   │   │   └── page.tsx         # Individual listing page
│   │   ├── commentItem.tsx      # Comment display
│   │   ├── commentSection.tsx   # Comments section
│   │   ├── HostCard.tsx         # Host information card
│   │   ├── listingDetailsCard.tsx # Listing details
│   │   ├── listingDetailsSkeleton.tsx # Loading skeleton
│   │   ├── listingPageTypes.ts  # Type definitions
│   │   └── postGallery.tsx      # Image gallery
│   ├── map/                     # Map functionality
│   │   └── page.tsx             # Interactive map page
│   ├── messages/                # Messaging system
│   │   ├── [id]/                # Individual chat pages
│   │   │   └── page.tsx         # Chat interface
│   │   ├── ChatList.tsx         # Chat list component
│   │   ├── layout.tsx           # Messages layout
│   │   └── page.tsx             # Messages overview
│   ├── not-found.tsx            # 404 page
│   ├── notifications/           # Notifications
│   │   └── page.tsx             # Notifications page
│   ├── page.tsx                 # Homepage
│   ├── privacy/                 # Privacy policy
│   │   └── page.tsx             # Privacy information
│   ├── profile/                 # User profiles
│   │   ├── [id]/                # Dynamic profile pages
│   │   │   └── page.tsx         # User profile page
│   │   ├── layout.tsx           # Profile layout
│   │   ├── listingsSection.tsx  # User listings section
│   │   ├── postSection.tsx      # User posts section
│   │   ├── profileErrorDisplay.tsx # Profile error handling
│   │   ├── profileLoadingSkeleton.tsx # Loading skeleton
│   │   ├── profilePageHeader.tsx # Profile header
│   │   └── profileTypes.ts      # Profile type definitions
│   ├── referral/                # Referral system
│   │   └── page.tsx             # Referral dashboard
│   ├── register/                # Registration
│   │   ├── layout.tsx           # Registration layout
│   │   └── page.tsx             # Registration page
│   ├── robots.ts                # Robots.txt generation
│   ├── search/                  # Search functionality
│   │   ├── layout.tsx           # Search layout
│   │   └── page.tsx             # Search results
│   ├── services/                # API services
│   │   └── chatApi.ts           # Chat API functions
│   ├── settings/                # User settings
│   │   ├── editListingForm.tsx  # Listing edit form
│   │   ├── editPostform.tsx     # Post edit form
│   │   ├── layout.tsx           # Settings layout
│   │   └── page.tsx             # Settings page
│   ├── site-map/                # Site map
│   │   └── page.tsx             # Site map page
│   ├── sitemap/                 # Sitemap generation
│   ├── sitemap.ts               # Sitemap configuration
│   ├── terms/                   # Terms of service
│   │   └── page.tsx             # Terms page
│   ├── types/                   # Type definitions
│   │   └── index.ts             # Shared types
│   ├── upload/                  # File upload
│   │   ├── layout.tsx           # Upload layout
│   │   └── page.tsx             # Upload interface
│   └── utils/                   # Utility functions
│       ├── errorUtils.ts        # Error handling utilities
│       └── tagDescriptions.ts   # Tag descriptions
├── data/                        # Static data
│   └── globe.json              # World map data
├── dist/                        # Build output
├── public/                      # Static assets
│   ├── ambientLogo.png         # Brand logos
│   ├── ambientLogo.svg
│   ├── file.svg                # UI icons
│   ├── globe.svg
│   ├── logo.png
│   ├── logo.svg
│   ├── next.svg
│   ├── scc.png
│   ├── vercel.svg
│   └── window.svg
├── src/                         # Additional source files
│   └── types/                   # Type definitions
│       └── fast-speedtest-api.d.ts
├── next-env.d.ts               # Next.js type definitions
├── next.config.ts              # Next.js configuration
├── package.json                # Project configuration
├── postcss.config.mjs          # PostCSS configuration
├── README.md                   # Project documentation
└── tsconfig.json               # TypeScript configuration
```

## Page Components

### Root Layout (`app/layout.tsx`)
The main layout wrapper that provides:
- **Metadata Configuration**: SEO, Open Graph, Twitter Cards
- **Global Styles**: Tailwind CSS and custom styles
- **Authentication Provider**: AuthContext for user state
- **Protected Layout**: Route protection wrapper
- **Structured Data**: JSON-LD for search engines

### Homepage (`app/page.tsx`)
The main landing page featuring:
- **Hero Section**: Value proposition and call-to-action
- **Feature Highlights**: Platform benefits
- **User Testimonials**: Social proof
- **Registration Flow**: Sign-up initiation
- **SEO Optimization**: Comprehensive meta tags

### Authentication Pages (`app/auth/`)
- **Login/Register**: Combined authentication interface
- **OAuth Callback**: Google authentication handling
- **Layout**: Authentication-specific layout wrapper

### Profile Completion (`app/complete-profile/page.tsx`)
User onboarding flow including:
- **Profile Setup**: Basic information collection
- **Preferences**: Travel preferences and interests
- **Photo Upload**: Profile picture management
- **Verification**: Email and phone verification

### Main Application (`app/home/`)
The core application dashboard featuring:
- **Feed**: Posts, stories, and listings
- **Navigation**: Main app navigation
- **User Actions**: Create posts, upload stories
- **Real-time Updates**: Live content updates

### Listing Management (`app/listing/`)
- **Listing Creation**: Form for creating home listings
- **Listing Details**: Individual listing pages
- **Image Gallery**: Property photo management
- **Comments Section**: User interaction
- **Host Information**: Property owner details

### Profile Pages (`app/profile/`)
- **User Profiles**: Public user profile pages
- **Listings Section**: User's property listings
- **Posts Section**: User's social posts
- **Followers/Following**: Social connections

### Messaging System (`app/messages/`)
- **Chat List**: Available conversations
- **Individual Chats**: Real-time messaging interface
- **Message History**: Conversation persistence
- **Typing Indicators**: Real-time status updates

### Map Integration (`app/map/page.tsx`)
Interactive map featuring:
- **Location Markers**: Property locations
- **Search Filters**: Location-based filtering
- **Property Details**: Map popup information
- **Navigation**: Directions and routing

## Reusable Components

### Authentication Components
- **ProtectedLayout**: Route protection wrapper
- **AuthContext**: Global authentication state
- **Login/Register Forms**: Authentication interfaces

### UI Components
- **Header**: Site navigation and user menu
- **Footer**: Site footer with links
- **Mobile Navigation**: Mobile-friendly navigation
- **Search Bar**: Global search functionality

### Content Components
- **PostCard**: Social post display
- **ListingCard**: Property listing display
- **ProfilePage**: User profile display
- **StoryFeed**: Story content display

### Modal Components
- **PostModal**: Post detail modal
- **FollowersModal**: Followers list modal
- **FilterModal**: Search filter interface
- **ConfirmDialog**: Confirmation dialogs

### Form Components
- **CreatePostForm**: Post creation interface
- **StoryUpload**: Story creation interface
- **EditListingForm**: Listing editing
- **EditPostForm**: Post editing

### Utility Components
- **OnboardingProgress**: Progress indicators
- **ErrorPage**: Error display
- **Loading Skeletons**: Loading states
- **InstantRedirect**: Redirect utility

## Authentication & Authorization

### Authentication Flow
1. **User Registration/Login** → Form submission
2. **Backend Authentication** → JWT token generation
3. **Token Storage** → localStorage/sessionStorage
4. **Route Protection** → ProtectedLayout wrapper
5. **API Requests** → Token in Authorization header

### OAuth Integration
- **Google OAuth**: Social login via Google
- **Callback Handling**: OAuth response processing
- **User Creation**: Automatic account creation
- **Session Management**: Persistent authentication

### Protected Routes
- **Authentication Required**: User must be logged in
- **Role-based Access**: Admin/ambassador features
- **Redirect Handling**: Automatic redirect to login

### Context Management
```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
```

## State Management

### Zustand Store
Global state management using Zustand for:
- **User State**: Authentication and profile data
- **UI State**: Modal states, loading states
- **Cache State**: API response caching
- **Form State**: Form data persistence

### Local State
React useState for component-specific state:
- **Form Data**: Input field values
- **UI State**: Component visibility, selections
- **Loading States**: Async operation status

### Server State
Next.js server components for:
- **Initial Data**: Server-side data fetching
- **Static Content**: Pre-rendered content
- **SEO Data**: Meta tags and structured data

## API Integration

### API Service Layer
Centralized API communication:
- **Base Configuration**: Axios instance setup
- **Request Interceptors**: Token attachment
- **Response Interceptors**: Error handling
- **Type Safety**: TypeScript interfaces

### Endpoint Categories
- **Authentication**: Login, register, OAuth
- **User Management**: Profile, settings, preferences
- **Listings**: CRUD operations for properties
- **Social Features**: Posts, comments, likes
- **Messaging**: Chat and message management
- **File Upload**: Image and document upload

### Real-time Communication
Socket.IO client for:
- **Live Messaging**: Real-time chat
- **Notifications**: Push notifications
- **Updates**: Live content updates
- **Presence**: Online status tracking

### Error Handling
Comprehensive error management:
- **API Errors**: Network and server errors
- **Validation Errors**: Form validation
- **Authentication Errors**: Token expiration
- **User Feedback**: Error message display

## Styling & UI

### Tailwind CSS 4
Modern utility-first CSS framework:
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme switching support
- **Custom Components**: Reusable UI patterns
- **Performance**: Optimized CSS delivery

### Design System
Consistent design patterns:
- **Color Palette**: Brand colors and variants
- **Typography**: Font families and sizes
- **Spacing**: Consistent spacing scale
- **Components**: Standardized UI components

### Responsive Design
Multi-device support:
- **Mobile**: Touch-friendly interfaces
- **Tablet**: Optimized layouts
- **Desktop**: Full-featured experience
- **Progressive Enhancement**: Feature detection

### Accessibility
WCAG compliance:
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and roles
- **Color Contrast**: Sufficient contrast ratios
- **Focus Management**: Visible focus indicators

## Third-party Integrations

### Google Maps API
Interactive mapping features:
- **Property Markers**: Location visualization
- **Geocoding**: Address to coordinates
- **Directions**: Navigation integration
- **Places API**: Location search

### React Leaflet
Alternative mapping solution:
- **Open Source**: Free mapping tiles
- **Customization**: Styling and markers
- **Performance**: Optimized rendering
- **Offline Support**: Cached tiles

### Socket.IO Client
Real-time communication:
- **WebSocket Connection**: Persistent connection
- **Event Handling**: Custom event system
- **Reconnection**: Automatic reconnection
- **Room Management**: Chat room functionality

### NextAuth.js
Authentication framework:
- **OAuth Providers**: Google, GitHub, etc.
- **Session Management**: Secure session handling
- **CSRF Protection**: Security measures
- **Database Integration**: User persistence

## Environment Configuration

### Required Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://casaway-backend.onrender.com
NEXT_PUBLIC_APP_URL=https://casaway-prelaunch.vercel.app

# Google OAuth
NEXTAUTH_URL=https://casaway-prelaunch.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key

# Database (if using NextAuth database)
DATABASE_URL=your-database-connection-string

# Email (for notifications)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@casaway.com
```

### Environment-specific Configuration
- **Development**: Local API, debug mode
- **Production**: Production API, optimized builds
- **Preview**: Staging environment testing

## Development Workflow

### Getting Started
1. **Clone Repository**: `git clone <repository-url>`
2. **Install Dependencies**: `npm install`
3. **Environment Setup**: Copy `.env.example` to `.env.local`
4. **Run Development Server**: `npm run dev`
5. **Access Application**: `http://localhost:3000`

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Organization
- **App Router**: Next.js 13+ file-based routing
- **Server Components**: Default server-side rendering
- **Client Components**: Interactive components
- **Shared Components**: Reusable UI components
- **API Services**: Centralized API communication

### Git Workflow
1. **Feature Branches**: Create from `main`
2. **Commit Messages**: Conventional commit format
3. **Pull Requests**: Code review required
4. **Testing**: All checks must pass

## SEO & Performance

### SEO Optimization
- **Meta Tags**: Comprehensive meta tag management
- **Structured Data**: JSON-LD schema markup
- **Sitemap**: Automatic sitemap generation
- **Robots.txt**: Search engine directives
- **Open Graph**: Social media sharing
- **Twitter Cards**: Twitter sharing optimization

### Performance Optimization
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Component and image lazy loading
- **Caching**: Static and dynamic caching strategies
- **Bundle Analysis**: Webpack bundle optimization

### Core Web Vitals
- **LCP**: Largest Contentful Paint optimization
- **FID**: First Input Delay minimization
- **CLS**: Cumulative Layout Shift prevention
- **TTFB**: Time to First Byte optimization

### Analytics
- **Google Analytics**: User behavior tracking
- **Performance Monitoring**: Core Web Vitals tracking
- **Error Tracking**: Application error monitoring
- **User Feedback**: User experience insights

## Deployment

### Vercel Deployment
Automatic deployment via Vercel:
- **Git Integration**: Automatic builds on push
- **Environment Variables**: Secure configuration
- **Preview Deployments**: Branch-based previews
- **Analytics**: Built-in performance monitoring

### Build Process
1. **Type Checking**: TypeScript compilation
2. **Linting**: Code quality checks
3. **Building**: Next.js production build
4. **Optimization**: Asset optimization
5. **Deployment**: Vercel deployment

### Environment Management
- **Production**: Live application environment
- **Preview**: Staging environment
- **Development**: Local development environment

### Monitoring
- **Performance**: Core Web Vitals monitoring
- **Errors**: Error tracking and reporting
- **Analytics**: User behavior analytics
- **Uptime**: Service availability monitoring

## Troubleshooting

### Common Issues

#### Build Errors
```bash
Error: Module not found
```
**Solution**: Check import paths and dependencies

#### Authentication Issues
```bash
Error: Invalid token
```
**Solution**: Verify JWT configuration and token expiration

#### API Connection Problems
```bash
Error: Network request failed
```
**Solution**: Check API base URL and network connectivity

#### OAuth Redirect Issues
```bash
Error: Redirect URI mismatch
```
**Solution**: Verify OAuth redirect URIs in provider settings

### Debug Mode
Enable debug logging:
```bash
DEBUG=next:* npm run dev
```

### Performance Issues
- **Bundle Size**: Analyze bundle with `@next/bundle-analyzer`
- **Image Optimization**: Use Next.js Image component
- **Code Splitting**: Implement dynamic imports
- **Caching**: Configure appropriate cache headers

### Security Considerations
- **Input Validation**: Validate all user inputs
- **XSS Protection**: Sanitize user-generated content
- **CSRF Protection**: Implement CSRF tokens
- **Content Security Policy**: Configure CSP headers
- **HTTPS**: Ensure secure connections

### Browser Compatibility
- **Modern Browsers**: ES6+ support required
- **Polyfills**: Automatic polyfill injection
- **Progressive Enhancement**: Graceful degradation
- **Mobile Support**: Touch and responsive design

---

## Additional Resources

- **Next.js Documentation**: Official Next.js guides
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe JavaScript development
- **Vercel**: Deployment platform documentation
- **Google Maps API**: Mapping service integration

This documentation should be updated as the application evolves and new features are added.
