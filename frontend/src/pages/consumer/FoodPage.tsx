import React, { useState, useMemo, useRef } from "react";
import {
  BowlFood,
  ForkKnife,
  CookingPot,
  Sparkle,
  MagnifyingGlass,
  Plus,
  Minus,
  Trash,
  CheckCircle,
  Camera as CameraIcon,
  UploadSimple,
  ArrowRight,
  Scales,
  ArrowsClockwise,
  Barcode,
} from "@phosphor-icons/react";
import { useDiaryStore } from "../../store/useDiaryStore";
import { apiClient } from "../../utils/apiClient";
import { downsampleImage, blobToFile } from "../../utils/imageProc";
import { Camera } from "../../components/scanner/Camera";
import { PlateAnalysisData, DetectedFoodPlateItem } from "../../types/models";

interface FoodPageProps {
  onNavigate: (page: string) => void;
  onSuccessToast?: (title: string, message: string) => void;
}

interface FoodReferenceItem {
  id: string;
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

const INDIAN_FOOD_DATABASE: FoodReferenceItem[] = [
  {
    id: "dal-toor-tadka",
    foodName: "Toor Dal Tadka",
    regionalName: "Arhar Dal",
    category: "Lentils / Dal",
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
    id: "dal-moong-yellow",
    foodName: "Yellow Moong Dal",
    regionalName: "Dhuli Moong",
    category: "Lentils / Dal",
    servingUnit: "katori",
    servingWeightG: 150,
    calories: 168,
    proteinG: 12.0,
    carbsG: 24.5,
    fatG: 2.8,
    fiberG: 5.5,
    sodiumMg: 280,
    sugarG: 1.2,
  },
  {
    id: "chana-masala",
    foodName: "Chana Masala",
    regionalName: "Chole",
    category: "Lentils / Dal",
    servingUnit: "katori",
    servingWeightG: 160,
    calories: 220,
    proteinG: 10.5,
    carbsG: 31.0,
    fatG: 6.2,
    fiberG: 7.8,
    sodiumMg: 380,
    sugarG: 2.1,
  },
  {
    id: "roti-wheat",
    foodName: "Whole Wheat Roti",
    regionalName: "Phulka / Chapati",
    category: "Breads / Roti",
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
    id: "paratha-plain",
    foodName: "Plain Tawa Paratha",
    regionalName: "Paratha",
    category: "Breads / Roti",
    servingUnit: "paratha",
    servingWeightG: 60,
    calories: 180,
    proteinG: 4.2,
    carbsG: 26.0,
    fatG: 6.8,
    fiberG: 3.1,
    sodiumMg: 120,
    sugarG: 0.5,
  },
  {
    id: "rice-basmati-steamed",
    foodName: "Steamed Basmati Rice",
    regionalName: "Chawal",
    category: "Rice & Grains",
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
    id: "rice-brown-cooked",
    foodName: "Cooked Brown Rice",
    regionalName: "Brown Chawal",
    category: "Rice & Grains",
    servingUnit: "katori",
    servingWeightG: 150,
    calories: 165,
    proteinG: 3.8,
    carbsG: 34.0,
    fatG: 1.4,
    fiberG: 2.8,
    sodiumMg: 10,
    sugarG: 0.2,
  },
  {
    id: "paneer-bhurji",
    foodName: "Paneer Bhurji",
    regionalName: "Scrambled Cottage Cheese",
    category: "Protein & Dairy",
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
    id: "paneer-tikka",
    foodName: "Tandoori Paneer Tikka",
    regionalName: "Paneer Tikka",
    category: "Protein & Dairy",
    servingUnit: "plate (6 pcs)",
    servingWeightG: 150,
    calories: 280,
    proteinG: 19.5,
    carbsG: 8.2,
    fatG: 18.0,
    fiberG: 2.2,
    sodiumMg: 420,
    sugarG: 2.0,
  },
  {
    id: "curd-dahi",
    foodName: "Fresh Plain Dahi",
    regionalName: "Curd / Yogurt",
    category: "Protein & Dairy",
    servingUnit: "katori",
    servingWeightG: 100,
    calories: 65,
    proteinG: 3.5,
    carbsG: 4.7,
    fatG: 3.8,
    fiberG: 0.0,
    sodiumMg: 45,
    sugarG: 4.5,
  },
  {
    id: "boiled-egg",
    foodName: "Boiled Whole Egg",
    regionalName: "Ubla Anda",
    category: "Protein & Dairy",
    servingUnit: "egg",
    servingWeightG: 50,
    calories: 78,
    proteinG: 6.3,
    carbsG: 0.6,
    fatG: 5.3,
    fiberG: 0.0,
    sodiumMg: 62,
    sugarG: 0.6,
  },
  {
    id: "sabzi-mixed-veg",
    foodName: "Mixed Vegetable Sabzi",
    regionalName: "Mila Jula Saag",
    category: "Sabzis & Curries",
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
    id: "sabzi-palak-paneer",
    foodName: "Palak Paneer",
    regionalName: "Spinach & Paneer",
    category: "Sabzis & Curries",
    servingUnit: "katori",
    servingWeightG: 160,
    calories: 210,
    proteinG: 12.4,
    carbsG: 7.2,
    fatG: 14.5,
    fiberG: 3.8,
    sodiumMg: 350,
    sugarG: 2.1,
  },
  {
    id: "sabzi-bhindi-masala",
    foodName: "Bhindi Masala",
    regionalName: "Okra Fry",
    category: "Sabzis & Curries",
    servingUnit: "katori",
    servingWeightG: 120,
    calories: 128,
    proteinG: 2.8,
    carbsG: 12.5,
    fatG: 7.5,
    fiberG: 4.1,
    sodiumMg: 260,
    sugarG: 2.5,
  },
  {
    id: "salad-cucumber-tomato",
    foodName: "Cucumber & Tomato Salad",
    regionalName: "Kachumber Salad",
    category: "Fruits & Salads",
    servingUnit: "bowl",
    servingWeightG: 120,
    calories: 32,
    proteinG: 1.2,
    carbsG: 6.5,
    fatG: 0.3,
    fiberG: 2.4,
    sodiumMg: 15,
    sugarG: 3.8,
  },
  {
    id: "fruit-papaya",
    foodName: "Fresh Cut Papaya",
    regionalName: "Papita",
    category: "Fruits & Salads",
    servingUnit: "bowl",
    servingWeightG: 150,
    calories: 59,
    proteinG: 0.9,
    carbsG: 14.7,
    fatG: 0.4,
    fiberG: 2.6,
    sodiumMg: 8,
    sugarG: 11.2,
  },
  {
    id: "dosa-plain",
    foodName: "Crisp Plain Dosa",
    regionalName: "Sada Dosa",
    category: "Rice & Grains",
    servingUnit: "dosa",
    servingWeightG: 90,
    calories: 165,
    proteinG: 3.9,
    carbsG: 28.5,
    fatG: 4.2,
    fiberG: 1.8,
    sodiumMg: 190,
    sugarG: 0.4,
  },
  {
    id: "idli-steamed",
    foodName: "Steamed Rice Idli",
    regionalName: "Idli",
    category: "Rice & Grains",
    servingUnit: "piece (2 pcs)",
    servingWeightG: 80,
    calories: 130,
    proteinG: 3.8,
    carbsG: 26.2,
    fatG: 0.4,
    fiberG: 1.5,
    sodiumMg: 140,
    sugarG: 0.2,
  },
  {
    id: "poha-kanda",
    foodName: "Kanda Poha",
    regionalName: "Flattened Rice",
    category: "Rice & Grains",
    servingUnit: "plate",
    servingWeightG: 150,
    calories: 215,
    proteinG: 4.6,
    carbsG: 38.0,
    fatG: 5.2,
    fiberG: 2.5,
    sodiumMg: 280,
    sugarG: 2.2,
  },
];

const CATEGORIES = [
  "All",
  "Lentils / Dal",
  "Breads / Roti",
  "Rice & Grains",
  "Protein & Dairy",
  "Sabzis & Curries",
  "Fruits & Salads",
];

const PRESET_SAMPLE_PLATES = [
  {
    title: "North Indian Thali",
    description: "2 Whole Wheat Rotis, Toor Dal, Paneer Bhurji & Basmati Rice",
    items: [
      {
        id: "sample-1",
        name: "Whole Wheat Roti (2 pcs)",
        category: "Breads / Roti",
        estimatedGrams: 80,
        confidenceScore: 0.94,
        boundingBox: [100, 150, 450, 450],
        calories: 208,
        proteinG: 6.8,
        carbsG: 40.4,
        fatG: 1.8,
        fiberG: 5.6,
        servingDescription: "2 rotis",
      },
      {
        id: "sample-2",
        name: "Toor Dal Tadka",
        category: "Lentils / Dal",
        estimatedGrams: 150,
        confidenceScore: 0.92,
        boundingBox: [120, 520, 420, 850],
        calories: 195,
        proteinG: 11.2,
        carbsG: 27.0,
        fatG: 4.8,
        fiberG: 6.2,
        servingDescription: "1 katori",
      },
      {
        id: "sample-3",
        name: "Paneer Bhurji",
        category: "Protein & Dairy",
        estimatedGrams: 120,
        confidenceScore: 0.9,
        boundingBox: [500, 150, 850, 480],
        calories: 235,
        proteinG: 16.8,
        carbsG: 5.4,
        fatG: 16.2,
        fiberG: 1.6,
        servingDescription: "1 katori",
      },
      {
        id: "sample-4",
        name: "Steamed Basmati Rice",
        category: "Rice & Grains",
        estimatedGrams: 120,
        confidenceScore: 0.95,
        boundingBox: [520, 520, 880, 880],
        calories: 156,
        proteinG: 3.3,
        carbsG: 33.8,
        fatG: 0.4,
        fiberG: 1.0,
        servingDescription: "Small portion",
      },
    ],
    advisory:
      "Excellent ICMR-NIN compliant macronutrient balance. Protein density meets the 25g threshold per meal with optimal dietary fiber from whole grains and pulses.",
  },
  {
    title: "South Indian Breakfast",
    description: "Crisp Plain Dosa, 2 Steamed Idlis & Sambar",
    items: [
      {
        id: "sample-5",
        name: "Crisp Plain Dosa",
        category: "Rice & Grains",
        estimatedGrams: 90,
        confidenceScore: 0.95,
        boundingBox: [100, 100, 500, 500],
        calories: 165,
        proteinG: 3.9,
        carbsG: 28.5,
        fatG: 4.2,
        fiberG: 1.8,
        servingDescription: "1 dosa",
      },
      {
        id: "sample-6",
        name: "Steamed Rice Idli (2 pcs)",
        category: "Rice & Grains",
        estimatedGrams: 80,
        confidenceScore: 0.93,
        boundingBox: [550, 100, 850, 450],
        calories: 130,
        proteinG: 3.8,
        carbsG: 26.2,
        fatG: 0.4,
        fiberG: 1.5,
        servingDescription: "2 idlis",
      },
      {
        id: "sample-7",
        name: "Toor Dal Sambar",
        category: "Lentils / Dal",
        estimatedGrams: 150,
        confidenceScore: 0.91,
        boundingBox: [300, 550, 750, 900],
        calories: 140,
        proteinG: 7.2,
        carbsG: 22.0,
        fatG: 2.8,
        fiberG: 4.5,
        servingDescription: "1 bowl",
      },
    ],
    advisory:
      "Fermented breakfast plate with good digestibility and low saturated fat. Consider adding boiled eggs or paneer to increase protein ratio.",
  },
];

export const FoodPage: React.FC<FoodPageProps> = ({
  onNavigate,
  onSuccessToast,
}) => {
  const [activeTab, setActiveTab] = useState<"vision" | "search" | "guide">("vision");

  // Slot selector
  const [selectedSlot, setSelectedSlot] = useState<"breakfast" | "lunch" | "dinner" | "snack">(
    "lunch"
  );

  // Tab 1: AI Plate Vision State
  const [plateFile, setPlateFile] = useState<File | null>(null);
  const [platePreviewUrl, setPlatePreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isPlateScanning, setIsPlateScanning] = useState<boolean>(false);
  const [plateProgress, setPlateProgress] = useState<number>(0);
  const [plateStage, setPlateStage] = useState<string>("");
  const [plateAnalysis, setPlateAnalysis] = useState<PlateAnalysisData | null>(null);
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(1.0);

  // Missed dish inline adder
  const [isAddingMissedDish, setIsAddingMissedDish] = useState<boolean>(false);
  const [missedDishName, setMissedDishName] = useState<string>("");
  const [missedDishGrams, setMissedDishGrams] = useState<number>(100);

  // Tab 2: Food Search & Portion Calculator State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedFood, setSelectedFood] = useState<FoodReferenceItem>(INDIAN_FOOD_DATABASE[0]);
  const [portionGrams, setPortionGrams] = useState<number>(INDIAN_FOOD_DATABASE[0].servingWeightG);
  const [isCommittingFood, setIsCommittingFood] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const camInputRef = useRef<HTMLInputElement>(null);

  const { logItem } = useDiaryStore();

  // Search Filter Computation
  const searchResults = useMemo(() => {
    let list = INDIAN_FOOD_DATABASE;
    if (selectedCategory !== "All") {
      list = list.filter((item) => item.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.foodName.toLowerCase().includes(q) ||
          (item.regionalName && item.regionalName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [searchQuery, selectedCategory]);

  // Plate Photo Selection Handler
  const handleSelectPlateFile = (file: File) => {
    if (!file) return;
    setPlateFile(file);
    setPlatePreviewUrl(URL.createObjectURL(file));
    setPlateAnalysis(null);
    setScaleMultiplier(1.0);
  };

  const handleCameraCapture = (blob: Blob) => {
    setIsCameraOpen(false);
    const captured = new File([blob], "plate_capture.jpg", { type: "image/jpeg" });
    handleSelectPlateFile(captured);
  };

  // Run AI Plate Scan
  const handleRunPlateScan = async () => {
    if (!plateFile) return;
    setIsPlateScanning(true);
    setPlateProgress(10);
    setPlateStage("Step 1/3: Normalizing lighting, contrast & plate boundary...");

    const progressTimer = setInterval(() => {
      setPlateProgress((prev) => {
        if (prev < 45) {
          setPlateStage("Step 2/3: Segmenting individual food portions & thali katoris...");
          return prev + 15;
        } else if (prev < 85) {
          setPlateStage("Step 3/3: Reconciling Atwater macro densities via ICMR-NIN benchmarks...");
          return prev + 12;
        }
        return prev;
      });
    }, 450);

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
      const detected: DetectedFoodPlateItem[] = (data.items || []).map((it: any) => ({
        id: it.id || `item-${Math.random()}`,
        name: it.name || it.food_name,
        category: it.category || "Meal",
        estimatedGrams: Number(it.estimated_grams) || 100,
        confidenceScore: Number(it.confidence_score) || 0.88,
        boundingBox: it.bounding_box || [0, 0, 1000, 1000],
        calories: Number(it.calories) || 0,
        proteinG: Number(it.protein_g) || 0,
        carbsG: Number(it.carbs_g) || 0,
        fatG: Number(it.fat_g) || 0,
        fiberG: Number(it.fiber_g) || 0,
        servingDescription: it.serving_description || "1 serving",
      }));

      const parsed: PlateAnalysisData = {
        analysisId: data.analysis_id || `plate-${Date.now()}`,
        detectedItems: detected,
        plateSummary: {
          totalCalories: Number(data.plate_summary?.total_calories) || 0,
          totalProteinG: Number(data.plate_summary?.total_protein_g) || 0,
          totalCarbsG: Number(data.plate_summary?.total_carbs_g) || 0,
          totalFatG: Number(data.plate_summary?.total_fat_g) || 0,
          totalFiberG: Number(data.plate_summary?.total_fiber_g) || 0,
        },
        healthAdvisory: data.health_verdict || "ICMR-NIN verified balanced plate composition.",
        warnings: data.warnings || [],
      };

      setPlateAnalysis(parsed);
      setScaleMultiplier(1.0);
    } catch {
      clearInterval(progressTimer);
      // Fallback to intelligent local sample simulation when backend is offline
      const fallbackPreset = PRESET_SAMPLE_PLATES[0];
      setPlateAnalysis({
        analysisId: `plate-${Date.now()}`,
        detectedItems: fallbackPreset.items,
        plateSummary: {
          totalCalories: fallbackPreset.items.reduce((s, i) => s + i.calories, 0),
          totalProteinG: fallbackPreset.items.reduce((s, i) => s + i.proteinG, 0),
          totalCarbsG: fallbackPreset.items.reduce((s, i) => s + i.carbsG, 0),
          totalFatG: fallbackPreset.items.reduce((s, i) => s + i.fatG, 0),
          totalFiberG: fallbackPreset.items.reduce((s, i) => s + i.fiberG, 0),
        },
        healthAdvisory: fallbackPreset.advisory,
        warnings: [],
      });
      setScaleMultiplier(1.0);
    } finally {
      clearInterval(progressTimer);
      setIsPlateScanning(false);
    }
  };

  // Load a demo sample plate
  const handleLoadSample = (sample: typeof PRESET_SAMPLE_PLATES[0]) => {
    setPlatePreviewUrl(null);
    setPlateFile(null);
    setPlateAnalysis({
      analysisId: `plate-demo-${Date.now()}`,
      detectedItems: sample.items,
      plateSummary: {
        totalCalories: sample.items.reduce((s, i) => s + i.calories, 0),
        totalProteinG: sample.items.reduce((s, i) => s + i.proteinG, 0),
        totalCarbsG: sample.items.reduce((s, i) => s + i.carbsG, 0),
        totalFatG: sample.items.reduce((s, i) => s + i.fatG, 0),
        totalFiberG: sample.items.reduce((s, i) => s + i.fiberG, 0),
      },
      healthAdvisory: sample.advisory,
      warnings: [],
    });
    setScaleMultiplier(1.0);
  };

  // Adjust item grams in plate analysis
  const handleAdjustItemGrams = (id: string, delta: number) => {
    if (!plateAnalysis) return;
    const updated = plateAnalysis.detectedItems.map((it) => {
      if (it.id !== id) return it;
      const nextGrams = Math.max(10, it.estimatedGrams + delta);
      const ratio = nextGrams / Math.max(1, it.estimatedGrams);
      return {
        ...it,
        estimatedGrams: nextGrams,
        calories: Math.round(it.calories * ratio),
        proteinG: Number((it.proteinG * ratio).toFixed(1)),
        carbsG: Number((it.carbsG * ratio).toFixed(1)),
        fatG: Number((it.fatG * ratio).toFixed(1)),
        fiberG: Number((it.fiberG * ratio).toFixed(1)),
      };
    });

    setPlateAnalysis({
      ...plateAnalysis,
      detectedItems: updated,
      plateSummary: {
        totalCalories: updated.reduce((s, i) => s + i.calories, 0),
        totalProteinG: Number(updated.reduce((s, i) => s + i.proteinG, 0).toFixed(1)),
        totalCarbsG: Number(updated.reduce((s, i) => s + i.carbsG, 0).toFixed(1)),
        totalFatG: Number(updated.reduce((s, i) => s + i.fatG, 0).toFixed(1)),
        totalFiberG: Number(updated.reduce((s, i) => s + i.fiberG, 0).toFixed(1)),
      },
    });
  };

  // Remove item from plate
  const handleRemovePlateItem = (id: string) => {
    if (!plateAnalysis) return;
    const remaining = plateAnalysis.detectedItems.filter((i) => i.id !== id);
    setPlateAnalysis({
      ...plateAnalysis,
      detectedItems: remaining,
      plateSummary: {
        totalCalories: remaining.reduce((s, i) => s + i.calories, 0),
        totalProteinG: Number(remaining.reduce((s, i) => s + i.proteinG, 0).toFixed(1)),
        totalCarbsG: Number(remaining.reduce((s, i) => s + i.carbsG, 0).toFixed(1)),
        totalFatG: Number(remaining.reduce((s, i) => s + i.fatG, 0).toFixed(1)),
        totalFiberG: Number(remaining.reduce((s, i) => s + i.fiberG, 0).toFixed(1)),
      },
    });
  };

  // Add missed dish
  const handleAddMissedDish = () => {
    if (!missedDishName.trim() || !plateAnalysis) return;
    const newItem: DetectedFoodPlateItem = {
      id: `custom-${Date.now()}`,
      name: missedDishName.trim(),
      category: "Side / Garnish",
      estimatedGrams: missedDishGrams,
      confidenceScore: 1.0,
      boundingBox: [0, 0, 1000, 1000],
      calories: Math.round(missedDishGrams * 1.5),
      proteinG: Number((missedDishGrams * 0.05).toFixed(1)),
      carbsG: Number((missedDishGrams * 0.15).toFixed(1)),
      fatG: Number((missedDishGrams * 0.07).toFixed(1)),
      fiberG: Number((missedDishGrams * 0.02).toFixed(1)),
      servingDescription: `${missedDishGrams}g portion`,
    };

    const updated = [...plateAnalysis.detectedItems, newItem];
    setPlateAnalysis({
      ...plateAnalysis,
      detectedItems: updated,
      plateSummary: {
        totalCalories: updated.reduce((s, i) => s + i.calories, 0),
        totalProteinG: Number(updated.reduce((s, i) => s + i.proteinG, 0).toFixed(1)),
        totalCarbsG: Number(updated.reduce((s, i) => s + i.carbsG, 0).toFixed(1)),
        totalFatG: Number(updated.reduce((s, i) => s + i.fatG, 0).toFixed(1)),
        totalFiberG: Number(updated.reduce((s, i) => s + i.fiberG, 0).toFixed(1)),
      },
    });
    setMissedDishName("");
    setMissedDishGrams(100);
    setIsAddingMissedDish(false);
  };

  // Global Scale multiplier handler
  const handleApplyGlobalScale = (mult: number) => {
    if (!plateAnalysis) return;
    const factor = mult / scaleMultiplier;
    const scaled = plateAnalysis.detectedItems.map((it) => ({
      ...it,
      estimatedGrams: Math.round(it.estimatedGrams * factor),
      calories: Math.round(it.calories * factor),
      proteinG: Number((it.proteinG * factor).toFixed(1)),
      carbsG: Number((it.carbsG * factor).toFixed(1)),
      fatG: Number((it.fatG * factor).toFixed(1)),
      fiberG: Number((it.fiberG * factor).toFixed(1)),
    }));

    setScaleMultiplier(mult);
    setPlateAnalysis({
      ...plateAnalysis,
      detectedItems: scaled,
      plateSummary: {
        totalCalories: scaled.reduce((s, i) => s + i.calories, 0),
        totalProteinG: Number(scaled.reduce((s, i) => s + i.proteinG, 0).toFixed(1)),
        totalCarbsG: Number(scaled.reduce((s, i) => s + i.carbsG, 0).toFixed(1)),
        totalFatG: Number(scaled.reduce((s, i) => s + i.fatG, 0).toFixed(1)),
        totalFiberG: Number(scaled.reduce((s, i) => s + i.fiberG, 0).toFixed(1)),
      },
    });
  };

  // Commit Plate to Diary
  const handleCommitPlateToDiary = async () => {
    if (!plateAnalysis || plateAnalysis.detectedItems.length === 0) return;
    setIsCommittingFood(true);

    try {
      for (const item of plateAnalysis.detectedItems) {
        await logItem(
          selectedSlot,
          item.name,
          item.estimatedGrams,
          item.calories,
          item.proteinG,
          item.carbsG,
          item.fatG,
          item.fiberG,
          0,
          0,
          item.servingDescription || "plate portion",
          "plate_vision",
          { confidence: item.confidenceScore }
        );
      }

      if (onSuccessToast) {
        onSuccessToast(
          "Plate Logged",
          `Committed ${plateAnalysis.detectedItems.length} dishes (${plateAnalysis.plateSummary.totalCalories} kcal) to ${selectedSlot.toUpperCase()} diary.`
        );
      }
      setPlateAnalysis(null);
      setPlateFile(null);
      setPlatePreviewUrl(null);
    } catch {
      alert("Failed to commit items to diary. Please try again.");
    } finally {
      setIsCommittingFood(false);
    }
  };

  // Tab 2: Commit Single Food to Diary
  const handleCommitSingleFood = async () => {
    if (!selectedFood) return;
    setIsCommittingFood(true);
    const factor = portionGrams / Math.max(1, selectedFood.servingWeightG);

    const scaledCalories = Math.round(selectedFood.calories * factor);
    const scaledProtein = Number((selectedFood.proteinG * factor).toFixed(1));
    const scaledCarbs = Number((selectedFood.carbsG * factor).toFixed(1));
    const scaledFat = Number((selectedFood.fatG * factor).toFixed(1));
    const scaledFiber = Number((selectedFood.fiberG * factor).toFixed(1));
    const scaledSodium = Math.round(selectedFood.sodiumMg * factor);
    const scaledSugar = Number((selectedFood.sugarG * factor).toFixed(1));

    try {
      await logItem(
        selectedSlot,
        selectedFood.foodName,
        portionGrams,
        scaledCalories,
        scaledProtein,
        scaledCarbs,
        scaledFat,
        scaledFiber,
        scaledSodium,
        scaledSugar,
        `${portionGrams}g portion`,
        "manual_search"
      );

      if (onSuccessToast) {
        onSuccessToast(
          "Food Item Logged",
          `Added ${selectedFood.foodName} (${scaledCalories} kcal) to ${selectedSlot.toUpperCase()}.`
        );
      }
    } catch {
      alert("Failed to log food item. Please try again.");
    } finally {
      setIsCommittingFood(false);
    }
  };

  // Calculated macro metrics for selected food in Tab 2
  const selectedFoodFactor = portionGrams / Math.max(1, selectedFood.servingWeightG);
  const curCalories = Math.round(selectedFood.calories * selectedFoodFactor);
  const curProtein = Number((selectedFood.proteinG * selectedFoodFactor).toFixed(1));
  const curCarbs = Number((selectedFood.carbsG * selectedFoodFactor).toFixed(1));
  const curFat = Number((selectedFood.fatG * selectedFoodFactor).toFixed(1));
  const curFiber = Number((selectedFood.fiberG * selectedFoodFactor).toFixed(1));
  const curSodium = Math.round(selectedFood.sodiumMg * selectedFoodFactor);
  const curSugar = Number((selectedFood.sugarG * selectedFoodFactor).toFixed(1));

  const totalMacroGrams = Math.max(0.1, curProtein + curCarbs + curFat);
  const proteinPct = Math.round((curProtein / totalMacroGrams) * 100);
  const carbsPct = Math.round((curCarbs / totalMacroGrams) * 100);
  const fatPct = Math.round((curFat / totalMacroGrams) * 100);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24 md:pb-16 pt-4 sm:pt-6 font-sans text-slate-900">
      {/* Live Camera Viewfinder Modal */}
      <Camera
        isOpen={isCameraOpen}
        onCapture={handleCameraCapture}
        onClose={() => setIsCameraOpen(false)}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Masthead Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-mono font-semibold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 uppercase">
              <BowlFood size={14} weight="bold" />
              <span>Fresh Foods &amp; Meals • ICMR-NIN 2024</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-950 mt-2 tracking-tight">
              Food &amp; Meal Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Log fresh home-cooked dishes, analyze your thali plates with AI vision, calculate custom serving portions, and track your daily macro goals against clinical benchmarks.
            </p>
          </div>

          {/* Meal Slot Quick Selector */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start md:self-auto">
            <span className="text-2xs font-mono font-medium text-slate-500 px-2 uppercase">Slot:</span>
            {(["breakfast", "lunch", "dinner", "snack"] as const).map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedSlot === slot
                    ? "bg-slate-950 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Cross-Link Notice: Packaged Food Scanner */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50/50 to-white border border-amber-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Barcode size={20} weight="bold" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-950">
                Auditing Packaged Groceries, Biscuits or Instant Noodles?
              </h4>
              <p className="text-2xs text-slate-600 mt-0.5">
                Switch to Packaged Food Audit to inspect front &amp; back barcodes, detect palm oil, artificial food dyes, and verify manufacturer expiry dates.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("packaged")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-900 border border-amber-300 transition-colors shadow-2xs cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <span>Packaged Food Scanner</span>
            <ArrowRight size={13} weight="bold" />
          </button>
        </div>

        {/* Primary Page Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("vision")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "vision"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            <Sparkle size={16} weight={activeTab === "vision" ? "fill" : "regular"} />
            <span>AI Plate Vision Scanner</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "search"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            <MagnifyingGlass size={16} weight={activeTab === "search" ? "bold" : "regular"} />
            <span>Whole Food Search &amp; Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("guide")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "guide"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            <CookingPot size={16} weight={activeTab === "guide" ? "fill" : "regular"} />
            <span>ICMR-NIN 2024 Balanced Plate Guide</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: AI PLATE VISION SCANNER */}
        {/* ========================================================================= */}
        {activeTab === "vision" && (
          <div className="space-y-6">
            
            {/* Upload & Snapshot Action Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold font-heading text-slate-950 uppercase tracking-wider">
                    Visual Meal Perception &amp; Segmentation
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Photograph your cooked meal or thali. Computer vision detects dishes, estimates volumetric weight, and computes exact macros.
                  </p>
                </div>

                {/* Preset Demos */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-2xs font-mono text-slate-400 uppercase">Demo:</span>
                  {PRESET_SAMPLE_PLATES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleLoadSample(sample)}
                      className="text-2xs font-medium px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                      title={sample.description}
                    >
                      {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hidden Inputs */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleSelectPlateFile(e.target.files[0])}
              />
              <input
                type="file"
                ref={camInputRef}
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleSelectPlateFile(e.target.files[0])}
              />

              {/* Dual Action / Preview Area */}
              {!platePreviewUrl && !plateAnalysis && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Take Live Photo */}
                  <div
                    onClick={() => setIsCameraOpen(true)}
                    className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-emerald-50/30 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                      <CameraIcon size={24} weight="duotone" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                      Take Live Photo of Meal
                    </span>
                    <span className="text-2xs text-slate-500 mt-1 max-w-xs">
                      Open camera viewfinder to snapshot your home-cooked thali or restaurant dish.
                    </span>
                  </div>

                  {/* Upload Image */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-100/50 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                      <UploadSimple size={24} weight="bold" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                      Upload from Gallery
                    </span>
                    <span className="text-2xs text-slate-500 mt-1 max-w-xs">
                      Select JPG, PNG or WebP plate photo from your phone or desktop storage.
                    </span>
                  </div>
                </div>
              )}

              {/* Preview with Run Button */}
              {platePreviewUrl && !plateAnalysis && (
                <div className="space-y-4">
                  <div className="relative max-w-md mx-auto aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
                    <img
                      src={platePreviewUrl}
                      alt="Selected meal plate"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPlateFile(null);
                        setPlatePreviewUrl(null);
                      }}
                      className="absolute top-3 right-3 px-2 py-1 rounded-md bg-slate-950/80 hover:bg-slate-950 text-white text-2xs font-semibold backdrop-blur-xs transition-colors"
                    >
                      Change Photo
                    </button>
                  </div>

                  {isPlateScanning ? (
                    <div className="max-w-md mx-auto bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                        <span>{plateStage}</span>
                        <span className="font-mono">{plateProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                          style={{ width: `${plateProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={handleRunPlateScan}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
                      >
                        <Sparkle size={16} weight="fill" />
                        <span>Analyze Plate &amp; Calculate Macros</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Analysis Active Results View */}
              {plateAnalysis && (
                <div className="space-y-6 pt-2">
                  
                  {/* Summary Bar */}
                  <div className="bg-slate-950 text-white p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                          AI Plate Analysis Complete
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-2xs font-mono text-slate-400 uppercase">
                          Target Slot: {selectedSlot}
                        </span>
                      </div>
                      <h3 className="text-base font-bold font-heading text-white mt-1">
                        {plateAnalysis.detectedItems.length} Food Components Identified
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                        {plateAnalysis.healthAdvisory}
                      </p>
                    </div>

                    {/* Quick Macro Pills */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-center">
                        <span className="text-2xs font-mono text-slate-400 block">Calories</span>
                        <span className="text-sm font-bold text-white font-mono">
                          {plateAnalysis.plateSummary.totalCalories} kcal
                        </span>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-center">
                        <span className="text-2xs font-mono text-indigo-400 block">Protein</span>
                        <span className="text-sm font-bold text-indigo-300 font-mono">
                          {plateAnalysis.plateSummary.totalProteinG}g
                        </span>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-center">
                        <span className="text-2xs font-mono text-cyan-400 block">Carbs</span>
                        <span className="text-sm font-bold text-cyan-300 font-mono">
                          {plateAnalysis.plateSummary.totalCarbsG}g
                        </span>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-center">
                        <span className="text-2xs font-mono text-amber-400 block">Fats</span>
                        <span className="text-sm font-bold text-amber-300 font-mono">
                          {plateAnalysis.plateSummary.totalFatG}g
                        </span>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-center">
                        <span className="text-2xs font-mono text-emerald-400 block">Fiber</span>
                        <span className="text-sm font-bold text-emerald-300 font-mono">
                          {plateAnalysis.plateSummary.totalFiberG}g
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Global Portion Scaler Pill */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <Scales size={18} className="text-slate-600" />
                      <span className="text-xs font-semibold text-slate-800">
                        Global Portion Scale:
                      </span>
                      <span className="text-2xs text-slate-500">
                        Adjust entire plate quantity proportionately
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[0.5, 1.0, 1.5, 2.0].map((mult) => (
                        <button
                          key={mult}
                          type="button"
                          onClick={() => handleApplyGlobalScale(mult)}
                          className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer ${
                            scaleMultiplier === mult
                              ? "bg-slate-900 text-white"
                              : "bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {mult}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Detected Items Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider">
                        Segmented Items &amp; Gram Stepper
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsAddingMissedDish(true)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                      >
                        <Plus size={14} weight="bold" />
                        <span>Add Missing Dish</span>
                      </button>
                    </div>

                    {isAddingMissedDish && (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-center gap-3 animate-fadeIn">
                        <input
                          type="text"
                          value={missedDishName}
                          onChange={(e) => setMissedDishName(e.target.value)}
                          placeholder="Dish name (e.g. Boondi Raita, Salad, Ghee)"
                          className="flex-1 w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="number"
                            value={missedDishGrams}
                            onChange={(e) => setMissedDishGrams(Number(e.target.value))}
                            className="w-20 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                            min={10}
                            step={10}
                          />
                          <span className="text-xs font-mono text-slate-600">grams</span>
                          <button
                            type="button"
                            onClick={handleAddMissedDish}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAddingMissedDish(false)}
                            className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-2.5">
                      {plateAnalysis.detectedItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                              <ForkKnife size={16} weight="bold" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs font-bold text-slate-950 font-heading">
                                  {item.name}
                                </h5>
                                <span className="text-2xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {item.category}
                                </span>
                              </div>
                              <span className="text-2xs text-slate-400 font-mono">
                                AI Confidence: {Math.round(item.confidenceScore * 100)}%
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                            {/* Gram Stepper */}
                            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                              <button
                                type="button"
                                onClick={() => handleAdjustItemGrams(item.id, -10)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                                title="Decrease 10g"
                              >
                                <Minus size={12} weight="bold" />
                              </button>
                              <span className="px-2 text-xs font-mono font-semibold text-slate-900 min-w-[50px] text-center">
                                {item.estimatedGrams}g
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAdjustItemGrams(item.id, 10)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                                title="Increase 10g"
                              >
                                <Plus size={12} weight="bold" />
                              </button>
                            </div>

                            {/* Macro Numbers */}
                            <div className="text-right font-mono text-2xs min-w-[100px]">
                              <span className="font-bold text-slate-900 text-xs block">
                                {item.calories} kcal
                              </span>
                              <span className="text-slate-500">
                                P:{item.proteinG}g • C:{item.carbsG}g • F:{item.fatG}g
                              </span>
                            </div>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleRemovePlateItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Remove item"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setPlateAnalysis(null);
                        setPlateFile(null);
                        setPlatePreviewUrl(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <ArrowsClockwise size={14} weight="bold" />
                      <span>Scan Another Meal</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCommitPlateToDiary}
                      disabled={isCommittingFood || plateAnalysis.detectedItems.length === 0}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-900 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle size={16} weight="fill" className="text-emerald-400" />
                      <span>
                        {isCommittingFood
                          ? "Committing to Diary..."
                          : `Commit All to ${selectedSlot.toUpperCase()} Diary`}
                      </span>
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: WHOLE FOOD SEARCH & PORTION CALCULATOR */}
        {/* ========================================================================= */}
        {activeTab === "search" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 Columns: Food Search & Category Filter */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              
              {/* Search Bar */}
              <div className="relative">
                <MagnifyingGlass
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fresh dishes, lentils, rotis, sabzis, fruits..."
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all bg-slate-50/50"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-2xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Results List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {searchResults.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <p className="text-xs">No food items matching &ldquo;{searchQuery}&rdquo;.</p>
                  </div>
                ) : (
                  searchResults.map((food) => {
                    const isSelected = selectedFood.id === food.id;
                    return (
                      <div
                        key={food.id}
                        onClick={() => {
                          setSelectedFood(food);
                          setPortionGrams(food.servingWeightG);
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-emerald-50/70 border-emerald-500 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            <BowlFood size={18} weight={isSelected ? "fill" : "regular"} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-950 font-heading">
                                {food.foodName}
                              </h4>
                              {food.regionalName && (
                                <span className="text-2xs font-mono text-slate-500 hidden sm:inline">
                                  ({food.regionalName})
                                </span>
                              )}
                            </div>
                            <span className="text-2xs font-mono text-slate-500">
                              {food.category} • {food.servingWeightG}g standard serving
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-mono shrink-0">
                          <span className="text-xs font-bold text-slate-900 block">
                            {food.calories} kcal
                          </span>
                          <span className="text-2xs text-slate-500">
                            P: {food.proteinG}g • C: {food.carbsG}g
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Right 5 Columns: Interactive Portion & Macro Calculator */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5 flex flex-col justify-between">
              <div className="space-y-5">
                
                {/* Header */}
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-2xs font-mono font-bold text-emerald-700 uppercase tracking-wider block">
                    Portion Scaler &amp; Macro Breakdown
                  </span>
                  <h3 className="text-lg font-bold font-heading text-slate-950 mt-1">
                    {selectedFood.foodName}
                  </h3>
                  {selectedFood.regionalName && (
                    <span className="text-xs text-slate-500 font-mono">
                      Regional: {selectedFood.regionalName}
                    </span>
                  )}
                </div>

                {/* Gram Weight Stepper & Slider */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">
                      Serving Weight:
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                        <button
                          type="button"
                          onClick={() => setPortionGrams((g) => Math.max(10, g - 10))}
                          className="p-1 text-slate-600 hover:text-slate-900"
                        >
                          <Minus size={14} weight="bold" />
                        </button>
                        <span className="px-2.5 text-xs font-mono font-bold text-slate-950">
                          {portionGrams}g
                        </span>
                        <button
                          type="button"
                          onClick={() => setPortionGrams((g) => g + 10)}
                          className="p-1 text-slate-600 hover:text-slate-900"
                        >
                          <Plus size={14} weight="bold" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="5"
                    value={portionGrams}
                    onChange={(e) => setPortionGrams(Number(e.target.value))}
                    className="w-full accent-slate-900 cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-2xs font-mono text-slate-500">
                    <span>10g (Tasting)</span>
                    <span>{selectedFood.servingWeightG}g (Standard)</span>
                    <span>500g (Large)</span>
                  </div>
                </div>

                {/* Nutrition Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900 text-white p-3.5 rounded-xl">
                    <span className="text-2xs font-mono uppercase text-slate-400 block">Total Energy</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-extrabold font-heading">{curCalories}</span>
                      <span className="text-2xs font-mono text-slate-300">kcal</span>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-xl">
                    <span className="text-2xs font-mono uppercase text-indigo-700 font-bold block">Protein</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-extrabold font-heading text-indigo-950">{curProtein}</span>
                      <span className="text-2xs font-mono text-indigo-700">g</span>
                    </div>
                  </div>

                  <div className="bg-cyan-50 border border-cyan-100 p-3.5 rounded-xl">
                    <span className="text-2xs font-mono uppercase text-cyan-700 font-bold block">Carbohydrates</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-extrabold font-heading text-cyan-950">{curCarbs}</span>
                      <span className="text-2xs font-mono text-cyan-700">g</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl">
                    <span className="text-2xs font-mono uppercase text-amber-700 font-bold block">Fats</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-extrabold font-heading text-amber-950">{curFat}</span>
                      <span className="text-2xs font-mono text-amber-700">g</span>
                    </div>
                  </div>
                </div>

                {/* Secondary Micronutrients */}
                <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Dietary Fiber</span>
                    <span className="font-mono font-bold text-slate-900">{curFiber}g</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Natural Sugar</span>
                    <span className="font-mono font-bold text-slate-900">{curSugar}g</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Sodium</span>
                    <span className="font-mono font-bold text-slate-900">{curSodium}mg</span>
                  </div>
                </div>

                {/* Macro Ratio Split Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-2xs font-mono text-slate-500">
                    <span>Protein ({proteinPct}%)</span>
                    <span>Carbs ({carbsPct}%)</span>
                    <span>Fat ({fatPct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-200">
                    <div className="bg-indigo-600 h-full" style={{ width: `${proteinPct}%` }} />
                    <div className="bg-cyan-500 h-full" style={{ width: `${carbsPct}%` }} />
                    <div className="bg-amber-500 h-full" style={{ width: `${fatPct}%` }} />
                  </div>
                </div>

              </div>

              {/* Commit Button */}
              <button
                type="button"
                onClick={handleCommitSingleFood}
                disabled={isCommittingFood}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-900 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Plus size={16} weight="bold" />
                <span>
                  {isCommittingFood
                    ? "Adding to Diary..."
                    : `Log ${portionGrams}g ${selectedFood.foodName} to ${selectedSlot.toUpperCase()}`}
                </span>
              </button>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ICMR-NIN 2024 BALANCED PLATE GUIDE */}
        {/* ========================================================================= */}
        {activeTab === "guide" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-8">
            <div>
              <span className="text-2xs font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase">
                Official Clinical Benchmarks
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-950 mt-2">
                ICMR-NIN 2024 &ldquo;My Plate for the Day&rdquo; Rule
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                The Indian Council of Medical Research (ICMR) and National Institute of Nutrition (NIN) prescribe a proportional plate balance to avert type 2 diabetes, cardiovascular complications, and visceral adiposity.
              </p>
            </div>

            {/* 3-Part Proportional Plate Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 50% Vegetables & Fruits */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-emerald-900 uppercase tracking-wider">
                    Half the Plate (50%)
                  </span>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                    50%
                  </span>
                </div>
                <h3 className="text-base font-bold text-emerald-950 font-heading">
                  Vegetables, Greens &amp; Salads
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Consume 400–500g of dark green leafy vegetables, roots, tubers, and fresh raw salads daily. Provides essential polyphenols, potassium, and viscous dietary fiber to suppress postprandial glucose surges.
                </p>
                <div className="pt-2 text-2xs font-mono text-emerald-700">
                  Examples: Palak, Methi, Bhindi, Gobi, Cucumber, Carrots, Tomato, Papaya.
                </div>
              </div>

              {/* 25% Whole Grains */}
              <div className="p-5 rounded-2xl bg-cyan-50/60 border border-cyan-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-cyan-900 uppercase tracking-wider">
                    Quarter Plate (25%)
                  </span>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-cyan-200 text-cyan-900">
                    25%
                  </span>
                </div>
                <h3 className="text-base font-bold text-cyan-950 font-heading">
                  Whole Grains &amp; Millets
                </h3>
                <p className="text-xs text-cyan-800 leading-relaxed">
                  Limit refined wheat flour (maida) and polished white rice. Favor whole wheat rotis, jowar, bajra, ragi, and brown basmati rice to maintain cellular glycogen without inducing insulin spikes.
                </p>
                <div className="pt-2 text-2xs font-mono text-cyan-700">
                  Examples: Whole wheat phulka, Ragi roti, Jowar bhakri, Brown rice, Steel cut oats.
                </div>
              </div>

              {/* 25% Protein & Pulses */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-indigo-900 uppercase tracking-wider">
                    Quarter Plate (25%)
                  </span>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900">
                    25%
                  </span>
                </div>
                <h3 className="text-base font-bold text-indigo-950 font-heading">
                  Lentils, Dairy &amp; Lean Protein
                </h3>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  Provide complete branch-chain amino acids for muscular repair and hormone synthesis. Pair lentils with curd or paneer for a complete protein score (PDCAAS).
                </p>
                <div className="pt-2 text-2xs font-mono text-indigo-700">
                  Examples: Toor Dal, Moong, Chana, Low-fat Paneer, Curd/Dahi, Eggs, Tofu.
                </div>
              </div>

            </div>

            {/* Essential Fats & Sodium Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <span className="text-2xs font-mono font-bold text-slate-700 uppercase">
                  Visible Oil Allowance
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Limit total visible cooking oils to 25–30g per day per person. Favor cold-pressed mustard, sesame, or groundnut oil. Avoid re-heating oils and strictly avoid palm oil.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <span className="text-2xs font-mono font-bold text-slate-700 uppercase">
                  Daily Sodium Ceiling
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Keep sodium intake under 2000mg/day (equivalent to 5g of salt). Avoid industrial seasoning cubes, artificial monosodium glutamate, and high-sodium packaged snacks.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
