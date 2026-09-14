import { readFileSync } from "node:fs";

// Next skips .env.local when NODE_ENV=test, so load it by hand. Real env (CI) always wins.
try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
} catch {
  // no .env.local: rely on the process environment
}

// Billing tests stub Stripe; these only need to be present.
process.env.STRIPE_SECRET_KEY ||= "sk_test_stub";
process.env.STRIPE_WEBHOOK_SECRET ||= "whsec_stub";
process.env.STRIPE_PRO_MONTHLY_PRICE_ID ||= "price_test_pro_monthly";
