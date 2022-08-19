import React from 'react';
import {Card, CardMedia, Grid} from '@mui/material';
import {ExerciseImage} from "components/Exercises/models/image";

type SideGalleryProps = {
    mainImage: ExerciseImage | undefined;
    sideImages: ExerciseImage[];
}

export const SideGallery = ({mainImage, sideImages}: SideGalleryProps) => {

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
                            sx={{height: 120}}
                            alt=""
                        />
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};
