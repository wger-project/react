import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { useDeleteRoutineQuery } from "@/components/Routines/queries";
import { RoutineDetailDropdown } from "@/components/Routines/widgets/RoutineDetailDropdown";
import React from 'react';
import { MemoryRouter } from "react-router-dom";
import { testQueryClient } from "@/tests/queryClient";
import { testPrivateTemplate1, testRoutine1 } from "@/tests/workoutRoutinesTestData";
import type { Mock } from 'vitest';
import { Routine } from "@/components/Routines/models/Routine";

vi.mock("@/components/Routines/queries");

describe("Test the RoutineDetailDropdown component", () => {

    let user: ReturnType<typeof userEvent.setup>;
    let deleteMutateAsync: Mock;

    beforeEach(() => {
        user = userEvent.setup();
        vi.resetAllMocks();

        deleteMutateAsync = vi.fn().mockResolvedValue(204);
        (useDeleteRoutineQuery as Mock).mockReturnValue({ mutateAsync: deleteMutateAsync });
    });

    const renderAndOpenMenu = async (routine: Routine) => {
        render(
            <QueryClientProvider client={testQueryClient}>
                <MemoryRouter>
                    <RoutineDetailDropdown routine={routine} />
                </MemoryRouter>
            </QueryClientProvider>
        );
        await user.click(screen.getByRole('button'));
    };

    test('shows the log and stats entries for a regular routine', async () => {

        // Act
        await renderAndOpenMenu(testRoutine1);

        // Assert
        expect(screen.getByText('routines.logsOverview')).toBeInTheDocument();
        expect(screen.getByText('routines.statsOverview')).toBeInTheDocument();
    });

    test('hides the log and stats entries for a template', async () => {

        // Act
        await renderAndOpenMenu(testPrivateTemplate1);

        // Assert
        // Logs and stats only make sense for a routine the user actually trains
        expect(screen.queryByText('routines.logsOverview')).not.toBeInTheDocument();
        expect(screen.queryByText('routines.statsOverview')).not.toBeInTheDocument();
        expect(screen.getByText('edit')).toBeInTheDocument();
    });

    test('deleting asks for confirmation before calling the mutation', async () => {

        // Act
        await renderAndOpenMenu(testRoutine1);
        await user.click(screen.getByText('delete'));

        // Assert - the dialog is open, but nothing was deleted yet
        expect(await screen.findByRole('dialog')).toBeInTheDocument();
        expect(deleteMutateAsync).not.toHaveBeenCalled();

        // Act - confirm
        const dialog = screen.getByRole('dialog');
        await user.click(within(dialog).getByRole('button', { name: 'delete' }));

        // Assert
        await waitFor(() => expect(deleteMutateAsync).toHaveBeenCalledTimes(1));
    });

    test('cancelling the delete dialog does not delete the routine', async () => {

        // Act
        await renderAndOpenMenu(testRoutine1);
        await user.click(screen.getByText('delete'));
        const dialog = await screen.findByRole('dialog');
        await user.click(within(dialog).getByRole('button', { name: 'cancel' }));

        // Assert
        expect(deleteMutateAsync).not.toHaveBeenCalled();
    });

    test('mark as template opens the template form', async () => {

        // Act
        await renderAndOpenMenu(testRoutine1);
        await user.click(screen.getByText('routines.markAsTemplate'));

        // Assert
        const dialog = await screen.findByRole('dialog');
        expect(within(dialog).getByText('routines.markAsTemplate')).toBeInTheDocument();
        expect(deleteMutateAsync).not.toHaveBeenCalled();
    });
});
