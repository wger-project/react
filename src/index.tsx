import { IngredientSearch } from "@/components/Nutrition";
import { LoadingWidget } from "@/core/ui/LoadingWidget/LoadingWidget";
import { WgerRoutes } from "@/routes";
import { makeTheme, theme } from '@/theme';
import createCache from '@emotion/cache';
import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import axios from 'axios';
import React, { Suspense } from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';
import './i18n';
import './index.css';


const queryClient = new QueryClient({
    // -> https://tanstack.com/query/latest/docs/reference/QueryClient
    // time in milliseconds, so 1000 * 30 = 30s

    defaultOptions: {
        queries: {
            // Don't retry client errors (e.g. a 404 for a deleted/stale resource), they
            // won't succeed on a retry and only delay surfacing the result
            retry: (failureCount, error) => {
                const status = axios.isAxiosError(error) ? error.response?.status : undefined;
                if (status !== undefined && status >= 400 && status < 500) {
                    return false;
                }
                return failureCount < 3;
            },
            staleTime: 1000 * 60 * 5,
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
                    <ThemeProvider theme={theme}>
                        <QueryClientProvider client={queryClient}>
                            <App />
                            <ReactQueryDevtools />
                        </QueryClientProvider>
                    </ThemeProvider>
                </Router>
            </Suspense>
        </React.StrictMode>
    );
}


const rootNoShadowDom = document.getElementById("react-page-no-shadow-dom");
if (rootNoShadowDom) {
    const root = createRoot(rootNoShadowDom);
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

/*
 * Components used in the wger django app, don't change the IDs here
 */
const ingredientSearchBox = document.getElementById("react-ingredient-search");
if (ingredientSearchBox) {
    const root = createRoot(ingredientSearchBox);
    root.render(
        <Suspense fallback={<LoadingWidget />}>
            <ThemeProvider theme={theme}>
                <IngredientSearch />
            </ThemeProvider>
        </Suspense>
    );
}

