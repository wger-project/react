import { QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from '@testing-library/react';
import { PublicTemplateOverview } from "components/WorkoutRoutines/Overview/PublicTemplateOverview";
import { BrowserRouter } from "react-router-dom";
import { getPublicTemplatesShallow } from "services";
import { testQueryClient } from "tests/queryClient";
import { testPublicTemplate1 } from "tests/workoutRoutinesTestData";

jest.mock("services");

describe("Smoke tests the PublicTemplateOverview component", () => {

    beforeEach(() => {
        (getPublicTemplatesShallow as jest.Mock).mockResolvedValue([testPublicTemplate1]);
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
        await act(async () => {
            await new Promise((r) => setTimeout(r, 20));
        });

        // Assert
        expect(getPublicTemplatesShallow).toHaveBeenCalledTimes(1);
        expect(screen.getByText('public template 1')).toBeInTheDocument();
        expect(screen.getByText('routines.publicTemplates')).toBeInTheDocument();
    });
});
