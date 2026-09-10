# MetroScan Frontend State and Page Navigation Flow Map
**Project ID**: SIH26034  
**Project Title**: Software System to Check Compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by Scanning Products, Images and Labels  
**Administering Ministry**: Ministry of Consumer Affairs, Food & Public Distribution, Department of Consumer Affairs (Legal Metrology Division), Government of India  
**Document Classification**: Frontend Architecture, State Machine & Navigation Specification  
**Version**: 1.0.0 (Production Blueprint)

---

## 1. Document Header & Frontend Architecture Overview

### 1.1 Technical Stack Specification
The MetroScan frontend is engineered as a high-performance, single-page application (SPA) designed to operate reliably in both high-bandwidth administrative offices and network-constrained field inspection environments.

| Layer | Technology | Version | Purpose & Rationale |
|---|---|---|---|
| Core Runtime | React | 19.0.0 | Concurrent rendering, compiler-optimized memoization, sub-millisecond DOM reconciliation |
| Language | TypeScript | 5.8 / 6.0 | Strict statutory typing, interface enforcement, null-safety across OCR payloads |
| Bundler & Dev Tooling | Vite | 6.0.0 | Instant Hot Module Replacement (HMR), tree-shaken production ES modules |
| Styling Engine | Tailwind CSS | 3.4.0 | Atomic design tokens, zero-runtime CSS overhead, custom government palette |
| Iconography | Phosphor Icons React | 2.1.0 | Lightweight, tree-shakeable SVG glyphs with standardized stroke weight |
| State Management | React Native Hooks | Built-in | Centralized single-state pattern in App.tsx; zero external state library bloat |

### 1.2 Zero-Bloat Architecture Rationale
MetroScan intentionally excludes third-party global state containers (such as Redux Toolkit, MobX, or Zustand) and heavy routing engines (such as React Router v6 or TanStack Router). The technical decisions behind this lightweight architecture include:
1. **Zero External Routing Bloat**: The application runs as an authoritative regulatory kiosk and field workstation. Navigation is strictly categorical (`landing`, `scanner`, `health`, `history`, `dashboard`, `inspections`, `reports`). Managing active routes via top-level string literal union states in `App.tsx` eliminates client-side routing bundle weight (saving >45KB minified), eliminates nested route context overhead, and prevents routing state desynchronization during offline field operations.
2. **Deterministic Unidirectional Data Flow**: Global application state resides exclusively in the root `App.tsx` component. Child components communicate changes upstream strictly through typed callback props (`onNavigate`, `onSetUserRole`, `onOpenReportModal`). This ensures predictable auditing traces, instantaneous hot swapping between Consumer and Officer modes, and deterministic state resets upon scan completion.
3. **Low Latency & High Frame Rates on Field Hardware**: Government field inspectors often utilize budget Android tablets or ruggedized handheld devices. Eliminating state-proxy libraries guarantees 60fps interaction during image manipulation, bounding box rendering, and millimeter font calibration.

### 1.3 Centralized State Architecture in App.tsx
The root component (`frontend/src/App.tsx`) coordinates all navigation transitions, role alterations, global modal overlays, and toast notifications.

