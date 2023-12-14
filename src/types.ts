import { AlertColor } from "@mui/material";

export interface ApiBodyWeightType {
    id: number,
    date: string,
    weight: string,
}

export interface ApiMuscleType {
    id: number,
    name: string,
    is_front: boolean,
    image_url_main: string,
    image_url_secondary: string,
}

export interface ApiCategoryType {
    id: number,
    name: string,
}

export interface ApiLanguageType {
    id: number,
    short_name: string,
    full_name: string,
}

export interface ApiSettingWeightUnitType {
    id: number,
    name: string,
}

export interface ApiSettingRepUnitType {
    id: number,
    name: string,
}

export interface ApiMeasurementCategoryType {
    id: number,
    name: string,
    unit: string
}

export interface ApiIngredientType {
    id: number,
    uuid: string,
    code: string,
    name: string,
    energy: number,
    protein: string,
    carbohydrates: string,
    carbohydrates_sugar: string | null,
    fat: string,
    fat_saturated: string | null,
    fibres: string | null,
    sodium: string | null,
    license: {
        id: number,
        full_name: string,
        short_name: string,
        url: string
    },
    license_author: string,
    image: ApiIngredientImageType
}

export type ApiIngredientImageType = {
    id: number,
    uuid: string,
    ingredient_id: number,
    ingredient_uuid: string,
    image: string,
    created: string,
    last_update: string,
    size: number,
    width: number,
    height: number,
    license: number,
    license_title: string,
    license_object_url: string,
    license_author: string,
    license_author_url: string,
    license_derivative_source_url: string
}


export type ApiIngredientWeightUnitType = {
    id: number,
    amount: string,
    ingredient: number,
    gram: number,
    unit: number
}

export interface ApiNutritionalPlanType {
    id: number,
    creation_date: string,
    description: string,
    only_logging: boolean,
    goal_energy: number | null,
    goal_protein: number | null,
    goal_carbohydrates: number | null,
    goal_fat: number | null,
}

export interface ApiMealType {
    id: number,
    order: number,
    time: string | null,
    name: string
}

export interface ApiMealItemType {
    id: number,
    meal: number,
    ingredient: number,
    weight_unit: number,
    order: number,
    amount: string
}

export interface ApiNutritionDiaryType {
    id: number,
    plan: number,
    meal: number | null,
    ingredient: number,
    weight_unit: number,
    datetime: Date,
    amount: string
}

export interface ApiMeasurementEntryType {
    id: number,
    category: number,
    date: Date,
    value: number,
    notes: string
}

export interface ApiEquipmentType {
    id: number,
    name: string,
}

export interface Notification {
    notify: boolean;
    message: string;
    severity: AlertColor | undefined;
    title: string;
    type: "other" | "delete" | undefined;
    undo?: boolean;
}