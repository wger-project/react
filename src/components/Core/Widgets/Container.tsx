import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Button, Container, Stack, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";

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
    backToTitle?: string;
    backToUrl?: string;
    optionsMenu?: ReactJSXElement;
};

export const WgerContainerFullWidth = (props: WgerTemplateContainerFullWidthProps) => {
    const { t } = useTranslation();

    const backTo = <Button
        size="small"
        component="a"
        href={props.backToUrl}>
        <ChevronLeftIcon fontSize="inherit" />
        {props.backToTitle ?? t('goBack')}
    </Button>;

    return (
        <Container maxWidth="lg">
            <Grid container spacing={2}>
                <Grid sx={{ mb: 2 }} size={12}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">

                        <Stack alignItems="start">
                            <Typography variant="h3">
                                {props.title}
                            </Typography>
                            {props.backToUrl && backTo}
                        </Stack>

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