```
+-------------------------------------------------------------------------------+
|                                  App.tsx                                      |
|  State:                                                                       |
|   - activePage: string ('landing'|'scanner'|'health'|'history'|               |
|                         'dashboard'|'inspections'|'reports')                  |
|   - userRole: UserRole ('consumer' | 'officer')                               |
|   - isReportModalOpen: boolean                                                |
|   - toasts: ToastMessage[]                                                    |
+-------------------------------------------------------------------------------+
           |                                                |
           v                                                v
+-----------------------+                        +-----------------------+
|   ToastContainer      |                        |  GenerateReportModal  |
| (Queue Notifications) |                        | (Statutory FORM LM)   |
+-----------------------+                        +-----------------------+
           |
           v
+-------------------------------------------------------------------------------+
|                                  Navbar                                       |
|  - Role Toggle Pill ('consumer' <-> 'officer')                                |
|  - Dynamic Route Tabs (Filtered based on userRole)                            |
+-------------------------------------------------------------------------------+
           |
           v
+-------------------------------------------------------------------------------+
|                           <main> Active Page View                             |
|                                                                               |
| [Consumer Views]                 [Officer Views]                              |
|  - LandingPage                    - LandingPage                               |
|  - ScannerPage (Consumer Mode)    - ScannerPage (Officer Mode)                |
|  - HealthCheckPage                - OfficerDashboardPage                      |
|  - ProductHistoryPage             - InspectionsPage                           |
|                                   - ReportViewerPage                          |
+-------------------------------------------------------------------------------+
           |
           v
+-------------------------------------------------------------------------------+
|                                  Footer                                       |
| (Statutory Citations, Legal Disclaimers, NIC/Legal Metrology Attributions)    |
+-------------------------------------------------------------------------------+
```

### 1.4 Core State Declarations in App.tsx
The primary states managed at the root component level include:
- `activePage`: Typed string controlling the currently mounted view component. Default: `'landing'`.
- `userRole`: Union type `'consumer' | 'officer'`. Determines permission boundaries, UI themes, and visible navigation links. Default: `'consumer'`.
- `isReportModalOpen`: Boolean controlling the visibility of the statutory report generation modal (`GenerateReportModal.tsx`).
- `toasts`: Array of `ToastMessage` objects containing notification queues with automatic 4500ms dismissal timers.

---

## 2. Role-Based Navigation & Page Hierarchy

### 2.1 Role-Based Page Access Matrix
MetroScan enforces strict operational separation between ordinary consumers auditing packaged goods and Legal Metrology field enforcement officers issuing statutory inspection certificates.

| Route Identifier | Page Component | Consumer Mode | Officer Mode | Primary Purpose |
|---|---|---|---|---|
| `landing` | `LandingPage.tsx` | Permitted | Permitted | Executive statutory overview, platform capabilities, quick start CTAs |
| `scanner` | `ScannerPage.tsx` | Permitted (Consumer UI) | Permitted (Enforcement UI) | Rule 6 declaration validation, Table-I font height audit, bounding box analysis |
| `health` | `HealthCheckPage.tsx` | Permitted | Hidden | Dual-panel nutritional assessment, ICMR-NIN threshold checks, price fairness |
| `history` | `ProductHistoryPage.tsx` | Permitted | Hidden | Local client cache of scanned products, search, status filtering |
| `dashboard` | `OfficerDashboardPage.tsx` | Hidden | Permitted | Enforcement KPIs, jurisdiction analytics, violation breakdown charts |
| `inspections` | `InspectionsPage.tsx` | Hidden | Permitted | Field inspection ledger, Section 36(1) notices, compounding tracking |
| `reports` | `ReportViewerPage.tsx` | Hidden | Permitted | Statutory docket archive, FORM LM-INSP-2011 generator, browser print |

### 2.2 Role Switching Mechanism & State Synchronization
The top-right header contains a persistent role toggle pill component in `frontend/src/components/layout/Navbar.tsx`. When clicked, it calls `onToggleUserRole` defined in `frontend/src/App.tsx`.

#### State Mutation Logic
```typescript
const handleToggleUserRole = () => {
  if (userRole === "consumer") {
    setUserRole("officer");
    addToast("info", "Officer Mode Enabled", "Switched to Enforcement Officer jurisdiction view.");
    // Sanitize active route: redirect consumer-only routes to officer dashboard
    if (activePage === "health" || activePage === "history") {
      setActivePage("dashboard");
    }
  } else {
    setUserRole("consumer");
    addToast("info", "Consumer Mode Enabled", "Switched to Citizen retail & nutrition verification.");
    // Sanitize active route: redirect officer-only routes to consumer scanner
    if (activePage === "dashboard" || activePage === "reports" || activePage === "inspections") {
      setActivePage("scanner");
    }
  }
};
```

