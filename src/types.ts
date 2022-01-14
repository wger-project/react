import { AlertColor } from "@mui/material";

export interface BodyWeightType {
    id: number,
    date: string,
    weight: string,
}

export interface Notification {
    notify: boolean
    message: string
    severity: AlertColor | undefined
    title: string
}