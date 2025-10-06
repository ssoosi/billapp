# 🧾 Billing Service API

A simple **NestJS billing API** to manage accounts, currencies, and calculate bills based on transactions and promotional discounts.

This project uses **TypeScript**, **NestJS**, and **in-memory storage** (no database required).

---

## 📁 Project Structure

```
billing-service/
├── src/
│   ├── accounts/
│   │   ├── dto/
│   │   │   ├── bill-request.dto.ts
│   │   │   └── create-account.dto.ts
│   │   ├── account.controller.ts
│   │   └── account.service.ts
│   ├── currencies/
│   │   ├── dto/
│   │   │   └── create-currency.dto.ts
│   │   ├── currency.controller.ts
│   │   └── currency.service.ts
│   ├── billing/
│   │   └── billing.service.ts
│   ├── app.module.ts
│   └── main.ts
├── package.json
└── tsconfig.json
```

🛠 Installation

##Clone the repo or create a new NestJS project manually.

Install dependencies:
```bash
npm install
npm install class-validator class-transformer
```

🚀 Running the API

Start in development mode:
```bash
npm run start:dev
```
http://localhost:3000

Example: create currency, create account, calculate bill

Below I show a simple end-to-end example you can run with curl. This will also demonstrate the numeric breakdown so you can verify the billing logic.

1) Create a currency (GBP)

```bash
curl -s -X POST http://localhost:3000/currencies \
  -H "Content-Type: application/json" \
  -d '{"currency":"GBP","monthlyFeeGbp":30,"perTransactionFeeGbp":0.5}' | jq
```

Response:
```bash
{
  "currency": "GBP",
  "monthlyFeeGbp": 30,
  "perTransactionFeeGbp": 0.5
}
```
2) Create an account (optional createdAt used so we can demonstrate a promo overlap)
```bash
curl -s -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "accountId":"acct-001",
    "currency":"GBP",
    "transactionThreshold":100,
    "discountDays":15,
    "discountRate":50,
    "createdAt":"2025-09-20T00:00:00.000Z"
  }' | jq

```
```bash
Response:

{
  "accountId": "acct-001",
  "currency": "GBP",
  "transactionThreshold": 100,
  "discountDays": 15,
  "discountRate": 50,
  "createdAt": "2025-09-20T00:00:00.000Z"
}
```
3) Request a bill for period 2025-10-01 → 2025-10-31 with 110 transactions
```bash
curl -s -X POST http://localhost:3000/accounts/acct-001/bill \
  -H "Content-Type: application/json" \
  -d '{
    "billingPeriodStart":"2025-10-01",
    "billingPeriodEnd":"2025-10-31",
    "transactionCount":110
  }' | jq
```
How the service calculates (explained step-by-step)

Billing period: 2025-10-01 → 2025-10-31 → 31 days.

Monthly base fee (GBP): £30 for the full month. For this period the entire month is covered, so base = £30.00.

Transaction threshold: 100 per month. Transactions given: 110 → extra transactions = 110 − 100 = 10.

Per-extra-transaction fee: £0.50 (set when creating the currency). So transaction fees = 10 × 0.5 = £5.00.

Subtotal (before discount) = base + transaction fees = 30 + 5 = £35.00.

Discount window: account createdAt 2025-09-20 plus 15 days → promo covers 2025-09-20 through 2025-10-04 inclusive → the billing period overlaps 2025-10-01 → 2025-10-04 = 4 days.

Discount fraction = 4 / 31 ≈ 0.129032258.

DiscountRate = 50% → effective discount on subtotal = subtotal * (4/31) * 0.5.

35 * (4/31) * 0.5 = 35 * 0.129032258 * 0.5 ≈ 35 * 0.064516129 ≈ £2.258064516

Rounded to 2 decimals → discount = £2.26

Total = subtotal − discount = 35.00 − 2.26 = £32.74

The API response will look like:
```bash
{
  "accountId": "acct-001",
  "billingPeriodStart": "2025-10-01T00:00:00.000Z",
  "billingPeriodEnd": "2025-10-31T00:00:00.000Z",
  "totalBillingDays": 31,
  "baseFeeTotal": 30,
  "transactionFeesTotal": 5,
  "subtotal": 35,
  "discountAmount": 2.26,
  "totalGbp": 32.74,
  "perMonth": [
    {
      "month": "2025-10",
      "daysInMonth": 31,
      "daysCovered": 31,
      "proratedBaseFee": 30,
      "transactionsAllocated": 110,
      "extraTransactions": 10,
      "transactionFees": 5
    }
  ]
}

```


##⚡ Tips for Testing

Use Postman or Insomnia to make requests.

Add a few currencies and accounts first.

Try billing periods:

Inside promo window → discount applied

After promo window → no discount

Test transactions above/below the threshold to see transaction fees in action.

##📌 Notes

All data is in-memory → restarting the server clears all accounts and currencies.

Transaction fees are £0.50 per transaction over threshold by default (can adjust in billing.service.ts).

Discount is proportional to overlap between billing period and promotional days.

##❤️ Built With

NestJS

TypeScript

class-validator & class-transformer