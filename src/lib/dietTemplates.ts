export interface MealSlot {
  id: string;
  time: string;
  name: string;
  items: string;
  serving?: string;
  note?: string;
}

export interface DietPlanData {
  title: string;
  subtitle: string;
  consultationMode?: string;
  calorieTarget?: string;
  meals: MealSlot[];
  foodsToInclude: string[];
  foodsInModeration: string[];
  foodsToAvoid: string[];
  dietaryGuidelines: string[];
  followUp: string;
  specialNotes?: string;
}

export const PREDEFINED_DIET_TEMPLATES: Record<string, DietPlanData> = {
  pcod: {
    title: 'PCOD DIET PLAN',
    subtitle: 'Personalised Nutrition Chart',
    consultationMode: 'Online / Clinic',
    calorieTarget: '1400 - 1600 kcal',
    meals: [
      {
        id: 'm1',
        time: '6:00 – 7:00 AM',
        name: 'Early Morning',
        items: '½ teaspoon Fenugreek powder in lukewarm water + Soaked almonds 3 + walnuts 5.',
        serving: '1 glass / 500 mL',
        note: ''
      },
      {
        id: 'm2',
        time: '8:00 – 9:00 AM',
        name: 'Breakfast',
        items: 'Vegetable oats chilla – 2 medium with mint chutney.',
        serving: '2 medium',
        note: 'Include a good protein source with breakfast. Avoid sugary cereals, sweetened beverages and deep-fried breakfast items.'
      },
      {
        id: 'm3',
        time: '1:00 – 2:00 PM',
        name: 'Lunch',
        items: `• Raw vegetable salad – 1 bowl (cucumber, carrot, tomato and fresh coconut).
• Cooked brown rice / millets / quinoa – ¾–1 cup.
• Dal / sambar / sprouts curry – 1 bowl.
• Vegetable curry – 1 bowl.
• Protein choice: paneer / tofu / soy chunks / grilled chicken / fish / eggs.
• Plain curd – ½ cup.`,
        serving: '1 bowl salad + ¾ cup grains',
        note: `• Prefer whole grains and high-fibre foods.
• Include green leafy vegetables and different coloured vegetables.
• Avoid excess oil, refined carbohydrates and large portions of rice.
• Combine carbohydrates with protein and fibre.
• Any cereal – 100 grams + salad – 100 grams + veg curry – 200 grams + chicken or paneer – 100 grams.
• Include all green leafy vegetables & vegetables, except potato, radish and yam.`
      },
      {
        id: 'm4',
        time: '4:00 – 5:00 PM',
        name: 'Evening',
        items: 'Roasted chana – 1 small handful.',
        serving: '1 small handful',
        note: ''
      },
      {
        id: 'm5',
        time: '7:00 – 8:00 PM',
        name: 'Dinner',
        items: `• Vegetable salad (cucumber + carrot).
• Jowar roti – 2 small with bottle gourd curry / ridge gourd curry and dal.
• Cereal – 100 grams + salad – 100 grams + veg curry – 200 grams.`,
        serving: '2 small rotis + 1 bowl dal',
        note: 'Include: soyabeans, soya chunks & dals as well.'
      },
      {
        id: 'm6',
        time: '9:00 PM',
        name: 'Before Bed',
        items: '½ teaspoon Fenugreek powder in lukewarm water.',
        serving: '1 glass / 200 mL',
        note: ''
      }
    ],
    foodsToInclude: [
      'Use iodized salt in recommended amounts.',
      'Include high-quality protein daily: eggs, skinless chicken, milk, curd, paneer, tofu, dals, pulses, sprouts.',
      'Eat whole grains such as whole wheat, oats, brown rice, and millets (ragi, jowar, bajra).',
      'Consume 2–3 servings of vegetables and 1–2 servings of fruits daily.',
      'Include selenium-rich foods: eggs, sunflower seeds, whole grains, mushrooms.',
      'Include zinc-rich foods: pumpkin seeds, sesame seeds, legumes.',
      'Include iron-rich foods: green leafy vegetables, lentils, chickpeas, rajma.',
      'Include vitamin B12-rich foods: milk, curd, eggs, chicken.',
      'Include healthy fats: almonds, walnuts, flaxseeds, chia seeds.',
      'Drink 3–4 litres of water daily.',
      'Include curd and buttermilk for gut health.'
    ],
    foodsInModeration: [
      'Ghee, butter & coconut/palm oil.',
      'Fatty meat & processed meat: limit fatty cuts, organ meats and processed meat; choose lean protein more often.',
      'Nuts and seeds should be limited to a small handful (20–30 g/day).',
      'Caffeine (tea and coffee) should be limited.'
    ],
    foodsToAvoid: [
      'Organ meats – liver, kidney, brain, heart. Red meat – mutton, beef, pork.',
      'Avoid intake of coconut water and fruit juices till 2 months.',
      'Processed meat – sausages, salami, bacon.',
      'High-purine fish – sardines, anchovies, mackerel, herring.',
      'Shellfish – prawns, mussels.',
      'Alcohol, especially beer, and avoid smoking.',
      'Soft drinks & sugary beverages, packaged fruit juices (avoid fruit juices and large fruit portions at one time).',
      'Excess sweets and added sugar.',
      'Deep-fried & highly processed foods.',
      'Excess salt (continue using iodized salt, but avoid excess intake).'
    ],
    dietaryGuidelines: [
      'Prefer whole grains/millets.',
      'Protein at each major meal: include a protein source with breakfast, lunch and dinner.',
      'Take small and frequent meals instead of large meals.',
      'Do not skip meals and then overeat; maintain relatively consistent meal timing and avoid prolonged fasting.',
      'Stay physically active: at least 45 mins – 1 hour of physical activity, along with strength-training exercises 2–3 times weekly.',
      'Ensure adequate sleep (7–8 hours).',
      'Hydration (3–4 litres).'
    ],
    followUp: 'Regular follow-up for at least 3 months to monitor blood glucose levels and assess progress.'
  },

  weight_loss: {
    title: 'WEIGHT MANAGEMENT & FAT LOSS PLAN',
    subtitle: 'Calorie-Deficit Nutrition & Metabolism Chart',
    consultationMode: 'Online / Clinic',
    calorieTarget: '1300 - 1500 kcal',
    meals: [
      {
        id: 'm1',
        time: '6:30 – 7:00 AM',
        name: 'Early Morning',
        items: 'Warm lemon water with 1 tsp chia seeds + 4 soaked almonds.',
        serving: '1 glass / 400 mL',
        note: 'Boosts morning hydration and kickstarts metabolic rate.'
      },
      {
        id: 'm2',
        time: '8:30 – 9:00 AM',
        name: 'Breakfast',
        items: '2 boiled egg whites (or 100g sautéed tofu/paneer) + 1 Multigrain / Besan Chilla with mint chutney.',
        serving: '1-2 chilla',
        note: 'Prioritize protein over carbohydrates to promote satiety and avoid mid-morning cravings.'
      },
      {
        id: 'm3',
        time: '11:00 – 11:30 AM',
        name: 'Mid-Morning Snack',
        items: '1 fresh green apple or 1 cup papaya + Green tea without sugar.',
        serving: '1 portion',
        note: 'High fiber fruit aids digestion.'
      },
      {
        id: 'm4',
        time: '1:00 – 2:00 PM',
        name: 'Lunch',
        items: `• 1 large bowl freshly chopped cucumber and tomato salad.
• 1 Multigrain roti (no oil/ghee) OR ½ cup cooked brown rice.
• 1 cup thick yellow dal / boiled rajma.
• 1 cup seasonal mixed vegetable sabzi (steamed/less oil).
• 1 small cup fresh probiotic curd.`,
        serving: '1 roti + 1 bowl dal + 1 cup sabzi',
        note: 'Eat the salad first, followed by vegetables and dal, then carbohydrates.'
      },
      {
        id: 'm5',
        time: '5:00 – 5:30 PM',
        name: 'Evening Snack',
        items: '1 cup air-popped makhana (fox nuts) OR roasted chana + Green tea.',
        serving: '30 grams',
        note: 'Avoid fried biscuits, namkeen, or bakery snacks.'
      },
      {
        id: 'm6',
        time: '7:30 – 8:30 PM',
        name: 'Dinner',
        items: 'Clear vegetable soup with shredded chicken breast OR grilled paneer salad with steamed broccoli and zucchini.',
        serving: '1 large bowl',
        note: 'Finish dinner at least 2.5 to 3 hours before going to sleep.'
      },
      {
        id: 'm7',
        time: '9:30 PM',
        name: 'Bedtime',
        items: '1 cup warm chamomile or cinnamon tea.',
        serving: '1 cup / 200 mL',
        note: 'Aids resting digestion and restful sleep.'
      }
    ],
    foodsToInclude: [
      'High protein sources: boiled egg whites, skinless chicken breast, tofu, low-fat paneer, sprouts.',
      'High-fiber vegetables: cucumber, bottle gourd, spinach, zucchini, ridge gourd, broccoli, cabbage.',
      'Low-GI whole grains: oats, quinoa, ragi, jowar, barley in controlled portions.',
      'Natural metabolism boosters: cinnamon, cumin water, chia seeds, green tea, ginger.',
      '3.5 – 4 Litres of water daily.'
    ],
    foodsInModeration: [
      'Cooking oil: restrict total daily oil intake to 2–3 teaspoons (use cold-pressed olive, mustard, or sesame oil).',
      'Whole eggs (maximum 1 whole egg daily, rest egg whites).',
      'Rice and wheat flatbreads (portion controlled).'
    ],
    foodsToAvoid: [
      'Refined flour (maida), white bread, pizzas, pasta, bakery cookies, pastries.',
      'Sugary aerated beverages, packaged fruit juices, sweetened milkshakes.',
      'Deep-fried snacks (samosas, pakoras, potato chips, mixtures).',
      'Night-time heavy carbs and sugary desserts.',
      'Alcohol, beer, and carbonated cocktails.'
    ],
    dietaryGuidelines: [
      'Strict portion control with balanced macronutrients (40% carbs, 30% protein, 30% healthy fats).',
      'Follow 10,000 brisk steps daily along with 30 mins cardiovascular or resistance training.',
      'Do not skip meals; eat slowly and chew thoroughly.',
      'Strict adherence to dinner before 8:30 PM.',
      'Ensure 7–8 hours uninterrupted quality sleep.'
    ],
    followUp: 'Bi-weekly weight and body measurements check-in to adjust calorie targets.'
  },

  diabetes: {
    title: 'TYPE 2 DIABETES MANAGEMENT DIET PLAN',
    subtitle: 'Low-Glycemic & Insulin Sensitizing Nutrition Plan',
    consultationMode: 'Online / Clinic',
    calorieTarget: '1500 - 1700 kcal',
    meals: [
      {
        id: 'm1',
        time: '6:30 – 7:00 AM',
        name: 'Early Morning',
        items: '1 cup warm water with ½ tsp Ceylon cinnamon powder + 4 soaked almonds + 1 walnut.',
        serving: '1 glass',
        note: 'Cinnamon helps improve insulin sensitivity.'
      },
      {
        id: 'm2',
        time: '8:30 – 9:00 AM',
        name: 'Breakfast',
        items: '2 Methi (fenugreek) Missi rotis with curd OR 1 bowl vegetable daliya / steel-cut oats.',
        serving: '2 rotis',
        note: 'Fenugreek slows carbohydrate absorption and prevents sharp glucose spikes.'
      },
      {
        id: 'm3',
        time: '11:00 AM',
        name: 'Mid-Morning',
        items: '1 small guava OR 1 small green apple with 1 glass fresh buttermilk.',
        serving: '1 portion',
        note: 'Choose low glycemic fruits only. Avoid mangoes, grapes, bananas, and sapota (chiku).'
      },
      {
        id: 'm4',
        time: '1:00 – 2:00 PM',
        name: 'Lunch',
        items: `• Large bowl of cucumber, radish, and tomato salad.
• 1–2 multigrain or jowar/bajra rotis.
• 1 cup green leafy vegetable curry (palak, methi, sarson, tindora, bhindi).
• 1 cup sprouted moong dal or boiled chana.
• ½ cup fresh homemade curd.`,
        serving: '1-2 rotis + 1 cup dal',
        note: 'Avoid white polished rice. If eating rice, choose brown rice or quinoa in small amounts.'
      },
      {
        id: 'm5',
        time: '4:30 – 5:00 PM',
        name: 'Evening Snack',
        items: '1 handful roasted black chana (chickpeas) with sugar-free black tea or green tea.',
        serving: '30 grams',
        note: ''
      },
      {
        id: 'm6',
        time: '7:30 – 8:00 PM',
        name: 'Dinner',
        items: '1 bowl vegetable barley soup + 1 small jowar roti with mixed vegetable curry and grilled paneer / boiled egg whites.',
        serving: '1 small roti + soup',
        note: 'Keep dinner lighter than lunch to maintain overnight fasting blood sugar.'
      },
      {
        id: 'm7',
        time: '9:30 PM',
        name: 'Bedtime',
        items: '½ cup warm skimmed milk with a pinch of turmeric.',
        serving: '100 mL',
        note: 'Helps prevent nocturnal hypoglycemia.'
      }
    ],
    foodsToInclude: [
      'Low Glycemic Index (GI < 55) foods: barley, oats, millets, sprouts, dals, pulses.',
      'Bitter vegetables: bitter gourd (karela), methi, drumstick, spinach, bottle gourd.',
      'Seeds rich in soluble fiber: chia seeds, flaxseeds, fenugreek seeds.',
      'Lean protein: egg whites, fish, skinless chicken, curd, tofu.'
    ],
    foodsInModeration: [
      'Cooking oil: 2–3 teaspoons daily of mustard, rice bran, or groundnut oil.',
      'Low-GI fruits: guava, apple, pear, orange, pomegranate (max 100g/day).'
    ],
    foodsToAvoid: [
      'White sugar, jaggery, honey, corn syrup, sweets, chocolates, cakes.',
      'High-GI fruits: mangoes, bananas, sapota (chiku), custard apple, grapes.',
      'White bread, refined flour (maida), white rice, potatoes, sweet potatoes, yam.',
      'Packaged fruit juices, flavored yogurts, sodas and sweetened beverages.',
      'Fried snacks, samosas, papad, commercial pickles.'
    ],
    dietaryGuidelines: [
      'Maintain fixed, consistent meal timings; do not delay meals or fast for prolonged hours.',
      'Monitor fasting and post-prandial (PP) blood glucose levels weekly.',
      'Engage in 45 minutes of daily brisk walking, especially 15–20 minutes after meals.',
      'Stay hydrated with 3 litres of plain water daily.'
    ],
    followUp: 'Monthly HbA1c review and blood sugar log consultation.'
  },

  thyroid: {
    title: 'THYROID & METABOLIC CARE DIET PLAN',
    subtitle: 'Hormone Balancing & Anti-Inflammatory Nutrition Chart',
    consultationMode: 'Online / Clinic',
    calorieTarget: '1500 - 1700 kcal',
    meals: [
      {
        id: 'm1',
        time: '6:30 AM',
        name: 'Early Morning',
        items: '1 glass warm coriander seed water (soaked overnight) + 2 Brazil nuts (rich in selenium).',
        serving: '1 glass / 300 mL',
        note: 'Take thyroid medication with plain water first, then wait 45 minutes before consuming this.'
      },
      {
        id: 'm2',
        time: '8:30 – 9:00 AM',
        name: 'Breakfast',
        items: 'Ragi idli (2-3) with coconut-coriander chutney and vegetable sambar.',
        serving: '2-3 idlis',
        note: 'Ragi and coconut provide mineral support for endocrine health.'
      },
      {
        id: 'm3',
        time: '11:00 AM',
        name: 'Mid-Morning',
        items: '1 cup seasonal fruit (pomegranate or papaya) + 1 tbsp roasted pumpkin seeds.',
        serving: '1 cup',
        note: 'Pumpkin seeds provide zinc required for T4 to T3 thyroid hormone conversion.'
      },
      {
        id: 'm4',
        time: '1:00 – 2:00 PM',
        name: 'Lunch',
        items: `• Cucumber & carrot salad with squeeze of fresh lemon.
• 2 Jowar or Bajra rotis.
• 1 bowl cooked dal or rajma.
• 1 bowl thoroughly cooked seasonal vegetable sabzi (ash gourd, lauki, tinda).
• 1 cup probiotic curd.`,
        serving: '2 rotis + 1 bowl dal',
        note: 'Always cook cruciferous vegetables thoroughly if eaten; do not eat them raw.'
      },
      {
        id: 'm5',
        time: '5:00 PM',
        name: 'Evening Snack',
        items: '1 cup roasted lotus seeds (makhana) with herbal ginger tea.',
        serving: '1 cup',
        note: ''
      },
      {
        id: 'm6',
        time: '7:30 – 8:00 PM',
        name: 'Dinner',
        items: 'Steamed vegetable moong dal khichdi with 1 cup curd OR grilled fish/chicken with sautéed bell peppers and beans.',
        serving: '1 bowl khichdi',
        note: 'Light, anti-inflammatory dinner.'
      }
    ],
    foodsToInclude: [
      'Iodine & selenium rich foods: iodized salt, eggs, sunflower seeds, pumpkin seeds, Brazil nuts.',
      'Zinc and Iron sources: lentils, chickpeas, pumpkin seeds, cooked leafy greens.',
      'Healthy gut foods: fresh curd, buttermilk, fermented foods.',
      'Anti-inflammatory spices: turmeric, ginger, coriander, black pepper.'
    ],
    foodsInModeration: [
      'Cruciferous vegetables: cabbage, cauliflower, broccoli, mustard greens (must be thoroughly cooked, never raw).',
      'Soy products: limit to once a week and keep separated from thyroid medication by 4 hours.'
    ],
    foodsToAvoid: [
      'Raw goitrogens (raw cabbage, raw kale, raw radishes).',
      'Gluten-heavy ultra-processed snacks (white bread, biscuits, pastries).',
      'Excess refined sugar, artificial sweeteners, and aerated drinks.',
      'Hydrogenated trans-fats and deeply fried fast foods.'
    ],
    dietaryGuidelines: [
      'Take thyroid medications strictly on an empty stomach with plain water, 45-60 mins before breakfast.',
      'Do not consume calcium or iron supplements within 4 hours of thyroid hormone pills.',
      'Exercise daily with a mix of gentle yoga, stretching, and moderate aerobic walking.',
      'Ensure 8 hours of restorative sleep to support hormonal regulation.'
    ],
    followUp: 'Review thyroid profile (TSH, Free T3, Free T4) every 6 to 8 weeks.'
  },

  hypertension: {
    title: 'HYPERTENSION & DASH CARDIAC DIET PLAN',
    subtitle: 'Low-Sodium, Potassium-Rich Cardiovascular Nutrition Plan',
    consultationMode: 'Online / Clinic',
    calorieTarget: '1500 - 1700 kcal',
    meals: [
      {
        id: 'm1',
        time: '6:30 – 7:00 AM',
        name: 'Early Morning',
        items: '1 glass lukewarm water with 1 tbsp soaked chia seeds + 4 soaked almonds.',
        serving: '1 glass',
        note: 'Supports vascular health.'
      },
      {
        id: 'm2',
        time: '8:30 – 9:00 AM',
        name: 'Breakfast',
        items: 'Oats upma loaded with carrots, peas, and french beans + 1 boiled egg white.',
        serving: '1 bowl',
        note: 'Prepared with minimal salt; flavor with coriander, lemon juice, and curry leaves.'
      },
      {
        id: 'm3',
        time: '11:00 AM',
        name: 'Mid-Morning',
        items: '1 small banana or 1 cup watermelon (high in potassium).',
        serving: '1 portion',
        note: 'Potassium counteracts the hypertensive effects of sodium.'
      },
      {
        id: 'm4',
        time: '1:00 – 2:00 PM',
        name: 'Lunch',
        items: `• 1 bowl beet, cucumber, and carrot salad.
• 2 wheat or jowar rotis (no added salt in dough).
• 1 cup low-salt vegetable curry (bottle gourd, tori, ridge gourd).
• 1 cup arhar or moong dal.
• 1 small cup fresh unflavored curd.`,
        serving: '2 rotis + 1 cup dal',
        note: 'Do not sprinkle table salt over salads or curd.'
      },
      {
        id: 'm5',
        time: '5:00 PM',
        name: 'Evening Snack',
        items: '1 cup unsalted roasted makhana + Hibiscus or green tea without sugar.',
        serving: '1 cup',
        note: 'Hibiscus tea has natural blood pressure lowering properties.'
      },
      {
        id: 'm6',
        time: '7:30 – 8:00 PM',
        name: 'Dinner',
        items: 'Clear bottle gourd & tomato soup + 1 small multigrain roti with steamed dal and sautéed veggies.',
        serving: '1 roti + soup',
        note: 'Early light dinner.'
      }
    ],
    foodsToInclude: [
      'Potassium and magnesium-rich foods: bananas, oranges, spinach, beetroot, sweet potato, lentils.',
      'Cardio-protective foods: garlic, flaxseeds, oats, beetroot juice, walnuts.',
      'Fresh fruits and vegetables (4–5 servings daily).',
      'Whole grains, legumes, and lean poultry/fish (salmon, mackerel).'
    ],
    foodsInModeration: [
      'Total daily salt restricted to under 1 level teaspoon (< 5g salt / < 2000mg sodium) across all dishes.',
      'Cold pressed heart-healthy oils (mustard, olive oil): 3 tsp/day maximum.'
    ],
    foodsToAvoid: [
      'Processed high-sodium items: commercial pickles (achaar), papad, chips, salted nuts.',
      'Canned soups, instant noodles, tomato ketchup, soy sauce, monosodium glutamate (MSG).',
      'Processed meats, sausages, bacon, ham, salted butter, processed cheese.',
      'Excess caffeine, energy drinks, and alcohol.'
    ],
    dietaryGuidelines: [
      'Strictly avoid adding raw salt on dining table (no salt shakers).',
      'Enhance flavors using herbs, lemon juice, garlic, onion, cumin, and mint instead of salt.',
      'Engage in 30–45 minutes of aerobic activity (walking, swimming, cycling) 5 days a week.',
      'Practice deep breathing or meditation for 15 minutes daily to relieve arterial stress.'
    ],
    followUp: 'Bi-weekly BP tracking and monthly nutritional consultation.'
  },

  general_wellness: {
    title: 'BALANCED NUTRITION & GENERAL WELLNESS PLAN',
    subtitle: 'Everyday Healthy Eating & Vitality Diet Chart',
    consultationMode: 'Online / Clinic',
    calorieTarget: '1600 - 1800 kcal',
    meals: [
      {
        id: 'm1',
        time: '6:30 – 7:00 AM',
        name: 'Early Morning',
        items: '1 glass warm water + 4 soaked almonds + 1 soaked walnut + 1 date.',
        serving: '1 glass',
        note: ''
      },
      {
        id: 'm2',
        time: '8:30 – 9:00 AM',
        name: 'Breakfast',
        items: '2 Vegetable Idlis or 1 Vegetable Dosa with sambar and mint chutney OR 2 boiled eggs with 1 slice whole wheat toast.',
        serving: '2 idlis / 2 eggs',
        note: 'Balanced combination of complex carbs and bioavailable protein.'
      },
      {
        id: 'm3',
        time: '11:00 AM',
        name: 'Mid-Morning',
        items: '1 seasonal fruit (apple, orange, guava, or papaya).',
        serving: '1 medium fruit',
        note: ''
      },
      {
        id: 'm4',
        time: '1:00 – 2:00 PM',
        name: 'Lunch',
        items: `• 1 plate fresh cucumber, tomato, and carrot salad.
• 2 Phulkas (whole wheat/multigrain).
• 1 cup seasonal vegetable sabzi.
• 1 cup dal or legumes (chole/rajma/lobia).
• 1 cup fresh curd or buttermilk.`,
        serving: '2 rotis + 1 bowl dal',
        note: 'Balanced plate: ½ plate vegetables, ¼ plate protein, ¼ plate whole grains.'
      },
      {
        id: 'm5',
        time: '5:00 PM',
        name: 'Evening Snack',
        items: '1 small bowl roasted chana or mixed nuts & seeds + tea/coffee with minimal sugar.',
        serving: '1 small bowl',
        note: ''
      },
      {
        id: 'm6',
        time: '7:30 – 8:30 PM',
        name: 'Dinner',
        items: '1–2 Phulkas or 1 cup vegetable daliya khichdi with 1 cup dal and mixed vegetable sabzi.',
        serving: '1-2 phulkas',
        note: 'Eat dinner at least 2 hours before bedtime.'
      }
    ],
    foodsToInclude: [
      'Eat a rainbow: colorful vegetables (green, red, yellow, orange) for diverse phytonutrients.',
      'Whole unrefined grains: brown rice, millets, oats, whole wheat.',
      'Adequate protein with every meal: eggs, dairy, paneer, dals, sprouts.',
      '3 Litres of water daily.'
    ],
    foodsInModeration: [
      'Ghee and butter: 1–2 teaspoons daily.',
      'Tea and coffee: maximum 2 cups daily.',
      'Occasional sweets / treats: limit to once a week in small quantity.'
    ],
    foodsToAvoid: [
      'Ultra-processed packaged foods, trans fats, and deep-fried items.',
      'Excessive refined sugar and carbonated sugary drinks.',
      'Skipping breakfast or irregular meal timings.'
    ],
    dietaryGuidelines: [
      'Eat mindfully without screens or distractions.',
      'Stay physically active with 30-45 minutes of movement daily.',
      'Drink 8-10 glasses of clean water daily.',
      'Maintain regular 7-8 hours sleep schedule.'
    ],
    followUp: 'Quarterly general health check-up and lifestyle assessment.'
  }
};

