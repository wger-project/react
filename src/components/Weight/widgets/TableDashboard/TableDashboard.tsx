import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { styled } from '@mui/material/styles';
import { MeasurementEntry } from "@/components/Measurements";
import React from 'react';
import { useTranslation } from "react-i18next";
import { dateTimeToLocale } from "@/core/lib/date";
import { WeightUnit } from "@/core/lib/weightUnit";


const PREFIX = 'WeightTableDashboard';

const classes = {
    table: `${PREFIX}-table`
};

const Root = styled('div')(() => {
    return {
        [`&.${classes.table}`]: {
            "& .MuiPaper-root": {
                border: "1px solid #bababa",

            }
        },
    };
});


export interface WeightTableProps {
    weights: MeasurementEntry[];
    unit: WeightUnit;
    categoryUnit: string;
}

export const WeightTableDashboard = ({ weights, unit, categoryUnit }: WeightTableProps) => {
    const [t] = useTranslation();

    const WEIGHT_ENTRIES_TO_SHOW = 5;

    const filteredWeight = weights.slice(0, WEIGHT_ENTRIES_TO_SHOW);

    return (
        <Root className={classes.table}>
            <TableContainer>
                <Table size={"small"}>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('date')}</TableCell>
                            <TableCell>{`${t('weight')} (${t(`server.${unit}`)})`}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredWeight.map((row) => (
                            <TableRow key={row.date.toISOString()}>
                                <TableCell>{dateTimeToLocale(row.date)}</TableCell>
                                <TableCell>{row.valueIn(unit, categoryUnit)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Root>
    );
};