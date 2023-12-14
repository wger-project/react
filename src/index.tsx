import createCache from '@emotion/cache';
import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { OverviewDashboard } from "components/BodyWeight/OverviewDashboard/OverviewDashboard";
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { NutritionCard } from "components/Dashboard/NutritionCard";
import { WeightOverview } from "pages";
import React, { Suspense } from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from 'react-router-dom';
import { WgerRoutes } from "routes";
import { WeightStateProvider } from 'state';
import { makeTheme, theme } from 'theme';

import App from './App';
import './i18n';
import './index.css';
import reportWebVitals from './reportWebVitals';


const queryClient = new QueryClient({
    // -> https://tanstack.com/query/v4/docs/react/reference/QueryClient
    // time in milliseconds, so 1000 * 30 = 30s

    defaultOptions: {
        queries: {
            retry: 3,
            staleTime: 1000 * 60 * 5,
            cacheTime: 1000 * 60 * 5,
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

const nutritionDashboard = document.getElementById('react-nutrition-dashboard');
if (nutritionDashboard) {
    const root = createRoot(nutritionDashboard);
    root.render(
            <Suspense fallback={<LoadingWidget />}>
                <ThemeProvider theme={theme}>
                    <QueryClientProvider client={queryClient}>
                        <NutritionCard />
                    </QueryClientProvider>
                </ThemeProvider>
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


renderComponentShadowDom('react-page');

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
