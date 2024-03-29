import axios from 'axios';
import { Category, CategoryAdapter } from "components/Exercises/models/category";
import { ApiCategoryType } from 'types';
import { makeHeader, makeUrl } from "utils/url";
import { ResponseType } from "./responseType";

export const CATEGORY_PATH = 'exercisecategory';


/*
 * Fetch all categories
 */
export const getCategories = async (): Promise<Category[]> => {
    const url = makeUrl(CATEGORY_PATH);
    const { data: receivedCategories } = await axios.get<ResponseType<ApiCategoryType>>(url, {
        headers: makeHeader(),
    });
    const adapter = new CategoryAdapter();
    return receivedCategories.results.map(c => adapter.fromJson(c));
};

