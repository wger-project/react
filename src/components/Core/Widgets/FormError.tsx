import { Alert, AlertTitle } from "@mui/material";
import { collectValidationErrors } from "utils/forms";

export const FormQueryErrors = (props: { mutationQuery: any }) => {
    if (!props.mutationQuery?.isError) {
        return null;
    }

    return <>
        <Alert severity="error" sx={{ mb: 1 }}>
            <AlertTitle>{props.mutationQuery.error?.message}</AlertTitle>
            <ul>
                {/* TODO: how to properly type this */}
                {collectValidationErrors((props.mutationQuery.error as any).response?.data).map((error, index) =>
                    <li key={index}>{error}</li>
                )}
            </ul>
        </Alert>
    </>;
};