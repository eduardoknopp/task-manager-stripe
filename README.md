# 🚀 Task Manager SaaS - Stripe Integration

A modern, enterprise-grade task management application built with Next.js 15, TypeScript, PostgreSQL, and Stripe for subscription management.

## 📋 Project Overview

This is a **SaaS task management application** with subscription-based entitlements powered by Stripe. Users can manage tasks with different feature access levels based on their subscription plan.

### Subscription Plans

| Feature | Free Plan | Pro Plan ($5/month) |
|---------|-----------|---------------------|
| **Tasks** | 10 max | ∞ Unlimited |
| **Tags & Labels** | ❌ | ✅ |
| **Task Priorities** | ❌ | ✅ |
| **Due Dates** | ❌ | ✅ |

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **React 19** - Latest React features

### Backend
- **Next.js Server Actions** - Server-side logic
- **Prisma ORM** - Type-safe database client
- **PostgreSQL 17** - Relational database
- **NextAuth.js v5** - Authentication

### Payments & Subscriptions
- **Stripe SDK 17.4+** - Payment processing
- **Stripe Webhooks** - Real-time subscription updates
- **Stripe Customer Portal** - Self-service billing

### Infrastructure
- **Docker Compose** - Local development orchestration
- **PostgreSQL Container** - Isolated database
- **Next.js Container** - Hot-reload development

## 📁 Project Structure

```
task-manager-stripe/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # SQL migrations
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/       # Auth routes (signin, signup)
│   │   ├── (dashboard)/  # Protected dashboard routes
│   │   ├── api/          # API routes (webhooks, etc)
│   │   ├── billing/      # Billing and upgrade pages
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Homepage
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── entitlements/ # Feature gates and usage tracking
│   │   └── tasks/        # Task management UI
│   ├── lib/              # Utilities
│   │   ├── auth/         # NextAuth config
│   │   ├── entitlements/ # Entitlement checking logic
│   │   ├── stripe/       # Stripe utilities
│   │   ├── db/           # Prisma client
│   │   └── utils/        # Helpers
│   ├── types/            # TypeScript types
│   └── middleware.ts     # Auth and route protection
├── docker-compose.yml     # Docker orchestration
├── Dockerfile             # Multi-stage build
└── package.json           # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** (LTS recommended)
- **Docker & Docker Compose** (latest version)
- **Stripe Account** (test mode for development)

### 1. Clone & Install

```bash
# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the following variables:

```env
# Database (automatic with Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskmanager?schema=public"

# NextAuth (generate secret: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Get after webhook setup
STRIPE_PRO_PRICE_ID="price_..." # Create in Stripe Dashboard
```

### 3. Start Docker Services

```bash
# Start PostgreSQL and Next.js containers
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### 4. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Open Prisma Studio to view database
npm run db:studio
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript validation |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create and run migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run docker:up` | Start Docker containers |
| `npm run docker:down` | Stop Docker containers |
| `npm run docker:logs` | View container logs |

## 📊 Database Schema

### Key Models

- **User** - User accounts with NextAuth.js integration
- **Task** - Individual tasks with status, priority, tags
- **Subscription** - Stripe subscription tracking
- **EntitlementUsage** - Real-time usage limits tracking
- **StripeEvent** - Webhook event audit log

### Relationships

```
User 1:N Task
User 1:N Subscription
User 1:1 EntitlementUsage
```

## 💳 Stripe Configuration

### 1. Create Products & Prices

In [Stripe Dashboard](https://dashboard.stripe.com/test/products):

1. Create **Pro Plan** product
2. Add **$5/month** recurring price
3. Copy the `price_id` to `.env` as `STRIPE_PRO_PRICE_ID`

### 2. Configure Webhooks

In [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks):

1. Add endpoint: `http://localhost:3000/api/webhooks/stripe`
2. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
3. Copy webhook secret to `.env` as `STRIPE_WEBHOOK_SECRET`

### 3. Test Payments

Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

## 🔐 Authentication Flow

1. User signs up/signs in via NextAuth.js
2. Session stored in database
3. Middleware checks authentication on protected routes
4. User data accessible via `useSession()` hook

## 🎯 Entitlements Flow

### Checking Limits

```typescript
// Before creating a task
const canCreateTask = await checkTaskLimit(userId)
if (!canCreateTask) {
  // Show upgrade prompt
}
```

### Middleware Protection

```typescript
// src/middleware.ts protects Pro features
if (requiresProPlan && userPlan === 'FREE') {
  redirect('/billing/upgrade')
}
```

### Webhook Synchronization

1. Stripe sends webhook event
2. API route validates signature
3. Update user subscription in database
4. Recalculate entitlements

## 🐳 Docker Configuration

### Development Mode
- **Hot reload** enabled via volume mounts
- **PostgreSQL** persistent data in named volume
- **Network** isolation with service discovery

### Production Mode
- Multi-stage build for optimized image
- Security hardening (non-root user)
- Standalone output for minimal container size

## 📈 Next Steps

- [ ] Implement authentication with NextAuth.js
- [ ] Create task CRUD operations
- [ ] Build project management UI
- [ ] Integrate Stripe Checkout
- [ ] Set up webhook handlers
- [ ] Add subscription management
- [ ] Implement entitlement middleware
- [ ] Create billing dashboard
- [ ] Add usage analytics
- [ ] Deploy to production

## 🤝 Contributing

This is a learning project. Feel free to explore, modify, and experiment!

## 📄 License

MIT License - free to use for learning and commercial purposes.

---

**Built with ❤️ using Next.js, TypeScript, PostgreSQL, and Stripe**
