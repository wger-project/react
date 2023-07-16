import { GroupedDiaryEntries } from "components/Nutrition/models/nutritionalPlan";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React from "react";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";

export const DiaryOverview = (props: { entries: Map<string, GroupedDiaryEntries>, planValues: NutritionalValues }) => {

    const [t] = useTranslation();

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
                        <TableCell>{key}</TableCell>
                        <TableCell align="right">
                            {props.entries.get(key)?.nutritionalValues.energy.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                            {(props.planValues.energy - props.entries.get(key)?.nutritionalValues.energy!).toFixed(2)}
                        </TableCell>
                    </TableRow>)
                }
            </TableBody>
        </Table>
    </TableContainer>;
};