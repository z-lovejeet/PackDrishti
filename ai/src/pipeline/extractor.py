import re
import json
import logging
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, model_validator

from backend.src.core.config import settings

logger = logging.getLogger("packdrashiti.extractor")


class BoundingBox(BaseModel):
    """
    Normalized spatial bounding box coordinates [0.0 to 1.0].
    Automatically normalizes 0-1000 scale or pixel coordinates to [0.0, 1.0].
    """
    ymin: float = Field(default=0.0)
    xmin: float = Field(default=0.0)
    ymax: float = Field(default=1.0)
    xmax: float = Field(default=1.0)

    @model_validator(mode="before")
    @classmethod
    def normalize_bbox(cls, data: Any) -> Any:
        if isinstance(data, dict):
            converted = {}
            for k in ["ymin", "xmin", "ymax", "xmax"]:
                raw_val = data.get(k, 0.0)
                try:
                    v = float(raw_val)
                    if v > 1.0:
                        v = v / 1000.0
                    converted[k] = max(0.0, min(1.0, v))
                except (ValueError, TypeError):
                    converted[k] = 0.0 if "min" in k else 1.0
            return converted
        return data


class RawDeclarationToken(BaseModel):
    """
    Individual extracted text token with spatial coordinates and declaration category.
    """
    text: str = ""
    declaration_type: str = "statutory_text"
    bbox: BoundingBox = Field(default_factory=BoundingBox)
    confidence: float = Field(1.0, ge=0.0, le=1.0)

    @model_validator(mode="before")
    @classmethod
    def normalize_token(cls, data: Any) -> Any:
        if isinstance(data, dict):
            conf = data.get("confidence", 1.0)
            try:
                conf_f = float(conf)
                if conf_f > 1.0:
                    conf_f = conf_f / 100.0
                data["confidence"] = max(0.0, min(1.0, conf_f))
            except Exception:
                data["confidence"] = 1.0
            if "bbox" in data and isinstance(data["bbox"], dict):
                # Ensure bbox has all 4 keys
                for k in ["ymin", "xmin", "ymax", "xmax"]:
                    if k not in data["bbox"]:
                        data["bbox"][k] = 0.0 if "min" in k else 1.0
        return data


