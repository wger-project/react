import axios from 'axios';
import { ApiCategoryType, ApiEquipmentType, ApiMuscleType } from 'types';
import { ResponseType } from "./responseType";
import { makeHeader, makeUrl } from "utils/url";
import { Muscle, MuscleAdapter } from "components/Exercises/models/muscle";
import { Category, CategoryAdapter } from "components/Exercises/models/category";
import { Equipment, EquipmentAdapter } from "components/Exercises/models/equipment";

export const MUSCLES_PATH = 'muscle';
export const CATEGORY_PATH = 'exercisecategory';
export const EQUIPMENT_PATH = 'equipment';

/*
 * Fetch all muscles
 */
export const getMuscles = async (): Promise<Muscle[]> => {
    const url = makeUrl(MUSCLES_PATH);
    const { data: receivedMuscles } = await axios.get<ResponseType<ApiMuscleType>>(url, {
        headers: makeHeader(),
    });
    const adapter = new MuscleAdapter();
    return receivedMuscles.results.map(m => adapter.fromJson(m));
};

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

