import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Theme
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { WeightEntry } from "components/BodyWeight/model";
import { ActionButton } from 'components/BodyWeight/Table/ActionButton/ActionButton';
import { WeightEntryFab } from "components/BodyWeight/Table/Fab/Fab";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { processWeight } from '../utils';


export interface WeightTableProps {
    weights: WeightEntry[];
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

export const WeightTable = ({ weights }: WeightTableProps) => {

    const availableResultsPerPage = [10, 50, 100];

    const [t] = useTranslation();
    const classes = useStyles();
    const processedWeights = processWeight(weights);
    const [rowsPerPage, setRowsPerPage] = useState(availableResultsPerPage[0]);
    const [page, setPage] = useState(0);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div className={classes.table}>
            <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">{t('date')}</TableCell>
                            <TableCell align="center">{t('weight')}</TableCell>
                            <TableCell align="center">{t('difference')}</TableCell>
                            <TableCell align="center">{t('days')}</TableCell>
                            <TableCell align="center" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {processedWeights.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
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
                                <TableCell align="center">
                                    <ActionButton weight={row.entry} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={availableResultsPerPage}
                    component="div"
                    count={processedWeights.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            <WeightEntryFab />
        </div>
    );
};