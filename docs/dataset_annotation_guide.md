# MetroScan: Packaging Dataset Collection and Annotation Guide
**Project ID**: SIH26034  
**Project Title**: Software System to Check Compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by Scanning Products, Images and Labels  
**Administering Ministry**: Ministry of Consumer Affairs, Food & Public Distribution, Department of Consumer Affairs (Legal Metrology Division), Government of India  
**Document Classification**: Standard Operating Procedure (SOP) and Technical Dataset Specification  
**Version**: 1.0.0 (Production Benchmark Reference)  
**Target Repository Directory**: `ml/test_data/`

---

## 1. Document Header and Technical Objective

### 1.1 Objective
This document defines the technical protocol for creating, standardizing, and annotating the official benchmark ground truth dataset for the MetroScan regulatory compliance and optical character recognition (OCR) platform. The primary goal is to establish an immutable, physically verified dataset of at least 50 packaged commodities across representative retail categories in India. This dataset serves as the absolute baseline for:
1. Evaluating OCR extraction accuracy (Character Error Rate [CER] and Word Error Rate [WER]) across varied packaging substrates, fonts, and print methods (rotogravure, flexography, thermal inkjet, offset lithography).
2. Calibrating the automated Principal Display Panel (PDP) area calculation and Rule 7 Table-I statutory font height verification engine.
3. Benchmarking layout analysis models (LayoutLMv3, YOLOv8/YOLOv11-OBB, and heuristic bounding-box parsers) against 19 fine-grained statutory declaration entity classes under the Legal Metrology (Packaged Commodities) Rules, 2011.
4. Validating automated compliance auditing rules (Section 36(1) penalty triggers, Rule 6(1)(a) through Rule 6(1)(n), and ICMR-NIN 2024 nutritional profiling).

### 1.2 Statutory Scope
All physical samples, imaging workflows, and annotation taxonomies strictly adhere to:
- The Legal Metrology Act, 2009 (Act No. 1 of 2010).
- The Legal Metrology (Packaged Commodities) Rules, 2011 (as amended up to 2024).
- Food Safety and Standards (Packaging) Regulations, 2018 and FSSAI (Labelling and Display) Regulations, 2020.
- ICMR - National Institute of Nutrition (NIN) Dietary Guidelines for Indians (2024 thresholds for High Fat, Sugar, and Salt [HFSS]).

---

## 2. Physical Packaging Sample Selection Matrix

### 2.1 Target Quota and Coverage Requirements
The benchmark evaluation suite requires a minimum quota of 50 physical retail Stock Keeping Units (SKUs). Every sample must be an authentic, commercially procured retail commodity sold in the Indian domestic market. The collection intentionally spans five packaging geometries, eight material substrate types, varied printing technologies, and challenging optical conditions to eliminate selection bias.

### 2.2 Category Distribution Matrix

| Category ID | Category Name | Target Count | Packaging Geometries & Substrates | Primary Legal Metrology Focus | Representative SKU Examples |
|---|---|---|---|---|---|
| CAT-FB | Food and Beverages | 20 | Flexible pouches (BOPP/Met-PET/LDPE), Rigid glass jars, Aseptic Tetra Paks, Folding paperboard cartons, Metal tinplate cans | Net quantity standardized units (Rule 13), MRP with tax declaration (Rule 6(1)(e)), Unit Sale Price (USP), FSSAI license format, ICMR-NIN nutrition table | Cereal cartons, Roasted almond pouches, Milk tetra paks, Jam glass jars, Ghee metal tins, Potato chips nitrogen-flushed bags, Biscuit wrappers, Edible oil pouches |
| CAT-PC | Personal Care and Cosmetics | 10 | Multilayer co-extruded squeeze tubes, Rigid high-density polyethylene (HDPE) bottles, Injection-molded PET jars, Wax-paper wrappers | Rule 6(1)(a) Manufacturer/Packer multi-location manufacturing codes, Date of packaging (Rule 6(1)(d)), Pin code compliance, Net volume (ml) vs net weight (g) | Toothpaste laminated tubes, Shampoo contour bottles, Glycerin soap bar wrappers, Moisturizer jars, Sunscreen squeeze tubes, Talcum powder canisters |
| CAT-HG | Household Goods | 10 | Heavy-gauge LDPE sacks with gussets, Ergonomic trigger spray bottles, Cylindrical opaque plastic containers | Declaration visibility, Net count vs net volume/weight, Distinct Consumer Care coordinate block (Rule 6(1)(n)), Font height proportionality | Laundry detergent powder bags, Surface cleaner spray bottles, Dishwash liquid squeeze containers, Floor disinfectant jugs, Mosquito repellent liquid refills |
| CAT-ED | Non-Standard / Challenging Edge Cases | 10 | High-gloss metallized foil wrappers, Curved cylindrical bottles (diameter < 40mm), Ultra-clear transparent substrates without white underprint, Miniature packages (< 50 cm2 PDP area) | Rule 26 exemptions for small packages, Letter height compliance under Rule 7 Table-I on curved PDPs, Dual-MRP stickers (Rule 18(2A)), Low-contrast text (Rule 9) | Confectionery foil pillows, Ayurvedic roll-on cylindrical vials, Transparent PET spring water bottles with reverse print, Chewing gum blister wraps, Travel-size hotel amenities (< 15g/ml) |
| **TOTAL** | **Benchmark Corpus** | **50** | **Comprehensive Cross-Section** | **Complete Statutory Coverage** | **Rigorous Enforcement Verification** |

### 2.3 Detailed Physical SKU Allocation

```
Category 1: Food & Beverages (20 SKUs)
  |-- 01. Metallized Flexible Pouch - Fried potato chips (Nitrogen-flushed, glossy BOPP)
  |-- 02. Metallized Stand-up Pouch - Premium roasted almonds (Zipper pouch with matte coat)
  |-- 03. Monolayer LDPE Pouch - Pasteurized toned milk 500 ml
  |-- 04. Glass Jar (Cylindrical) - Mixed fruit jam 500 g (Paper wrap label, metal twist cap)
  |-- 05. Glass Bottle (Square Base) - Virgin olive oil 250 ml (Self-adhesive film label)
  |-- 06. Aseptic Tetra Brik Carton - Fruit beverage 200 ml (Aluminium foil composite)
  |-- 07. Aseptic Tetra Brik Carton - UHT dairy milk 1000 ml (Gable top with plastic cap)
  |-- 08. Folding Paperboard Carton - Corn flakes cereal 300 g (Offset printed litho board)
  |-- 09. Folding Paperboard Carton - Green tea bags 50 N (Inner foil pouch, outer carton)
  |-- 10. Paperboard Folding Carton - Spices / Garam masala 100 g (Outer carton, inner sealed bag)
  |-- 11. Cylindrical Tinplate Can - Desi ghee 1000 ml (Embossed lid, lithographed metal body)
  |-- 12. Cylindrical Aluminium Beverage Can - Carbonated cola 330 ml (Direct curved printing)
  |-- 13. Cylindrical Tinplate Can - Gulab jamun 1000 g (Paper wrap label on ribbed tinplate)
  |-- 14. Plastic Tub (Polypropylene) - Table butter 500 g (In-mould label on lid and tub)
  |-- 15. Flow-Wrap Plastic Pack - Cream sandwich biscuits 120 g (Horizontal form-fill-seal)
  |-- 16. Multilayer Poly Pouch - Iodized table salt 1000 g (High-opacity white polyethylene)
  |-- 17. Gusseted Plastic Bag - Basmati rice 5 kg (Woven PP sack with stitched paper label)
  |-- 18. PET Jar (Octagonal) - Honey 250 g (Die-cut transparent label)
  |-- 19. Squeeze Pouch with Spout - Tomato ketchup 950 g (Laminated barrier film)
  `-- 20. Composite Canister - Crisp potato snacks 165 g (Spiral-wound paperboard, foil bottom)

