-- Seed Data: Verified Food Reference (105 Items)
-- Compatible with PostgreSQL 16 / Supabase
-- Idempotent insert with ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Roti / Chapati (Whole Wheat)', 'Phulka / Roti', 'grains_cereals',
    264.00, 9.00, 51.00,
    2.50, 7.00, 150.00,
    1.00, '[{"unit": "1 medium roti", "weight_g": 35.0}, {"unit": "2 medium rotis", "weight_g": 70.0}, {"unit": "100g serving", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Paratha (Plain Tawa)', 'Plain Paratha', 'grains_cereals',
    310.00, 7.50, 45.00,
    11.00, 5.00, 220.00,
    1.00, '[{"unit": "1 plain paratha", "weight_g": 60.0}, {"unit": "100g serving", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Naan (Tandoori Plain)', 'Tandoori Naan', 'grains_cereals',
    290.00, 8.50, 52.00,
    5.00, 2.50, 380.00,
    2.00, '[{"unit": "1 naan", "weight_g": 90.0}, {"unit": "100g serving", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Brown Rice (Cooked)', 'Bhura Chawal', 'grains_cereals',
    123.00, 2.70, 25.60,
    1.00, 1.80, 4.00,
    0.40, '[{"unit": "1 katori cooked", "weight_g": 150.0}, {"unit": "1 cup cooked", "weight_g": 195.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Basmati White Rice (Cooked)', 'Chawal / Bhat', 'grains_cereals',
    130.00, 2.70, 28.20,
    0.30, 0.40, 2.00,
    0.10, '[{"unit": "1 katori cooked", "weight_g": 150.0}, {"unit": "1 plate cooked", "weight_g": 200.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Poha (Cooked Flattened Rice)', 'Kanda Poha', 'grains_cereals',
    180.00, 3.20, 33.00,
    3.80, 2.00, 210.00,
    1.50, '[{"unit": "1 bowl", "weight_g": 180.0}, {"unit": "100g serving", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Upma (Cooked Semolina)', 'Rava Upma', 'grains_cereals',
    165.00, 3.50, 26.00,
    5.00, 2.00, 250.00,
    1.00, '[{"unit": "1 bowl", "weight_g": 180.0}, {"unit": "100g serving", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Idli (Steamed Rice-Dal Cake)', 'Idli', 'grains_cereals',
    140.00, 4.50, 28.00,
    0.80, 1.80, 180.00,
    0.50, '[{"unit": "1 piece", "weight_g": 40.0}, {"unit": "2 pieces", "weight_g": 80.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Plain Dosa', 'Sada Dosa', 'grains_cereals',
    168.00, 3.90, 28.50,
    4.20, 1.50, 220.00,
    0.80, '[{"unit": "1 medium dosa", "weight_g": 90.0}, {"unit": "100g serving", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Masala Dosa', 'Masala Dosa', 'grains_cereals',
    215.00, 4.20, 32.00,
    7.80, 2.50, 310.00,
    1.20, '[{"unit": "1 full dosa", "weight_g": 160.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Rolled Oats (Cooked with Water)', 'Oatmeal', 'grains_cereals',
    71.00, 2.50, 12.00,
    1.40, 1.70, 2.00,
    0.30, '[{"unit": "1 bowl cooked", "weight_g": 200.0}, {"unit": "100g serving", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Quinoa (Cooked)', 'Quinoa', 'grains_cereals',
    120.00, 4.40, 21.30,
    1.90, 2.80, 7.00,
    0.90, '[{"unit": "1 cup cooked", "weight_g": 185.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Dalia / Broken Wheat Khichdi', 'Daliya', 'grains_cereals',
    110.00, 3.40, 20.00,
    1.80, 3.50, 180.00,
    0.50, '[{"unit": "1 bowl", "weight_g": 200.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Whole Wheat Bread', 'Brown Bread', 'grains_cereals',
    247.00, 11.00, 43.00,
    3.40, 6.00, 450.00,
    4.50, '[{"unit": "1 slice", "weight_g": 35.0}, {"unit": "2 slices", "weight_g": 70.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Pav (Indian Dinner Roll)', 'Ladi Pav', 'grains_cereals',
    275.00, 8.50, 53.00,
    2.80, 2.00, 420.00,
    3.00, '[{"unit": "1 piece", "weight_g": 45.0}, {"unit": "2 pieces", "weight_g": 90.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Yellow Dal Tadka', 'Toor / Moong Dal', 'lentils_legumes',
    115.00, 6.20, 15.00,
    3.40, 4.00, 240.00,
    0.80, '[{"unit": "1 katori cooked", "weight_g": 150.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Moong Dal Khichdi', 'Khichdi', 'lentils_legumes',
    135.00, 5.00, 22.00,
    3.00, 3.00, 210.00,
    0.50, '[{"unit": "1 bowl cooked", "weight_g": 200.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Chana Dal Curry', 'Bengal Gram Dal', 'lentils_legumes',
    130.00, 7.00, 17.50,
    3.40, 5.00, 250.00,
    1.00, '[{"unit": "1 katori", "weight_g": 150.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Rajma Curry (Kidney Beans)', 'Rajma Masala', 'lentils_legumes',
    140.00, 6.80, 20.00,
    3.60, 5.50, 260.00,
    1.20, '[{"unit": "1 katori", "weight_g": 150.0}, {"unit": "1 bowl", "weight_g": 200.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Chole Masala (Chickpeas)', 'Kabuli Chana', 'lentils_legumes',
    165.00, 7.20, 21.00,
    5.80, 5.20, 290.00,
    1.50, '[{"unit": "1 katori", "weight_g": 150.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Masoor Dal (Red Lentil)', 'Lal Masoor', 'lentils_legumes',
    110.00, 6.50, 14.50,
    2.80, 3.80, 220.00,
    0.70, '[{"unit": "1 katori", "weight_g": 150.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Sambar', 'South Indian Sambar', 'lentils_legumes',
    85.00, 3.80, 13.00,
    2.00, 3.20, 280.00,
    1.80, '[{"unit": "1 katori", "weight_g": 150.0}, {"unit": "1 bowl", "weight_g": 200.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Dal Makhani', 'Maa ki Dal', 'lentils_legumes',
    168.00, 5.50, 16.50,
    9.00, 4.20, 280.00,
    1.20, '[{"unit": "1 katori", "weight_g": 150.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Boiled Chickpeas', 'Boiled Chana', 'lentils_legumes',
    164.00, 8.90, 27.40,
    2.60, 7.60, 24.00,
    4.80, '[{"unit": "1 cup", "weight_g": 164.0}, {"unit": "100g serving", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Sprouted Moong (Raw)', 'Ankurit Moong', 'lentils_legumes',
    105.00, 7.00, 19.00,
    0.40, 3.50, 15.00,
    2.00, '[{"unit": "1 bowl", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Soya Chunks (Boiled)', 'Meal Maker', 'lentils_legumes',
    120.00, 17.00, 9.00,
    0.50, 5.00, 10.00,
    1.00, '[{"unit": "1 bowl cooked", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Lobia Curry (Black Eyed Peas)', 'Chawli / Lobia', 'lentils_legumes',
    125.00, 6.50, 17.00,
    3.20, 4.50, 230.00,
    1.00, '[{"unit": "1 katori", "weight_g": 150.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Cow Milk (Whole 3.5% Fat)', 'Gay ka Doodh', 'dairy_alternatives',
    64.00, 3.30, 4.80,
    3.50, 0.00, 45.00,
    4.80, '[{"unit": "1 glass", "weight_g": 200.0}, {"unit": "1 cup", "weight_g": 150.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Buffalo Milk (Full Cream)', 'Bhains ka Doodh', 'dairy_alternatives',
    97.00, 3.80, 5.20,
    6.90, 0.00, 50.00,
    5.20, '[{"unit": "1 glass", "weight_g": 200.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Curd / Plain Dahi (Whole Milk)', 'Dahi / Yogurt', 'dairy_alternatives',
    61.00, 3.50, 4.70,
    3.30, 0.00, 46.00,
    4.70, '[{"unit": "1 katori", "weight_g": 120.0}, {"unit": "1 cup", "weight_g": 150.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Greek Yogurt (Plain Non-fat)', 'Greek Dahi', 'dairy_alternatives',
    59.00, 10.20, 3.60,
    0.40, 0.00, 36.00,
    3.20, '[{"unit": "1 cup", "weight_g": 150.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Paneer (Indian Cottage Cheese)', 'Paneer', 'dairy_alternatives',
    265.00, 18.30, 3.40,
    20.00, 0.00, 22.00,
    2.50, '[{"unit": "50g cubes", "weight_g": 50.0}, {"unit": "100g slab", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Tofu (Firm)', 'Soy Paneer', 'dairy_alternatives',
    83.00, 10.00, 1.90,
    4.50, 0.90, 12.00,
    0.50, '[{"unit": "100g slab", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Chaas / Buttermilk (Spiced)', 'Chaas / Mattha', 'dairy_alternatives',
    28.00, 1.60, 2.40,
    1.30, 0.20, 160.00,
    2.40, '[{"unit": "1 glass", "weight_g": 250.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Desi Ghee (Clarified Butter)', 'Shuddh Desi Ghee', 'dairy_alternatives',
    884.00, 0.30, 0.00,
    98.00, 0.00, 2.00,
    0.00, '[{"unit": "1 tsp", "weight_g": 5.0}, {"unit": "1 tbsp", "weight_g": 14.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Cheddar Cheese', 'Cheese Slice', 'dairy_alternatives',
    403.00, 24.90, 1.30,
    33.10, 0.00, 621.00,
    0.50, '[{"unit": "1 slice", "weight_g": 28.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Salted Table Butter', 'Makhan', 'dairy_alternatives',
    733.00, 0.80, 0.10,
    81.10, 0.00, 580.00,
    0.10, '[{"unit": "1 cube", "weight_g": 10.0}, {"unit": "1 tbsp", "weight_g": 14.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Skimmed Milk', 'Toned / Skimmed Milk', 'dairy_alternatives',
    35.00, 3.40, 4.90,
    0.20, 0.00, 52.00,
    4.90, '[{"unit": "1 glass", "weight_g": 200.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Unsweetened Soy Milk', 'Soy Doodh', 'dairy_alternatives',
    43.00, 3.80, 2.10,
    2.00, 1.00, 45.00,
    0.80, '[{"unit": "1 glass", "weight_g": 200.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Whole Boiled Egg', 'Ubla Anda', 'poultry_seafood_meat',
    143.00, 12.60, 0.70,
    9.50, 0.00, 124.00,
    0.70, '[{"unit": "1 large egg", "weight_g": 50.0}, {"unit": "2 large eggs", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Boiled Egg White', 'Ande ki Safedi', 'poultry_seafood_meat',
    52.00, 10.90, 0.70,
    0.20, 0.00, 166.00,
    0.70, '[{"unit": "2 egg whites", "weight_g": 66.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Egg Omelet (Plain 2 eggs)', 'Anda Omelette', 'poultry_seafood_meat',
    154.00, 11.00, 1.20,
    11.50, 0.10, 240.00,
    0.80, '[{"unit": "1 serving", "weight_g": 110.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Chicken Breast (Skinless Boiled/Grilled)', 'Murg Breast', 'poultry_seafood_meat',
    165.00, 31.00, 0.00,
    3.60, 0.00, 74.00,
    0.00, '[{"unit": "1 breast fillet", "weight_g": 150.0}, {"unit": "100g serving", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Chicken Thigh (Cooked Boneless)', 'Murg Thigh', 'poultry_seafood_meat',
    209.00, 26.00, 0.00,
    10.90, 0.00, 86.00,
    0.00, '[{"unit": "1 thigh piece", "weight_g": 120.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Tandoori Grilled Chicken', 'Tandoori Chicken', 'poultry_seafood_meat',
    185.00, 27.50, 2.20,
    7.10, 0.40, 340.00,
    0.50, '[{"unit": "1 leg/chest piece", "weight_g": 140.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Rohu / Indian Carp Fish Curry', 'Machhli Curry', 'poultry_seafood_meat',
    145.00, 16.00, 3.50,
    7.20, 0.80, 280.00,
    0.50, '[{"unit": "1 piece with gravy", "weight_g": 160.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Salmon Fillet (Pan Seared)', 'Salmon Machhli', 'poultry_seafood_meat',
    206.00, 22.10, 0.00,
    12.30, 0.00, 60.00,
    0.00, '[{"unit": "1 fillet", "weight_g": 150.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Boiled Prawns / Shrimp', 'Jhinga', 'poultry_seafood_meat',
    99.00, 24.00, 0.20,
    0.30, 0.00, 111.00,
    0.00, '[{"unit": "10 medium prawns", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Mutton Curry (Goat Meat)', 'Gosht / Mutton Curry', 'poultry_seafood_meat',
    215.00, 18.50, 3.00,
    14.00, 0.70, 310.00,
    0.60, '[{"unit": "1 serving", "weight_g": 180.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Canned Tuna in Water', 'Tuna Fish', 'poultry_seafood_meat',
    116.00, 26.00, 0.00,
    1.00, 0.00, 330.00,
    0.00, '[{"unit": "1 can drained", "weight_g": 120.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Turkey Breast (Roast)', 'Turkey Breast', 'poultry_seafood_meat',
    135.00, 30.00, 0.00,
    1.00, 0.00, 68.00,
    0.00, '[{"unit": "100g serving", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Aloo Gobi', 'Aloo Gobi Sabzi', 'cooked_vegetables_dishes',
    115.00, 2.60, 14.50,
    5.20, 3.20, 260.00,
    2.20, '[{"unit": "1 katori", "weight_g": 150.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Palak Paneer', 'Palak Paneer', 'cooked_vegetables_dishes',
    165.00, 8.50, 6.00,
    12.00, 2.80, 290.00,
    1.50, '[{"unit": "1 katori", "weight_g": 160.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Bhindi Masala (Okra)', 'Bhindi ki Sabzi', 'cooked_vegetables_dishes',
    98.00, 2.10, 9.50,
    5.80, 3.50, 240.00,
    2.00, '[{"unit": "1 katori", "weight_g": 140.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Mixed Vegetable Sabzi', 'Mix Veg', 'cooked_vegetables_dishes',
    92.00, 2.40, 11.00,
    4.20, 3.40, 230.00,
    2.50, '[{"unit": "1 katori", "weight_g": 150.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Baingan Bharta (Roasted Eggplant)', 'Baingan Bharta', 'cooked_vegetables_dishes',
    88.00, 1.80, 8.50,
    5.20, 3.00, 220.00,
    3.20, '[{"unit": "1 katori", "weight_g": 150.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Matar Mushroom', 'Khumb Matar', 'cooked_vegetables_dishes',
    102.00, 4.50, 9.80,
    5.00, 3.00, 250.00,
    2.80, '[{"unit": "1 katori", "weight_g": 150.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Methi Malai Matar', 'Methi Matar Malai', 'cooked_vegetables_dishes',
    155.00, 4.20, 12.00,
    10.00, 3.20, 270.00,
    3.50, '[{"unit": "1 katori", "weight_g": 150.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Lauki Sabzi (Bottle Gourd)', 'Ghia / Doodhi Sabzi', 'cooked_vegetables_dishes',
    65.00, 1.20, 6.00,
    4.00, 1.80, 210.00,
    2.00, '[{"unit": "1 katori", "weight_g": 150.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Aloo Jeera', 'Jeera Aloo', 'cooked_vegetables_dishes',
    135.00, 2.00, 19.00,
    5.80, 2.20, 270.00,
    1.00, '[{"unit": "1 katori", "weight_g": 150.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Paneer Bhurji', 'Spiced Scrambled Paneer', 'cooked_vegetables_dishes',
    195.00, 13.00, 4.50,
    13.80, 1.50, 280.00,
    1.80, '[{"unit": "1 katori", "weight_g": 140.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Chicken Biryani (Home Style)', 'Murgh Biryani', 'cooked_vegetables_dishes',
    178.00, 9.50, 21.00,
    6.20, 1.40, 320.00,
    0.80, '[{"unit": "1 plate", "weight_g": 250.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Vegetable Pulao', 'Veg Pulao', 'cooked_vegetables_dishes',
    145.00, 3.20, 24.50,
    3.80, 2.20, 260.00,
    1.20, '[{"unit": "1 plate", "weight_g": 200.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Egg Bhurji (Scrambled Spiced Egg)', 'Anda Bhurji', 'cooked_vegetables_dishes',
    162.00, 11.50, 2.80,
    11.40, 0.80, 270.00,
    1.20, '[{"unit": "1 serving", "weight_g": 130.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Kadhi Pakora', 'Besan Kadhi Pakora', 'cooked_vegetables_dishes',
    138.00, 4.50, 13.00,
    7.50, 1.80, 340.00,
    2.50, '[{"unit": "1 katori", "weight_g": 160.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Cucumber (Raw with Peel)', 'Kheera', 'raw_vegetables_salads',
    15.00, 0.70, 3.60,
    0.10, 0.50, 2.00,
    1.70, '[{"unit": "1 medium cucumber", "weight_g": 120.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Vine Tomato (Raw)', 'Tamatar', 'raw_vegetables_salads',
    18.00, 0.90, 3.90,
    0.20, 1.20, 5.00,
    2.60, '[{"unit": "1 medium tomato", "weight_g": 110.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Red Onion (Raw)', 'Pyaz', 'raw_vegetables_salads',
    40.00, 1.10, 9.30,
    0.10, 1.70, 4.00,
    4.20, '[{"unit": "1 small onion", "weight_g": 70.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Fresh Spinach (Raw)', 'Palak Patta', 'raw_vegetables_salads',
    23.00, 2.90, 3.60,
    0.40, 2.20, 79.00,
    0.40, '[{"unit": "1 cup raw", "weight_g": 30.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Broccoli (Raw Florets)', 'Broccoli', 'raw_vegetables_salads',
    34.00, 2.80, 6.60,
    0.40, 2.60, 33.00,
    1.70, '[{"unit": "1 cup florets", "weight_g": 91.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Shredded Iceberg Lettuce', 'Salad Patta', 'raw_vegetables_salads',
    14.00, 0.90, 3.00,
    0.10, 1.20, 10.00,
    2.00, '[{"unit": "1 cup", "weight_g": 72.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Raw Carrot', 'Gajar', 'raw_vegetables_salads',
    41.00, 0.90, 9.60,
    0.20, 2.80, 69.00,
    4.70, '[{"unit": "1 medium carrot", "weight_g": 61.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Raw Beetroot', 'Chukandar', 'raw_vegetables_salads',
    43.00, 1.60, 9.60,
    0.20, 2.80, 78.00,
    6.80, '[{"unit": "1 small beetroot", "weight_g": 80.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Green Bell Pepper / Capsicum', 'Shimla Mirch', 'raw_vegetables_salads',
    20.00, 0.90, 4.60,
    0.20, 1.70, 3.00,
    2.40, '[{"unit": "1 medium capsicum", "weight_g": 120.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Green Cabbage (Raw Shredded)', 'Patta Gobi', 'raw_vegetables_salads',
    25.00, 1.30, 5.80,
    0.10, 2.50, 18.00,
    3.20, '[{"unit": "1 cup", "weight_g": 89.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'White Radish / Mooli', 'Mooli', 'raw_vegetables_salads',
    16.00, 0.70, 3.40,
    0.10, 1.60, 39.00,
    1.90, '[{"unit": "1 radish", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Raw Cauliflower Florets', 'Phool Gobi', 'raw_vegetables_salads',
    25.00, 1.90, 5.00,
    0.30, 2.00, 30.00,
    1.90, '[{"unit": "1 cup", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Cavendish Banana', 'Kela', 'fresh_fruits',
    89.00, 1.10, 22.80,
    0.30, 2.60, 1.00,
    12.20, '[{"unit": "1 medium banana", "weight_g": 118.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Royal Gala Apple (with Skin)', 'Seb', 'fresh_fruits',
    52.00, 0.30, 13.80,
    0.20, 2.40, 1.00,
    10.40, '[{"unit": "1 medium apple", "weight_g": 182.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Fresh Papaya', 'Papita', 'fresh_fruits',
    43.00, 0.50, 10.80,
    0.30, 1.70, 8.00,
    7.80, '[{"unit": "1 cup diced", "weight_g": 145.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Fresh Guava', 'Amrood', 'fresh_fruits',
    68.00, 2.60, 14.30,
    1.00, 5.40, 2.00,
    8.90, '[{"unit": "1 medium guava", "weight_g": 100.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Alphonso Mango', 'Aam', 'fresh_fruits',
    60.00, 0.80, 15.00,
    0.40, 1.60, 1.00,
    13.70, '[{"unit": "1 cup sliced", "weight_g": 165.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Sweet Orange', 'Santra / Mosambi', 'fresh_fruits',
    47.00, 0.90, 11.80,
    0.10, 2.40, 0.00,
    9.40, '[{"unit": "1 medium orange", "weight_g": 131.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Fresh Watermelon', 'Tarbooj', 'fresh_fruits',
    30.00, 0.60, 7.60,
    0.20, 0.40, 1.00,
    6.20, '[{"unit": "1 bowl diced", "weight_g": 200.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Pomegranate Seeds', 'Anaar Daana', 'fresh_fruits',
    83.00, 1.70, 18.70,
    1.20, 4.00, 3.00,
    13.70, '[{"unit": "1/2 cup", "weight_g": 87.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Green Grapes', 'Angoor', 'fresh_fruits',
    69.00, 0.70, 18.10,
    0.20, 0.90, 2.00,
    15.50, '[{"unit": "1 cup", "weight_g": 151.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Fresh Pineapple', 'Ananas', 'fresh_fruits',
    50.00, 0.50, 13.10,
    0.10, 1.40, 1.00,
    9.90, '[{"unit": "1 cup chunks", "weight_g": 165.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Green Kiwi Fruit', 'Kiwi', 'fresh_fruits',
    61.00, 1.10, 14.70,
    0.50, 3.00, 3.00,
    9.00, '[{"unit": "1 medium kiwi", "weight_g": 69.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Mixed Berries (Strawberries & Blueberries)', 'Berries', 'fresh_fruits',
    45.00, 0.80, 11.00,
    0.40, 2.80, 1.00,
    6.50, '[{"unit": "1 cup", "weight_g": 140.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Raw Almonds', 'Badam', 'nuts_seeds_fats',
    579.00, 21.20, 21.60,
    49.90, 12.50, 1.00,
    4.40, '[{"unit": "10 almonds", "weight_g": 12.0}, {"unit": "1 handful", "weight_g": 28.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Raw Walnuts', 'Akhrot', 'nuts_seeds_fats',
    654.00, 15.20, 13.70,
    65.20, 6.70, 2.00,
    2.60, '[{"unit": "4 halves", "weight_g": 14.0}, {"unit": "1 handful", "weight_g": 28.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Chia Seeds', 'Chia Beej', 'nuts_seeds_fats',
    486.00, 16.50, 42.10,
    30.70, 34.40, 16.00,
    0.00, '[{"unit": "1 tbsp", "weight_g": 12.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Flax Seeds (Ground)', 'Alsi Beej', 'nuts_seeds_fats',
    534.00, 18.30, 28.90,
    42.20, 27.30, 30.00,
    1.60, '[{"unit": "1 tbsp", "weight_g": 10.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Roasted Peanuts (Unsalted)', 'Moongphali', 'nuts_seeds_fats',
    585.00, 24.40, 21.50,
    49.70, 8.00, 6.00,
    4.20, '[{"unit": "1 handful", "weight_g": 30.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Cashew Nuts (Raw)', 'Kaju', 'nuts_seeds_fats',
    553.00, 18.20, 30.20,
    43.80, 3.30, 12.00,
    5.90, '[{"unit": "10 cashews", "weight_g": 15.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Pumpkin Seeds', 'Kaddu ke Beej', 'nuts_seeds_fats',
    559.00, 30.20, 10.70,
    49.00, 6.00, 7.00,
    1.40, '[{"unit": "1 tbsp", "weight_g": 15.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Extra Virgin Olive Oil', 'Jaitun ka Tel', 'nuts_seeds_fats',
    884.00, 0.00, 0.00,
    98.00, 0.00, 2.00,
    0.00, '[{"unit": "1 tsp", "weight_g": 5.0}, {"unit": "1 tbsp", "weight_g": 14.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Roasted Chana (Bengal Gram)', 'Bhuna Chana', 'snacks_beverages',
    369.00, 18.60, 58.00,
    5.20, 16.80, 28.00,
    3.00, '[{"unit": "1 handful", "weight_g": 30.0}, {"unit": "1 bowl", "weight_g": 50.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Roasted Makhana (Foxnuts Plain)', 'Makhana', 'snacks_beverages',
    347.00, 9.70, 76.90,
    0.10, 14.50, 5.00,
    0.50, '[{"unit": "1 large bowl", "weight_g": 30.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Tender Coconut Water', 'Nariyal Paani', 'snacks_beverages',
    19.00, 0.70, 3.70,
    0.20, 1.10, 105.00,
    2.60, '[{"unit": "1 coconut", "weight_g": 240.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Pure Green Tea (Brewed Unsweetened)', 'Green Tea', 'snacks_beverages',
    1.00, 0.20, 0.00,
    0.00, 0.00, 1.00,
    0.00, '[{"unit": "1 cup", "weight_g": 200.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Black Coffee (Brewed Unsweetened)', 'Black Coffee', 'snacks_beverages',
    2.00, 0.30, 0.20,
    0.00, 0.00, 2.00,
    0.00, '[{"unit": "1 cup", "weight_g": 200.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Vegetable Samosa (Fried)', 'Samosa', 'snacks_beverages',
    262.00, 4.00, 32.00,
    13.00, 2.80, 390.00,
    1.80, '[{"unit": "1 samosa", "weight_g": 80.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Besan Cheela (Gram Flour Pancake)', 'Besan Puda / Cheela', 'snacks_beverages',
    185.00, 8.50, 24.00,
    6.00, 4.20, 260.00,
    1.50, '[{"unit": "1 medium cheela", "weight_g": 80.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;

INSERT INTO verified_food_reference (
    id, food_name, regional_name, category, calories_per_100g, protein_per_100g,
    carbs_per_100g, fat_per_100g, fiber_per_100g, sodium_per_100g, sugar_per_100g,
    portion_sizes_json, is_verified, created_at
) VALUES (
    gen_random_uuid(), 'Whey Protein Isolate (Unflavored Powder)', 'Whey Isolate', 'snacks_beverages',
    370.00, 88.00, 2.50,
    1.00, 0.00, 170.00,
    1.00, '[{"unit": "1 scoop", "weight_g": 30.0}]'::jsonb, TRUE, CURRENT_TIMESTAMP
) ON CONFLICT (food_name) DO NOTHING;
