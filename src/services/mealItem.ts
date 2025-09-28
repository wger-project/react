import axios from 'axios';
import { MealItem } from "components/Nutrition/models/mealItem";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";


export const addMealItem = async (data: MealItem): Promise<MealItem> => {
    const response = await axios.post(
        makeUrl(ApiPath.MEAL_ITEM),
        data.toJson(),
        { headers: makeHeader() }
    );

    return MealItem.fromJson(response.data);
};

export const editMealItem = async (mealItem: MealItem): Promise<MealItem> => {
    const response = await axios.patch(
        makeUrl(ApiPath.MEAL_ITEM, { id: mealItem.id! }),
        mealItem.toJson(),
        { headers: makeHeader() }
    );

    return MealItem.fromJson(response.data);
};

export const deleteMealItem = async (id: number): Promise<void> => {
    await axios.delete(
        makeUrl(ApiPath.MEAL_ITEM, { id: id }),
        { headers: makeHeader() },
    );
};
