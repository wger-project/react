import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { Container, Grid, Stack, Typography } from "@mui/material";
import React from "react";

type WgerTemplateContainerProps = {
    title?: string;
    mainContent: ReactJSXElement | null;
    sideBar?: ReactJSXElement;
    optionsMenu?: ReactJSXElement;
    fab?: ReactJSXElement;
};

export const WgerContainerRightSidebar = (props: WgerTemplateContainerProps) => {

    return <Container maxWidth="lg">

        <Grid container spacing={2}>
            <Grid item xs={8} sx={{ mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography gutterBottom variant="h3">
                        {props.title}
                    </Typography>
                    {props.optionsMenu}
                </Stack>
            </Grid>

            <Grid item xs={12} sm={8}>
                {props.mainContent}
            </Grid>
            <Grid item xs={12} sm={4}>
                {props.sideBar}
            </Grid>
        </Grid>

        {props.fab}

    </Container>;
};