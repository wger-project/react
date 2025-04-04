import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Breakpoint, Button, Container, Stack, Typography } from "@mui/material";
import Grid from '@mui/material/Grid';
import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";

type WgerTemplateContainerRightSidebarProps = {
    title?: string;
    subTitle?: string;
    mainContent: ReactJSXElement | null;
    sideBar?: ReactJSXElement;
    optionsMenu?: ReactJSXElement;
    backToTitle?: string;
    backToUrl?: string;
    fab?: ReactJSXElement;
};

function BackButton(props: { href: string | undefined, backToTitle: string | undefined }) {
    const { t } = useTranslation();

    return <Button
        size="small"
        component="a"
        href={props.href}>
        <ChevronLeftIcon fontSize="inherit" />
        {props.backToTitle ?? t('goBack')}
    </Button>;
}

export const WgerContainerRightSidebar = (props: WgerTemplateContainerRightSidebarProps) => {
    const backTo = <BackButton href={props.backToUrl} backToTitle={props.backToTitle} />;

    return (
        <Container maxWidth="lg">
            <Grid container spacing={2}>
                <Grid sx={{ mb: 2 }} size={8}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack alignItems="start">
                            <Typography variant="h3">
                                {props.title}
                            </Typography>
                            {props.subTitle && <Typography variant="h6">
                                {props.subTitle}
                            </Typography>}
                            {props.backToUrl && backTo}
                        </Stack>
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
    maxWidth?: false | Breakpoint | undefined
};

export const WgerContainerFullWidth = (props: WgerTemplateContainerFullWidthProps) => {
    const backTo = <BackButton href={props.backToUrl} backToTitle={props.backToTitle} />;

    return (
        <Container maxWidth={props.maxWidth}>
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