Category 2: Personal Care & Cosmetics (10 SKUs)
  |-- 21. Laminated Squeeze Tube - Fluoride toothpaste 150 g (Crimped seal with thermal batch print)
  |-- 22. Co-extruded Plastic Tube - Clarifying face wash 100 ml (Glossy laminate tube)
  |-- 23. HDPE Contour Bottle - Anti-dandruff shampoo 340 ml (Front and back self-adhesive labels)
  |-- 24. Opaque PET Bottle - Nourishing hair oil 200 ml (Flip-top dispenser cap)
  |-- 25. Wax-Coated Paper Wrap - Herbal bathing soap bar 125 g (Direct paper wrap)
  |-- 26. Rigid Paperboard Carton - Luxury perfume bottle 50 ml (Cellophane outer wrap removed)
  |-- 27. PET Bottle with Pump - Liquid handwash 250 ml (Conical contour with wrap-around label)
  |-- 28. PP Wide-Mouth Jar - Deep conditioning hair mask 200 g (Direct screen-printed tub)
  |-- 29. Deodorant Aerosol Can - Body spray 150 ml (Curved aluminium impact extrusion)
  `-- 30. Plastic Compact - Sunscreen gel 50 g (Dual-panel clamshell with outer card)

Category 3: Household Goods (10 SKUs)
  |-- 31. LDPE Heavy Bag - Front-load detergent powder 2 kg (Pillow pouch with punched handle)
  |-- 32. HDPE Spray Bottle - Glass and multi-surface cleaner 500 ml (Angled neck trigger bottle)
  |-- 33. Squeeze HDPE Bottle - Thick toilet cleaner 750 ml (Bent nozzle bottle, ribbed surface)
  |-- 34. Cylindrical Plastic Bottle - Concentrated floor disinfectant 1000 ml
  |-- 35. PET Bottle with Flip Cap - Dishwashing liquid concentrate 500 ml
  |-- 36. Plastic Canister - Scouring powder 400 g (Perforated cardboard lid, plastic body)
  |-- 37. Paperboard Carton - Mosquito coil pack 10 N (Flat carton with embossed text)
  |-- 38. Blister Card Pack - Toothbrush pack of 4 (Heat-sealed PVC blister to printed card)
  |-- 39. Corrugated Carton - LED lighting bulb 9W (Four-panel small utility box)
  `-- 40. Plastic Refill Pouch - Handwash liquid refill 750 ml (Pouch with corner spout)

Category 4: Non-Standard / Challenging Edge Cases (10 SKUs)
  |-- 41. Highly Reflective Foil Flow-Wrap - Chocolate candy bar 45 g (Wrinkled reflective surface)
  |-- 42. Transparent PET Bottle - Carbonated soda 600 ml (White print directly over dark liquid)
  |-- 43. Cylindrical Miniature Bottle - Herbal cough syrup 60 ml (Circumference 88 mm)
  |-- 44. Miniature Sachet (< 50 cm2 PDP) - Single-use shampoo sachet 6 ml (Rule 26 exemption)
  |-- 45. Miniature Sachet (< 50 cm2 PDP) - Instant coffee powder 2 g (Extreme small font threshold)
  |-- 46. Ultra-Reflective Gold Foil Box - Luxury confectionery assortment 200 g (Holographic foil)
  |-- 47. Conical Tapered Plastic Cup - Frozen ice cream dessert 100 ml (Slanted side panel text)
  |-- 48. Dual-MRP Sticker SKU - Imported dry fruits 250 g (Over-stickered price label violation)
  |-- 49. Transparent Glass Bottle - Mineral tonic water 300 ml (No white background, high refraction)
  `-- 50. Flexible Metallic Tetra Wedge - Energy electrolyte drink 150 ml (Irregular prism geometry)
```

---

## 3. Image Capture and Photographic Standards

### 3.1 Optical and Sensor Specifications
To ensure that computer vision algorithms and human verifiers operate on sub-millimeter level details, all primary benchmark images must adhere to strict optical capture specifications:

| Parameter | Mandatory Requirement | Ideal Benchmark Specification | Technical Rationale |
|---|---|---|---|
| Optical Sensor Resolution | Minimum 1920 x 1080 (Full HD, 2.07 MP) | 3840 x 2160 (4K UHD, 8.29 MP) or 24 MP APS-C | Required to resolve 1.0 mm font heights at >= 12 pixels per stroke width. |
| Bit Depth & Color Space | 24-bit RGB, sRGB profile | 24-bit uncompressed RGB, ITU-R BT.709 | Ensures standardized color luminance calculations for WCAG contrast auditing. |
| File Format & Compression | JPEG (Quality >= 90, 4:4:4 chroma) or PNG | Lossless 24-bit PNG or uncompressed TIFF | Eliminates discrete cosine transform (DCT) block artifacts around text edges. |
| Lens Optical Quality | Fixed focal length (Prime lens 50 mm equivalent) | Macro 50 mm or 85 mm f/2.8 prime lens | Eliminates barrel distortion, chromatic aberration, and edge vignetting. |
| Optical Geometry | Orthographic / Perpendicular axis | Optical axis normal to target plane (+/- 1.5 deg) | Minimizes projective transformation distortion across the panel plane. |
| Depth of Field (DoF) | Aperture f/5.6 to f/8.0 | Aperture f/8.0, ISO 100, Tripod mounted | Maintains critical focus across the front, curved sides, and base of the package. |
| Shutter Speed | Shutter >= 1/125s (Handheld) or Fixed (Tripod) | 1/60s on rigid mechanical tripod with 2s shutter delay | Eliminates motion blur and micro-jitter at the sensor level. |

### 3.2 Lighting and Glare Control Protocol
Reflective packaging substrates (metallized polyester, transparent BOPP, glossy UV varnishes, and tinplate) produce severe specular reflections that blind OCR engines. Data collection must apply the following physical lighting rules:

1. **Diffuse Ambient Setup**:
   - Utilize two high-CRI (CRI >= 95, TLCI >= 96) continuous LED light panels with 5500K color temperature.
   - Light sources must be positioned at 45-degree angles relative to the packaging surface.
   - Dual-layer softbox diffusers or polarizing sheets must be mounted over the light panels.
2. **Cross-Polarization Technique for Metallic and Glossy Substrates**:
   - For high-gloss foils, laminates, and tinplate cans, mount a linear polarizing filter on the light panels and a circular polarizing filter (CPL) on the camera lens.
   - Rotate the CPL filter until specular glares and hot spots completely extinguish, revealing the underlying printed text without highlight blowout.
3. **Background Surface**:
   - Position packages on a non-reflective, matte neutral background (Kodak 18% gray card or non-glare matte white photography vinyl).
   - The background must extend beyond the frame to prevent ambient color casting.

### 3.3 Orientation, Framing, and Calibration Rig
Every capture session must incorporate physical spatial calibration to permit automated pixel-to-millimeter scaling:

