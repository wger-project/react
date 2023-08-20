import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { GroupedDiaryEntries } from "components/Nutrition/models/nutritionalPlan";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { numberLocale } from "utils/numbers";
import { makeLink, WgerLink } from "utils/url";

export const DiaryOverview = (props: {
    planId: number,
    logged: Map<string, GroupedDiaryEntries>,
    planned: NutritionalValues
}) => {

    const [t, i18n] = useTranslation();


    return <TableContainer>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>{t('date')}</TableCell>
                    <TableCell align="right">{t('nutrition.logged')}</TableCell>
                    <TableCell align="right">{t('nutrition.difference')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {Array.from(props.logged).map(([key]) =>
                    <TableRow key={key}>
                        <TableCell>
                            <Link
                                to={makeLink(WgerLink.NUTRITION_DIARY, i18n.language, { id: props.planId, date: key })}>
                                {new Date(key).toLocaleDateString(i18n.language)}
                            </Link>
                        </TableCell>
                        <TableCell align="right">
                            {t('nutrition.valueEnergyKcal',
                                { value: numberLocale(props.logged.get(key)?.nutritionalValues.energy!, i18n.language) }
                            )}
                        </TableCell>
                        <TableCell align="right">
                            {numberLocale(props.logged.get(key)?.nutritionalValues.energy! - props.planned.energy, i18n.language)}
                        </TableCell>
                    </TableRow>)
                }
            </TableBody>
        </Table>
    </TableContainer>;
};