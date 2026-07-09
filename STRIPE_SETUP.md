# Stripe Setup Guide for Aetheris

This guide walks you through setting up Stripe for the Aetheris billing system.

## Step 1: Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up
2. Complete the account verification
3. Switch to **Test Mode** (toggle in the top right) for development

## Step 2: Create Products and Prices

For each paid plan, create a Product with a Price:

### Starter Plan ($29/month)
1. Go to **Products** in Stripe Dashboard
2. Click **+ Add Product**
3. Name: `Aetheris Starter`
4. Add a price:
   - Price: `$29.00`
   - Billing period: **Monthly**
   - Recurring
5. Add another price for yearly:
   - Price: `$290.00` (2 months free)
   - Billing period: **Yearly**
   - Recurring
6. Save the product

### Pro Plan ($99/month)
1. Create another product
2. Name: `Aetheris Pro`
3. Monthly price: `$99.00`
4. Yearly price: `$990.00` (2 months free)

### Business Plan ($299/month)
1. Create another product
2. Name: `Aetheris Business`
3. Monthly price: `$299.00`
4. Yearly price: `$2,990.00` (2 months free)

## Step 3: Copy Price IDs

For each price you created, copy the Price ID (starts with `price_`):
1. Click on the product
2. Click on the price
3. Copy the **API ID** (e.g., `price_1ABC123...`)

## Step 4: Get API Keys

1. Go to **Developers > API Keys**
2. Copy the **Secret key** (starts with `sk_test_` for test mode)

## Step 5: Set Up Webhook

1. Go to **Developers > Webhooks**
2. Click **+ Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/stripe/webhooks`
   - For local testing, use [Stripe CLI](#local-development-webhooks) below
4. Select events to send:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

## Step 6: Configure Environment Variables

Copy your keys into `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_MONTHLY_PRICE_ID=price_...
STRIPE_STARTER_YEARLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_...
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_...
```

## Step 7: UPI Configuration (India)

Stripe supports UPI as a payment method in India automatically. Once your Stripe account is activated for live payments:
- UPI payments appear as an option on the checkout page
- No additional configuration needed
- Customers can pay via any UPI app (Google Pay, PhonePe, Paytm, etc.)

**Note:** UPI is only available for Stripe accounts based in India or with India as a payment currency.

## Local Development Webhooks

For local development, use the Stripe CLI to forward webhooks to your local server:

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```

4. Copy the webhook signing secret from the CLI output into your `.env.local`

## Testing

Use Stripe's test card numbers:
- **Success:** `4242 4242 4242 4242`
- **Requires authentication:** `4000 0025 0000 3155`
- **Declined:** `4000 0000 0000 0002`

For UPI testing (India accounts):
- Use the UPI test ID: `upi@pay`

## Go Live Checklist

- [ ] Complete Stripe account verification
- [ ] Switch from test to live API keys
- [ ] Update webhook endpoint URL to production domain
- [ ] Update webhook signing secret
- [ ] Create live products and prices (or activate test products)
- [ ] Test the full checkout flow
- [ ] Verify webhook events are received
