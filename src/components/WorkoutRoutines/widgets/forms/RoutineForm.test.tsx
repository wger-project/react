import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoutineForm } from "components/WorkoutRoutines/widgets/forms/RoutineForm";
import { BrowserRouter } from "react-router-dom";
import { addRoutine, editRoutine } from 'services';
import { testQueryClient } from "tests/queryClient";
import { testRoutine1 } from "tests/workoutRoutinesTestData";


jest.mock("services");
const mockEditRoutine = editRoutine as jest.Mock;
const mockAddRoutine = addRoutine as jest.Mock;

describe('RoutineForm', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
        jest.resetAllMocks();
        mockAddRoutine.mockResolvedValue(testRoutine1);
    });

    test('pre fills the form with data from the routine', async () => {

        // Act
        render(
            <BrowserRouter>
                <QueryClientProvider client={testQueryClient}>
                    <RoutineForm routine={testRoutine1} />
                </QueryClientProvider>
            </BrowserRouter>
        );

        // Assert
        expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Test routine 1');
        const groupStart = screen.getByRole('group', { name: /start/i });
        expect(within(groupStart).getByRole('textbox', { hidden: true })).toHaveValue('05/01/2024');

        const groupEnd = screen.getByRole('group', { name: /end/i });
        expect(within(groupEnd).getByRole('textbox', { hidden: true })).toHaveValue('06/01/2024');
        expect(screen.getByRole('textbox', { name: /description/i })).toHaveValue('Full body routine');
    });

    test('sends the correct data to the server', async () => {

        // Act
        render(
            <BrowserRouter>
                <QueryClientProvider client={testQueryClient}>
                    <RoutineForm routine={testRoutine1} />
                </QueryClientProvider>
            </BrowserRouter>
        );
        const nameInput = screen.getByRole('textbox', { name: /name/i });
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated routine name');
        await user.click(screen.getByRole('button', { name: /save/i }));

        // Assert
        expect(mockEditRoutine).toHaveBeenCalledWith({
            "description": "Full body routine",
            "end": "2024-06-01",
            "fitInWeek": false,
            "fit_in_week": false,
            "id": 1,
            "name": "Updated routine name",
            "start": "2024-05-01",
        });
    });

    test('empty form', async () => {

        // Act
        render(
            <BrowserRouter>
                <QueryClientProvider client={testQueryClient}>
                    <RoutineForm />
                </QueryClientProvider>
            </BrowserRouter>
        );
        expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('');
        expect(screen.getByRole('textbox', { name: /description/i })).toHaveValue('');

        await user.type(screen.getByRole('textbox', { name: /name/i }), 'New routine name');
        await user.type(screen.getByRole('textbox', { name: /description/i }), 'The description goes here');
        await user.click(screen.getByRole('button', { name: /save/i }));

        // Assert
        expect(mockAddRoutine).toHaveBeenCalledWith(expect.objectContaining({
            name: "New routine name",
            description: "The description goes here",
        }));
    });
});