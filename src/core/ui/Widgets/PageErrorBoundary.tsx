import { Alert, AlertTitle, Container } from "@mui/material";
import React, { ErrorInfo, ReactNode } from "react";
import { useLocation } from "react-router-dom";

type PageErrorBoundaryProps = {
    children: ReactNode;
};

type PageErrorBoundaryState = {
    error: Error | null;
};

class PageErrorBoundary extends React.Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
    state: PageErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Unable to render page", error, errorInfo);
    }

    render() {
        if (this.state.error) {
            return (
                <Container maxWidth="md" sx={{ mt: 2 }}>
                    <Alert severity="error">
                        <AlertTitle>Unable to load this page</AlertTitle>
                        {this.state.error.message}
                    </Alert>
                </Container>
            );
        }

        return this.props.children;
    }
}

export const RouteErrorBoundary = ({ children }: PageErrorBoundaryProps) => {
    const location = useLocation();

    return <PageErrorBoundary key={location.pathname}>{children}</PageErrorBoundary>;
};
