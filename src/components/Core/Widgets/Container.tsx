import React from "react";
import { Container, Grid, Stack, Typography } from "@mui/material";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

type WgerTemplateContainerProps = {
    title?: string;
    mainContent: ReactJSXElement | null;
    sideBar?: ReactJSXElement;
    optionsMenu?: ReactJSXElement;
    fab?: ReactJSXElement;
};

export const WgerContainerRightSidebar = (props: WgerTemplateContainerProps) => {

    return <Container maxWidth="lg">

        <Grid container>
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