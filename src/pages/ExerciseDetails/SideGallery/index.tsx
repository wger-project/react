import React from 'react';
import styles from './side_gallery.module.css';
import { Grid } from '@mui/material';

// While waiting for data with images, we render this dummy
export const SideGallery = () => {
    const imgURL = "https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80";

  return (
    <div className={styles.side_gallery}>
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <img src={`${imgURL}`} alt="details" />
            </Grid>
            <Grid item md={6}>
                <img src={`${imgURL}`} alt="details" />
            </Grid>
            <Grid item md={6}>
                <img src={`${imgURL}`} alt="details" />
            </Grid>
            <Grid item md={6}>
                <img src={`${imgURL}`} alt="details" />
            </Grid>
        </Grid>
    </div>
    
  );
};
