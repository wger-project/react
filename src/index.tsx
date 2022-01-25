import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './i18n';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';
import reportWebVitals from './reportWebVitals';
import { theme } from 'theme';
import { ThemeProvider } from '@mui/material/styles';
import { StateProvider } from 'state';
import { WeightOverview } from "pages";
import { OverviewDashboard } from "components/BodyWeight/OverviewDashboard/OverviewDashboard";

const rootElement = document.getElementById("root");
if (rootElement) {
    ReactDOM.render(
        <React.StrictMode>
            <Suspense fallback={<div>Loading... </div>}>
                <Router>
                    <StateProvider>
                        <ThemeProvider theme={theme}>
                            <App />
                        </ThemeProvider>
                    </StateProvider>
                </Router>
            </Suspense>
        </React.StrictMode>,
        rootElement
    );
}

/*
 * Components used in the wger django app, don't change the IDs here
 */
const weightOverview = document.getElementById("react-weight-overview");
if (weightOverview) {
    ReactDOM.render(
        <Suspense fallback={<div>Loading... </div>}>
            <StateProvider>
                <WeightOverview />
            </StateProvider>
        </Suspense>,
        weightOverview);
}

const weightDashboard = document.getElementById("react-weight-dashboard");
if (weightDashboard) {
    ReactDOM.render(
        <Suspense fallback={<div>Loading... </div>}>
            <StateProvider>
                <OverviewDashboard />
            </StateProvider>
        </Suspense>,
        weightDashboard);
}


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
