import React from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Theme
} from '@mui/material';
import { processWeight } from '../utils';
import { ActionButton } from 'components/BodyWeight/Table/ActionButton/ActionButton';
import { makeStyles } from '@mui/styles';
import { useTranslation } from "react-i18next";
import { WeightEntry } from "components/BodyWeight/model";
import { deleteWeight } from 'services';
import { removeWeight, setNotification, useStateValue } from 'state';


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

export const WeightTable = ({ weights }: WeightTableProps) => {

    const availableResultsPerPage = [10, 50, 100];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [state, dispatch] = useStateValue();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [t, i18n] = useTranslation();
    const classes = useStyles();
    const processedWeights = processWeight(weights);
    const [rowsPerPage, setRowsPerPage] = React.useState(availableResultsPerPage[0]);
    const [page, setPage] = React.useState(0);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteWeight = async (weight: WeightEntry) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const statusCode = await deleteWeight(weight.id!);
            dispatch(removeWeight(weight.id!));
            dispatch(setNotification(
                {
                    notify: true,
                    message: "Successful",
                    severity: "success",
                    title: "Success"
                }
            ));
            // clear out the notifications after some times
            setTimeout(() => {
                dispatch(setNotification({ notify: false, message: "", severity: undefined, title: "" }));
            }, 5000);
        } catch (error: unknown) {
            dispatch(setNotification(
                {
                    notify: true,
                    message: "Unsuccessful",
                    severity: "error",
                    title: "Error"
                }
            ));
            // clear out the notifications after some times
            setTimeout(() => {
                dispatch(setNotification({ notify: false, message: "", severity: undefined, title: "" }));
            }, 5000);
        }
    };

    return (
        <div className={classes.table}>
            <TableContainer component={Paper}>
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
                                <TableCell align="center"><ActionButton handleDeleteWeight={handleDeleteWeight}
                                                                        weight={row.entry} /></TableCell>
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

            { /*<WeightEntryFab />*/}
        </div>
    );
};