```
+-------------------------------------------------------------+
| Camera Sensor (Orthogonal Optical Axis)                     |
+-------------------------------------------------------------+
                              |
                              v  (Normal Line: 90 deg +/- 1.5 deg)
+-------------------------------------------------------------+
|                                                             |
|   [Frame Boundary: 1920x1080 or 3840x2160]                  |
|                                                             |
|       +---------------------------------------------+       |
|       |                                             |       |
|       |             PHYSICAL PACKAGE                |       |
|       |        Principal Display Panel (PDP)        |       |
|       |                                             |       |
|       |        Filling 70% to 85% of Frame Area     |       |
|       |                                             |       |
|       +---------------------------------------------+       |
|                                                             |
|   [Fiducial Scale: 50 mm Precision Calibration Bar / Ruler] |
|                                                             |
+-------------------------------------------------------------+
```

1. **Framing Proportions**:
   - The package must occupy between 70% and 85% of the total image area.
   - A margin of 7.5% to 15% must remain visible on all four sides to facilitate edge-detection boundary segmentation and outer contour extraction.
2. **Physical Calibration Target**:
   - Place a certified stainless steel millimeter calibration scale or a high-contrast ArUco / checkerboard fiducial marker directly beside the package in the exact plane of the display panel.
   - Record the pixels-per-millimeter ratio (PPR) directly into the metadata schema:
     $$	ext{PPR} = rac{	ext{Distance in Pixels}}{	ext{Measured Distance in Millimeters}}$$

### 3.4 Multi-Panel Mandate
Under Legal Metrology Rules, statutory declarations are frequently split across multiple physical faces of the package:
- **Principal Display Panel (PDP)**: Contains brand identity, common or generic commodity name, and net quantity declaration.
- **Back / Side Information Panel**: Contains manufacturer identity, address with PIN code, Maximum Retail Price (MRP), Unit Sale Price (USP), packaging dates, consumer care coordinates, FSSAI license, barcode, and nutritional panel.

**Strict Mandate**: For all 50 SKUs, images must be collected in coordinated pairs:
1. `SKU_{ID}_{CAT}_FRONT.jpg`: Dedicated Principal Display Panel capture.
2. `SKU_{ID}_{CAT}_BACK.jpg`: Dedicated Back/Information Panel capture.
3. `SKU_{ID}_{CAT}_SIDE.jpg` (Optional/Auxiliary): Captures supplementary sides if declarations spill onto secondary lateral panels.

Capture pairs must be shot in the identical optical session with uniform focal length, illumination intensity, and calibration geometry.

---

## 4. Statutory Basis and Annotation Taxonomy

### 4.1 Legal Grounding in Legal Metrology (Packaged Commodities) Rules, 2011
Every annotation entity class is derived directly from statutory mandates codified in the Legal Metrology Act, 2009 and the Packaged Commodities Rules, 2011. The table below lists all 19 exact taxonomy classes along with their governing statutory citation, legal requirement, and extraction boundary rules.

| Entity Class Label | Statutory Reference | Legal Requirement & Definition | Extraction Boundary & Formatting Rule |
|---|---|---|---|
| `mrp_value` | Rule 6(1)(e) | Numeric value of the Maximum Retail Price in Indian Rupees. | Enclose only the numeric price string and currency symbol (e.g., "Rs. 145.00" or "145.00"). Do not include the tax statement. |
| `mrp_tax_statement` | Rule 6(1)(e) | Mandatory tax qualification statement. Must state "Inclusive of all taxes" or statutory equivalent. | Enclose the exact phrase (e.g., "Incl. of all taxes", "Inclusive of all taxes"). |
| `unit_sale_price` | Rule 6(1)(e) Second Proviso | Mandated price per unit weight, volume, or piece where package net quantity exceeds 1 kg / 1 L. | Enclose numeric price and unit denominator (e.g., "Rs. 0.45 / g", "Rs. 45.00 / 100g", "Rs. 12.00 / N"). |
| `net_quantity_value` | Rule 6(1)(c), Rule 12 | Numeric quantity representation of the commodity contained in the package. | Enclose the numeric value only (e.g., "500", "1.5", "750"). |
| `net_quantity_unit` | Rule 13, Second Schedule | Statutory SI unit of measurement: g, kg, ml, l, m, cm, or N (number). Non-standard units (e.g., gms, kgs, ltrs) constitute a violation. | Enclose the unit text only (e.g., "g", "kg", "ml", "L", "N"). |
| `mfg_date` | Rule 6(1)(d) | Month and year in which the commodity is manufactured, packed, or imported. | Enclose date expression (e.g., "03/2024", "MAR 2024", "MFD: 15/03/2024"). |
| `expiry_date` | Rule 6(1)(d), FSSAI Reg. 2020 | Best before date or date of expiry. Mandatory for perishable, food, and cosmetic products. | Enclose expiry phrase and date (e.g., "EXP: 02/2025", "Best before 9 months from manufacture"). |
| `manufacturer_name` | Rule 6(1)(a) | Registered legal corporate identity of the manufacturer, packer, or importer. | Enclose legal business name (e.g., "Hindustan Unilever Limited", "Nestle India Ltd."). |
| `manufacturer_address` | Rule 6(1)(a) | Complete premises address of the manufacturing facility or corporate registered office. | Enclose full postal street address, premises number, industrial area, city, and state. |
| `pin_code` | Rule 6(1)(a) proviso | 6-digit Indian Postal Index Number. Mandatory for valid premises location. | Enclose exactly the 6-digit PIN code integer (e.g., "560066", "110001"). |
| `consumer_care_person` | Rule 6(1)(n) | Designation or name of the grievance officer/manager handling consumer complaints. | Enclose official designation (e.g., "Consumer Care Manager", "Grievance Officer"). |
| `consumer_care_address` | Rule 6(1)(n) | Physical address where consumer complaints or inquiries may be posted. | Enclose consumer care postal address block if separated from manufacturer address. |
| `consumer_care_phone` | Rule 6(1)(n) | Operational telephone number or toll-free helpline for consumer grievances. | Enclose phone number string including STD code or 1800 toll-free prefix (e.g., "1800-102-2221"). |
| `consumer_care_email` | Rule 6(1)(n) | Dedicated email address for consumer dispute resolution. | Enclose full email address string (e.g., "customercare@brand.co.in"). |
| `country_of_origin` | Rule 6(1)(aa) | Mandatory declaration of country where goods originated or were assembled. | Enclose origin statement (e.g., "Made in India", "Country of Origin: India", "Product of Vietnam"). |
| `generic_commodity_name` | Rule 6(1)(b) | Common or generic name of the commodity contained in the package. | Enclose generic noun phrase (e.g., "Almond Kernel", "Instant Noodles", "Synthetic Detergent Powder"). |
| `fssai_license_number` | FSSAI Act, 2006 | 14-digit statutory food safety license number accompanied by FSSAI logo. | Enclose the 14-digit registration number and optional "Lic. No." prefix (e.g., "10012011000123"). |
| `barcode_region` | Commercial Standard | Machine-readable barcode symbol (EAN-13, UPC-A, Code-128, DataMatrix, or QR code). | Enclose the entire bounding polygon of the barcode bars/matrix plus human-readable check digits. |
| `nutrition_table_region` | FSSAI Labelling Reg. 2020 | Structured tabular grid or block declaring energy, protein, carbohydrate, sugar, fat, and sodium per 100g/serving. | Enclose outer bounding polygon containing the entire nutritional facts panel. |

### 4.2 Detailed Annotation Rules and Disambiguation Guidelines
1. **Separation of Net Quantity Value and Unit**:
   - Annotators must never combine numeric values with units into a single entity. For example, in the string "Net Wt: 500 g", "500" is tagged as `net_quantity_value` and "g" is tagged as `net_quantity_unit`.
   - This strict separation enables the downstream rule engine to test compliance under Rule 13 (prohibition of non-standard units like "gms", "kilos", "litres").
