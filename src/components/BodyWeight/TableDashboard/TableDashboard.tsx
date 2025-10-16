import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { styled } from '@mui/material/styles';
import { WeightEntry } from "components/BodyWeight/model";
import React from 'react';
import { useTranslation } from "react-i18next";
import { dateTimeToLocale } from "utils/date";


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
    weights: WeightEntry[];
}

export const WeightTableDashboard = ({ weights }: WeightTableProps) => {
    const [t] = useTranslation();

    const WEIGHT_ENTRIES_TO_SHOW = 5;

    const filteredWeight = weights.slice(0, WEIGHT_ENTRIES_TO_SHOW);

    return (
        <Root className={classes.table}>
            <TableContainer>
                <Table size={"small"}>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">{t('date')}</TableCell>
                            <TableCell align="center">{t('weight')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredWeight.map((row) => (
                            <TableRow key={row.date.toISOString()}>
                                <TableCell align="center">
                                    {dateTimeToLocale(row.date)}
                                </TableCell>
                                <TableCell align="center">{row.weight}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Root>
    );
};