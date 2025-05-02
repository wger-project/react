import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { RoutineDetailDropdown } from "components/WorkoutRoutines/widgets/RoutineDetailDropdown";
import React from 'react';
import { MemoryRouter } from "react-router-dom";
import { testQueryClient } from "tests/queryClient";
import { testRoutine1 } from "tests/workoutRoutinesTestData";

describe("Test the RoutineDetailDropdown component", () => {

    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
        jest.resetAllMocks();
    });

    test('Edit entry is enabled for routines', async () => {

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <MemoryRouter>
                    <RoutineDetailDropdown routine={testRoutine1} />
                </MemoryRouter>
            </QueryClientProvider>
        );
        const menuButton = screen.getByRole('button');
        await user.click(menuButton);

        // Assert
        const editMenuItem = screen.getByText('edit').closest('li');
        expect(editMenuItem).not.toHaveAttribute('aria-disabled');
    });

    test('Edit entry is disabled for templates', async () => {
        // Arrange
        testRoutine1.isTemplate = true;

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <MemoryRouter>
                    <RoutineDetailDropdown routine={testRoutine1} />
                </MemoryRouter>
            </QueryClientProvider>
        );
        const menuButton = screen.getByRole('button');
        await user.click(menuButton);

        // Assert
        const editMenuItem = screen.getByText('edit').closest('li');
        expect(editMenuItem).toHaveAttribute('aria-disabled', 'true');
    });
});
