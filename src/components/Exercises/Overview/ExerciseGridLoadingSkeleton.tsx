import React from "react";
import { Box, Card, CardContent, CardMedia, Grid, Skeleton, } from "@mui/material";

export const ExerciseGridSkeleton = () => {

    return (
        <Grid container spacing={1}>
            {Array.apply(null, Array(21)).map((skeletonBase, idx) => (
                <Grid item xs={4} key={idx} sx={{ display: "flex" }}>
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
        </Grid>
    );
};
