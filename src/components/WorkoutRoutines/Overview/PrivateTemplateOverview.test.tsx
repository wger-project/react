import { QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from '@testing-library/react';
import { PrivateTemplateOverview } from "components/WorkoutRoutines/Overview/PrivateTemplateOverview";
import { BrowserRouter } from "react-router-dom";
import { getPrivateTemplatesShallow } from "services";
import { testQueryClient } from "tests/queryClient";
import { testPrivateTemplate1 } from "tests/workoutRoutinesTestData";

jest.mock("services");

describe("Smoke tests the PrivateTemplateOverview component", () => {

    beforeEach(() => {
        (getPrivateTemplatesShallow as jest.Mock).mockResolvedValue([testPrivateTemplate1]);
    });

    test('renders all private templates', async () => {

        // Act
        render(
            <BrowserRouter>
                <QueryClientProvider client={testQueryClient}>
                    <PrivateTemplateOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(async () => {
            await new Promise((r) => setTimeout(r, 20));
        });

        // Assert
        expect(getPrivateTemplatesShallow).toHaveBeenCalledTimes(1);
        expect(screen.getByText('private template 1')).toBeInTheDocument();
        expect(screen.getByText('routines.templates')).toBeInTheDocument();
    });
});
