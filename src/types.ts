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
    notify: boolean
    message: string
    severity: AlertColor | undefined
    title: string
    type: "other" | "delete" | undefined
    undo?: boolean
}