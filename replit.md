# GalenAI Reviewer Dashboard

## Overview

GalenAI Reviewer Dashboard is a medical content review platform that streamlines the quality assessment and publishing workflow for educational materials. The application supports two types of content: flashcards and multiple-choice questions (MCQs), with automated quality checks including duplicate detection, reference coverage analysis, and competency mapping.

The system facilitates collaboration between Contributors (Data Engineers) who submit content and Reviewers (Doctors/Content team) who evaluate and approve materials. It replaces ad-hoc document sharing with a structured intake and review system, providing organized queues by Subject → Topic → Competency.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for build tooling
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Mock authentication system for development (designed for production auth integration)
- **API Design**: RESTful endpoints following resource-based patterns
- **Session Management**: Development mode uses mock sessions, production-ready for proper session handling

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless connection
- **ORM**: Drizzle with schema-first approach
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Connection pooling with WebSocket support for serverless environments

### Key Data Models
- **Users**: Role-based (CONTRIBUTOR, REVIEWER) with email authentication
- **Items**: Core content entities supporting FLASHCARD and MCQ types
- **Competencies**: Subject-based learning objectives with hierarchical organization
- **Auto Checks**: Quality assessment results including duplicate detection and reference coverage
- **Journal Notes**: User-specific notes for workflow tracking

### Authentication and Authorization
- **Development Mode**: Mock authentication with configurable user roles
- **Production Ready**: Designed for NextAuth.js integration with email providers
- **Role-Based Access Control**: Contributor and Reviewer permissions with protected routes
- **Session Security**: JWT-ready architecture with secure session management

### Quality Assurance Features
- **Duplicate Detection**: String similarity analysis for content deduplication
- **Reference Coverage**: Automated analysis of source material completeness
- **Competency Mapping**: Subject and domain-based content organization
- **Bloom Taxonomy**: Educational objective classification support

### Workflow Management
- **Status Tracking**: DRAFT → NEEDS_REVIEW → CHANGES_REQUESTED → PUBLISHED
- **Review Queue**: Organized by subject, topic, and competency for efficient processing
- **Change Requests**: Structured feedback system for content improvement
- **Analytics**: Throughput metrics and quality flag reporting

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI component primitives for accessibility

### Development Tools
- **Vite**: Fast build tool with HMR for development
- **TypeScript**: Static type checking across the stack
- **Tailwind CSS**: Utility-first CSS framework
- **Zod**: Runtime type validation for API inputs

### UI Components
- **Shadcn/ui**: Pre-built accessible React components
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Accessible carousel component
- **React Hook Form**: Performant form handling with validation

### Production Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Email Provider**: Configurable SMTP service for authentication
- **WebSocket Support**: Real-time connection capability for database operations

### Quality Assurance Tools
- **String Similarity**: Text comparison for duplicate detection
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Dynamic className generation for component variants