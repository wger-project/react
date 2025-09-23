import Grid from '@mui/material/Grid';
import { Header, } from 'components';
import { Notifications } from 'components/Core/Notifications';
import React from 'react';
import { WgerRoutes } from "routes";


function App() {

    return (
        (<Grid container>
            <Grid size={12}>
                <Header />
            </Grid>
            <Grid size={12}>
                <Notifications />
            </Grid>
            <Grid size={12}>
                <WgerRoutes />
            </Grid>
        </Grid>)
    );
}

export default App;
