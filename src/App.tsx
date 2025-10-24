import Grid from "@mui/material/Grid";
import { Header } from "components";
import { Notifications } from "components/Core/Notifications";
import React from "react";
import { WgerRoutes } from "routes";
import { PreferencesProvider } from "state/PreferencesContext";

function App() {
    return (
        <PreferencesProvider>
            <Grid container>
                <Grid size={12}>
                    <Header />
                </Grid>
                <Grid size={12}>
                    <Notifications />
                </Grid>
                <Grid size={12}>
                    <WgerRoutes />
                </Grid>
            </Grid>
        </PreferencesProvider>
    );
}

export default App;
