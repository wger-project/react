import { Category, CategoryAdapter } from "@/components/Exercises/models/category";
import { fetchAll } from "@/core/lib/requests";
import { makeUrl } from "@/core/lib/url";

export const CATEGORY_PATH = 'exercisecategory';


/*
 * Fetch all categories
 */
export const getCategories = async (): Promise<Category[]> => {
    const adapter = new CategoryAdapter();
    return await fetchAll(makeUrl(CATEGORY_PATH), json => adapter.fromJson(json));
};