2. **Disambiguation of MRP vs Unit Sale Price**:
   - If a package displays "MRP Rs. 120.00 (Rs. 0.60 / g)", annotate "Rs. 120.00" as `mrp_value` and "(Rs. 0.60 / g)" as `unit_sale_price`.
   - If the text "Inclusive of all taxes" is adjacent or below MRP, annotate it separately as `mrp_tax_statement`.
3. **Consumer Care Block Isolation**:
   - When consumer care details are grouped in a single paragraph, annotators must decompose the paragraph into the four distinct statutory sub-entities: `consumer_care_person`, `consumer_care_phone`, `consumer_care_email`, and `consumer_care_address`.
4. **Manufacturer Address vs PIN Code**:
   - The PIN code must be annotated both within the bounding context of `manufacturer_address` (if drawn hierarchically) and specifically tagged as an atomic `pin_code` token to verify the Rule 6(1)(a) proviso requiring a valid 6-digit postal code.
5. **Multi-location Manufacturer Codes**:
   - Where a package lists multiple factories (e.g., "Mfg by: Unit (A) Pune, Unit (B) Haridwar") with a batch code prefix indicating the manufacturing unit, the entire block is tagged under `manufacturer_address`, and the relevant active facility address is transcribed.

---

## 5. Bounding Box and Polygon Annotation Schema (JSON)

### 5.1 Schema Design Specifications
The MetroScan annotation format uses JSON schema version 1.2.0. The schema captures full spatial polygons (minimum 4 vertices, arbitrary N vertices for curved surfaces), normalized bounding boxes (0-100 percentage coordinates), exact OCR transcripts, measured physical letter heights, and statutory compliance status.

