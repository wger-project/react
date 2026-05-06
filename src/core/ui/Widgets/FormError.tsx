import { Alert, AlertTitle, Box, Snackbar } from "@mui/material";
import { SNACKBAR_AUTO_HIDE_DURATION } from "@/core/lib/consts";
import { collectValidationErrors } from "@/core/lib/forms";

// Close buttons are intentionally absent: dismissing one error left the open
// state at false, so a follow-up mutation's error wouldn't surface. See f9ba0a47.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FormQueryErrors = (props: { mutationQuery: any }) => {
    if (!props.mutationQuery?.isError) {
        return null;
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Alert severity="error" sx={{ mb: 1 }}>
                <AlertTitle>{props.mutationQuery.error?.message}</AlertTitle>
                <ul>
                    {collectValidationErrors(props.mutationQuery.error.response?.data).map((error, index) =>
                        <li key={index}>{error}</li>
                    )}
                </ul>
            </Alert>
        </Box>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FormQueryErrorsSnackbar = (props: { mutationQuery: any }) => {
    if (!props.mutationQuery?.isError) {
        return null;
    }

    return (
        <Snackbar open={true} autoHideDuration={SNACKBAR_AUTO_HIDE_DURATION}>
            <Alert severity="error" sx={{ width: '100%' }}>
                <AlertTitle>{props.mutationQuery.error?.message}</AlertTitle>
                <ul>
                    {collectValidationErrors(props.mutationQuery.error.response?.data).map((error, index) =>
                        <li key={index}>{error}</li>
                    )}
                </ul>
            </Alert>
        </Snackbar>
    );
};