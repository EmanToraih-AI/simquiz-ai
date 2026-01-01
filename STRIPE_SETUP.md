# Stripe Subscription Setup Guide

## ✅ Completed Steps

1. ✅ Installed Stripe packages (`@stripe/stripe-js`, `@stripe/react-stripe-js`)
2. ✅ Created Pricing page (`/pricing`)
3. ✅ Created subscription utility functions (`src/utils/subscription.ts`)
4. ✅ Added subscription checks to quiz generation
5. ✅ Created Stripe checkout session Edge Function
6. ✅ Created Stripe webhook Edge Function
7. ✅ Added pricing route to App.tsx

---

## 📋 Next Steps (What You Need to Do)

### Step 1: Fix SQL Error (DONE - Already Fixed)
The SQL error in `ENHANCED_ANALYTICS_SCHEMA.sql` has been fixed. You can now run it in Supabase SQL Editor.

### Step 2: Set Up Stripe Product and Price

1. Go to: https://dashboard.stripe.com/test/products
2. Click **"Add product"**
3. Set:
   - **Name**: SimQuiz AI Pro
   - **Description**: Unlimited quizzes and advanced features
   - **Pricing**: 
     - Model: Recurring
     - Price: $15.00
     - Billing period: Monthly
4. Click **"Save product"**
5. **Copy the Price ID** (starts with `price_...`) - you'll need this

### Step 3: Add Stripe Keys to Supabase Secrets

1. Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/settings/functions
2. Scroll to **"Secrets"** section
3. Add these secrets:
   - **Name**: `STRIPE_SECRET_KEY`
     - **Value**: Your Stripe Secret Key (from https://dashboard.stripe.com/test/apikeys)
     - Format: `sk_test_...` (test mode) or `sk_live_...` (production)
   
   - **Name**: `STRIPE_PRICE_ID`
     - **Value**: The Price ID you copied in Step 2 (e.g., `price_1234567890`)
   
   - **Name**: `STRIPE_WEBHOOK_SECRET`
     - **Value**: Will be provided after setting up webhook endpoint (Step 5)

### Step 4: Deploy Stripe Edge Functions

#### 4A: Deploy `create-checkout-session`

1. Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/functions
2. Click **"Create a new function"**
3. Function name: `create-checkout-session`
4. Open local file: `supabase/functions/create-checkout-session/index.ts`
5. Copy ALL code
6. Paste into Supabase editor
7. Click **"Deploy"**

#### 4B: Deploy `stripe-webhook`

1. Click **"Create a new function"** again
2. Function name: `stripe-webhook`
3. Open local file: `supabase/functions/stripe-webhook/index.ts`
4. Copy ALL code
5. Paste into Supabase editor
6. Click **"Deploy"**

### Step 5: Set Up Stripe Webhook Endpoint

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL**: 
   ```
   https://jbumdbqfglovurosqgjx.supabase.co/functions/v1/stripe-webhook
   ```
4. **Description**: SimQuiz AI Webhook
5. **Events to listen to**: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **"Add endpoint"**
7. **Copy the "Signing secret"** (starts with `whsec_...`)
8. Add it to Supabase Secrets:
   - Go to Supabase → Settings → Functions → Secrets
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: The signing secret you just copied
   - Click **"Save"**

### Step 6: Update Pricing.tsx with Correct API Endpoint

The Pricing page is already configured to use the Supabase Edge Function. Make sure your `.env` file has:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)
```

You can get this from: https://dashboard.stripe.com/test/apikeys

### Step 7: Test the Flow

1. Navigate to: `http://localhost:5173/pricing`
2. Click **"Start 7-Day Free Trial"** (must be logged in)
3. Complete Stripe Checkout (use test card: `4242 4242 4242 4242`)
4. After checkout, you should be redirected to `/dashboard`
5. Check your profile in Supabase to verify `subscription_status` is `'active'`

---

## 📊 Database Schema

The subscription columns already exist in the `profiles` table:
- `subscription_status` (TEXT, DEFAULT 'free')
- `subscription_id` (TEXT, nullable)
- `trial_ends_at` (TIMESTAMPTZ, nullable)

No additional SQL needed!

---

## 🔒 Subscription Limits

### Free Tier:
- **5 quizzes per month**
- Unlimited quiz attempts
- Basic features

### Pro Tier (Active/Trialing):
- **Unlimited quizzes**
- Unlimited quiz attempts
- All features

### Trial Period:
- **7 days** free trial
- Automatically set when subscription is created
- Status: `'active'` (treated as paid during trial)

---

## 🧪 Testing

### Test Cards (Stripe Test Mode):
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires 3D Secure**: `4000 0027 6000 3184`

Any future expiry date and any 3-digit CVC.

---

## 🐛 Troubleshooting

### Checkout not redirecting?
- Check browser console for errors
- Verify `STRIPE_PRICE_ID` is set correctly in Supabase secrets
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is in `.env` file

### Webhook not updating subscription?
- Check Stripe webhook logs: https://dashboard.stripe.com/test/webhooks
- Verify `STRIPE_WEBHOOK_SECRET` is set in Supabase secrets
- Check Supabase function logs for errors

### Subscription check failing?
- Check browser console for errors
- Verify profile has correct `subscription_status`
- Check that quiz count query is working correctly

---

## 📝 Notes

- **Test Mode**: All Stripe operations use test mode by default (use test API keys)
- **Production**: When ready, switch to live keys and update webhook endpoint
- **Trial Period**: Managed by Stripe (7 days), profile updated via webhook
- **Quiz Limits**: Enforced in frontend before quiz generation

---

**You're ready to test!** 🚀

Start with Step 2 (create Stripe product) and work through the steps.

