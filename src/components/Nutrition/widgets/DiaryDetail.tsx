import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { DiaryEntry } from "components/Nutrition/models/diaryEntry";
import React from "react";
import { useTranslation } from "react-i18next";

export const DiaryDetail = (props: { entries: DiaryEntry[], planValues: NutritionalValues }) => {

    const [t, i18n] = useTranslation();


    return <TableContainer>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>{t('date')}</TableCell>
                    <TableCell align="right">{t('nutrition.energy')}</TableCell>
                    <TableCell align="right">{t('nutrition.carbohydrates')}</TableCell>
                    <TableCell align="right">{t('nutrition.protein')}</TableCell>
                    <TableCell align="right">{t('nutrition.fat')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {props.entries.map(entry =>
                    <TableRow key={entry.id}>
                        <TableCell>
                            {entry.amount}
                            {entry.ingredient?.name}
                        </TableCell>
                        <TableCell align="right">{entry.nutritionalValues.energy}</TableCell>
                        <TableCell align="right">{entry.nutritionalValues.carbohydrates}</TableCell>
                        <TableCell align="right">{entry.nutritionalValues.protein}</TableCell>
                        <TableCell align="right">{entry.nutritionalValues.fat}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </TableContainer>;
};