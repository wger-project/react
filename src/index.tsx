import React, { Suspense } from 'react';
import './index.css';
import './i18n';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';
import reportWebVitals from './reportWebVitals';
import { theme } from 'theme';
import { ThemeProvider } from '@mui/material/styles';
import { WeightStateProvider } from 'state';
import { WeightOverview } from "pages";
import { OverviewDashboard } from "components/BodyWeight/OverviewDashboard/OverviewDashboard";
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // set a stale time of 20 seconds
            //staleTime: 1000 * 20,
        },
    }
});

const rootElement = document.getElementById("root");
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <Suspense fallback={<LoadingWidget />}>
                <Router>
                    <WeightStateProvider>
                        <ThemeProvider theme={theme}>
                            <QueryClientProvider client={queryClient}>
                                <App />
                                <ReactQueryDevtools />
                            </QueryClientProvider>
                        </ThemeProvider>
                    </WeightStateProvider>
                </Router>
            </Suspense>
        </React.StrictMode>
    );
}

/*
 * Components used in the wger django app, don't change the IDs here
 */
const weightOverview = document.getElementById("react-weight-overview");
if (weightOverview) {
    const root = createRoot(weightOverview);
    root.render(
        <Suspense fallback={<LoadingWidget />}>
            <WeightStateProvider>
                <ThemeProvider theme={theme}>
                    <WeightOverview />
                </ThemeProvider>
            </WeightStateProvider>
        </Suspense>
    );
}

const weightDashboard = document.getElementById("react-weight-dashboard");
if (weightDashboard) {
    const root = createRoot(weightDashboard);
    root.render(
        <Suspense fallback={<LoadingWidget />}>
            <WeightStateProvider>
                <ThemeProvider theme={theme}>
                    <OverviewDashboard />
                </ThemeProvider>
            </WeightStateProvider>
        </Suspense>
    );
}


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
