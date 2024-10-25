import { Box, Card, CardContent, CardMedia, Skeleton, } from "@mui/material";
import Grid from '@mui/material/Grid2';
import React from "react";

export const ExerciseGridSkeleton = () => {

    return (
        (<Grid container spacing={1}>
            {Array.apply(null, Array(21)).map((skeletonBase, idx) => (
                <Grid key={idx} sx={{ display: "flex" }} size={4}>
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