### 2.3 Dynamic Navbar Navigation Tabs
The `Navbar` component dynamically renders navigation items based on the active `userRole`:
- **Consumer Navigation Set**:
  - `Overview` -> `landing`
  - `Label Scanner` -> `scanner`
  - `Health Check` -> `health`
  - `My Scans` -> `history`
- **Officer Navigation Set**:
  - `Overview` -> `landing`
  - `Officer Dashboard` -> `dashboard`
  - `Field Scanner` -> `scanner`
  - `Inspection Ledger` -> `inspections`
  - `Report Dockets` -> `reports`

---

## 3. Scanner Flow State Machine

### 3.1 State Machine Specification
The `ScannerPage.tsx` component orchestrates packaging image capture, canvas downsampling, optical character recognition simulation, and interactive result inspection.

| State Name | Triggers / Preconditions | Active Visual Indicators | Permitted Transitions |
|---|---|---|---|
| `IDLE` | Component mount or upload reset | Drag-and-drop zone, camera launch button, sample selector | `FILE_SELECTED` |
| `FILE_SELECTED` | User selects file via dialog, drag drop, or camera | File name banner, thumbnail preview generated | `CANVAS_RESIZE`, `ERROR` |
| `CANVAS_RESIZE` | File format validated (JPEG, PNG, WEBP) | Background canvas scaling, dimensions clamped to 2048px | `UPLOADING`, `ERROR` |
| `UPLOADING` | Resized blob generated | Progress bar initiated, cancel upload button visible | `ANALYZING_OCR`, `ERROR` |
| `ANALYZING_OCR` | Upload payload confirmed | 3-step progress bar with milestone textual descriptions | `RESULTS_READY`, `ERROR` |
| `RESULTS_READY` | Rule engine payload returned | Two-column inspection workstation, bounding box overlay | `IDLE`, `CANVAS_RESIZE` |
| `ERROR` | Malformed file, canvas fault, network timeout | Error banner, retry button, diagnostic notice | `IDLE`, `FILE_SELECTED` |

### 3.2 State Transition Diagram (ASCII)

```
        +------------------------------------------------------+
        |                        IDLE                          |
        +------------------------------------------------------+
                                   |
                       User selects file / drops image
                                   v
        +------------------------------------------------------+
        |                    FILE_SELECTED                     |
        +------------------------------------------------------+
                                   |
                      Format verified (JPEG/PNG/WEBP)
                                   v
        +------------------------------------------------------+
        |                    CANVAS_RESIZE                     |
        |       (Downsample to max 2048px, JPEG 0.85)          |
        +------------------------------------------------------+
                                   |
                         Blob created successfully
                                   v
        +------------------------------------------------------+
        |                      UPLOADING                       |
        |              (Transmit optimized payload)            |
        +------------------------------------------------------+
                                   |
                          Payload acknowledged
                                   v
        +------------------------------------------------------+
        |                    ANALYZING_OCR                     |
        |  Step 1 (30%): PDP segmentation & line detection    |
        |  Step 2 (70%): Rule 6 declaration extraction        |
        |  Step 3 (95%): Rule 7 Table-I font calibration      |
        +------------------------------------------------------+
                                   |
                         Analysis completed (1050ms)
                                   v
        +------------------------------------------------------+
        |                    RESULTS_READY                     |
        |  - Executive Report Header                           |
        |  - Left: Declarations / Font Audit Table             |
        |  - Right: Interactive Annotated Packaging Specimen   |
        +------------------------------------------------------+
           |                                                |
     User resets / uploads new                     User clicks sample
           |                                                |
           +---------------------> IDLE <-------------------+
```

### 3.3 Client-Side Canvas Image Downsampling Pipeline
High-resolution camera sensors on modern smartphones produce images between 12MB and 48MB (up to 8000x6000 pixels). Transmitting uncompressed images over 2G/3G field connections causes severe network bottlenecks. The client-side pipeline downsamples images to an optimal resolution that preserves font edge sharpness for Rule 7 Table-I millimeter measurements while minimizing payload weight.

