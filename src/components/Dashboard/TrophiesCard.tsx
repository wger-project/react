import { Card, CardContent, CardMedia, Typography, } from "@mui/material";
import Box from "@mui/system/Box";
import Stack from "@mui/system/Stack";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { EmptyCard } from "components/Dashboard/EmptyCard";
import { UserTrophy } from "components/Trophies/models/userTrophy";
import { useUserTrophiesQuery } from "components/Trophies/queries/trophies";
import React from "react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();

    return (<DashboardCard title={t("trophies.trophies")}>
        <Box sx={{ overflowX: 'auto', width: '100%', py: 1 }}>
            <Stack direction="row" spacing={2} sx={{ display: 'flex' }}>
                {props.trophies.map((userTrophy) => (
                    <Card sx={{ width: 200, flex: '0 0 auto' }} key={userTrophy.trophy.uuid}>
                        <CardMedia
                            sx={{ height: 140 }}
                            image={userTrophy.trophy.image}
                            title={userTrophy.trophy.name}
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h6" component="div">
                                {userTrophy.trophy.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {userTrophy.trophy.description}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Box>
    </DashboardCard>);
}
