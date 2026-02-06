# Plan for Removing Stripe Integration

This plan details the steps to remove Stripe from both the backend (`kazuo_back`) and frontend (`kazuo_front`) of the Kazuo project, enabling free access to all features.

## 1. Backend (`kazuo_back`)

### 1.1 Remove Stripe Dependencies and Configuration
- [ ] **Edit `kazuo_back/package.json`**: Remove `stripe` from `dependencies`.
- [ ] **Edit `kazuo_back/.env.example`**: Remove `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
- [ ] **Delete File**: `kazuo_back/src/config/stripe.config.ts`.

### 1.2 Remove Stripe Modules and Logic
- [ ] **Delete Directory**: `kazuo_back/src/modules/stripe/` (This includes `payment.module.ts`, `payment.service.ts`, `payment.controller.ts`, `stripe-webhook.module.ts`, `stripe-webhook.controller.ts`).

### 1.3 Update App Module and Main Entry Point
- [ ] **Edit `kazuo_back/src/app.module.ts`**:
    - Remove `import { StripeModule } ...`.
    - Remove `StripeModule` from the `imports` array in `@Module`.
- [ ] **Edit `kazuo_back/src/main.ts`**:
    - Remove the middleware configuration for `/stripe/webhook`.

### 1.4 Refactor User Logic (Optional but Recommended)
- The `pay` flag in `Users` entity is only set to `true` in `StripeService`. Since we are removing `StripeService`, this flag will default to `false`.
- If features are restricted by `pay = false`, we should either:
    - Update `Users` entity to default `pay` to `true`.
    - Or remove the `pay` check from the code.
- *Note:* Current analysis shows `pay` is not widely used in guards, but `isAdmin` was also set to `true` upon payment.
- [ ] **Verify**: Ensure users can perform necessary actions (like `update` or `delete` stores) if those were restricted to Admins. If necessary, update guards or grant permissions.

## 2. Frontend (`kazuo_front`)

### 2.1 Remove Stripe Dependencies and Configuration
- [ ] **Edit `kazuo_front/package.json`**: Remove `stripe` from `dependencies`.
- [ ] **Edit `kazuo_front/.env.example`**: Remove `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `SUCCESS_URL` (if specific to Stripe).

### 2.2 Remove API Routes
- [ ] **Delete File**: `kazuo_front/src/app/api/checkout/route.ts`.
- [ ] **Delete File**: `kazuo_front/src/app/api/prices/route.ts`.
- [ ] **Delete File**: `kazuo_front/src/app/api/webhook/route.ts`.

### 2.3 Refactor UI Components
- [ ] **Delete Component**: `kazuo_front/src/components/ButtonCheckout/` (and its index.tsx).
- [ ] **Edit `kazuo_front/src/components/Planes/index.tsx`**:
    - Remove `fetch` call to `/stripe/prices`.
    - Remove `ButtonCheckout` usage.
    - Update the UI to display a static "Free Plan" or "Premium Access" card with all features listed, and a generic "Get Started" or "Go to Dashboard" button instead of "Subscribe".

## 3. Verification

- [ ] **Run Backend**: Ensure `kazuo_back` starts without errors.
- [ ] **Run Frontend**: Ensure `kazuo_front` starts without errors.
- [ ] **Test Flow**:
    - Register a new user.
    - Create a store (should work without payment).
    - Access "Planes" page (should show free access info).