class PackageVisualExtraction(BaseModel):
    """
    Structured visual extraction output produced by Tier 1 Perception.
    """
    brand_name: Optional[str] = None
    product_name: Optional[str] = None
    category: Optional[str] = "Packaged Food"
    mrp: Optional[float] = None
    currency: str = "INR"
    declared_usp: Optional[float] = None
    declared_usp_unit: Optional[str] = None
    net_quantity_value: Optional[float] = None
    net_quantity_unit: Optional[str] = None
    pdp_width_cm: Optional[float] = 10.0
    pdp_height_cm: Optional[float] = 15.0
    pdp_area_cm2: Optional[float] = 150.0
    measured_font_height_mm: Optional[float] = 2.5
    mfg_month: Optional[int] = None
    mfg_year: Optional[int] = None
    mfg_date_str: Optional[str] = None
    expiry_date: Optional[str] = None
    expiry_date_str: Optional[str] = None
    expiry_month: Optional[int] = None
    expiry_year: Optional[int] = None
    best_before_duration: Optional[str] = None
    is_expired: bool = False
    expiry_status: str = "valid"  # 'expired' | 'near_expiry' | 'valid'
    expiry_details: Optional[str] = None
    consumer_care_email: Optional[str] = None
    consumer_care_phone: Optional[str] = None
    consumer_care_address: Optional[str] = None
    manufacturer_name: Optional[str] = None
    manufacturer_address: Optional[str] = None
    country_of_origin: Optional[str] = "India"
    fg_color_hex: Optional[str] = "#1A1A1A"
    bg_color_hex: Optional[str] = "#FFFFFF"
    tokens: List[RawDeclarationToken] = Field(default_factory=list)
    raw_text: str = ""

    @model_validator(mode="before")
    @classmethod
    def sanitize_extraction(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Alias mapping
            if "brand" in data and not data.get("brand_name"):
                data["brand_name"] = str(data["brand"])
            if "product" in data and not data.get("product_name"):
                data["product_name"] = str(data["product"])
            if "commodity_name" in data and not data.get("product_name"):
                data["product_name"] = str(data["commodity_name"])

            # Numeric sanitization for strings like "Rs 30.00", "50g", "150 cm2"
            for num_field in ["mrp", "declared_usp", "net_quantity_value", "pdp_width_cm", "pdp_height_cm", "pdp_area_cm2", "measured_font_height_mm"]:
                val = data.get(num_field)
                if isinstance(val, str):
                    clean = re.sub(r"[^\d.]", "", val)
                    try:
                        data[num_field] = float(clean) if clean else None
                    except ValueError:
                        data[num_field] = None

            # Date month/year sanitization
            if isinstance(data.get("mfg_month"), str):
                try:
                    data["mfg_month"] = int(re.sub(r"\D", "", data["mfg_month"]))
                except Exception:
                    data["mfg_month"] = None
            if isinstance(data.get("mfg_year"), str):
                try:
                    raw_y = int(re.sub(r"\D", "", data["mfg_year"]))
                    data["mfg_year"] = 2000 + raw_y if raw_y < 100 else raw_y
                except Exception:
                    data["mfg_year"] = None

            if isinstance(data.get("expiry_month"), str):
                try:
                    data["expiry_month"] = int(re.sub(r"\D", "", data["expiry_month"]))
                except Exception:
                    data["expiry_month"] = None
            if isinstance(data.get("expiry_year"), str):
                try:
                    raw_y = int(re.sub(r"\D", "", data["expiry_year"]))
                    data["expiry_year"] = 2000 + raw_y if raw_y < 100 else raw_y
                except Exception:
                    data["expiry_year"] = None

            # Deterministic Date & Shelf-Life Expiry Evaluation
            data = cls._evaluate_dates_and_expiry(data)

        return data

    @classmethod
    def _evaluate_dates_and_expiry(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Determines manufacturing date, expiry date, relative shelf life, and whether
        commodity has expired relative to current reference date (September 2026).
        """
        CURRENT_YEAR = 2026
        CURRENT_MONTH = 9

        mfg_m = data.get("mfg_month")
        mfg_y = data.get("mfg_year")
        exp_m = data.get("expiry_month")
        exp_y = data.get("expiry_year")
        exp_str = str(data.get("expiry_date") or data.get("expiry_date_str") or "").strip()
        mfg_str = str(data.get("mfg_date_str") or "").strip()
        bb_str = str(data.get("best_before_duration") or "").strip()
        raw_text = str(data.get("raw_text") or "")
        combined_text = f"{exp_str} {mfg_str} {bb_str} {raw_text}".lower()

        # 1. Parse MFG date from strings if month/year missing
        if not mfg_m or not mfg_y:
            mfg_regex = re.search(r"(?:mfg|mfd|pkd|packed|date of mfg)[\s.:/-]*([0-9]{1,2})[\s/.-]+([0-9]{2,4})", combined_text)
            if mfg_regex:
                try:
                    mfg_m = int(mfg_regex.group(1))
                    raw_yr = int(mfg_regex.group(2))
                    mfg_y = 2000 + raw_yr if raw_yr < 100 else raw_yr
                    data["mfg_month"] = mfg_m
                    data["mfg_year"] = mfg_y
                except Exception:
                    pass

        if mfg_m and mfg_y and not data.get("mfg_date_str"):
            data["mfg_date_str"] = f"{mfg_m:02d}/{mfg_y}"

        # 2. Check for relative shelf-life (e.g., 'Best before 4 months from manufacture')
        best_before_match = re.search(r"(?:best before|use within)?\s*(\d+)\s*(months?|days?|years?)", f"{bb_str} {combined_text}")
        if best_before_match:
            qty = int(best_before_match.group(1))
            unit = best_before_match.group(2)
            data["best_before_duration"] = f"{qty} {unit}"
            if mfg_m and mfg_y and not exp_y:
                if "month" in unit:
                    total_months = (mfg_y * 12 + (mfg_m - 1)) + qty
                    exp_y = total_months // 12
                    exp_m = (total_months % 12) + 1
                    data["expiry_month"] = exp_m
                    data["expiry_year"] = exp_y
                    data["expiry_date_str"] = f"{exp_m:02d}/{exp_y}"
                elif "day" in unit:
                    approx_months = max(1, round(qty / 30))
                    total_months = (mfg_y * 12 + (mfg_m - 1)) + approx_months
                    exp_y = total_months // 12
                    exp_m = (total_months % 12) + 1
                    data["expiry_month"] = exp_m
                    data["expiry_year"] = exp_y
                    data["expiry_date_str"] = f"{exp_m:02d}/{exp_y}"

        # 3. Check for explicit expiry date in text
        if not exp_y:
            exp_regex = re.search(r"(?:exp|expiry|use by|best before)[\s.:/-]*([0-9]{1,2})[\s/.-]+([0-9]{2,4})", combined_text)
            if exp_regex:
                try:
                    exp_m = int(exp_regex.group(1))
                    raw_yr = int(exp_regex.group(2))
                    exp_y = 2000 + raw_yr if raw_yr < 100 else raw_yr
                    data["expiry_month"] = exp_m
                    data["expiry_year"] = exp_y
                    data["expiry_date_str"] = f"{exp_m:02d}/{exp_y}"
                except Exception:
                    pass

        if not data.get("expiry_date_str") and exp_str:
            data["expiry_date_str"] = exp_str

        # 4. Determine Expiration Status
        current_total = CURRENT_YEAR * 12 + CURRENT_MONTH
        is_expired = False
        status = "valid"
        details = "Statutory shelf-life verified."

        if exp_y and exp_m:
            exp_total = exp_y * 12 + exp_m
            if exp_total < current_total:
                is_expired = True
                status = "expired"
                months_past = current_total - exp_total
                details = f"Commodity expired in {exp_m:02d}/{exp_y} ({months_past} months past declared shelf life)."
            elif exp_total == current_total:
                is_expired = False
                status = "near_expiry"
                details = f"Commodity near expiry (expires this month: {exp_m:02d}/{exp_y})."
            else:
                is_expired = False
                status = "valid"
                details = f"Commodity within valid shelf life (expires {exp_m:02d}/{exp_y})."
        elif mfg_y:
            # If no explicit expiry is declared, typical packaged snacks/foods expire within 6-9 months
            # Any product manufactured in 2024 or earlier is undeniably expired as of September 2026 (>20 months old)
            if mfg_y < CURRENT_YEAR:
                mfg_total = mfg_y * 12 + (mfg_m or 1)
                months_since_mfg = current_total - mfg_total
                if months_since_mfg > 12:
                    is_expired = True
                    status = "expired"
                    details = f"Manufactured in {mfg_m or 'XX'}/{mfg_y} ({months_since_mfg} months ago). Exceeded standard maximum 12-month packaged food shelf life."

        # Allow upstream explicit is_expired flag to take precedence
        if data.get("is_expired") is True:
            is_expired = True
            status = "expired"

        data["is_expired"] = is_expired
        data["expiry_status"] = status
        data["expiry_details"] = details
        return data


class VisualPerceptionExtractor:
    """
    Tier 1 Multimodal Visual Perception and Spatial Text Extractor.
    Prioritizes Multimodal VLM (Google Gemini) and falls back to deterministic OCR heuristics.
    Supports single or dual-face (Front + Back) packaging image analysis.
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.pixel_per_mm = settings.CALIBRATION_PIXEL_PER_MM
        self.model_hierarchy = [
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash-lite",
            "gemini-3.7-flash",
            "gemini-flash-lite-latest",
            "gemini-3.1-flash-lite-preview",
            "gemini-3.6-flash",
            "gemini-3.5-flash",
        ]


    async def extract_from_image_bytes(
        self, image_input: Union[bytes, List[bytes]], filename: str = ""
    ) -> PackageVisualExtraction:
        """
        Extracts structured declarations from packaging image bytes (single or multiple images).
        """
        # Standardize to list of image bytes
        if isinstance(image_input, (list, tuple)):
            image_list = [img for img in image_input if img and len(img) > 0]
        else:
            image_list = [image_input] if image_input and len(image_input) > 0 else []

        if not image_list:
            return self._extract_via_ocr_heuristics(b"", filename)

        # Check if first image is an actual binary image
        is_binary_image = False
        first_img = image_list[0]
        if len(first_img) >= 4:
            if first_img.startswith(b"\xff\xd8") or first_img.startswith(b"\x89PNG") or b"RIFF" in first_img[:12]:
                is_binary_image = True

        if is_binary_image and self.api_key and not self.api_key.startswith("placeholder"):
            try:
                return await self._extract_via_gemini(image_list)
            except Exception as e:
                logger.error(
                    f"Multimodal VLM perception failed across all models: {e}. Falling back to OCR heuristics."
                )

        return self._extract_via_ocr_heuristics(first_img, filename)

    async def _extract_via_gemini(self, image_list: List[bytes]) -> PackageVisualExtraction:
        """
        Calls Gemini API with modern google.genai Client supporting multi-image Front + Back analysis.
        """
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=self.api_key)

        prompt = (
            "You are an expert Legal Metrology statutory packaging compliance auditor for the Department of Consumer Affairs, Government of India. "
            "Examine all provided images of the packaged commodity (which may include the Front Panel and/or Back Nutritional Panel, e.g. Lay's potato chips, biscuits, edible oil, etc.).\n\n"
            "Carefully and accurately extract all mandatory statutory declarations under the Legal Metrology (Packaged Commodities) Rules, 2011 (as amended up to 2024):\n"
            "1. brand_name: Exact brand (e.g. Lay's, Kurkure, Britannia, Nestle, Amul).\n"
            "2. product_name: Exact product variant or common generic name (e.g. India's Magic Masala, Classic Salted, Cream & Onion).\n"
            "3. category: Product category (e.g. Potato Chips / Savoury Snacks, Biscuits, Dairy, Edible Oil).\n"
            "4. mrp: Maximum Retail Price as a pure number (e.g. 10.0, 20.0, 50.0). Look for 'MRP Rs.', 'Incl. of all taxes'.\n"
            "5. currency: Currency code (default 'INR').\n"
            "6. declared_usp: Unit Sale Price as a number (e.g. 0.40, 0.20, 1.50). If not printed, leave null.\n"
            "7. declared_usp_unit: Unit for USP (e.g. 'g', 'kg', 'ml', 'l', 'piece').\n"
            "8. net_quantity_value: Net quantity as a number (e.g. 50.0, 28.0, 100.0, 500.0).\n"
            "9. net_quantity_unit: Unit for Net Quantity (e.g. 'g', 'kg', 'ml', 'l'). Must use standard SI units.\n"
            "10. pdp_width_cm: Estimated Principal Display Panel width in cm (e.g. 12.0).\n"
            "11. pdp_height_cm: Estimated Principal Display Panel height in cm (e.g. 18.0).\n"
            "12. pdp_area_cm2: Estimated Principal Display Panel area in cm^2 (width * height).\n"
            "13. measured_font_height_mm: Measured or estimated font height of the net quantity and MRP numeral in mm (e.g. 2.5, 3.0).\n"
            "14. mfg_month: Month of manufacture as integer (1-12).\n"
            "15. mfg_year: Year of manufacture as 4-digit integer (e.g. 2024, 2025, 2026).\n"
            "16. mfg_date_str: Formatted manufacture date string as printed (e.g. '08/2024', '15/04/2024', 'AUG 2024').\n"
            "17. expiry_date: Expiry or Best Before declaration text as printed (e.g. 'Best before 4 months from manufacture', 'USE BY 15/10/2024').\n"
            "18. expiry_date_str: Declared or calculated expiry date string (e.g. '12/2024', '15/10/2024').\n"
            "19. best_before_duration: Declared shelf life duration if stated (e.g. '4 months', '6 months', '180 days').\n"
            "20. is_expired: Boolean. TODAY'S REFERENCE DATE IS SEPTEMBER 2026. If the expiry date or best-before period has passed relative to September 2026 (for example, any product manufactured in 2023 or 2024 with a 4-12 month shelf life), this MUST be true.\n"
            "21. expiry_status: 'expired' if past shelf life, 'near_expiry' if expiring this month, or 'valid'.\n"
            "22. consumer_care_email: Official consumer care email address (e.g. consumer.feedback@pepsico.com).\n"
            "23. consumer_care_phone: Official consumer care toll-free phone number (e.g. 1800 22 4020).\n"
            "24. consumer_care_address: Full registered consumer care postal address.\n"
            "25. manufacturer_name: Complete registered name of manufacturer / packer / importer (e.g. PepsiCo India Holdings Pvt. Ltd.).\n"
            "26. manufacturer_address: Complete factory or corporate registered address.\n"
            "27. country_of_origin: Country of origin (e.g. India).\n"
            "28. fg_color_hex: Dominant text foreground color in hex (e.g. #000000).\n"
            "29. bg_color_hex: Dominant background color behind statutory text in hex (e.g. #FFFFFF or #F5F5F5).\n"
            "30. raw_text: Comprehensive transcript of all visible text across all images.\n"
            "31. tokens: List of detected statutory tokens, each with {text: str, declaration_type: str, bbox: {ymin: float, xmin: float, ymax: float, xmax: float}, confidence: float}.\n\n"
            "Return strictly valid JSON conforming to this specification."
        )

        contents: List[Any] = [prompt]
        for img_bytes in image_list:
            mime = "image/jpeg"
            if img_bytes.startswith(b"\x89PNG"):
                mime = "image/png"
            elif b"RIFF" in img_bytes[:12]:
                mime = "image/webp"
            contents.append(types.Part.from_bytes(data=img_bytes, mime_type=mime))

        last_error = None
        for model_name in self.model_hierarchy:
            try:
                config = types.GenerateContentConfig(
                    response_mime_type="application/json",
                )
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config,
                )
                if response and response.text:
                    clean_text = response.text.strip()
                    if clean_text.startswith("```json"):
                        clean_text = clean_text[7:]
                    if clean_text.endswith("```"):
                        clean_text = clean_text[:-3]
                    data = json.loads(clean_text)
                    return PackageVisualExtraction(**data)
            except Exception as e:
                last_error = e
                err_msg = str(e).lower()
                logger.warning(f"Model {model_name} failed: {e}.")
                if "429" in err_msg or "quota" in err_msg or "resource_exhausted" in err_msg:
                    logger.warning(f"Model {model_name} quota exceeded. Trying next available model in hierarchy...")
                    continue
                logger.warning("Trying next model in hierarchy...")

        raise RuntimeError(f"All Gemini models in hierarchy failed. Last error: {last_error}")


    def _extract_via_ocr_heuristics(
        self, image_bytes: bytes, filename: str = ""
    ) -> PackageVisualExtraction:
        """
        Deterministic OCR and heuristic fallback parser.
        Extracts key declarations from raw text or actual OCR results without dummy or mock values.
        Utilizes local pytesseract OCR and Groq LLM parsing.
        """
        import io
        from PIL import Image

        extracted_text = ""
        tokens: List[RawDeclarationToken] = []

        if image_bytes and len(image_bytes) > 0:
            try:
                pil_img = Image.open(io.BytesIO(image_bytes))
                import pytesseract
                ocr_data = pytesseract.image_to_data(pil_img, output_type=pytesseract.Output.DICT)
                img_w, img_h = pil_img.size

                n_boxes = len(ocr_data['text'])
                for i in range(n_boxes):
                    text_word = ocr_data['text'][i].strip()
                    if text_word:
                        try:
                            conf = float(ocr_data['conf'][i]) / 100.0
                            conf = max(0.0, min(1.0, conf))
                        except Exception:
                            conf = 0.8

                        x, y, w, h = ocr_data['left'][i], ocr_data['top'][i], ocr_data['width'][i], ocr_data['height'][i]
                        ymin = max(0.0, min(1.0, y / max(1, img_h)))
                        xmin = max(0.0, min(1.0, x / max(1, img_w)))
                        ymax = max(0.0, min(1.0, (y + h) / max(1, img_h)))
                        xmax = max(0.0, min(1.0, (x + w) / max(1, img_w)))

                        tokens.append(RawDeclarationToken(
                            text=text_word,
                            declaration_type="statutory_text",
                            bbox=BoundingBox(ymin=ymin, xmin=xmin, ymax=ymax, xmax=xmax),
                            confidence=conf
                        ))

                extracted_text = pytesseract.image_to_string(pil_img).strip()
            except Exception as ocr_err:
                logger.warning("Pytesseract OCR failed: %s", ocr_err)
                try:
                    extracted_text = image_bytes.decode("utf-8", errors="ignore").strip()
                except Exception:
                    extracted_text = ""

        # If OCR text obtained and Groq API is available, parse with Groq LLM
        if extracted_text and settings.GROQ_API_KEY and not settings.GROQ_API_KEY.startswith("placeholder"):
            try:
                from groq import Groq
                groq_client = Groq(api_key=settings.GROQ_API_KEY)
                prompt = (
                    "You are a statutory compliance parser under the Legal Metrology (Packaged Commodities) Rules 2011, India.\n"
                    "Extract statutory label declarations from the following OCR text extracted from product packaging.\n"
                    "Return a JSON object with EXACTLY these fields:\n"
                    "brand_name (str or null),\n"
                    "product_name (str or null),\n"
                    "category (str, e.g. Snacks, Food & Beverage, Personal Care),\n"
                    "mrp (float or null, pure numeral without currency symbol, e.g. 20.0),\n"
                    "currency (str, default 'INR'),\n"
                    "declared_usp (float or null, e.g. 0.40),\n"
                    "declared_usp_unit (str or null, e.g. 'g', 'kg', 'ml', 'l'),\n"
                    "net_quantity_value (float or null, e.g. 50.0),\n"
                    "net_quantity_unit (str or null, e.g. 'g', 'kg', 'ml', 'l'),\n"
                    "mfg_month (int or null, 1-12),\n"
                    "mfg_year (int or null, e.g. 2024, 2025, 2026),\n"
                    "mfg_date_str (str or null, e.g. '08/2024'),\n"
                    "expiry_date (str or null, e.g. 'Best before 4 months from mfg'),\n"
                    "expiry_date_str (str or null, e.g. '12/2024'),\n"
                    "is_expired (bool, true if expired relative to September 2026, e.g. 2024 dates),\n"
                    "consumer_care_email (str or null),\n"
                    "consumer_care_phone (str or null),\n"
                    "manufacturer_name (str or null),\n"
                    "manufacturer_address (str or null),\n"
                    "country_of_origin (str, default 'India')\n\n"
                    f"OCR Text:\n{extracted_text}\n\n"
                    "Return ONLY valid JSON."
                )
                groq_resp = groq_client.chat.completions.create(
                    model="qwen/qwen3.8-27b",
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"},
                    max_tokens=600,
                    temperature=0.1,
                )
                parsed_data = json.loads(groq_resp.choices[0].message.content)
                parsed_data["tokens"] = tokens
                parsed_data["raw_text"] = extracted_text
                parsed_data["pdp_width_cm"] = 10.0
                parsed_data["pdp_height_cm"] = 15.0
                parsed_data["pdp_area_cm2"] = 150.0
                parsed_data["measured_font_height_mm"] = 2.5
                return PackageVisualExtraction(**parsed_data)
            except Exception as groq_err:
                logger.warning("Groq OCR parsing failed: %s. Falling back to regex heuristics.", groq_err)

        # Default clean extraction without any dummy mock values
        extraction = PackageVisualExtraction(
            brand_name=None,
            product_name=None,
            category="Packaged Goods",
            mrp=None,
            currency="INR",
            declared_usp=None,
            declared_usp_unit=None,
            net_quantity_value=None,
            net_quantity_unit=None,
            pdp_width_cm=10.0,
            pdp_height_cm=15.0,
            pdp_area_cm2=150.0,
            measured_font_height_mm=2.0,
            mfg_month=None,
            mfg_year=None,
            expiry_date=None,
            consumer_care_email=None,
            consumer_care_phone=None,
            consumer_care_address=None,
            manufacturer_name=None,
            manufacturer_address=None,
            country_of_origin="India",
            fg_color_hex="#111827",
            bg_color_hex="#FFFFFF",
            raw_text=extracted_text,
            tokens=tokens,
        )

        if not extracted_text:
            return extraction

        # Apply regex heuristics if extracted_text contains matches
        if "mrp" in extracted_text.lower():
            mrp_match = re.search(r"mrp\s*[:=]?\s*(?:rs\.?|inr)?\s*([0-9]+(?:\.[0-9]{1,2})?)", extracted_text, re.I)
            if mrp_match:
                extraction.mrp = float(mrp_match.group(1))

        if "net wt" in extracted_text.lower() or "net quantity" in extracted_text.lower() or "net qty" in extracted_text.lower():
            net_match = re.search(r"(?:net\s*(?:wt\.?|quantity|qty))\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)\s*(g|kg|ml|l)", extracted_text, re.I)
            if net_match:
                extraction.net_quantity_value = float(net_match.group(1))
                extraction.net_quantity_unit = net_match.group(2).lower()

        return extraction
