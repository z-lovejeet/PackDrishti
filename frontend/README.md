# BiteIQ — Frontend Client
### AI-Powered Consumer Food Nutrition, Ingredient Safety & Daily Product Scanner

A modern, fast, mobile-friendly React application for decoding packaged food labels, evaluating nutrition against **ICMR-NIN 2024 Dietary Guidelines for Indians** and **WHO** safe intake benchmarks, flagging harmful additives and industrial palm oil, and discovering healthier whole-food alternatives.

---

## Quick Start

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

## Key Features

| Feature | Description |
|---|---|
| **Consumer Home / Landing** | Interactive masthead, daily health benchmarks, and guided onboarding. |
| **Food & Nutrition Scanner** | Dual-panel upload (front + back), camera capture, instant nutrition extraction, and 0–100 Health Score. |
| **Nutrient Normalization** | Automatic per-100g / 100ml recalculation revealing hidden sugars, saturated fat, and sodium beyond serving tricks. |
| **Additive & Dye Audit** | Comprehensive check for hidden industrial palm oil, synthetic azo food dyes (Tartrazine, Sunset Yellow, Allura Red), and flavor enhancers. |
| **Personal Food Log & History** | Review past scans, track daily nutrition trends, and compare products. |

---

## Design System & Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom civic & health color palette
- **Icons**: Phosphor Icons
- **State Management**: Zustand
- **PWA**: Offline caching, service worker, and mobile installation prompts
