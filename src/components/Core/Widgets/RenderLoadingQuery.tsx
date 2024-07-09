import { Alert, Box, Stack } from "@mui/material";

import { UseQueryResult } from "@tanstack/react-query";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import React from "react";


export const RenderLoadingQuery = (props: { query: UseQueryResult, child: JSX.Element | boolean }) => {

    if (props.query.isLoading) {
        return <LoadingPlaceholder />;
    }

    if (props.query.isError) {
        return <Box
            sx={{ height: 200, alignItems: "center", mt: 2 }}
            component={Stack}
            direction="column"
            justifyContent="center">
            {/*// @ts-ignore */}
            <Alert severity="error">Error while fetching data: {props.query.error!.message}</Alert>
        </Box>;
    }

    if (props.query.isSuccess) {
        return props.child;
    }

};


//