import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Trans } from "react-i18next";
import { WeightEntry } from "components/BodyWeight/model";


export interface WeightTableProps {
    weights: WeightEntry[]
}

const useStyles = makeStyles((theme: Theme) => {
    return {
        table: {
            "& .MuiPaper-root": {
                border: "1px solid #bababa",

            }
        },
    };
});

export const WeightTableDashboard = ({ weights }: WeightTableProps) => {
    const classes = useStyles();
    const WEIGHT_ENTRIES_TO_SHOW = 5;

    // sort weights by date
    weights.sort((a, b) => {
        return b.date.getTime() - a.date.getTime();
    });
    const filteredWeight = weights.slice(0, WEIGHT_ENTRIES_TO_SHOW);

    return (
        <div className={classes.table}>
            <TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center"><Trans i18nKey={'date'} /></TableCell>
                            <TableCell align="center"><Trans i18nKey={'weight'} /></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredWeight.map((row) => (
                            <TableRow
                                key={row.date.toLocaleDateString()}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row" align="center">
                                    {row.date.toLocaleDateString()}
                                </TableCell>
                                <TableCell align="center">{row.weight}</TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};