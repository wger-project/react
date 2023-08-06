import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { GroupedDiaryEntries } from "components/Nutrition/models/nutritionalPlan";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { makeLink, WgerLink } from "utils/url";

export const DiaryOverview = (props: { entries: Map<string, GroupedDiaryEntries>, planValues: NutritionalValues }) => {

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
                {Array.from(props.entries).map(([key]) =>
                    <TableRow key={key}>
                        <TableCell>
                            <Link to={makeLink(WgerLink.NUTRITION_DIARY, i18n.language, { id: 1, date: key })}>
                                {new Date(key).toLocaleDateString(i18n.language)}
                            </Link>
                        </TableCell>
                        <TableCell align="right">
                            {props.entries.get(key)?.nutritionalValues.energy.toFixed()}
                        </TableCell>
                        <TableCell align="right">
                            {(props.planValues.energy - props.entries.get(key)?.nutritionalValues.energy!).toFixed()}
                        </TableCell>
                    </TableRow>)
                }
            </TableBody>
        </Table>
    </TableContainer>;
};