import React, { useEffect, useState } from 'react';
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
import { addWeightEntry, removeWeight, setNotification, useWeightStateValue } from 'state';


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

    const [state, dispatch] = useWeightStateValue();
    const [t] = useTranslation();
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

    const [deleteTimeoutID, SetDeleteTimeoutID] = useState<ReturnType<typeof setTimeout> | undefined>();
    const [weightToDelete, SetWeightToDelete] = useState<WeightEntry | undefined>();

    useEffect(() => {
        // if true, cancel the timeout that will request a DELETE
        if (state.notification.undo && deleteTimeoutID) {
            // cancel the timout that will notify and make request
            clearTimeout(deleteTimeoutID);
            // only dispatch if weightToDelete is defined

            weightToDelete && dispatch(addWeightEntry(weightToDelete));
            // notify the undone successfully
            dispatch(setNotification(
                {
                    notify: true,
                    message: "Undone",
                    severity: "success",
                    title: "Success",
                    type: "other"
                }
            ));
            // clear out the notifications after some times
            setTimeout(() => {
                dispatch(setNotification({
                    notify: false,
                    message: "",
                    severity: undefined,
                    title: "",
                    type: undefined
                }));
            }, 5000);
        }
    }, [state.notification.undo, deleteTimeoutID, weightToDelete, dispatch]);

    const handleDeleteWeight = async (weight: WeightEntry) => {
        try {
            dispatch(removeWeight(weight));
            dispatch(setNotification(
                {
                    notify: true,
                    message: "Successful",
                    severity: "success",
                    title: "Success",
                    type: "delete"
                }
            ));
            // clear out the notifications after some times
            setTimeout(() => {
                dispatch(setNotification({
                    notify: false,
                    message: "",
                    severity: undefined,
                    title: "",
                    type: undefined
                }));
            }, 5000);

            const timeout = setTimeout(async () => {
                await deleteWeight(weight.id!);
                console.log("deleted weight");

            }, 5000);

            SetDeleteTimeoutID(timeout);
            SetWeightToDelete(weight);
        } catch (error: unknown) {
            dispatch(setNotification(
                {
                    notify: true,
                    message: "Unsuccessful",
                    severity: "error",
                    title: "Error",
                    type: "delete"
                }
            ));
            // clear out the notifications after some times
            setTimeout(() => {
                dispatch(setNotification({
                    notify: false,
                    message: "",
                    severity: undefined,
                    title: "",
                    type: undefined
                }));
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