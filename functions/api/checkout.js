/**
 * GetWireGuard — Waffo Pancake Checkout
 * Cloudflare Pages Function  →  POST /api/checkout
 *
 * Products (Dashboard):
 *   Shared Nodes   PROD_4FqTbOFpuQjCkx9Sg5nUqC
 *   Dedicated Line PROD_2qWhSvNdwFiJwlrkIZfuFW
 *
 * Private key: waffo-private-key-KEY_3p3C.pem (Base64, no PEM headers)
 * Merchant ID : MER_7Degle21rf4YY31kU0OkSH
 * Store ID    : STO_6947yeaX8j0Nvce7adVGfR
 */

import { WaffoPancake } from "@waffo/pancake-ts";

// ─── Product IDs (hardcoded — already created in Dashboard) ──────────────────

const PRODUCT_IDS = {
  shared:    "PROD_4FqTbOFpuQjCkx9Sg5nUqC",
  dedicated: "PROD_2qWhSvNdwFiJwlrkIZfuFW",
};

// ─── Price map — passed as priceSnapshot so one product covers both billing periods ──

const PRICES = {
  shared_monthly:    { amount: 2.99,  taxIncluded: true, taxCategory: "saas" },
  shared_yearly:     { amount: 29.99, taxIncluded: true, taxCategory: "saas" },
  dedicated_monthly: { amount: 9.99,  taxIncluded: true, taxCategory: "saas" },
  dedicated_yearly:  { amount: 99.99, taxIncluded: true, taxCategory: "saas" },
};

// ─── Private key (Base64, from waffo-private-key-KEY_3p3C.pem) ───────────────

const PRIVATE_KEY_B64 =
  "MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCn5S13+HV9utTKQdNOtenkhHsn3Np2hvOFLi6iePaJBCh3JY6ZhMKBeFAL6ifWGYmkZVUiV8ZoQcyYgroSnu2zjZd0tSdOKkDppX3CYc/ijAJy74agQvwkOFhXR2OiZcLJ4lfWkKah+C6cbDfpQH7pN7TUJjzfOUl1ZpmTZv37I3PP0ZCVRgJAy/KRVLyXr+uNQeIFYoQZQRXd+vm6RqfG8jE/7jsjIPmT16bLcoOYNorPxslmZHR8/afQnySQABaBz+hfqbb4aMJ6/jQTtmzKKHpnL5aJzpjjjjQQ9dYAh9fkf3q+bN8ExMfb8hm1lMeE/IE7snrsP0nirBdpt9CjAgMBAAECggEAKFzw2uw49sKRQJSlo8EZG058Ox+dx6v25HgvTvEMt/Dvd4FocGDZz/1oJQ0kiZS3IfYYivqWIN9cu/eFm09o7ucl17FrYx/GXkViX/Za32hweEg8Uc/4xQ5ksorfmZ2kQBuxqUw6OysqrYFYybMvL4ssZmpQ7QtdLSO+3RCAE71U/T1ah5FKBENfzWgGV8isqz2KZ/okdRU9haFjc2zDVkALU864jVImIus1husfhW8JJ7gZ6OnhiA8/1ZcPVegFtsKDzGLWYossPPco5O09kpNYQ2mfmGA/G0uWrI8isYEKEWuOOYhbvEOtrCKq0bS+wT4lxF6XEw68rnyjPusLlQKBgQDQ2VTMsIhbm44+m2gP9iQJEDyFYcCxKh7ZDNaCO1+aT5hGdX5Mvx2WlkMXBpeoehPV9aenqJSfgqJ6IKmdACG0BBbVg47Fu4EVU3PUWqNFAzdXrTcsvb10c+PeTmuXzHIs87pN6/SCuVMMLXoQzs+k9UiIG1M/r+9iKTnElgVDBwKBgQDNzODG9znojkrGDoLQCgfiZGrpTOXfdTg2MJQIzJL0jq+LXfA/C+ll8lbJVahCfQp6ksmVGqZeADNz/w65RjFvmVEj+Imc+ed6EUxbQNXTgiG6khlQ4WERZpAq6Sg8vzkezsjvKI92FCktahtWyBWIPkz3iKn7ijWiy6XJRq6ShQKBgQCqEqGMwqF4QDfY4gMfJGl5+//c+prJayyNwneYvDMBXZn6nsmIRAYbUCg4QwUTjL5EeXTbAlxtfRtE6v5UvPu1NbNGkoicmzHmJPxpTJoypAjYXFVXGPiEMa+5pBDYIARGeQAZXnHSVoq7mvkRYOkVQy2asO3dKi99t2a0oRqN1wKBgQCy9GDRItG8I19p8dxWQyKv/lnpHPEW6rtCg+N1804mUpzbN4hdimIeQCivUkjJ6ClghJu9iDr6qnoTd8q52QvL2ynveYNQeQ6L2tbm0u4cyZ/CuKBC8HiTxPfAGJbgm/dzjqSzMjXtm4Ji901mnP38RxBufuwwyvHw6dzztP7AcQKBgQCN/JipCEbVkGO9T+9x38YF2FyJsv12WjE1PK3XPudOnVj8JM822rZ1bsiA2j9ld4RWTLapV8pTw/8VBYzXXZADD5nrX/y5ewxPDe6AForHGSylhdycDiGTPuMDiL/W3ndsCT82wMNgFiVeq07JqUMzU35cXb9RfR7x1BA8srEczA==";

// ─── Helper ───────────────────────────────────────────────────────────────────

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ─── Cloudflare Pages Function ────────────────────────────────────────────────

export async function onRequestPost({ request, env }) {
  // ── Parse body ──
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { plan, billing, node, email, name } = body;

  // ── Validate ──
  if (!["shared", "dedicated"].includes(plan)) {
    return jsonResponse({ error: "Invalid plan. Must be 'shared' or 'dedicated'." }, 400);
  }
  if (!["monthly", "yearly"].includes(billing)) {
    return jsonResponse({ error: "Invalid billing. Must be 'monthly' or 'yearly'." }, 400);
  }
  if (!email || !name) {
    return jsonResponse({ error: "email and name are required." }, 400);
  }

  const key       = `${plan}_${billing}`;          // e.g. "shared_monthly"
  const productId = PRODUCT_IDS[plan];
  const price     = PRICES[key];

  // ── Private key: prefer env var (for key rotation), fall back to hardcoded ──
  const privateKey = env.WAFFO_PRIVATE_KEY || PRIVATE_KEY_B64;
  const merchantId = env.WAFFO_MERCHANT_ID || "MER_7Degle21rf4YY31kU0OkSH";

  const client = new WaffoPancake({ merchantId, privateKey });

  // ── Create checkout session ──
  try {
    const session = await client.checkout.createSession({
      productId,
      productType:   "subscription",
      currency:      "USD",
      buyerEmail:    email,
      successUrl:    "https://getwireguard.com/download.html?welcome=1",
      priceSnapshot: price,           // dynamic price for monthly vs yearly
      withTrial:     true,
      metadata: {
        customerName: name,
        serverNode:   node || "unselected",
        plan,
        billing,
      },
    });

    return jsonResponse({ checkoutUrl: session.checkoutUrl });

  } catch (err) {
    console.error("[checkout] createSession failed:", err?.errors ?? err);
    return jsonResponse(
      { error: "Failed to create checkout session. Please try again." },
      500
    );
  }
}