#### Pipeline Specification
- **Maximum Dimension Constraint**: 2048 pixels along the longest edge (width or height).
- **Aspect Ratio Preservation**: Strict proportional scaling (`aspectRatio = originalWidth / originalHeight`).
- **Compression Format**: `image/jpeg` at quality index `0.85`.
- **Target Payload Size**: Reduced from 15MB-30MB down to 450KB-850KB (>95% bandwidth reduction).

#### Implementation Logic
```typescript
export async function downsampleImageForOcr(file: File): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file from disk."));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to parse image element."));
      img.onload = () => {
        const MAX_DIM = 2048;
        let targetWidth = img.width;
        let targetHeight = img.height;

        if (img.width > MAX_DIM || img.height > MAX_DIM) {
          if (img.width > img.height) {
            targetWidth = MAX_DIM;
            targetHeight = Math.round((img.height * MAX_DIM) / img.width);
          } else {
            targetHeight = MAX_DIM;
            targetWidth = Math.round((img.width * MAX_DIM) / img.height);
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas 2D context acquisition failed."));
          return;
        }

        // Apply high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl, width: targetWidth, height: targetHeight });
            } else {
              reject(new Error("Canvas blob generation failed."));
            }
          },
          "image/jpeg",
          0.85
        );
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
```

### 3.4 Results Sub-View Toggles & Inspection Views
When `ScannerPage` reaches `RESULTS_READY`, the results panel provides dynamic filtering and detailed inspection views:
1. **Rule 6 Declarations (`declarations`)**: Displays all mandatory statutory fields:
   - Manufacturer name, address, and postal PIN code (Rule 6(1)(a)).
   - Country of origin for imported commodities (Rule 6(1)(aa)).
   - Generic commodity name (Rule 6(1)(b)).
   - Net quantity in SI standard metric units (Rule 6(1)(c) and Rule 13).
   - Month and year of manufacture/packing (Rule 6(1)(d)).
   - Retail sale price (MRP) inclusive of all taxes (Rule 6(1)(e)).
   - Unit Sale Price (USP) per g/kg/ml/l (Rule 6(1)(e) Second Proviso).
   - Consumer care contact coordinates (Rule 6(1)(n)).
2. **Rule 7 Table-I Font Audit (`font_table`)**: Detailed tabular comparison:
   - Evaluates Principal Display Panel (PDP) area (e.g. 185 cm²).
   - Calculates statutory minimum font height threshold (e.g. 4.0 mm for net weight > 200g up to 1kg).
   - Compares measured font cap-height against statutory minimum.
   - Computes deficiency margin in millimeters and flags infractions.
3. **Interactive Visual Overlay (`visual_overlay`)**:
   - `frontend/src/components/scanner/AnnotatedImage.tsx` maps bounding boxes with coordinates `(x, y, width, height)` in relative percentages (0-100%).
   - Bounding boxes are color-coded: Green for compliant declarations, Red for statutory infractions, Blue for active focus.
   - Clicking a card on the left automatically shifts camera focus and draws a highlight box around the corresponding label element on the packaging photograph.

---

## 4. Consumer Health Check Flow

### 4.1 Dual-Panel Packaging Requirement
Statutory declarations in Indian consumer packaged foods are distributed across distinct panels:
- **Front Panel**: Brand identity, generic commodity title, FSSAI logo and license number, vegetarian/non-vegetarian logo, and net quantity declaration.
- **Back Panel**: Mandatory nutritional information table (energy, protein, carbohydrate, total sugar, added sugar, dietary fiber, total fat, saturated fat, trans fat, sodium), ingredients list in descending order of weight, consumer care details, and MRP/USP stamp.

A single photograph cannot provide sufficient data to evaluate both marketing claims and nutritional compliance. The `HealthCheckPage.tsx` interface enforces a mandatory dual-panel upload sequence.

