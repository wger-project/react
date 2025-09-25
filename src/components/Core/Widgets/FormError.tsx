import { Alert, AlertTitle, Box, Collapse, Snackbar } from "@mui/material";
import { useState } from 'react';
import { SNACKBAR_AUTO_HIDE_DURATION } from "utils/consts";
import { collectValidationErrors } from "utils/forms";

export const FormQueryErrors = (props: { mutationQuery: any }) => {
    const [openAlert, setOpenAlert] = useState(true);

    const handleCloseAlert = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    if (!props.mutationQuery?.isError) {
        return null;
    }

    return <>
        <Box sx={{ width: '100%' }}>
            <Collapse in={openAlert}>
                <Alert severity="error" sx={{ mb: 1 }} onClose={handleCloseAlert}>
                    <AlertTitle>{props.mutationQuery.error?.message}</AlertTitle>
                    <ul>
                        {/* TODO: how to properly type this */}
                        {collectValidationErrors((props.mutationQuery.error as any).response?.data).map((error, index) =>
                            <li key={index}>{error}</li>
                        )}
                    </ul>
                </Alert>
            </Collapse>
        </Box>
    </>;
};

export const FormQueryErrorsSnackbar = (props: { mutationQuery: any }) => {
    const [openSnackbar, setOpenSnackbar] = useState(true);

    if (!props.mutationQuery?.isError) {
        return null;
    }

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    return <>
        <Snackbar open={openSnackbar} autoHideDuration={SNACKBAR_AUTO_HIDE_DURATION} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                <AlertTitle>{props.mutationQuery.error?.message}</AlertTitle>
                <ul>
                    {/* TODO: how to properly type this */}
                    {collectValidationErrors((props.mutationQuery.error as any).response?.data).map((error, index) =>
                        <li key={index}>{error}</li>
                    )}
                </ul>
            </Alert>
        </Snackbar>
    </>;
};