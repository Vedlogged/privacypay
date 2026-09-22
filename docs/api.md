# PrivacyPay API Specification

## Base URL
`/api`

---

## Endpoints

### 1. `GET /api/health`
Returns system health status and Midnight network telemetry.
- **Response**: `200 OK`
```json
{
  "status": "healthy",
  "network": "Midnight Preprod Testnet (Halo2/ZK-SNARKs)",
  "protocol": "PrivacyPay Compact Engine v0.3.0",
  "metrics": { ... }
}
```

### 2. `GET /api/products` & `POST /api/products`
Manage SaaS product catalog.
- **POST Body**: `{ "name": string, "description": string, "category": string }`
- **Response**: `201 Created`

### 3. `GET /api/plans` & `POST /api/plans`
Manage SaaS pricing tiers.
- **POST Body**: `{ "productId": string, "name": string, "priceUsd": number, "cadence": "month"|"year", "features": string[] }`

### 4. `GET /api/subscriptions` & `POST /api/subscriptions`
List or authorize subscriptions.
- **POST Body**: `{ "planIdNumeric": string, "customSecret"?: string }`
- **Response**: `201 Created`

### 5. `DELETE /api/subscriptions/:id`
Cancel an active subscription with secret proof.
- **DELETE Body**: `{ "secret": string }`

### 6. `POST /api/billing/cycle`
Trigger or advance a recurring billing cycle.
- **POST Body**: `{ "subscriptionId": string, "amountCents": number, "outcome": "SUCCESS"|"FAILURE" }`
