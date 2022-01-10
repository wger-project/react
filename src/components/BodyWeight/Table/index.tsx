import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme } from '@mui/material';
import { processWeight } from '../utils';
import { ActionButton } from 'components/BodyWeight/Table/ActionButton/ActionButton';
import { makeStyles } from '@mui/styles';
import { Trans } from "react-i18next";
import { WeightEntry } from "components/BodyWeight/model";
import { deleteWeight } from 'services';
import { WeightEntryFab } from "components/BodyWeight/Table/Fab/Fab";


export interface WeightTableProps {
    weights: WeightEntry[]
    fetchNewWeights: () => void
}

export interface ProcessedWeight {
    entry: WeightEntry,
    change: number,
    days: number,
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

export const WeightTable = ({ weights, fetchNewWeights }: WeightTableProps) => {
    const classes = useStyles();
    const processedWeights = processWeight(weights);

    const handleDeleteWeight = async (weight: WeightEntry) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const statusCode = await deleteWeight(weight.id!);
            // call to update weights to newest values after a weight is deleted
            fetchNewWeights();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={classes.table}>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center"><Trans i18nKey={'date'} /></TableCell>
                            <TableCell align="center"><Trans i18nKey={'weight'} /></TableCell>
                            <TableCell align="center"><Trans i18nKey={'difference'} /></TableCell>
                            <TableCell align="center"><Trans i18nKey={'days'} /></TableCell>
                            <TableCell align="center" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {processedWeights.map((row) => (
                            <TableRow
                                key={row.entry.date.toLocaleDateString()}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row" align="center">
                                    {row.entry.date.toLocaleDateString()}
                                </TableCell>
                                <TableCell align="center">{row.entry.weight}</TableCell>
                                <TableCell align="center">{+row.change.toFixed(2)}</TableCell>
                                <TableCell align="center">{row.days}</TableCell>
                                <TableCell align="center"><ActionButton handleDeleteWeight={handleDeleteWeight}
                                                                        weight={row.entry} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <WeightEntryFab />
        </div>
    );
};