### 4.2 Multi-Step Upload Validation State Machine
The component maintains distinct state hooks for front and back images:
- `frontImageSrc`: Base64 string for front panel photograph.
- `frontFileName`: File name string for front panel.
- `backImageSrc`: Base64 string for back panel photograph.
- `backFileName`: File name string for back panel.

#### Validation Logic
1. **State 0/2**: Both slots empty. The action button is locked, displaying: `Upload both Front and Back packaging photographs to unlock the health audit (0/2 Uploaded)`.
2. **State 1/2**: Either front or back panel loaded. Action button remains locked, displaying: `1/2 Uploaded`.
3. **State 2/2**: Both panels confirmed. The primary CTA activates: `Run Health & Nutrition Check`.

```
+-------------------------------------------------------------------------------+
|                       Dual Upload Target Grid                                 |
|                                                                               |
|   +-------------------------------+   +-------------------------------+       |
|   |         Front Panel           |   |          Back Panel           |       |
|   |  - Brand & Title              |   |  - Nutritional Table          |       |
|   |  - Net Quantity Declaration   |   |  - Ingredients & Allergens    |       |
|   |  - FSSAI License Logo         |   |  - MRP / Unit Sale Price      |       |
|   |  Status: [LOADED / EMPTY]     |   |  Status: [LOADED / EMPTY]     |       |
|   +-------------------------------+   +-------------------------------+       |
+-------------------------------------------------------------------------------+
                                        |
           isUploadComplete = Boolean(frontImageSrc && backImageSrc)
                                        |
                 +----------------------+----------------------+
                 | (False)                                     | (True)
                 v                                             v
    +-------------------------+                   +-------------------------+
    |  Action Button Locked   |                   |  Action Button Active   |
    |  "0/2 or 1/2 Uploaded"  |                   |  "Run Health & Nutri"   |
    +-------------------------+                   +-------------------------+
```

### 4.3 Analysis Sequence & Progress Milestones
When the user triggers `runDualScanAudit()`, the system executes a phased analysis:
- **Phase 1 (33% Progress)**: Extracting nutritional table values, serving size declarations, and descending ingredients list.
- **Phase 2 (66% Progress)**: Benchmarking sugar, sodium, and saturated fats against ICMR-NIN 2024 upper dietary thresholds.
- **Phase 3 (100% Progress)**: Evaluating Unit Sale Price fairness against standard metric baselines and synthesizing dietary advisories.

### 4.4 Health Audit Presentation Structure
The resulting health audit renders structured advisory panels:
1. **Nutritional Index Header**:
   - 0-100 composite score computed from ICMR dietary guidelines.
   - Classification badge: `Nutritious Choice` (Score >= 70), `Moderate Caution` (Score 45-69), `Statutory HFSS Hazard` (Score < 45).
2. **HFSS Warning Badge Cluster**:
   - Prominently displays high-risk nutrient markers: `High Added Sugar (>10% energy)`, `Excess Sodium (>2000mg/day standard)`, `High Saturated Fat`, `Trans Fat Free`.
3. **Nutritional Parameter Breakdown Matrix**:
   - 6-column comparison table: Parameter, Per 100g, Per Serving, ICMR Daily Recommended Limit, Concentration Level, and Medical Assessment.
4. **MRP & Price Fairness Evaluation**:
   - Displays declared MRP alongside calculated Unit Sale Price (USP per 100g or 100ml).
   - Identifies non-standard packaging volume tricks (e.g. downsizing a 100g biscuit pack to 82g while retaining original MRP).
5. **Two-Column Dietary Advisory Presentation**:
   - **Left Panel (Safe Consumption)**: Identifies demographic groups who can consume the product safely (e.g. endurance athletes, active adults).
   - **Right Panel (Avoidance Warnings)**: Highlights clinical contraindications (e.g. Type-2 Diabetics, hypertensive patients, children under 12).
