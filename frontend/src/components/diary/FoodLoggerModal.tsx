import React, { useState, useEffect } from "react";
import {
  X,
  MagnifyingGlass,
  Camera,
  Barcode,
  Plus,
  Minus,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react";
import { useDiaryStore } from "../../store/useDiaryStore";
import { apiClient } from "../../utils/apiClient";
import { downsampleImage, blobToFile } from "../../utils/imageProc";
import { PlateAnalysisData, PackagedAuditResultData } from "../../types/models";

interface FoodLoggerModalProps {
  isOpen: boolean;
  initialSlot?: "breakfast" | "lunch" | "dinner" | "snack";
  onClose: () => void;
  onPlateScanned: (analysis: PlateAnalysisData) => void;
  onPackagedScanned: (audit: PackagedAuditResultData) => void;
  onSuccessToast: (title: string, message: string) => void;
}

interface FoodSearchResult {
  id?: string;
  foodName: string;
  regionalName?: string;
  category: string;
  servingUnit: string;
  servingWeightG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sodiumMg: number;
  sugarG: number;
}

const COMMON_INDIAN_STAPLES: FoodSearchResult[] = [
  {
    foodName: "Toor Dal Tadka",
    category: "Lentil/Dal",
    servingUnit: "katori",
    servingWeightG: 150,
    calories: 195,
    proteinG: 11.2,
    carbsG: 27.0,
    fatG: 4.8,
    fiberG: 6.2,
    sodiumMg: 340,
    sugarG: 1.5,
  },
  {
    foodName: "Whole Wheat Roti",
    category: "Bread",
    servingUnit: "roti",
    servingWeightG: 40,
    calories: 104,
    proteinG: 3.4,
    carbsG: 20.2,
    fatG: 0.9,
    fiberG: 2.8,
    sodiumMg: 85,
    sugarG: 0.4,
  },
  {
    foodName: "Paneer Bhurji",
    category: "Dairy/Curry",
    servingUnit: "serving",
    servingWeightG: 120,
    calories: 235,
    proteinG: 16.8,
    carbsG: 5.4,
    fatG: 16.2,
    fiberG: 1.6,
    sodiumMg: 310,
    sugarG: 1.8,
  },
  {
    foodName: "Steamed Basmati Rice",
    category: "Grain",
    servingUnit: "katori",
    servingWeightG: 150,
    calories: 195,
    proteinG: 4.1,
    carbsG: 42.3,
    fatG: 0.5,
    fiberG: 1.2,
    sodiumMg: 12,
    sugarG: 0.1,
  },
  {
    foodName: "Mixed Vegetable Sabzi",
    category: "Curry",
    servingUnit: "katori",
    servingWeightG: 150,
    calories: 142,
    proteinG: 3.3,
    carbsG: 18.0,
    fatG: 6.3,
    fiberG: 4.5,
    sodiumMg: 290,
    sugarG: 3.2,
  },
  {
    foodName: "Boiled Whole Egg",
    category: "Egg/Protein",
    servingUnit: "piece",
    servingWeightG: 50,
    calories: 78,
    proteinG: 6.3,
    carbsG: 0.6,
    fatG: 5.3,
    fiberG: 0.0,
    sodiumMg: 62,
    sugarG: 0.6,
  },
];

export const FoodLoggerModal: React.FC<FoodLoggerModalProps> = ({
  isOpen,
  initialSlot = "breakfast",
  onClose,
  onPlateScanned,
  onPackagedScanned,
  onSuccessToast,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<"breakfast" | "lunch" | "dinner" | "snack">(
    initialSlot
  );
  const [activeTab, setActiveTab] = useState<"search" | "plate" | "packaged">("search");

  // Tab 1: Database Search State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [weightGrams, setWeightGrams] = useState<number>(100);

  // Tab 2: Plate Vision State
  const [plateFile, setPlateFile] = useState<File | null>(null);
  const [platePreviewUrl, setPlatePreviewUrl] = useState<string | null>(null);
  const [isPlateScanning, setIsPlateScanning] = useState<boolean>(false);
  const [plateStage, setPlateStage] = useState<string>("");
  const [plateProgress, setPlateProgress] = useState<number>(0);

  // Tab 3: Packaged Scan State
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [productHint, setProductHint] = useState<string>("");
  const [isPackagedScanning, setIsPackagedScanning] = useState<boolean>(false);
  const [packagedError, setPackagedError] = useState<string | null>(null);

  const { logItem } = useDiaryStore();

  useEffect(() => {
    if (initialSlot) {
      setSelectedSlot(initialSlot);
    }
  }, [initialSlot]);

  // Debounced search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const resp = await apiClient.get(`/foods/search?q=${encodeURIComponent(searchQuery)}`);
        if (resp.data && resp.data.items) {
          const items: FoodSearchResult[] = resp.data.items.map((it: any) => ({
            id: it.id,
            foodName: it.food_name || it.name,
            regionalName: it.regional_name,
            category: it.category || "General",
            servingUnit: it.serving_unit || "serving",
            servingWeightG: Number(it.serving_weight_g) || 100,
            calories: Number(it.calories) || 0,
            proteinG: Number(it.protein_g) || 0,
            carbsG: Number(it.carbs_g) || 0,
            fatG: Number(it.fat_g) || 0,
            fiberG: Number(it.fiber_g) || 0,
            sodiumMg: Number(it.sodium_mg) || 0,
            sugarG: Number(it.sugar_g) || 0,
          }));
          setSearchResults(items);
        } else {
          // Filter local fallback
          const filtered = COMMON_INDIAN_STAPLES.filter((item) =>
            item.foodName.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(filtered);
        }
      } catch {
        const filtered = COMMON_INDIAN_STAPLES.filter((item) =>
          item.foodName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle selecting a food from search or quick staples
  const handleSelectFood = (food: FoodSearchResult) => {
    setSelectedFood(food);
    setQuantity(1);
    setWeightGrams(food.servingWeightG || 100);
  };

  // Commit selected item to diary
  const handleCommitItem = async () => {
    if (!selectedFood) return;
    const factor = weightGrams / Math.max(1, selectedFood.servingWeightG || 100);

    const scaledCalories = Math.round(selectedFood.calories * factor);
    const scaledProtein = Number((selectedFood.proteinG * factor).toFixed(1));
    const scaledCarbs = Number((selectedFood.carbsG * factor).toFixed(1));
    const scaledFat = Number((selectedFood.fatG * factor).toFixed(1));
    const scaledFiber = Number((selectedFood.fiberG * factor).toFixed(1));
    const scaledSodium = Math.round(selectedFood.sodiumMg * factor);
    const scaledSugar = Number((selectedFood.sugarG * factor).toFixed(1));

    await logItem(
      selectedSlot,
      selectedFood.foodName,
      weightGrams,
      scaledCalories,
      scaledProtein,
      scaledCarbs,
      scaledFat,
      scaledFiber,
      scaledSodium,
      scaledSugar,
      `${quantity} ${selectedFood.servingUnit || "serving"}`
    );

    onSuccessToast("Food Logged", `Added ${selectedFood.foodName} to ${selectedSlot}`);
    onClose();
  };

  // Tab 2: Plate Vision Scan Handler
  const handlePlateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPlateFile(file);
      setPlatePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRunPlateScan = async () => {
    if (!plateFile) return;
    setIsPlateScanning(true);
    setPlateProgress(10);
    setPlateStage("Step 1/3: Optimizing resolution & lighting...");

    const progressTimer = setInterval(() => {
      setPlateProgress((prev) => {
        if (prev < 40) {
          setPlateStage("Step 2/3: Segmenting food items & volumetric bounding...");
          return prev + 15;
        } else if (prev < 80) {
          setPlateStage("Step 3/3: Cross-referencing ICMR-NIN nutritional databases...");
          return prev + 10;
        }
        return prev;
      });
    }, 400);

    try {
      let finalFile: File | Blob = plateFile;
      if (plateFile.size > 2 * 1024 * 1024) {
        const downsampled = await downsampleImage(plateFile, {
          maxDimension: 2048,
          maxSizeBytes: 2 * 1024 * 1024,
        });
        finalFile = blobToFile(downsampled.blob, plateFile.name || "plate.jpg");
      }

      const formData = new FormData();
      formData.append("image", finalFile);
      formData.append("meal_type_hint", selectedSlot);

      const resp = await apiClient.post("/meals/scan-plate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(progressTimer);
      setPlateProgress(100);

      const data = resp.data;
      const plateAnalysis: PlateAnalysisData = {
        analysisId: data.analysis_id || `plate-${Date.now()}`,
        detectedItems: (data.items || []).map((it: any) => ({
          id: it.id || `item-${Math.random()}`,
          name: it.name || it.food_name,
          category: it.category || "Meal",
          estimatedGrams: Number(it.estimated_grams) || 100,
          confidenceScore: Number(it.confidence_score) || 0.85,
          boundingBox: it.bounding_box || [0, 0, 1000, 1000],
          calories: Number(it.calories) || 0,
          proteinG: Number(it.protein_g) || 0,
          carbsG: Number(it.carbs_g) || 0,
          fatG: Number(it.fat_g) || 0,
          fiberG: Number(it.fiber_g) || 0,
          servingDescription: it.serving_description || "1 serving",
        })),
        plateSummary: {
          totalCalories: Number(data.plate_summary?.total_calories) || 0,
          totalProteinG: Number(data.plate_summary?.total_protein_g) || 0,
          totalCarbsG: Number(data.plate_summary?.total_carbs_g) || 0,
          totalFatG: Number(data.plate_summary?.total_fat_g) || 0,
          totalFiberG: Number(data.plate_summary?.total_fiber_g) || 0,
        },
        healthAdvisory: data.health_verdict || "Balanced meal plate composition.",
        warnings: data.warnings || [],
      };

      onClose();
      onPlateScanned(plateAnalysis);
    } catch (err: any) {
      clearInterval(progressTimer);
      const detail = err?.response?.data?.detail || "Plate scanning failed. Please try again.";
      alert(detail);
    } finally {
      setIsPlateScanning(false);
    }
  };

  // Tab 3: Packaged Food Scan Handler
  const handleRunPackagedScan = async () => {
    if (!frontFile || !backFile) {
      setPackagedError("Please upload both Front and Back packaging panel photos.");
      return;
    }
    setPackagedError(null);
    setIsPackagedScanning(true);

    try {
      const formData = new FormData();
      formData.append("front_image", frontFile);
      formData.append("back_image", backFile);
      if (productHint) {
        formData.append("product_name_hint", productHint);
      }

      const resp = await apiClient.post("/packaged/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (resp.data && resp.data.data) {
        const audit = resp.data.data as PackagedAuditResultData;
        onClose();
        onPackagedScanned(audit);
      }
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail || "Packaged analysis failed. Please verify images.";
      setPackagedError(detail);
    } finally {
      setIsPackagedScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-2xl border border-slate-200/80 shadow-modal max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900">
              Log Food Item
            </h2>
            <span className="text-2xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              BiteIQ Logger
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Meal Slot Selector Strip */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  selectedSlot === slot
                    ? "bg-slate-950 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Main Action Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "search"
                ? "border-slate-950 text-slate-950"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MagnifyingGlass size={16} weight={activeTab === "search" ? "bold" : "regular"} />
            <span>Search Database</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("plate")}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "plate"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Camera size={16} weight={activeTab === "plate" ? "bold" : "regular"} />
            <span>Plate Vision AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("packaged")}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "packaged"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Barcode size={16} weight={activeTab === "packaged" ? "bold" : "regular"} />
            <span>Packaged Scanner</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: SEARCH DATABASE */}
          {activeTab === "search" && (
            <div className="space-y-4">
              {/* Search Bar Input */}
              <div className="relative">
                <MagnifyingGlass
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Indian dishes (e.g. Toor Dal, Roti, Paneer...)"
                  className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-sans"
                  autoFocus
                />
                {isSearching && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-2xs font-mono text-slate-400">
                    Searching...
                  </span>
                )}
              </div>

              {/* Selected Item Portion Tuner */}
              {selectedFood && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-900">
                        {selectedFood.foodName}
                      </h4>
                      {selectedFood.regionalName && (
                        <span className="text-2xs text-slate-500">
                          {selectedFood.regionalName}
                        </span>
                      )}
                    </div>
                    <span className="text-2xs font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold">
                      {Math.round(
                        selectedFood.calories *
                          (weightGrams / Math.max(1, selectedFood.servingWeightG || 100))
                      )}{" "}
                      kcal
                    </span>
                  </div>

                  {/* Quantity & Weight Stepper */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          const nq = Math.max(0.5, quantity - 0.5);
                          setQuantity(nq);
                          setWeightGrams(Math.round(nq * (selectedFood.servingWeightG || 100)));
                        }}
                        className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <span className="px-3 text-xs font-mono font-bold text-slate-900">
                        {quantity} {selectedFood.servingUnit || "serving"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const nq = quantity + 0.5;
                          setQuantity(nq);
                          setWeightGrams(Math.round(nq * (selectedFood.servingWeightG || 100)));
                        }}
                        className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>

                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs text-slate-500">Mass:</span>
                      <input
                        type="number"
                        value={weightGrams}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setWeightGrams(val);
                          setQuantity(
                            Number((val / Math.max(1, selectedFood.servingWeightG || 100)).toFixed(1))
                          );
                        }}
                        className="w-20 px-2 py-1 rounded-md border border-slate-300 text-xs font-mono"
                      />
                      <span className="text-xs font-mono text-slate-600">grams</span>
                    </div>
                  </div>

                  {/* Dynamic Macro Yield Breakdown */}
                  {(() => {
                    const factor =
                      weightGrams / Math.max(1, selectedFood.servingWeightG || 100);
                    return (
                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-center text-2xs font-mono">
                        <div className="bg-white p-1.5 rounded border border-slate-200">
                          <span className="text-indigo-600 font-bold block">
                            {(selectedFood.proteinG * factor).toFixed(1)}g
                          </span>
                          <span className="text-slate-500">Protein</span>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-200">
                          <span className="text-cyan-600 font-bold block">
                            {(selectedFood.carbsG * factor).toFixed(1)}g
                          </span>
                          <span className="text-slate-500">Carbs</span>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-200">
                          <span className="text-amber-600 font-bold block">
                            {(selectedFood.fatG * factor).toFixed(1)}g
                          </span>
                          <span className="text-slate-500">Fat</span>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-200">
                          <span className="text-emerald-600 font-bold block">
                            {(selectedFood.fiberG * factor).toFixed(1)}g
                          </span>
                          <span className="text-slate-500">Fiber</span>
                        </div>
                      </div>
                    );
                  })()}

                  <button
                    type="button"
                    onClick={handleCommitItem}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
                  >
                    Add to {selectedSlot.toUpperCase()}
                  </button>
                </div>
              )}

              {/* Search Results List or Quick Staples */}
              <div className="space-y-2">
                <span className="text-2xs uppercase font-mono text-slate-500 font-semibold block">
                  {searchQuery ? "Search Results" : "Common Staples (Tap to select)"}
                </span>

                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {(searchQuery ? searchResults : COMMON_INDIAN_STAPLES).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      onClick={() => handleSelectFood(item)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedFood?.foodName === item.foodName
                          ? "bg-slate-100 border-slate-900"
                          : "bg-white border-slate-200/80 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-semibold text-xs text-slate-900">
                            {item.foodName}
                          </span>
                          <span className="text-2xs text-slate-600 font-mono">
                            {item.category}
                          </span>
                        </div>
                        <span className="text-2xs text-slate-600 font-mono">
                          {item.servingWeightG}g • {item.proteinG}g P • {item.carbsG}g C • {item.fatG}g F
                        </span>
                      </div>

                      <div className="text-right text-xs font-mono font-bold text-slate-900">
                        {item.calories} kcal
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PLATE VISION AI */}
          {activeTab === "plate" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-start gap-3">
                <Sparkle size={20} weight="fill" className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <span className="font-bold block">Autonomous Computer Vision</span>
                  Snap a top-down photograph of your meal plate or thali. BiteIQ will segment discrete foods, estimate volumetric mass in grams, and calculate precise macros.
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors">
                {platePreviewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={platePreviewUrl}
                      alt="Plate preview"
                      className="max-h-48 mx-auto rounded-xl object-contain shadow-xs"
                    />
                    <div className="flex justify-center gap-2">
                      <label className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                        Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePlateFileChange}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Camera size={24} weight="bold" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Tap to take a photo or upload from library
                      </span>
                      <span className="text-2xs text-slate-500">
                        Supports JPEG, PNG, WebP up to 10MB
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePlateFileChange}
                    />
                  </label>
                )}
              </div>

              {/* Progress Bar during Scanning */}
              {isPlateScanning && (
                <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fadeIn">
                  <div className="flex items-center justify-between text-2xs font-mono">
                    <span className="text-slate-700 font-semibold">{plateStage}</span>
                    <span className="text-slate-900 font-bold">{plateProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${plateProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleRunPlateScan}
                disabled={!plateFile || isPlateScanning}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Sparkle size={16} weight="bold" />
                <span>{isPlateScanning ? "Analyzing Plate with AI..." : "Scan Plate with AI"}</span>
              </button>
            </div>
          )}

          {/* TAB 3: PACKAGED FOOD SCANNER */}
          {activeTab === "packaged" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 flex items-start gap-3">
                <Barcode size={20} weight="fill" className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950">
                  <span className="font-bold block">Front &amp; Back Panel Inspection</span>
                  Upload front branding + back nutritional label. BiteIQ audits palm oil, synthetic dyes (Grades A/B/C), and calculates 0–100 health index.
                </div>
              </div>

              {/* Dual Panel Uploaders */}
              <div className="grid grid-cols-2 gap-3">
                {/* Front Panel */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 text-center">
                  <span className="text-2xs font-mono font-bold text-slate-700 block mb-2">
                    1. Front Panel
                  </span>
                  {frontPreview ? (
                    <img
                      src={frontPreview}
                      alt="Front preview"
                      className="h-24 mx-auto rounded object-contain mb-2"
                    />
                  ) : (
                    <div className="h-24 flex items-center justify-center text-slate-400">
                      <Camera size={28} />
                    </div>
                  )}
                  <label className="text-2xs font-semibold text-slate-800 bg-white border border-slate-300 px-2 py-1 rounded block hover:bg-slate-100 cursor-pointer">
                    {frontFile ? "Change Front" : "Upload Front"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const f = e.target.files[0];
                          setFrontFile(f);
                          setFrontPreview(URL.createObjectURL(f));
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Back Panel */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 text-center">
                  <span className="text-2xs font-mono font-bold text-slate-700 block mb-2">
                    2. Back Ingredients Panel
                  </span>
                  {backPreview ? (
                    <img
                      src={backPreview}
                      alt="Back preview"
                      className="h-24 mx-auto rounded object-contain mb-2"
                    />
                  ) : (
                    <div className="h-24 flex items-center justify-center text-slate-400">
                      <Camera size={28} />
                    </div>
                  )}
                  <label className="text-2xs font-semibold text-slate-800 bg-white border border-slate-300 px-2 py-1 rounded block hover:bg-slate-100 cursor-pointer">
                    {backFile ? "Change Back" : "Upload Back"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const f = e.target.files[0];
                          setBackFile(f);
                          setBackPreview(URL.createObjectURL(f));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Product Hint (Optional) */}
              <div>
                <label className="text-2xs font-mono uppercase text-slate-600 block mb-1">
                  Product Name (Optional Hint)
                </label>
                <input
                  type="text"
                  value={productHint}
                  onChange={(e) => setProductHint(e.target.value)}
                  placeholder="e.g. Lay's Magic Masala, Britannia Good Day"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-sans"
                />
              </div>

              {packagedError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <WarningCircle size={16} weight="bold" className="shrink-0" />
                  <span>{packagedError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleRunPackagedScan}
                disabled={!frontFile || !backFile || isPackagedScanning}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Barcode size={16} weight="bold" />
                <span>
                  {isPackagedScanning
                    ? "Auditing Packaged Food..."
                    : "Audit Packaged Food"}
                </span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
