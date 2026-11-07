import { Box, Card, CardContent, CardMedia, Skeleton, } from "@mui/material";
import Grid from '@mui/material/Grid';
import React from "react";

export const ExerciseGridSkeleton = () => {

    const skeletonIds = Array.from({ length: 21 }, (_, id) => `exercise-skeleton-${id + 1}`);

    return (
        (<Grid container spacing={1}>
            {skeletonIds.map((skeletonId) => (
                <Grid key={skeletonId} sx={{ display: "flex" }} size={4}>
                    <Card>
                        <CardMedia>
                            <Skeleton variant="rectangular" width={250} height={150} />
                        </CardMedia>
                        <CardContent>
                            <Box sx={{ pt: 0.5 }}>
                                <Skeleton width="60%" />
                                <Skeleton />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>)
    );
};
