import { Button, Card, CardContent, CardMedia, Tooltip, Typography, } from "@mui/material";
import Box from "@mui/system/Box";
import Stack from "@mui/system/Stack";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { EmptyCard } from "components/Dashboard/EmptyCard";
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

    return trophiesQuery.data !== null ? (
        <TrophiesCardContent trophies={trophiesQuery.data!} />
    ) : (
        <EmptyCard title={t("trophies.trophies")} />
    );
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
                    <Tooltip title={tooltipWidget(userTrophy.trophy.description)} arrow>
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
