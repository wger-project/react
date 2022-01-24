import React, { useEffect, useState } from 'react';
import { Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme } from '@mui/material';
import { processWeight } from '../utils';
import { ActionButton } from 'components/BodyWeight/Table/ActionButton/ActionButton';
import { makeStyles } from '@mui/styles';
import { Trans } from "react-i18next";
import { WeightEntry } from "components/BodyWeight/model";
import { deleteWeight } from 'services';
import { useStateValue, removeWeight, setNotification, addWeightEntry } from 'state';
import { WeightEntryFab } from "components/BodyWeight/Table/Fab/Fab";


export interface WeightTableProps {
    weights: WeightEntry[]
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

export const WeightTable = ({ weights }: WeightTableProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [state, dispatch] = useStateValue();
    const classes = useStyles();
    const processedWeights = processWeight(weights);

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
                dispatch(setNotification({notify: false, message: "", severity: undefined, title: "", type: undefined}));
            }, 5000);
        }
    }, [state.notification.undo, deleteTimeoutID, weightToDelete, dispatch]);

    const handleDeleteWeight = async (weight: WeightEntry) => {
        try {
            dispatch(removeWeight(weight.id!));
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
                dispatch(setNotification({notify: false, message: "", severity: undefined, title: "", type: undefined}));
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
                dispatch(setNotification({notify: false, message: "", severity: undefined, title: "", type: undefined}));
            }, 5000);
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