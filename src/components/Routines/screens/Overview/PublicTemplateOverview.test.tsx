import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import { PublicTemplateOverview } from "@/components/Routines/screens/Overview/PublicTemplateOverview";
import { BrowserRouter } from "react-router-dom";
import { getPublicTemplatesShallow } from "@/services";
import { testQueryClient } from "@/tests/queryClient";
import { testPublicTemplate1 } from "@/tests/workoutRoutinesTestData";
import type { Mock } from 'vitest';

vi.mock("@/services");

describe("Smoke tests the PublicTemplateOverview component", () => {

    beforeEach(() => {
        (getPublicTemplatesShallow as Mock).mockResolvedValue([testPublicTemplate1]);
    });

    test('renders all public templates', async () => {

        // Act
        render(
            <BrowserRouter>
                <QueryClientProvider client={testQueryClient}>
                    <PublicTemplateOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        // Assert
        await waitFor(() => expect(getPublicTemplatesShallow).toHaveBeenCalledTimes(1));
        expect(await screen.findByText('public template 1')).toBeInTheDocument();
        expect(screen.getByText('routines.publicTemplates')).toBeInTheDocument();
    });
});
