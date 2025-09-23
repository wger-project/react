import { Card, CardMedia } from '@mui/material';
import Grid from '@mui/material/Grid';
import { ExerciseImage } from "components/Exercises/models/image";
import { ExerciseVideo } from "components/Exercises/models/video";
import React from 'react';

type SideGalleryProps = {
    mainImage: ExerciseImage | undefined;
    sideImages: ExerciseImage[];
}

export const SideGallery = ({ mainImage, sideImages }: SideGalleryProps) => {

    return (
        (<Grid container spacing={1}>
            {mainImage && <Grid size={12}>
                <Card>
                    <CardMedia
                        component="img"
                        image={mainImage.url}
                        alt=""
                    />
                </Card>
            </Grid>}
            {sideImages.map(img => (
                <Grid key={img.id} size={6}>
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
        </Grid>)
    );
};

type VideoGalleryProps = {
    videos: ExerciseVideo[]
}

export const SideVideoGallery = ({ videos }: VideoGalleryProps) => {

    return (
        (<Grid container spacing={1}>
            {videos.map(video => (
                <Grid key={video.id} size={6}>
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
        </Grid>)
    );
};