export const TIME_SLOTS_BY_MEAL: Record<string, string[]> = {
  earlyMorning: [
    '5:30 – 6:30 AM',
    '6:00 – 7:00 AM',
    '6:30 – 7:30 AM',
    '7:00 – 7:30 AM',
    '7:00 – 8:00 AM'
  ],
  breakfast: [
    '7:30 – 8:30 AM',
    '8:00 – 9:00 AM',
    '8:30 – 9:30 AM',
    '9:00 – 10:00 AM',
    '9:30 – 10:30 AM'
  ],
  midMorning: [
    '10:30 – 11:00 AM',
    '11:00 AM',
    '11:00 – 11:30 AM',
    '11:30 AM – 12:00 PM',
    '12:00 PM'
  ],
  lunch: [
    '12:30 – 1:30 PM',
    '1:00 – 2:00 PM',
    '1:30 – 2:30 PM',
    '2:00 – 3:00 PM'
  ],
  evening: [
    '4:00 – 5:00 PM',
    '4:30 – 5:30 PM',
    '5:00 – 6:00 PM',
    '5:30 – 6:30 PM',
    '6:00 – 7:00 PM'
  ],
  dinner: [
    '7:00 – 8:00 PM',
    '7:30 – 8:30 PM',
    '8:00 – 9:00 PM',
    '8:30 – 9:30 PM',
    '9:00 – 10:00 PM'
  ],
  beforeBed: [
    '9:00 – 9:30 PM',
    '9:30 PM',
    '9:30 – 10:00 PM',
    '10:00 PM',
    '10:00 – 10:30 PM'
  ]
};

