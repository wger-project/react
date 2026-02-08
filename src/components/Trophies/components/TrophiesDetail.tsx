import { Card, CardContent, CardMedia, LinearProgress, LinearProgressProps, Typography } from "@mui/material";
import Box from "@mui/system/Box";
import Grid from "@mui/system/Grid";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerFullWidth } from "components/Core/Widgets/Container";
import { UserTrophyProgression } from "components/Trophies/models/userTrophyProgression";
import { useUserTrophyProgressionQuery } from "components/Trophies/queries/trophies";
import React from "react";
import { useTranslation } from "react-i18next";


export const TrophiesDetail = () => {
    const [t] = useTranslation();

    const planQuery = useUserTrophyProgressionQuery();

    if (planQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return <WgerContainerFullWidth title={t('trophies.trophies')}>
        <Grid container spacing={2}>
            {planQuery.data!.map((trophyProgression) => (
                <Grid size={{ xs: 12, sm: 4, md: 3, lg: 3, xl: 2 }} key={trophyProgression.trophy.uuid}>
                    <TrophyProgressCard key={trophyProgression.trophy.uuid} trophyProgression={trophyProgression} />
                </Grid>
            ))}
        </Grid>
    </WgerContainerFullWidth>;
};


function TrophyProgressCard(props: { trophyProgression: UserTrophyProgression }) {
    return <Card sx={{ height: "100%" }}>
        <CardMedia
            sx={{
                opacity: props.trophyProgression.isEarned ? 1 : 0.3,
                p: 1,
                width: 'auto',
                mx: 'auto',
                maxHeight: 130,
            }}
            component="img"
            image={props.trophyProgression.trophy.image}
            title={props.trophyProgression.trophy.name}
        />
        <CardContent sx={{ opacity: props.trophyProgression.isEarned ? 1 : 0.6 }}>

            <Typography gutterBottom variant="h6" component="div" textAlign="center">
                {props.trophyProgression.trophy.name}
            </Typography>

            <Box sx={{ mb: 2, mt: 0 }}>
                {(props.trophyProgression.trophy.isProgressive && !props.trophyProgression.isEarned) &&
                    <LinearProgressWithLabel value={props.trophyProgression.progress} />
                }
                <Typography variant="body2" sx={{ color: "text.secondary", textAlign: 'center' }}>
                    {props.trophyProgression.progressDisplay}
                </Typography>

            </Box>

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {props.trophyProgression.trophy.description}
            </Typography>

        </CardContent>
    </Card>;
}


const LinearProgressWithLabel = (props: LinearProgressProps & { value: number, progressLabel?: string | null }) => {
    // Extract custom prop so it doesn't get passed to the progress bar via the spread operator
    const { progressLabel, ...linearProps } = props;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" {...linearProps} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {progressLabel ?? `${Math.round(props.value)}%`}
                </Typography>
            </Box>
        </Box>
    );
};
