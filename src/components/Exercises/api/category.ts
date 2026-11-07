import { Category, CategoryAdapter } from "@/components/Exercises/models/category";
import { ApiCategoryType } from '@/types';
import { API_MAX_PAGE_SIZE } from "@/core/lib/consts";
import { fetchPaginated } from "@/core/lib/requests";
import { makeHeader, makeUrl } from "@/core/lib/url";

export const CATEGORY_PATH = 'exercisecategory';


/*
 * Fetch all categories
 */
export const getCategories = async (): Promise<Category[]> => {
    const url = makeUrl(CATEGORY_PATH, { query: { limit: API_MAX_PAGE_SIZE } });
    const adapter = new CategoryAdapter();
    const out: Category[] = [];

    for await (const page of fetchPaginated(url, makeHeader())) {
        out.push(...(page as ApiCategoryType[]).map(c => adapter.fromJson(c)));
    }

    return out;
};

