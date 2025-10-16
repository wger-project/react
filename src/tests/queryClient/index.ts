import { QueryClient } from "@tanstack/react-query";

export const getTestQueryClient = () => new QueryClient({
    defaultOptions: { queries: { retry: false } }
});

export const testQueryClient = new QueryClient();