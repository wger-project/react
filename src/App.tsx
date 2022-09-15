import React from 'react';
import { Header, } from 'components';
import { Notifications } from 'components/Core/Notifications';
import { Grid } from "@mui/material";
import { WgerRoutes } from "routes";


function App() {

    return (
        <Grid container>
            <Grid item xs={12}>
                <Header />
            </Grid>
            <Grid item xs={12}>
                <Notifications />
            </Grid>
            <Grid item xs={12}>
                <WgerRoutes />
            </Grid>
        </Grid>
    );
}

export default App;
