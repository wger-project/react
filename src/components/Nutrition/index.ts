/**
 * Public surface of the Nutrition domain.
 *
 * Other code may only import from `@/components/Nutrition`, never from
 * internal sub-paths.
 */
export { BmiCalculator } from "./screens/BmiCalculator";
export { IngredientSearch } from "./screens/IngredientSearch";
export { NutritionDiaryOverview } from "./screens/NutritionDiaryOverview";
export { PlanDetail } from "./screens/PlanDetail";
export { PlansOverview } from "./screens/PlansOverview";

// Models
export { Ingredient } from "./models/Ingredient";
export type { ApiIngredientThumbnailType } from "./models/IngredientImageThumbnails";
export { DiaryEntry } from "./models/diaryEntry";
export { type ApiMealType, Meal } from "./models/meal";
export { type ApiMealItemType, MealItem } from "./models/mealItem";
export { NutritionalPlan, nutritionalPlanAdapter } from "./models/nutritionalPlan";
export { NutritionWeightUnit } from "./models/weightUnit";

// Query hooks
export {
    useAddDiaryEntryQuery,
    useFetchLastNutritionalPlanQuery,
    useNutritionDiaryQuery,
} from "./queries";

// Widgets
export { NutritionalValuesDashboardChart } from "./widgets/charts/NutritionalValuesDashboardChart";
export { NutritionDiaryEntryForm } from "./widgets/forms/NutritionDiaryEntryForm";
export { PlanForm } from "./widgets/forms/PlanForm";
