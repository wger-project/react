import React, { Suspense } from 'react';
import './index.css';
import './i18n';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';
import createCache from '@emotion/cache';
import reportWebVitals from './reportWebVitals';
import { makeTheme, theme } from 'theme';
import { ThemeProvider } from '@mui/material/styles';
import { WeightStateProvider } from 'state';
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { WgerRoutes } from "routes";
import { CacheProvider } from "@emotion/react";
import { OverviewDashboard } from "components/BodyWeight/OverviewDashboard/OverviewDashboard";
import { WeightOverview } from "pages";


const queryClient = new QueryClient({
    // -> https://tanstack.com/query/v4/docs/react/reference/QueryClient
    // time in milliseconds,  1000 * 30 = 30seconds

    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 1000 * 30,
            cacheTime: 1000 * 30,
            refetchOnMount: true,
            refetchOnWindowFocus: true,
            refetchOnReconnect: "always"
        },
    }
});


const renderComponentShadowDom = (divId: string) => {

    const rootElement = document.getElementById(divId);
    if (rootElement === null) {
        return;
    }

    const shadow = rootElement.attachShadow({ mode: 'open' });
    const shadowRoot = document.createElement('div');
    const styleElement = document.createElement('style');

    const djangoReactStyle = document.getElementById('react-css');
    if (djangoReactStyle) {
        const djangoStyleElement = document.createElement('link');
        djangoStyleElement.setAttribute('rel', 'stylesheet');
        // @ts-ignore
        djangoStyleElement.setAttribute('href', djangoReactStyle.href);
        shadow.appendChild(djangoReactStyle);
    }

    shadow.appendChild(shadowRoot);
    shadow.appendChild(styleElement);


    const cache = createCache({
        key: 'css',
        prepend: true,
        container: styleElement,
    });

    const root = createRoot(shadowRoot);
    root.render(
        <CacheProvider value={cache}>
            <Suspense fallback={<LoadingWidget />}>
                <Router>
                    <ThemeProvider theme={makeTheme(shadowRoot)}>
                        <QueryClientProvider client={queryClient}>
                            <WgerRoutes />
                        </QueryClientProvider>
                    </ThemeProvider>
                </Router>
            </Suspense>
        </CacheProvider>
    );
};

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

renderComponentShadowDom("react-exercise-overview");
renderComponentShadowDom("react-exercise-contribute");


const exerciseDetail = document.getElementById("react-exercise-detail");
if (exerciseDetail) {
    const root = createRoot(exerciseDetail);
    root.render(
        <Suspense fallback={<LoadingWidget />}>
            <Router>
                <ThemeProvider theme={theme}>
                    <QueryClientProvider client={queryClient}>
                        <WgerRoutes />
                    </QueryClientProvider>
                </ThemeProvider>
            </Router>
        </Suspense>
    );
}


renderComponentShadowDom("react-routine-overview");
renderComponentShadowDom("react-routine-detail");
renderComponentShadowDom("react-routine-logs");


renderComponentShadowDom("react-measurements-overview");
renderComponentShadowDom("react-measurements-detail");

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
