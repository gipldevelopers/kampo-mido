# 🪙 Digital Gold Wallet Management System

A complete **manual-operated Digital Gold Wallet Software** for jewellery businesses, where customers deposit money through **UPI**, the admin **manually updates gold rates**, and the system converts deposits into **24K gold grams** with full **KYC, ledger, reporting, and withdrawal management**.

This system is built for **transparency, legal compliance, and long-term scalability**.

---

## 🚀 Key Features

✅ Manual Gold Rate Management  
✅ UPI-Based Manual Deposit Entry (No Payment Gateway)  
✅ Complete KYC System with OCR  
✅ Auto Gold Conversion  
✅ Customer Gold Wallet  
✅ Weekly Statements (WhatsApp / SMS / Email)  
✅ Physical Gold / Money / Jewellery Withdrawals  
✅ Full Ledger & Audit Logs  
✅ PostgreSQL Database  
✅ Admin + Customer Dual Panel System  

---

## 👥 User Roles

### 1️⃣ Admin (Owner / Staff)
- Manages customers, KYC, deposits, gold rate, withdrawals, reports, notifications
- Full system control

### 2️⃣ Customer (End User)
- Views gold wallet
- Uploads KYC
- Deposits via UPI
- Requests withdrawals
- Downloads statements

---

## 🧩 Modules Overview

### ✅ Admin Module
- Dashboard
- Customer Management
- KYC Management
- Gold Rate Management (Manual)
- Deposit Management (Manual UPI)
- Withdrawal Management
- Ledger & Reports
- Notification System
- Staff Management (Optional)
- Admin Profile

### ✅ Customer Module
- Dashboard
- Gold Wallet
- UPI Deposit Page
- Withdrawals
- Statements
- KYC Upload
- Profile Settings

---

## 🗄️ Database

- **Database Type:** PostgreSQL  
- **Total Tables:** 13+ Core Tables  
- Includes:
  - users
  - customers
  - nominees
  - kyc_documents
  - gold_rates
  - deposits
  - gold_conversions
  - revaluation_entries
  - withdrawals
  - ledger
  - statements
  - notification_logs
  - staff_action_logs

---

## 🔐 KYC Features

- Aadhaar / DL / Voter ID / Passport
- Address Proof (Optional)
- PAN (Optional)
- Digital Signature Upload
- Nominee Details
- OCR Auto Data Extraction
- Auto KYC Approval Workflow
- Duplicate KYC Detection
- Downloadable KYC PDF
- Audit Logs for Legal Security

---

## 💰 Deposit & Gold Conversion Workflow

1. Customer sends money via **UPI**
2. Admin manually enters deposit into system
3. System fetches **latest manually updated gold rate**
4. Converts amount → **gold grams**
5. Gold wallet updates automatically
6. Ledger entry created

---

## 📈 Gold Rate Management

- Admin manually updates daily gold rate
- System:
  - Recalculates all wallet values
  - Creates revaluation ledger entries
  - Updates profit/loss automatically

---

## 🏦 Withdrawals

Customers can request:
- ✅ Physical Gold
- ✅ Money Payout
- ✅ Jewellery Conversion

Admin approves and completes requests manually.

---

## 📤 Notifications & Statements

- Weekly Wallet Statements
- Deposit Confirmation Alerts
- Withdrawal Updates
- KYC Approval Messages

Channels:
- WhatsApp API
- SMS
- Email

---

## 🛠️ Tech Stack (Suggested)

| Layer | Technology |
|--------|------------|
| Frontend | React / Next.js |
| Backend | Node.js / Express |
| Database | PostgreSQL |
| File Storage | Local / AWS S3 |
| OCR | Tesseract / Paid API |
| WhatsApp | WhatsApp Business API |
| Authentication | JWT |
| Hosting | AWS / DigitalOcean |