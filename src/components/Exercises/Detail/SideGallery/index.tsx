import React from 'react';
import { Card, CardMedia, Grid } from '@mui/material';
import { ExerciseImage } from "components/Exercises/models/image";
import { ExerciseVideo } from "components/Exercises/models/video";

type SideGalleryProps = {
    mainImage: ExerciseImage | undefined;
    sideImages: ExerciseImage[];
}

export const SideGallery = ({ mainImage, sideImages }: SideGalleryProps) => {

    return (
        <Grid container spacing={1}>
            {mainImage && <Grid item xs={12}>
                <Card>
                    <CardMedia
                        component="img"
                        image={mainImage.url}
                        alt=""
                    />
                </Card>
            </Grid>}

            {sideImages.map(img => (
                <Grid item xs={6} key={img.id}>
                    <Card>
                        <CardMedia
                            component="img"
                            image={img.url}
                            sx={{ height: 120 }}
                            alt=""
                        />
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

type VideoGalleryProps = {
    videos: ExerciseVideo[]
}

export const SideVideoGallery = ({ videos }: VideoGalleryProps) => {

    return (
        <Grid container spacing={1}>
            {videos.map(video => (
                <Grid item xs={6} key={video.id}>
                    <Card>
                        <CardMedia
                            component={'video'}
                            src={video.url}
                            sx={{ height: 120 }}
                            controls
                            muted
                            preload="metadata"
                        />
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};