export const STANDARD_TIME_SLOTS = [
  '6:00 – 7:00 AM',
  '6:30 – 7:30 AM',
  '7:00 – 7:30 AM',
  '7:00 – 8:00 AM',
  '7:30 – 8:30 AM',
  '8:00 – 9:00 AM',
  '8:30 – 9:30 AM',
  '9:00 – 10:00 AM',
  '10:30 – 11:00 AM',
  '11:00 AM',
  '11:00 – 11:30 AM',
  '11:30 AM – 12:00 PM',
  '12:30 – 1:30 PM',
  '1:00 – 2:00 PM',
  '1:30 – 2:30 PM',
  '2:00 – 3:00 PM',
  '4:00 – 5:00 PM',
  '4:30 – 5:30 PM',
  '5:00 – 6:00 PM',
  '5:30 – 6:30 PM',
  '7:00 – 8:00 PM',
  '7:30 – 8:30 PM',
  '8:00 – 9:00 PM',
  '8:30 – 9:30 PM',
  '9:00 – 9:30 PM',
  '9:30 PM',
  '9:30 – 10:00 PM',
  '10:00 PM',
  '10:00 – 10:30 PM'
];

export const QUICK_ADD_OPTIONS = {
  meals: [
    { name: 'Early Morning', time: '6:00 – 7:00 AM', items: '½ tsp Fenugreek powder in lukewarm water + 3 soaked almonds + 5 walnuts.' },
    { name: 'Breakfast', time: '8:00 – 9:00 AM', items: 'Vegetable oats chilla – 2 medium with mint chutney.' },
    { name: 'Mid-Morning', time: '11:00 AM', items: '1 seasonal fruit (apple/guava/papaya) + 1 glass fresh buttermilk.' },
    { name: 'Lunch', time: '1:00 – 2:00 PM', items: 'Raw vegetable salad + Brown rice/millets (¾-1 cup) + Dal + Veg curry + Curd.' },
    { name: 'Evening', time: '4:30 – 5:30 PM', items: 'Roasted chana (1 small handful) + Green tea without sugar.' },
    { name: 'Dinner', time: '7:30 – 8:30 PM', items: 'Vegetable salad + 2 Jowar rotis with bottle gourd curry & dal.' },
    { name: 'Before Bed', time: '9:30 PM', items: '½ tsp Fenugreek powder in lukewarm water (1 glass / 200 mL).' }
  ],

  // Specific food suggestions categorized by meal type
  mealItemsByCategory: {
    earlyMorning: [
      '½ tsp Fenugreek powder in lukewarm water + 3 soaked almonds + 5 walnuts.',
      'Warm lemon water with 1 tsp soaked chia seeds.',
      '1 cup warm water with ½ tsp Ceylon cinnamon powder.',
      '1 glass overnight soaked coriander seed water.',
      'Green tea with lemon and ginger slices.',
      '4 soaked almonds + 1 walnut + 1 date.'
    ],
    breakfast: [
      'Vegetable oats chilla – 2 medium with mint chutney.',
      'Ragi idli (2-3) with coconut chutney and vegetable sambar.',
      '2 Boiled egg whites + 1 slice multigrain toast.',
      'Moong dal chilla with grated paneer filling.',
      'Vegetable daliya / steel-cut oats upma with mixed veggies.',
      'Besan chilla (2) with mint-coriander chutney.',
      'Vegetable poha with roasted peanuts and lemon.',
      'Scrambled eggs (2 whites + 1 whole) with sautéed spinach.',
      'Plain curd (½ cup).'
    ],
    midMorning: [
      '1 small guava OR 1 green apple.',
      '1 cup freshly cut papaya with lime juice.',
      '1 glass fresh unsalted buttermilk (chaas) with cumin.',
      '1 cup seasonal fruit (pomegranate / orange).',
      '1 tender coconut water (if permitted).',
      '1 tbsp roasted pumpkin seeds + 1 cup green tea.'
    ],
    lunch: [
      'Raw vegetable salad – 1 bowl (cucumber, carrot, tomato & fresh coconut).',
      'Cooked brown rice / millets / quinoa – ¾–1 cup.',
      'Dal / sambar / sprouts curry – 1 bowl.',
      'Seasonal vegetable curry (lauki, tori, bhindi, tindora) – 1 bowl.',
      'Protein choice: paneer / tofu / soy chunks / grilled chicken / fish / eggs.',
      'Plain curd or fresh buttermilk – ½ cup.',
      '2 Jowar / Multigrain rotis (without oil).',
      '1 cup thick yellow moong dal with cumin seasoning.',
      'Boiled chana or rajma curry – 1 bowl.'
    ],
    evening: [
      'Roasted chana – 1 small handful.',
      'Roasted makhana (fox nuts) – 1 cup.',
      'Sprouts chaat with onion, tomato, and lemon – 1 small bowl.',
      '1 cup green tea without sugar.',
      '1 handful boiled peanuts or steamed corn.',
      'Herbal ginger or chamomile tea.'
    ],
    dinner: [
      'Vegetable salad (cucumber + carrot).',
      'Jowar roti – 2 small with bottle gourd curry / ridge gourd curry and dal.',
      'Clear vegetable soup with shredded chicken breast or grilled paneer.',
      'Steamed vegetable moong dal khichdi with 1 cup curd.',
      '1 Multigrain roti with dal palak and steamed sabzi.',
      'Grilled fish or chicken with sautéed bell peppers and beans.',
      'Soyabean or soya chunks curry with 1-2 small phulkas.'
    ],
    beforeBed: [
      '½ tsp Fenugreek powder in lukewarm water (1 glass / 200 mL).',
      'Warm chamomile tea.',
      '½ cup warm skimmed milk with a pinch of turmeric.',
      '1 cup warm cinnamon water.'
    ],
    general: [
      'Fresh green salad (cucumber, carrot, radish, tomato).',
      '1 bowl yellow moong dal.',
      '2 small jowar or multigrain rotis.',
      '1 bowl seasonal green vegetable sabzi.',
      '100g grilled paneer / tofu / chicken.',
      '½ cup probiotic plain curd.'
    ]
  },

  portionSizes: [
    '1 glass / 200 mL',
    '1 glass / 500 mL',
    '2 medium',
    '1 bowl (150g)',
    '¾–1 cup',
    '1 small handful (30g)',
    '100 grams',
    '2 small rotis',
    '1 portion',
    '½ cup'
  ],

  specialNotes: [
    'Include a good protein source with breakfast.',
    'Avoid sugary cereals, sweetened beverages and deep-fried breakfast items.',
    'Prefer whole grains and high-fibre foods.',
    'Avoid excess oil, refined carbohydrates and large portions of rice.',
    'Combine carbohydrates with protein and fibre.',
    'Include all green leafy vegetables & vegetables, except potato, radish and yam.',
    'Include: soyabeans, soya chunks & dals as well.',
    'Eat the salad first, followed by vegetables and dal, then carbohydrates.',
    'Finish dinner at least 2.5 to 3 hours before going to sleep.',
    'Do not sprinkle raw table salt over salads or curd.'
  ],

  foodsToInclude: [
    'Use iodized salt in recommended amounts.',
    'Include high-quality protein: eggs, skinless chicken, milk, curd, paneer, tofu, dals, sprouts daily.',
    'Eat whole grains such as oats, brown rice, ragi, and jowar.',
    'Consume 2–3 servings of vegetables and 1–2 servings of seasonal fruits.',
    'Include curd and buttermilk for gut microbiome health.',
    'Include healthy fats: almonds, walnuts, flaxseeds, and chia seeds.',
    'Include selenium-rich foods: sunflower seeds, eggs, mushrooms.',
    'Include zinc-rich foods: pumpkin seeds, sesame seeds, legumes.',
    'Include iron-rich foods: green leafy vegetables, lentils, chickpeas.'
  ],
  foodsInModeration: [
    'Ghee, butter & coconut/palm oil.',
    'Fatty meat & processed meat: limit fatty cuts, choose lean protein.',
    'Nuts and seeds should be limited to a small handful (20–30 g/day).',
    'Caffeine (tea and coffee) limited to 1–2 cups daily without sugar.',
    'Whole eggs: limit to 1 whole egg daily, prioritize egg whites.',
    'Red meat: limit to once a fortnight, prioritize lean cuts.'
  ],
  foodsToAvoid: [
    'Organ meats – liver, kidney, brain, heart. Red meat – mutton, beef, pork.',
    'Avoid intake of coconut water and fruit juices till 2 months.',
    'Processed meat – sausages, salami, bacon.',
    'High-purine fish – sardines, anchovies, mackerel, herring.',
    'Shellfish – prawns, mussels.',
    'Alcohol, especially beer, and avoid smoking.',
    'Soft drinks & sugary beverages, packaged fruit juices.',
    'Excess sweets and added sugar.',
    'Deep-fried & highly processed foods.',
    'Excess salt (continue using iodized salt, but avoid excess intake).'
  ],
  dietaryGuidelines: [
    'Prefer whole grains/millets.',
    'Protein at each major meal: include a protein source with breakfast, lunch and dinner.',
    'Take small and frequent meals instead of large meals.',
    'Do not skip meals and then overeat; maintain relatively consistent meal timing and avoid prolonged fasting.',
    'Stay physically active: at least 45 mins – 1 hour of physical activity, along with strength-training exercises 2–3 times weekly.',
    'Ensure adequate sleep (7–8 hours).',
    'Hydration (3–4 litres).'
  ]
};
