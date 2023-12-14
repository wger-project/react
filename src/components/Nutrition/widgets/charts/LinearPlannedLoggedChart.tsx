import { LinearProgress, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { numberGramLocale } from "utils/numbers";

export const LinearPlannedLoggedChart = (props: {
    percentage: number,
    logged: number,
    title: string,
    planned: number
}) => {
    const { i18n } = useTranslation();

    const hasPlanned = props.planned > 0;

    return <>
        <LinearProgress
            variant="determinate"
            value={props.percentage < 100 ? props.percentage : 100}
        />
        <Typography variant={"caption"}>
            {props.title} — {numberGramLocale(props.logged, i18n.language)}
            {hasPlanned && <>&nbsp;/ {numberGramLocale(props.planned, i18n.language)}</>}
        </Typography>
    </>;

};