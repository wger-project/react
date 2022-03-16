import React from 'react';
import styles from './side_gallery.module.css';
import { Grid } from '@mui/material';
import { ExerciseImage } from "components/Exercises/models/image";

type SideGalleryProps = {
    mainImage: ExerciseImage | undefined;
    sideImages: ExerciseImage[];
}

export const SideGallery = ({ mainImage, sideImages }: SideGalleryProps) => {


    return (
        <div className={styles.side_gallery}>
            <Grid container spacing={2}>
                {mainImage && <Grid item xs={12}>
                    <img src={mainImage.url} />
                </Grid>}
                {sideImages.map(img => (
                    <Grid item xs={6} key={img.id}>
                        <img src={img.url} alt="details" />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};