6. **Healthier Whole-Food Alternatives**:
   - Proposes unprocessed or minimally processed regional alternatives (e.g. roasted chana instead of fried extruded snacks).

---

## 5. Officer Dashboard & Enforcement Workflows

### 5.1 Enforcement Officer Dashboard View (`OfficerDashboardPage.tsx`)
The officer dashboard serves as the central operational cockpit for Legal Metrology Inspectors executing field inspections and market surveillance.

#### Key Interface Modules
1. **Inspector Credential & Jurisdiction Banner**:
   - Displays officer name, government badge number (e.g. `DL-LM-2024-884`), division, zone, and assigned geographic district.
   - Quick action buttons: `New Product Inspection` (navigates to scanner) and `Generate Statutory Certificate` (opens modal).
2. **Statutory Enforcement KPI Tiles**:
   - **Total Inspected**: Total packaged commodities audited across retail markets with monthly trend percentage.
   - **Certified Compliant**: Total SKUs meeting all Rule 6 and Rule 7 requirements, with aggregate compliance rate.
   - **Violations Recorded**: Total actionable infractions identified under Section 36(1) of the Legal Metrology Act, 2009.
   - **Compounded & Closed**: Revenue collected through compounding fees under Section 48.
3. **Recent Enforcement Actions & Violations Feed**:
   - Real-time audit log of inspected retail establishments, seized SKUs, and issued notices.

### 5.2 Field Inspections & Violations Ledger (`InspectionsPage.tsx`)
The inspections ledger manages the complete lifecycle of enforcement actions.

#### Ledger Filter Bar
- Full-text search across Case ID, product name, brand, or statutory infraction code.
- Status filter tabs:
  - `All`: Complete registry of field inspections.
  - `Notice Issued`: Formal Section 36(1) show-cause notices dispatched to manufacturers.
  - `Under Review`: Manufacturer response submitted to Legal Metrology Controller.
  - `Resolved`: Rectification confirmed or compounding penalty collected under Section 48.
  - `Escalated`: Non-responsive cases forwarded for prosecution before the Judicial Magistrate.

#### Expandable Inspection Docket Item
Each record in the ledger expands to display:
- Product classification and violation code (e.g. `VIOL-2026-0891`).
- Specific statutory violation (e.g. Rule 6(1)(e) Unit Sale Price omitted).
- Manufacturer corporate identity and registered address.
- Chronological enforcement timeline with timestamped actions by the assigned officer.

### 5.3 Statutory Report Viewer & Browser Print Engine (`ReportViewerPage.tsx`)
MetroScan implements an official inspection docket viewer adhering to FORM LM-INSP-2011 standards.

#### Inspection Docket Specifications
- **Docket Header**: State Government Directorate of Legal Metrology, Inspection Docket Reference Number, Inspection Date, and Inspector Credentials.
- **Retailer & Specimen Metadata**: Establishment name, trade license number, market location, commodity generic name, brand, batch number, barcode.
- **Statutory Audit Checklist**: Line-by-line verification of Rule 6 declarations with physical font measurement audit against Rule 7 Table-I.
- **Section 36(1) Legal Notice Draft**: Pre-filled statutory text citing non-compliance and specifying the compounding fee under Section 48.

#### One-Click Browser Print Integration (`window.print()`)
Rather than depending on server-side PDF generation binaries that may stall during offline field inspections, MetroScan uses optimized client-side CSS print styles triggered via `window.print()`.

```css
@media print {
  /* Suppress non-printable interface chrome */
  header, nav, footer, .no-print, button {
    display: none !important;
  }

  /* Reset layout constraints for paper output */
  body, main, .print-container {
    background: #ffffff !important;
    color: #000000 !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    box-shadow: none !important;
  }

  /* Force clean page breaks between major report sections */
  .page-break-before {
    page-break-before: always !important;
  }

  /* Prevent split dockets across physical page margins */
  .statutory-card, tr, .avoid-break {
    page-break-inside: avoid !important;
  }

  /* Ensure high-contrast monochromatic rendering for official filing */
  table, th, td {
    border: 1px solid #333333 !important;
    color: #000000 !important;
  }
}
```

