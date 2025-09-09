# Overview

This is a full-stack web application for the "Little Man" ($MNM) token project - a vintage 1930s cartoon superhero character on the SUI blockchain. The application serves as a promotional website and landing page for the cryptocurrency token, featuring character information, token details, and community links. The project uses a modern React frontend with Express.js backend, TypeScript throughout, and is configured for PostgreSQL database integration via Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with a custom vintage-themed color palette featuring warm, muted tones
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and API data fetching
- **Form Handling**: React Hook Form with Zod validation schemas
- **Component Structure**: Modular component architecture with reusable UI components in `/components/ui/`

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure with `/api` prefix for all routes
- **Development Server**: tsx for TypeScript execution in development
- **Production Build**: esbuild for optimized backend bundling
- **Middleware**: Custom logging middleware for API request tracking

## Data Storage
- **Database**: PostgreSQL as the primary database
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema Management**: Centralized schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database migration management
- **Connection**: Neon Database serverless PostgreSQL for cloud hosting
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development

## Authentication & Session Management
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Schema**: Basic user model with username/password authentication
- **Validation**: Zod schemas for input validation and type safety

## Development & Build Process
- **Development**: Concurrent frontend (Vite) and backend (tsx) development servers
- **Hot Reload**: Vite HMR for frontend, tsx watch mode for backend
- **Type Checking**: Shared TypeScript configuration across frontend, backend, and shared modules
- **Build Process**: Separate builds for frontend (Vite) and backend (esbuild)
- **Path Aliases**: Configured aliases for clean imports (@/, @shared/, @assets/)

## Project Structure
- **Frontend**: `/client/` directory containing React application
- **Backend**: `/server/` directory with Express.js API
- **Shared**: `/shared/` directory for common types, schemas, and utilities
- **Assets**: `/attached_assets/` for static images and media files
- **UI Components**: Comprehensive component library in `/client/src/components/ui/`

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, Wouter router
- **Backend**: Express.js, Node.js with TypeScript support
- **Build Tools**: Vite, esbuild, tsx for development

## UI & Styling
- **Component Library**: Radix UI primitives (@radix-ui/*) for accessible components
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Utility Libraries**: class-variance-authority, clsx, tailwind-merge for styling utilities
- **Icons**: Lucide React for consistent iconography

## Database & Data Management
- **Database**: Neon Database (@neondatabase/serverless) for PostgreSQL hosting
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod for runtime type validation and schema generation
- **Session Management**: connect-pg-simple for PostgreSQL session storage

## State Management & API
- **Data Fetching**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Hookform resolvers
- **Date Handling**: date-fns for date manipulation and formatting

## Development Tools
- **Replit Integration**: Replit-specific plugins for development environment
- **Error Handling**: Runtime error overlay for development debugging
- **Type Safety**: TypeScript with strict configuration across all modules

## Third-Party Services
- **Blockchain**: SUI blockchain integration for $MNM token
- **Community**: Telegram integration for community chat
- **Trading**: Blast.fun integration for token trading platform
- **Fonts**: Google Fonts (Inter) for typography
- **Icons**: Font Awesome for additional iconography

## Specialized UI Components
- **Carousels**: Embla Carousel for image/content carousels
- **Command Palette**: cmdk for search and command interfaces
- **Charts**: Recharts for data visualization (configured but not actively used)
- **Advanced Inputs**: Input-OTP for one-time password inputs
- **Layout**: React Resizable Panels for flexible layouts