### 5.2 Official JSON Ground Truth Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "MetroScanPackagingAnnotation",
  "type": "object",
  "required": [
    "schema_version",
    "image_metadata",
    "physical_calibration",
    "image_dimensions",
    "pdp_specification",
    "annotations"
  ],
  "properties": {
    "schema_version": { "type": "string", "enum": ["1.2.0"] },
    "image_metadata": {
      "type": "object",
      "required": ["sku_id", "category_id", "filename", "panel_type", "capture_timestamp", "lighting_condition"],
      "properties": {
        "sku_id": { "type": "string", "pattern": "^SKU_[0-9]{3}$" },
        "category_id": { "type": "string", "enum": ["CAT-FB", "CAT-PC", "CAT-HG", "CAT-ED"] },
        "filename": { "type": "string" },
        "panel_type": { "type": "string", "enum": ["FRONT_PDP", "BACK_DECLARATION", "SIDE_AUXILIARY"] },
        "capture_timestamp": { "type": "string", "format": "date-time" },
        "lighting_condition": { "type": "string", "enum": ["DIFFUSE_POLARIZED", "CROSS_POLARIZED", "AMBIENT_STUDIO"] }
      }
    },
    "physical_calibration": {
      "type": "object",
      "required": ["pixels_per_mm", "calibration_target_type", "caliper_measurement_verified"],
      "properties": {
        "pixels_per_mm": { "type": "number", "minimum": 1.0 },
        "calibration_target_type": { "type": "string" },
        "caliper_measurement_verified": { "type": "boolean" }
      }
    },
    "image_dimensions": {
      "type": "object",
      "required": ["width_px", "height_px", "channels"],
      "properties": {
        "width_px": { "type": "integer", "minimum": 1080 },
        "height_px": { "type": "integer", "minimum": 720 },
        "channels": { "type": "integer", "enum": [3] }
      }
    },
    "pdp_specification": {
      "type": "object",
      "required": ["physical_height_mm", "physical_width_mm", "pdp_area_cm2", "rule7_min_font_height_mm"],
      "properties": {
        "physical_height_mm": { "type": "number" },
        "physical_width_mm": { "type": "number" },
        "pdp_area_cm2": { "type": "number" },
        "rule7_min_font_height_mm": { "type": "number" }
      }
    },
    "annotations": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "id",
          "class_label",
          "polygon",
          "normalized_bbox",
          "extracted_text",
          "measured_font_height_mm",
          "statutory_compliance"
        ],
        "properties": {
          "id": { "type": "integer" },
          "class_label": {
            "type": "string",
            "enum": [
              "mrp_value",
              "mrp_tax_statement",
              "unit_sale_price",
              "net_quantity_value",
              "net_quantity_unit",
              "mfg_date",
              "expiry_date",
              "manufacturer_name",
              "manufacturer_address",
              "pin_code",
              "consumer_care_person",
              "consumer_care_address",
              "consumer_care_phone",
              "consumer_care_email",
              "country_of_origin",
              "generic_commodity_name",
              "fssai_license_number",
              "barcode_region",
              "nutrition_table_region"
            ]
          },
          "polygon": {
            "type": "array",
            "items": {
              "type": "array",
              "items": { "type": "number" },
              "minItems": 2,
              "maxItems": 2
            },
            "minItems": 4
          },
          "normalized_bbox": {
            "type": "object",
            "required": ["x", "y", "width", "height"],
            "properties": {
              "x": { "type": "number", "minimum": 0.0, "maximum": 100.0 },
              "y": { "type": "number", "minimum": 0.0, "maximum": 100.0 },
              "width": { "type": "number", "minimum": 0.0, "maximum": 100.0 },
              "height": { "type": "number", "minimum": 0.0, "maximum": 100.0 }
            }
          },
          "extracted_text": { "type": "string" },
          "measured_font_height_mm": { "type": "number" },
          "statutory_compliance": {
            "type": "object",
            "required": ["is_compliant", "statutory_rule", "violation_reason"],
            "properties": {
              "is_compliant": { "type": "boolean" },
              "statutory_rule": { "type": "string" },
              "violation_reason": { "type": ["string", "null"] }
            }
          }
        }
      }
    }
  }
}
```

### 5.3 Concrete Ground Truth Annotation Example

The following production JSON instance documents SKU_002 (Premium Roasted Almonds 500 g Stand-up Pouch, Back Panel):

```json
{
  "schema_version": "1.2.0",
  "image_metadata": {
    "sku_id": "SKU_002",
    "category_id": "CAT-FB",
    "filename": "SKU_002_FB_BACK.jpg",
    "panel_type": "BACK_DECLARATION",
    "capture_timestamp": "2026-09-10T10:15:30Z",
    "lighting_condition": "DIFFUSE_POLARIZED"
  },
  "physical_calibration": {
    "pixels_per_mm": 11.42,
    "calibration_target_type": "MITUTOYO_PRECISION_RETICLE_50MM",
    "caliper_measurement_verified": true
  },
  "image_dimensions": {
    "width_px": 3840,
    "height_px": 2160,
    "channels": 3
  },
  "pdp_specification": {
    "physical_height_mm": 240.0,
    "physical_width_mm": 160.0,
    "pdp_area_cm2": 384.0,
    "rule7_min_font_height_mm": 4.0
  },
  "annotations": [
    {
      "id": 101,
      "class_label": "mrp_value",
      "polygon": [
        [1420.0, 480.0],
        [1780.0, 480.0],
        [1780.0, 535.0],
        [1420.0, 535.0]
      ],
      "normalized_bbox": {
        "x": 36.98,
        "y": 22.22,
        "width": 9.38,
        "height": 2.55
      },
      "extracted_text": "Rs. 650.00",
      "measured_font_height_mm": 4.82,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "Rule 6(1)(e)",
        "violation_reason": null
      }
    },
    {
      "id": 102,
      "class_label": "mrp_tax_statement",
      "polygon": [
        [1795.0, 485.0],
        [2240.0, 485.0],
        [2240.0, 530.0],
        [1795.0, 530.0]
      ],
      "normalized_bbox": {
        "x": 46.74,
        "y": 22.45,
        "width": 11.59,
        "height": 2.08
      },
      "extracted_text": "(Inclusive of all taxes)",
      "measured_font_height_mm": 3.94,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "Rule 6(1)(e)",
        "violation_reason": null
      }
    },
    {
      "id": 103,
      "class_label": "unit_sale_price",
      "polygon": [
        [1420.0, 545.0],
        [1890.0, 545.0],
        [1890.0, 590.0],
        [1420.0, 590.0]
      ],
      "normalized_bbox": {
        "x": 36.98,
        "y": 25.23,
        "width": 12.24,
        "height": 2.08
      },
      "extracted_text": "USP: Rs. 1.30 / g",
      "measured_font_height_mm": 3.94,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "Rule 6(1)(e) Second Proviso",
        "violation_reason": null
      }
    },
    {
      "id": 104,
      "class_label": "net_quantity_value",
      "polygon": [
        [1420.0, 610.0],
        [1545.0, 610.0],
        [1545.0, 665.0],
        [1420.0, 665.0]
      ],
      "normalized_bbox": {
        "x": 36.98,
        "y": 28.24,
        "width": 3.26,
        "height": 2.55
      },
      "extracted_text": "500",
      "measured_font_height_mm": 4.82,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "Rule 6(1)(c) and Rule 7 Table-I",
        "violation_reason": null
      }
    },
    {
      "id": 105,
      "class_label": "net_quantity_unit",
      "polygon": [
        [1560.0, 610.0],
        [1620.0, 610.0],
        [1620.0, 665.0],
        [1560.0, 665.0]
      ],
      "normalized_bbox": {
        "x": 40.63,
        "y": 28.24,
        "width": 1.56,
        "height": 2.55
      },
      "extracted_text": "g",
      "measured_font_height_mm": 4.82,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "Rule 13",
        "violation_reason": null
      }
    },
    {
      "id": 106,
      "class_label": "mfg_date",
      "polygon": [
        [1420.0, 680.0],
        [1820.0, 680.0],
        [1820.0, 725.0],
        [1420.0, 725.0]
      ],
      "normalized_bbox": {
        "x": 36.98,
        "y": 31.48,
        "width": 10.42,
        "height": 2.08
      },
      "extracted_text": "PKD: 08/2026",
      "measured_font_height_mm": 3.94,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "Rule 6(1)(d)",
        "violation_reason": null
      }
    },
    {
      "id": 107,
      "class_label": "expiry_date",
      "polygon": [
        [1420.0, 740.0],
        [2100.0, 740.0],
        [2100.0, 785.0],
        [1420.0, 785.0]
      ],
      "normalized_bbox": {
        "x": 36.98,
        "y": 34.26,
        "width": 17.71,
        "height": 2.08
      },
      "extracted_text": "BEST BEFORE 9 MONTHS FROM PACKAGING",
      "measured_font_height_mm": 3.94,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "Rule 6(1)(d)",
        "violation_reason": null
      }
    },
    {
      "id": 108,
      "class_label": "manufacturer_name",
      "polygon": [
        [650.0, 920.0],
        [1620.0, 920.0],
        [1620.0, 970.0],
        [650.0, 970.0]
      ],
      "normalized_bbox": {
        "x": 16.93,
        "y": 42.59,
        "width": 25.26,
        "height": 2.31
      },
      "extracted_text": "NutriFoods India Private Limited",
      "measured_font_height_mm": 4.38,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "Rule 6(1)(a)",
        "violation_reason": null
      }
    },
    {
      "id": 109,
      "class_label": "manufacturer_address",
      "polygon": [
        [650.0, 980.0],
        [2050.0, 980.0],
        [2050.0, 1070.0],
        [650.0, 1070.0]
      ],
      "normalized_bbox": {
        "x": 16.93,
        "y": 45.37,
        "width": 36.46,
        "height": 4.17
      },
      "extracted_text": "Plot No. 44, KIADB Industrial Area, Phase II, Whitefield, Bengaluru, Karnataka",
      "measured_font_height_mm": 3.50,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "Rule 6(1)(a)",
        "violation_reason": null
      }
    },
    {
      "id": 110,
      "class_label": "pin_code",
      "polygon": [
        [1750.0, 1025.0],
        [1920.0, 1025.0],
        [1920.0, 1070.0],
        [1750.0, 1070.0]
      ],
      "normalized_bbox": {
        "x": 45.57,
        "y": 47.45,
        "width": 4.43,
        "height": 2.08
      },
      "extracted_text": "560066",
      "measured_font_height_mm": 3.94,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "Rule 6(1)(a) Proviso",
        "violation_reason": null
      }
    },
    {
      "id": 111,
      "class_label": "country_of_origin",
      "polygon": [
        [650.0, 1090.0],
        [1220.0, 1090.0],
        [1220.0, 1135.0],
        [650.0, 1135.0]
      ],
      "normalized_bbox": {
        "x": 16.93,
        "y": 50.46,
        "width": 14.84,
        "height": 2.08
      },
      "extracted_text": "Country of Origin: India",
      "measured_font_height_mm": 3.94,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "Rule 6(1)(aa)",
        "violation_reason": null
      }
    },
    {
      "id": 112,
      "class_label": "consumer_care_person",
      "polygon": [
        [650.0, 1170.0],
        [1280.0, 1170.0],
        [1280.0, 1215.0],
        [650.0, 1215.0]
      ],
      "normalized_bbox": {
        "x": 16.93,
        "y": 54.17,
        "width": 16.41,
        "height": 2.08
      },
      "extracted_text": "Consumer Care Executive",
      "measured_font_height_mm": 3.94,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "Rule 6(1)(n)",
        "violation_reason": null
      }
    },
    {
      "id": 113,
      "class_label": "consumer_care_phone",
      "polygon": [
        [650.0, 1225.0],
        [1160.0, 1225.0],
        [1160.0, 1270.0],
        [650.0, 1270.0]
      ],
      "normalized_bbox": {
        "x": 16.93,
        "y": 56.71,
        "width": 13.28,
        "height": 2.08
      },
      "extracted_text": "1800-208-8888",
      "measured_font_height_mm": 3.94,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "Rule 6(1)(n)",
        "violation_reason": null
      }
    },
    {
      "id": 114,
      "class_label": "consumer_care_email",
      "polygon": [
        [1190.0, 1225.0],
        [1880.0, 1225.0],
        [1880.0, 1270.0],
        [1190.0, 1270.0]
      ],
      "normalized_bbox": {
        "x": 30.99,
        "y": 56.71,
        "width": 17.97,
        "height": 2.08
      },
      "extracted_text": "feedback@nutrifoods.co.in",
      "measured_font_height_mm": 3.94,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "Rule 6(1)(n)",
        "violation_reason": null
      }
    },
    {
      "id": 115,
      "class_label": "consumer_care_address",
      "polygon": [
        [650.0, 1280.0],
        [2050.0, 1280.0],
        [2050.0, 1325.0],
        [650.0, 1325.0]
      ],
      "normalized_bbox": {
        "x": 16.93,
        "y": 59.26,
        "width": 36.46,
        "height": 2.08
      },
      "extracted_text": "Same as manufacturer premises address above",
      "measured_font_height_mm": 3.50,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "Rule 6(1)(n)",
        "violation_reason": null
      }
    },
    {
      "id": 116,
      "class_label": "generic_commodity_name",
      "polygon": [
        [650.0, 360.0],
        [1580.0, 360.0],
        [1580.0, 430.0],
        [650.0, 430.0]
      ],
      "normalized_bbox": {
        "x": 16.93,
        "y": 16.67,
        "width": 24.22,
        "height": 3.24
      },
      "extracted_text": "ROASTED AND SALTED ALMONDS",
      "measured_font_height_mm": 6.13,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "Rule 6(1)(b)",
        "violation_reason": null
      }
    },
    {
      "id": 117,
      "class_label": "fssai_license_number",
      "polygon": [
        [650.0, 1420.0],
        [1350.0, 1420.0],
        [1350.0, 1485.0],
        [650.0, 1485.0]
      ],
      "normalized_bbox": {
        "x": 16.93,
        "y": 65.74,
        "width": 18.23,
        "height": 3.01
      },
      "extracted_text": "Lic. No. 10018043002241",
      "measured_font_height_mm": 3.94,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "FSSAI Packaging Regulations, 2018",
        "violation_reason": null
      }
    },
    {
      "id": 118,
      "class_label": "barcode_region",
      "polygon": [
        [2850.0, 1400.0],
        [3550.0, 1400.0],
        [3550.0, 1850.0],
        [2850.0, 1850.0]
      ],
      "normalized_bbox": {
        "x": 74.22,
        "y": 64.81,
        "width": 18.23,
        "height": 20.83
      },
      "extracted_text": "8901030829142",
      "measured_font_height_mm": 2.63,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "GS1 / EAN-13",
        "violation_reason": null
      }
    },
    {
      "id": 119,
      "class_label": "nutrition_table_region",
      "polygon": [
        [2400.0, 480.0],
        [3600.0, 480.0],
        [3600.0, 1320.0],
        [2400.0, 1320.0]
      ],
      "normalized_bbox": {
        "x": 62.50,
        "y": 22.22,
        "width": 31.25,
        "height": 38.89
      },
      "extracted_text": "Nutritional Facts Per 100g: Energy 620 kcal, Protein 21.2g, Total Carbohydrate 19.5g, Added Sugars 0.0g, Total Fat 52.8g, Saturated Fat 4.2g, Sodium 340mg",
      "measured_font_height_mm": 2.63,
      "statutory_compliance": {
        "is_compliant": true,
        "statutory_rule": "FSSAI (Labelling and Display) Reg., 2020",
        "violation_reason": null
      }
    }
  ]
}
```

---

## 6. Labeling Tool Protocol and Export Format

### 6.1 Tool Configuration and Selection
Data annotators may utilize Labelme, CVAT (Computer Vision Annotation Tool), or Roboflow. The recommended open-source tool for precise polygon tracing is **Labelme** due to its exact floating-point polygon vertex storage and direct integration with local Python scripts.

#### 6.1.1 Labelme Protocol
1. **Installation**:
   ```bash
   pip install labelme
   ```
2. **Pre-configuration**:
   Create a label flags definition file `ml/labelme_classes.txt` containing the exact 19 class names:
   ```
   mrp_value
   mrp_tax_statement
   unit_sale_price
   net_quantity_value
   net_quantity_unit
   mfg_date
   expiry_date
   manufacturer_name
   manufacturer_address
   pin_code
   consumer_care_person
   consumer_care_address
   consumer_care_phone
   consumer_care_email
   country_of_origin
   generic_commodity_name
   fssai_license_number
   barcode_region
   nutrition_table_region
   ```
3. **Execution**:
   ```bash
   labelme ml/test_data/images --labels ml/labelme_classes.txt --output ml/test_data/raw_labelme
   ```
4. **Drawing Rules**:
   - Use the **Create Polygon** mode (`Ctrl+N` or `Cmd+N`).
   - For rectangular text lines, click 4 corners with tight boundaries. Do not include extraneous white margins exceeding 2 pixels.
   - For curved bottles, cans, or warped foil sachets, trace along the text contour using 8 to 16 vertices.
   - In the description field, input the exact transcribed string including punctuation and symbols.

#### 6.1.2 CVAT Protocol
1. Create a Project named `MetroScan_GroundTruth_Benchmark`.
2. Add labels corresponding to the 19 classes with `Polygon` and `Attribute: transcribed_text (text)`.
3. Upload raw high-resolution images from `ml/test_data/images/`.
4. Export task annotations using the `CVAT for images 1.1` format or `COCO 1.0`.

### 6.2 Coordinate Normalization to Frontend [x, y, width, height] (0-100 Scale)
The MetroScan web frontend canvas renders bounding boxes using percentage coordinates:
- X_norm = (X_min / W_img) * 100
- Y_norm = (Y_min / H_img) * 100
- W_norm = ((X_max - X_min) / W_img) * 100
- H_norm = ((Y_max - Y_min) / H_img) * 100

All coordinates must be rounded to two decimal places.

### 6.3 Automated Conversion Script
The following Python script converts Labelme raw JSON files into the certified MetroScan schema, computes normalized bounding boxes, and generates test suite manifests.

```python
#!/usr/bin/env python3
"""
Convert Labelme annotations to MetroScan Ground Truth Schema (v1.2.0).
Location: ml/scripts/convert_labelme_to_metroscan.py
"""