---

## 6. Client-Side Offline Caching & LocalStorage Schema

### 6.1 Offline Architecture Philosophy
Field inspections by Legal Metrology Officers frequently occur in basements, wholesale grain mandis, cold storage units, and rural retail outlets lacking cellular connectivity. Similarly, consumers audit commodities inside underground hypermarkets with zero signal. MetroScan implements an offline-first storage architecture utilizing browser `localStorage` and `IndexedDB` caching layers.

### 6.2 Key 1: `metroscan_history_v1`
Stores the most recent 20 verified scan records. This cache enables instantaneous client-side retrieval, search, and filtering without issuing HTTP requests.

#### Storage Capacity & Eviction Rule
- Maximum records: 20 items.
- Eviction policy: First-In, First-Out (FIFO) ring buffer.
- Average item footprint: ~12KB (excluding raw image, using compressed 240x240 thumbnail or cached image reference).
- Total storage footprint: ~240KB (well within the 5MB browser LocalStorage threshold).

#### TypeScript Schema
```typescript
export interface StoredScanHistoryItem {
  id: string;                                     // UUID: 'scan-hist-uuid'
  scanCode: string;                               // Official format: 'MS-2026-XXXX'
  productName: string;                            // Extracted commodity title
  brand: string;                                  // Identified brand
  category: string;                               // 'Food & Beverage' | 'Household' | etc.
  scannedAt: string;                              // ISO timestamp: '2026-09-10T12:00:00.000Z'
  scanType: 'label_compliance' | 'consumer_health';// Audit category
  status: 'compliant' | 'violation' | 'warning' | 'healthy' | 'caution';
  declaredMrp: string;                            // Currency formatted string
  thumbnailUrl: string;                           // Downsampled 240x240 base64 or blob URL
  summaryNote: string;                            // Brief text summary
  violationsCount?: number;                       // Total infractions detected
  healthScore?: number;                           // 0-100 score (if health audit)
  pdpAreaCm2?: number;                            // PDP Area in square centimeters
  cachedOffline: boolean;                         // True if captured without internet
}
```

#### Storage Utility API Contract
```typescript
const HISTORY_STORAGE_KEY = "metroscan_history_v1";
const MAX_HISTORY_ITEMS = 20;

export function saveScanToHistory(record: StoredScanHistoryItem): void {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    let items: StoredScanHistoryItem[] = raw ? JSON.parse(raw) : [];
    
    // Deduplicate by scanCode
    items = items.filter((item) => item.scanCode !== record.scanCode);
    
    // Insert newest item at the head of the array
    items.unshift(record);
    
    // Enforce FIFO ceiling of 20 records
    if (items.length > MAX_HISTORY_ITEMS) {
      items = items.slice(0, MAX_HISTORY_ITEMS);
    }
    
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("LocalStorage write failed for metroscan_history_v1:", error);
  }
}

export function getScanHistory(): StoredScanHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("LocalStorage read failed for metroscan_history_v1:", error);
    return [];
  }
}

export function clearScanHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error("LocalStorage clear failed:", error);
  }
}
```

### 6.3 Key 2: `metroscan_officer_session_v1`
Preserves officer session credentials, active district filters, and offline draft notices across browser restarts.

#### TypeScript Schema
```typescript
export interface StoredOfficerSession {
  version: "1.0.0";
  officerProfile: {
    name: string;                                 // e.g. "Vikram Malhotra"
    badgeNumber: string;                          // e.g. "DL-LM-2024-884"
    designation: string;                          // e.g. "Senior Inspector"
    division: string;                             // e.g. "Legal Metrology Department"
    zone: string;                                 // e.g. "North Zone - Division IV"
    jurisdiction: string;                         // e.g. "New Delhi District"
  };
  activeFilters: {
    district: string;                             // Selected district filter
    statusFilter: string;                         // Active ledger status tab
    searchTerm: string;                           // Active query string
  };
  lastSyncTimestamp: string;                      // ISO timestamp of last server sync
  draftNotices: {
    caseId: string;                               // Case identifier
    commodityName: string;                        // Audited commodity
    manufacturer: string;                         // Accused firm
    infractionCodes: string[];                    // Cites: Rule 6(1)(a), Rule 7 Table-I
    penaltyLeviedInr: number;                     // Computed Section 48 fee
    draftedAt: string;                            // Timestamp
  }[];
}
```

