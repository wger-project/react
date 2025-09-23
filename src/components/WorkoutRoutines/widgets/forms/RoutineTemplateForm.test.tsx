import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoutineTemplateForm } from "components/WorkoutRoutines/widgets/forms/RoutineTemplateForm";
import { editRoutine } from 'services';
import { testQueryClient } from "tests/queryClient";
import { testRoutine1 } from "tests/workoutRoutinesTestData";


jest.mock("services");
const mockEditRoutine = editRoutine as jest.Mock;

describe('RoutineTemplateForm', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
        jest.resetAllMocks();
    });

    test('calls editRoutine when setting the template flag', async () => {

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <RoutineTemplateForm routine={testRoutine1} />
            </QueryClientProvider>
        );

        // Assert
        const templateToggle = screen.getByRole('checkbox', { name: 'routines.template' });
        expect(templateToggle).not.toBeChecked();
        await user.click(templateToggle);
        expect(mockEditRoutine).toHaveBeenCalledTimes(1);
        expect(mockEditRoutine).toHaveBeenCalledWith(expect.objectContaining({
            "id": 1,
            "isPublic": false,
            "isTemplate": true
        }));
    });

    test('calls editRoutine when setting the public template flag', async () => {

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <RoutineTemplateForm routine={testRoutine1} />
            </QueryClientProvider>
        );

        // Assert
        const templateToggle = screen.getByRole('checkbox', { name: 'routines.template' });
        const publicTemplateToggle = screen.getByRole('checkbox', { name: 'routines.publicTemplate' });
        expect(templateToggle).not.toBeChecked();
        expect(publicTemplateToggle).not.toBeChecked();

        // Disabled until template is set
        expect(publicTemplateToggle).toBeDisabled();

        await user.click(templateToggle);
        await user.click(publicTemplateToggle);
        expect(publicTemplateToggle).not.toBeDisabled();
        expect(mockEditRoutine).toHaveBeenCalledTimes(2);
        expect(mockEditRoutine).toHaveBeenNthCalledWith(2, expect.objectContaining({
            "id": 1,
            "isPublic": true,
            "isTemplate": true
        }));
    });
});