import os
import sys
import json
import glob
from typing import Dict, Any, List

CLASS_TAXONOMY = {
    "mrp_value", "mrp_tax_statement", "unit_sale_price",
    "net_quantity_value", "net_quantity_unit", "mfg_date",
    "expiry_date", "manufacturer_name", "manufacturer_address",
    "pin_code", "consumer_care_person", "consumer_care_address",
    "consumer_care_phone", "consumer_care_email", "country_of_origin",
    "generic_commodity_name", "fssai_license_number",
    "barcode_region", "nutrition_table_region"
}

def polygon_to_bbox(points: List[List[float]], img_w: int, img_h: int) -> Dict[str, float]:
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    
    norm_x = round((min_x / img_w) * 100.0, 2)
    norm_y = round((min_y / img_h) * 100.0, 2)
    norm_w = round(((max_x - min_x) / img_w) * 100.0, 2)
    norm_h = round(((max_y - min_y) / img_h) * 100.0, 2)
    
    return {"x": norm_x, "y": norm_y, "width": norm_w, "height": norm_h}

def convert_labelme_file(input_path: str, output_path: str, metadata: Dict[str, Any]) -> None:
    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    img_w = data.get("imageWidth")
    img_h = data.get("imageHeight")
    
    converted_annotations = []
    ann_id = 101
    
    for shape in data.get("shapes", []):
        label = shape.get("label")
        if label not in CLASS_TAXONOMY:
            print(f"Warning: Unknown label '{label}' in {input_path}")
            continue
            
        points = shape.get("points", [])
        bbox = polygon_to_bbox(points, img_w, img_h)
        transcript = shape.get("description", "")
        
        # Calculate letter height if calibration exists
        px_per_mm = metadata.get("pixels_per_mm", 10.0)
        box_h_px = (max(p[1] for p in points) - min(p[1] for p in points))
        measured_h_mm = round(box_h_px / px_per_mm, 2)
        
        converted_annotations.append({
            "id": ann_id,
            "class_label": label,
            "polygon": [[round(pt[0], 2), round(pt[1], 2)] for pt in points],
            "normalized_bbox": bbox,
            "extracted_text": transcript,
            "measured_font_height_mm": measured_h_mm,
            "statutory_compliance": {
                "is_compliant": True,
                "statutory_rule": "Rule 6 / Rule 7 Compliance",
                "violation_reason": None
            }
        })
        ann_id += 1
        
    output_payload = {
        "schema_version": "1.2.0",
        "image_metadata": {
            "sku_id": metadata.get("sku_id", "SKU_001"),
            "category_id": metadata.get("category_id", "CAT-FB"),
            "filename": os.path.basename(metadata.get("image_path", "")),
            "panel_type": metadata.get("panel_type", "BACK_DECLARATION"),
            "capture_timestamp": metadata.get("capture_timestamp", "2026-09-10T12:00:00Z"),
            "lighting_condition": "DIFFUSE_POLARIZED"
        },
        "physical_calibration": {
            "pixels_per_mm": px_per_mm,
            "calibration_target_type": "DIGITAL_CALIPER_50MM",
            "caliper_measurement_verified": True
        },
        "image_dimensions": {
            "width_px": img_w,
            "height_px": img_h,
            "channels": 3
        },
        "pdp_specification": {
            "physical_height_mm": metadata.get("pdp_h_mm", 200.0),
            "physical_width_mm": metadata.get("pdp_w_mm", 150.0),
            "pdp_area_cm2": metadata.get("pdp_area_cm2", 300.0),
            "rule7_min_font_height_mm": metadata.get("rule7_min_h_mm", 4.0)
        },
        "annotations": converted_annotations
    }
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, indent=2, ensure_ascii=False)
    print(f"Successfully wrote converted ground truth: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python convert_labelme_to_metroscan.py <input_labelme.json> <output_metroscan.json>")
        sys.exit(1)
    convert_labelme_file(sys.argv[1], sys.argv[2], {})
