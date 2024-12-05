import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { Container, Stack, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import React, { ReactNode } from "react";

type WgerTemplateContainerRightSidebarProps = {
    title?: string;
    mainContent: ReactJSXElement | null;
    sideBar?: ReactJSXElement;
    optionsMenu?: ReactJSXElement;
    fab?: ReactJSXElement;
};

export const WgerContainerRightSidebar = (props: WgerTemplateContainerRightSidebarProps) => {

    return (
        <Container maxWidth="lg">
            <Grid container spacing={2}>
                <Grid sx={{ mb: 2 }} size={8}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography gutterBottom variant="h3">
                            {props.title}
                        </Typography>
                        {props.optionsMenu}
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, sm: 8 }}>
                    {props.mainContent}
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    {props.sideBar}
                </Grid>
            </Grid>
            {props.fab}
        </Container>
    );
};

type WgerTemplateContainerFullWidthProps = {
    title?: string;
    children: ReactNode;
    optionsMenu?: ReactJSXElement;
};

export const WgerContainerFullWidth = (props: WgerTemplateContainerFullWidthProps) => {

    return (
        <Container maxWidth="lg">
            <Grid container spacing={2}>
                <Grid sx={{ mb: 2 }} size={12}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography gutterBottom variant="h3">
                            {props.title}
                        </Typography>
                        {props.optionsMenu}
                    </Stack>
                </Grid>

                <Grid size={12}>
                    {props.children}
                </Grid>
            </Grid>
        </Container>
    );
};