import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import { styled } from '@mui/material/styles';
import { WeightEntry } from "components/BodyWeight/model";
import { ActionButton } from 'components/BodyWeight/Table/ActionButton/ActionButton';
import { WeightEntryFab } from "components/BodyWeight/Table/Fab/Fab";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { dateTimeToLocale } from "utils/date";
import { processWeight } from '../utils';


const PREFIX = 'WeightTable';

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

export const WeightTable = ({ weights }: WeightTableProps) => {

    const availableResultsPerPage = [10, 50, 100];

    const { t } = useTranslation();

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
        <Root className={classes.table}>
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
                                key={row.entry.date.toISOString()}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row" align="center">
                                    {dateTimeToLocale(row.entry.date)}
                                </TableCell>
                                <TableCell align="center">{row.entry.weight}</TableCell>
                                <TableCell align="center">{+row.change.toFixed(2)}</TableCell>
                                <TableCell align="center">{row.days.toFixed(1)}</TableCell>
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
        </Root>
    );
};