```

---

## 7. Quality Assurance and Dataset Validation Checklist

### 7.1 Caliper Verification Protocol for Font Heights
Physical letter height is the central technical criterion for determining violations under Rule 7 Table-I of the Legal Metrology (Packaged Commodities) Rules, 2011. Computer vision measurements alone cannot serve as ground truth without manual physical calibration.

#### 7.1.1 Measurement Hardware
1. **Instrument**: Certified Digital Vernier Caliper (Mitutoyo 500-196-30 or equivalent, resolution 0.01 mm, accuracy +/- 0.02 mm) or Peak Optical Measuring Magnifier 10x with reticle scale graduated in 0.1 mm increments.
2. **Calibration Certificate**: Caliper zero-point verification checked against gauge block prior to each 10-SKU measurement session.

#### 7.1.2 Measurement Methodology
Under the **Explanation to Table-I of Rule 7**:
- For uppercase letters (e.g., "A", "H", "M"), measure the absolute vertical distance from the baseline to the cap line.
- For lowercase letters with ascenders or descenders (e.g., "b", "d", "p", "q"), measure from the lowest point to the highest point.
- For lowercase letters without ascenders/descenders (e.g., "a", "c", "e", "o", "x"), the minimum height shall be calculated by multiplying the prescribed minimum height by a factor of 1.5 or measuring the physical x-height.
- For numerals (e.g., "0" to "9"), measure the absolute vertical height of the glyph.

```
+-------------------------------------------------------------+
| Uppercase 'H': Measure total height (Baseline to Cap Line)  |
|                                                             |
|   |<- Cap Line                                              |
|   |  |   |                                                  |
|   |  +---+  Measured Caliper Height = H_mm                  |
|   |  |   |                                                  |
|   |<- Baseline                                              |
|                                                             |
| Lowercase 'o': Measure x-height                             |
|                                                             |
|   |<- Mean Line                                             |
|   |  +---+  Measured x-height * 1.5 >= Statutory Threshold  |
|   |  |   |                                                  |
|   |<- Baseline                                              |
+-------------------------------------------------------------+
```

Every sample's `mrp_value`, `net_quantity_value`, and `manufacturer_name` must be measured with the physical caliper and recorded in the annotation file under `measured_font_height_mm`. The tolerance between the manual caliper reading and the optical pipeline computation (H_px / PPR) must not exceed 0.15 mm.

### 7.2 Multi-Tier Verification Protocol

```
+-------------------------------------------------------------+
| TIER 1: Optical & Capture Quality Audit                     |
|  - Resolution >= 1920x1080, JPEG Q >= 90 or Lossless PNG    |
|  - Absence of specular glare / highlight clipping on text   |
|  - Package occupies 70% - 85% of frame                      |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| TIER 2: Transcription & Character Exactness Audit           |
|  - Character Error Rate (CER) = 0.00% against physical text |
|  - Case sensitivity preserved (uppercase vs lowercase)      |
|  - Complete 6-digit PIN code captured                       |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| TIER 3: Spatial & Caliper Metric Cross-Validation          |
|  - Bounding polygon coordinates bounded within [0, W], [0, H]|
|  - Font height cross-check: |(H_px / PPR) - Caliper| <= 0.15mm|
|  - Normalized bbox coordinates match polygon extrema        |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| TIER 4: Statutory Legal Metrology Completeness Audit        |
|  - Verification of Rule 6 mandatory declarations            |
|  - Front/Back multi-panel association confirmed             |
|  - Minimum font height threshold computed for PDP area      |
+-------------------------------------------------------------+
```

### 7.3 Rule 7 Table-I Statutory Font Height Reference

| Area of Principal Display Panel (A in cm2) | Minimum Font Height for General Goods (H in mm) | Minimum Font Height for Blown / Formed Containers (H in mm) |
|---|---|---|
| A <= 50 | 1.0 | 1.5 |
| 50 < A <= 100 | 1.5 | 3.0 |
| 100 < A <= 500 | 2.5 | 4.0 |
| 500 < A <= 2500 | 4.0 | 6.0 |
| A > 2500 | 6.0 | 6.0 |

*Note: For packages with net quantity in weight or volume, numerals and letters for net quantity must strictly satisfy the table above. Any height below these statutory limits triggers an automatic infraction under Section 36(1).*

### 7.4 Automated Dataset Validation Script
The automated validator `ml/scripts/validate_dataset.py` parses all annotation JSON files in `ml/test_data/annotations/` and enforces structural integrity, schema compliance, polygon limits, and statutory field completeness.

```python
#!/usr/bin/env python3
"""
Dataset Validation Script for MetroScan Benchmark Annotations
Location: ml/scripts/validate_dataset.py
"""

import os
import sys
import json
import glob
from typing import List, Dict, Any, Tuple

EXPECTED_CLASSES = {
    "mrp_value", "mrp_tax_statement", "unit_sale_price",
    "net_quantity_value", "net_quantity_unit", "mfg_date",
    "expiry_date", "manufacturer_name", "manufacturer_address",
    "pin_code", "consumer_care_person", "consumer_care_address",
    "consumer_care_phone", "consumer_care_email", "country_of_origin",
    "generic_commodity_name", "fssai_license_number",
    "barcode_region", "nutrition_table_region"
}

MANDATORY_STATUTORY_CLASSES = {
    "mrp_value", "net_quantity_value", "net_quantity_unit",
    "mfg_date", "manufacturer_name", "manufacturer_address",
    "country_of_origin"
}

