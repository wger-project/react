import { Button, Card, CardContent, CardHeader, CardMedia, Tooltip, Typography, } from "@mui/material";
import Box from "@mui/system/Box";
import Stack from "@mui/system/Stack";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { UserTrophy } from "components/Trophies/models/userTrophy";
import { useUserTrophiesQuery } from "components/Trophies/queries/trophies";
import React from "react";
import { useTranslation } from "react-i18next";
import { makeLink, WgerLink } from "utils/url";
import { DashboardCard } from "./DashboardCard";

export const TrophiesCard = () => {
    const { t } = useTranslation();
    const trophiesQuery = useUserTrophiesQuery();

    if (trophiesQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return trophiesQuery.data !== null
        ? <TrophiesCardContent trophies={trophiesQuery.data!} />
        : <EmptyTrophiesCardContent />;
};

function TrophiesCardContent(props: { trophies: UserTrophy[] }) {
    const { t, i18n } = useTranslation();

    const tooltipWidget = (tooltip: string) => <Typography variant="body2" textAlign={'center'}>
        {tooltip}
    </Typography>;

    return (<DashboardCard
        title={''}
        scrollable={false}
        actions={
            <>
                <Button
                    size="small"
                    href={makeLink(WgerLink.TROPHIES, i18n.language)}
                >
                    {t("seeDetails")}
                </Button>
            </>
        }
    >
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
            <Stack direction="row" spacing={3} sx={{ display: 'flex' }}>
                {props.trophies.map((userTrophy) => (
                    <Tooltip title={tooltipWidget(userTrophy.trophy.description)} arrow key={userTrophy.trophy.id}>
                        <Card sx={{ width: 80, flex: '0 0 auto', boxShadow: 'none' }} key={userTrophy.trophy.uuid}>
                            <CardMedia
                                component="img"
                                image={userTrophy.trophy.image}
                                title={userTrophy.trophy.name}
                            />
                            <CardContent>
                                <Typography gutterBottom variant="body2" component="div" textAlign="center">
                                    {userTrophy.trophy.name}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Tooltip>
                ))}
            </Stack>
        </Box>
    </DashboardCard>);
}

export const EmptyTrophiesCardContent = () => {
    const [t] = useTranslation();

    return (<>
        <Card sx={{ paddingTop: 0, height: "100%", }}>
            <CardHeader
                title={t("trophies.trophies")}
                sx={{ paddingBottom: 0 }}
            />
            <CardContent>
                <Typography variant="h6" mr={3}>
                    {t('nothingHereYet')}
                </Typography>
            </CardContent>
        </Card>
    </>);
};