---

## 7. Error Boundaries & Fallback States

### 7.1 Global React Error Boundary
To prevent application crashes from uncaught JavaScript runtime exceptions (e.g. malformed OCR JSON, corrupted base64 images), the application wraps the `<main>` viewport in a React Error Boundary (`ErrorBoundary.tsx`).

#### Error Boundary Behavior
1. Catches unhandled errors in child component trees during render, lifecycle methods, or constructors.
2. Logs diagnostic exception stacks to the browser console.
3. Renders a statutory error recovery interface without destroying active LocalStorage caches.
4. Provides two recovery actions:
   - `Attempt In-Place Component Recovery`: Resets error boundary state and re-renders the current route.
   - `Return to Safe Overview Screen`: Resets `activePage` to `'landing'` and reloads core rulebooks.

### 7.2 Hardware & Network Fallback Matrix

| Failure Event | Detection Mechanism | Immediate User Experience | Fallback Recovery Action |
|---|---|---|---|
| Camera Access Denied | `navigator.mediaDevices.getUserMedia` rejected with `NotAllowedError` | Toast notification: `Camera access denied by browser security policy` | Automatically switches file input to file browser mode (`Browse Local File`); displays guide for browser camera permissions |
| Unsupported Image Format | File MIME type check (!= `image/jpeg`, `image/png`, `image/webp`) | Upload rejected; warning card rendered with red border | Inline notice: `Please upload packaging photographs in JPEG, PNG, or WEBP format up to 20MB` |
| Image Resolution Sub-Optimal | Canvas loader detects width or height < 400 pixels | Toast alert: `Image resolution too low for statutory verification` | Prompts user to re-capture packaging closer to label; proceeds with best-effort OCR warning badge |
| Network Disconnect / 500 Timeout | `fetch` rejects with `NetworkError` or response status >= 500 | Progress bar halts; error card: `Verification engine unreachable (Offline)` | Displays cached local rulebook analysis; preserves captured specimen in offline queue for background sync |
| Storage Quota Exceeded | `localStorage.setItem` throws `QuotaExceededError` | Silent eviction of the oldest 5 records from `metroscan_history_v1` | Retries save operation; informs user scan history has been pruned |

### 7.3 Empty State Component Standards
Every view implements contextual empty state components to prevent confusing blank screens:
- **Scanner Initial Empty State**: Rendered when `activeTab === 'upload'` and no image is loaded. Displays drag-and-drop target, browse button, camera trigger, and a direct link: `Or switch to Benchmark Test Samples to test pre-configured specimens`.
- **History Ledger Empty State**: Rendered when `metroscan_history_v1` is empty or search filters return zero matches. Displays search icon, message `No verified commodities found matching active criteria`, and a `Reset All Filters` action button.
- **Inspections Ledger Empty State**: Rendered when an officer selects a status filter containing zero cases. Displays message `No enforcement actions currently flagged under [Status] in your jurisdiction`.

---

## 8. Summary & Technical Verification

The MetroScan frontend architecture provides a robust, zero-bloat, role-adaptive interface adhering strictly to the Legal Metrology (Packaged Commodities) Rules, 2011. By unifying Consumer and Officer workflows within a single typed state container, downsampling images on the client canvas, enforcing dual-panel uploads for nutritional audits, and maintaining client-side offline storage, the platform guarantees high-speed compliance auditing in both field inspection environments and everyday consumer shopping contexts.