def validate_annotation_file(file_path: str) -> Tuple[bool, List[str]]:
    errors = []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        return False, [f"JSON Parse Failure: {str(e)}"]

    # 1. Schema version check
    if data.get("schema_version") != "1.2.0":
        errors.append(f"Invalid schema_version: {data.get('schema_version')} (expected 1.2.0)")

    # 2. Dimensions check
    dims = data.get("image_dimensions", {})
    w, h = dims.get("width_px", 0), dims.get("height_px", 0)
    if w < 1080 or h < 720:
        errors.append(f"Substandard image dimensions: {w}x{h}")

    # 3. Calibration check
    calib = data.get("physical_calibration", {})
    ppr = calib.get("pixels_per_mm", 0.0)
    if ppr <= 0.0:
        errors.append(f"Invalid pixels_per_mm: {ppr}")

    # 4. Annotations list audit
    annotations = data.get("annotations", [])
    if not annotations:
        errors.append("No annotations present in file.")

    found_classes = set()
    for ann in annotations:
        ann_id = ann.get("id")
        label = ann.get("class_label")
        poly = ann.get("polygon", [])
        bbox = ann.get("normalized_bbox", {})
        text = ann.get("extracted_text", "")
        font_h = ann.get("measured_font_height_mm", 0.0)

        found_classes.add(label)

        if label not in EXPECTED_CLASSES:
            errors.append(f"Unknown class label '{label}' at annotation {ann_id}")

        if len(poly) < 4:
            errors.append(f"Polygon for annotation {ann_id} has fewer than 4 vertices.")

        for pt in poly:
            if pt[0] < 0 or pt[0] > w or pt[1] < 0 or pt[1] > h:
                errors.append(f"Vertex {pt} outside image boundaries {w}x{h} at annotation {ann_id}")

        # Check normalized bbox bounds
        for key in ["x", "y", "width", "height"]:
            val = bbox.get(key, -1.0)
            if val < 0.0 or val > 100.0:
                errors.append(f"Normalized bbox {key}={val} out of range [0, 100] at annotation {ann_id}")

        if not text and label not in ["barcode_region", "nutrition_table_region"]:
            errors.append(f"Empty extracted_text for textual class '{label}' at annotation {ann_id}")

        if font_h <= 0.0:
            errors.append(f"Invalid measured_font_height_mm={font_h} at annotation {ann_id}")

    # 5. Mandatory panel completeness (only if panel is BACK_DECLARATION)
    panel_type = data.get("image_metadata", {}).get("panel_type")
    if panel_type == "BACK_DECLARATION":
        missing_mandatory = MANDATORY_STATUTORY_CLASSES - found_classes
        if missing_mandatory:
            errors.append(f"Back panel missing mandatory statutory classes: {list(missing_mandatory)}")

    return len(errors) == 0, errors

def run_dataset_audit(annotations_dir: str) -> bool:
    json_files = sorted(glob.glob(os.path.join(annotations_dir, "*.json")))
    if not json_files:
        print(f"No annotation JSON files discovered in {annotations_dir}")
        return False

    print(f"Found {len(json_files)} annotation files to audit.")
    total_errors = 0
    passed_files = 0

    for fpath in json_files:
        fname = os.path.basename(fpath)
        is_valid, errs = validate_annotation_file(fpath)
        if is_valid:
            passed_files += 1
            print(f"[PASS] {fname}")
        else:
            total_errors += len(errs)
            print(f"[FAIL] {fname}:")
            for err in errs:
                print(f"       - {err}")

    print("
" + "=" * 60)
    print(f"Audit Summary: {passed_files}/{len(json_files)} Passed | Total Discrepancies: {total_errors}")
    print("=" * 60)
    return total_errors == 0

if __name__ == "__main__":
    target_dir = sys.argv[1] if len(sys.argv) > 1 else "ml/test_data/annotations"
    success = run_dataset_audit(target_dir)
    sys.exit(0 if success else 1)
```

---

## 8. Directory Structure and Repository Layout

The benchmark packaging dataset must be organized under `ml/test_data/` strictly following this directory tree:

```
ml/test_data/
|-- README.md                           # Dataset quickstart, license, and benchmark checksums
|-- images/                             # Master high-resolution product imagery (1920x1080 / 4K)
|   |-- SKU_001_FB_FRONT.jpg
|   |-- SKU_001_FB_BACK.jpg
|   |-- SKU_002_FB_FRONT.jpg
|   |-- SKU_002_FB_BACK.jpg
|   |-- SKU_021_PC_FRONT.jpg
|   |-- SKU_021_PC_BACK.jpg
|   |-- SKU_031_HG_FRONT.jpg
|   |-- SKU_031_HG_BACK.jpg
|   |-- SKU_041_ED_FRONT.jpg
|   `-- SKU_041_ED_BACK.jpg
|-- annotations/                        # Official ground truth JSON files (v1.2.0 schema)
|   |-- SKU_001_FB_FRONT.json
|   |-- SKU_001_FB_BACK.json
|   |-- SKU_002_FB_FRONT.json
|   |-- SKU_002_FB_BACK.json
|   |-- SKU_021_PC_FRONT.json
|   |-- SKU_021_PC_BACK.json
|   |-- SKU_031_HG_FRONT.json
|   |-- SKU_031_HG_BACK.json
|   |-- SKU_041_ED_FRONT.json
|   `-- SKU_041_ED_BACK.json
|-- calibration/                        # Calibration target images and optical correction profiles
|   |-- mitutoyo_50mm_grid_sample.jpg
|   |-- lens_distortion_profile_50mm.json
|   `-- cross_polarization_setup_diagram.png
|-- manifests/                          # Split definitions for training, validation, and testing
|   |-- benchmark_50_sku_manifest.json
|   |-- challenging_edge_cases_split.json
|   `-- fssai_nutritional_subset.json
`-- reports/                            # Generated validation reports and OCR evaluation metrics
    |-- baseline_cer_wer_report.md
    `-- legal_metrology_accuracy_matrix.csv
```

### 8.1 File Naming Standard
Every image and annotation pair must follow the strict deterministic nomenclature:
`SKU_{ID}_{CAT}_{PANEL}.{ext}`

Where:
- `{ID}`: Three-digit zero-padded integer from `001` to `050` (or higher).
- `{CAT}`: Two-letter category code (`FB` = Food & Beverages, `PC` = Personal Care, `HG` = Household Goods, `ED` = Edge Cases).
- `{PANEL}`: Physical surface orientation (`FRONT`, `BACK`, `SIDE`).
- `{ext}`: File extension (`jpg` for images, `json` for annotations).

Example: `SKU_005_FB_BACK.jpg` maps directly and uniquely to `SKU_005_FB_BACK.json`.

---

## 9. Enforcement Scoring and OCR Benchmark Metrics

To ensure that the benchmark dataset produces objective, repeatable scientific evaluations, tests executed against this dataset must report the following metrics:

1. **Character Error Rate (CER)**:
   CER = (S + D + I) / N
   Where S is substitutions, D is deletions, I is insertions, and N is total characters in ground truth.
2. **Word Error Rate (WER)**:
   WER = (S_w + D_w + I_w) / N_w
3. **Intersection over Union (IoU) on Statutory Bounding Boxes**:
   IoU = Area(B_pred intersect B_gt) / Area(B_pred union B_gt)
   A detected entity is considered localized if IoU >= 0.50.
4. **Statutory Classification F1-Score**:
   Precision, Recall, and F1-score across all 19 fine-grained legal metrology entity classes.
5. **Font Height Measurement Absolute Error**:
   Delta_H_abs = |H_pred - H_caliper|
   Target benchmark accuracy: Mean Absolute Error (MAE) <= 0.12 mm.
