# MetroScan — Legal Metrology Compliance Checking System
### Ministry of Consumer Affairs, Food & Public Distribution • Smart India Hackathon (SIH26034)

A streamlined, humanized software system developed under the **Legal Metrology (Packaged Commodities) Rules, 2011** to check statutory packaging declarations, enforce metric unit standards, and cross-reference official registered commodity datasets.

---

## 🏛️ Regulatory Background & Government Dataset
- **Administering Authority**: Department of Consumer Affairs (DoCA), Government of India
- **Statutory Rules**: Legal Metrology (Packaged Commodities) Rules, 2011 (LMPC Rules)
- **Dataset Integration**: Direct integration with the official DoCA Legal Metrology repository:
  `https://consumeraffairs.gov.in/pages/legal-metrology-act`
- **Core Enforcement Standards Checked**:
  - **Rule 6(1)(a)**: Complete Manufacturer / Packer / Importer Name, Address & 6-digit PIN Code
  - **Rule 6(1)(b)**: Generic or Common Commercial Name of the commodity
  - **Rule 6(1)(c) & Rule 13**: Net Quantity declared strictly in SI metric units (`g`, `kg`, `ml`, `l`). Rejection of prohibited abbreviations (`gms`, `Kgs`, `ltrs`)
  - **Rule 6(1)(e)**: Maximum Retail Price (MRP) with mandatory `"inclusive of all taxes"`
  - **Rule 6(1)(e) Second Proviso**: Mandatory **Unit Sale Price (USP)** (`₹/g`, `₹/kg`, `₹/ml`, `₹/l`)
  - **Rule 6(1)(d)**: Month & Year of Manufacture
  - **Rule 6(1)(n)**: Consumer Grievance Contact with Person/Office, Address, Phone & Email
  - **Rule 7 & Table-I**: Prescribed minimum font cap-height based on Principal Display Panel (PDP) surface area
  - **Rule 18(2A)**: Statutory Prohibition on Dual MRP across retail channels
  - **Rule 27**: Mandatory registration of manufacturers, packers, and importers

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 🖥️ Streamlined 4-View Architecture

| # | Page / Feature | Key Capabilities & Highlights |
|---|---|---|
| **1** | **Overview / Home** (`/`) | Clear, uncluttered statutory overview explaining the Legal Metrology Act, 2009 with direct entry points to all 3 core features. |
| **2** | **Feature 1: Label Scanner** | Scan packaging labels or select pre-loaded real test samples (*Parle-G*, *Tata Salt*, *Catch Spices*). Immediate extraction checklist, interactive SVG bounding box packaging overlay, Rule 7 Table-I font cap-height check, and one-click PDF inspection certificate export. |
| **3** | **Feature 2: Official Govt Dataset** | Search and filter the official Department of Consumer Affairs pre-packaged commodities repository by Brand, Commodity, Rule 27 LMPC Registration Number, or State Directorate. |
| **4** | **Feature 3: Inspection Log** | Official field inspection ledger tracking market inspections, Section 36(1) show-cause notices for missing declarations or illegal units, and Section 48 compounding orders. |

---

## 🎨 Humanized Design System
- **Restrained Civic Palette**: Flat Deep Teal (`#1B5E7B`), Warm Amber (`#E67E22`), Forest Green (`#27AE60`), Brick Red (`#C0392B`), and crisp neutral grays (`#F9FAFB`, `#374151`).
- **Anti-AI-Slop Guarantee**: Zero gradient card backgrounds, zero neon glows, zero glassmorphism, no marketing buzzwords.
- **Genuine Indian Context**: Realistic Indian packaged commodities (*Parle-G Gold, Tata Salt Iodised, Amul Butter, Fortune Sunflower Oil, Catch Black Pepper, Haldiram's Bhujia*), valid postal addresses with 6-digit PIN codes, and Indian currency formatting (`₹ 55.00`).
