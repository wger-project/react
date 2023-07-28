import axios from 'axios';
import { MealItem, MealItemAdapter } from "components/Nutrition/models/mealItem";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";


export interface AddMealItemParams {
    meal: number,
    ingredient: number,
    weight_unit: number | null,
    amount: number
}

export interface EditMealItemParams extends AddMealItemParams {
    id: number,
}


export const addMealItem = async (data: AddMealItemParams): Promise<MealItem> => {
    const response = await axios.post(
        makeUrl(ApiPath.MEAL_ITEM),
        data,
        { headers: makeHeader() }
    );

    return new MealItemAdapter().fromJson(response.data);
};

export const editMealItem = async (data: EditMealItemParams): Promise<MealItem> => {
    const response = await axios.patch(
        makeUrl(ApiPath.MEAL_ITEM, { id: data.id }),
        data,
        { headers: makeHeader() }
    );

    return new MealItemAdapter().fromJson(response.data);
};

export const deleteMealItem = async (id: number): Promise<void> => {
    await axios.delete(
        makeUrl(ApiPath.MEAL_ITEM, { id: id }),
        { headers: makeHeader() },
    );
};
