import React from "react";
import { Container, Grid, Typography } from "@mui/material";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

type WgerTemplateContainerProps = {
    title?: string;
    mainContent: ReactJSXElement | null;
    sideBar?: ReactJSXElement | null;
    fab?: ReactJSXElement | null;
};

export const WgerContainerRightSidebar = (props: WgerTemplateContainerProps) => {

    return <Container maxWidth="lg">

        <Grid container>
            <Grid item xs={12} sx={{ mb: 2 }}>
                <Typography gutterBottom variant="h3">
                    {props.title}
                </Typography>
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