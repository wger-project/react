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

export interface Notification {
    notify: boolean
    message: string
    severity: AlertColor | undefined
    title: string
}