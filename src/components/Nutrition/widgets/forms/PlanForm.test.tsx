import { useAddNutritionalPlanQuery, useEditNutritionalPlanQuery } from "@/components/Nutrition/queries";
import { PlanForm } from "@/components/Nutrition/widgets/forms/PlanForm";
import { mutateMock } from "@/tests/mutationMock";
import { TEST_NUTRITIONAL_PLAN_1 } from "@/tests/nutritionTestdata";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import React from 'react';
import type { Mock } from 'vitest';

vi.mock("@/components/Measurements/api/bodyWeight");
vi.mock("@/components/Nutrition/queries");

describe("Test the PlanForm component", () => {
    const queryClient = new QueryClient();
    // Separate mocks, a single one could not tell the add and edit branch apart
    let addMutate = mutateMock();
    let editMutate = mutateMock();

    beforeEach(() => {
        addMutate = mutateMock();
        editMutate = mutateMock();

        (useEditNutritionalPlanQuery as Mock).mockImplementation(() => ({
            mutate: editMutate
        }));

        (useAddNutritionalPlanQuery as Mock).mockImplementation(() => ({
            mutate: addMutate
        }));
    });

    test('Passing an existing plan renders its values in the form', () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <PlanForm plan={TEST_NUTRITIONAL_PLAN_1} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByDisplayValue('Summer body!!!')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'submit' })).toBeInTheDocument();
    });

    test('Editing an existing plan', async () => {

        // Arrange
        const user = userEvent.setup();


        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <PlanForm plan={TEST_NUTRITIONAL_PLAN_1} />
            </QueryClientProvider>
        );
        const descriptionInput = await screen.findByLabelText('description');
        await user.clear(descriptionInput);
        await user.type(descriptionInput, 'a better name');

        // Assert
        await user.click(screen.getByRole('button', { name: 'submit' }));
        expect(editMutate).toHaveBeenCalledWith(expect.objectContaining({
                id: 'aaaaaaaa-0000-0000-0000-000000000101',
                description: "a better name",
                // the existing plan's dates must be preserved when only the description changes
                start: TEST_NUTRITIONAL_PLAN_1.start,
                end: TEST_NUTRITIONAL_PLAN_1.end,
                goalCarbohydrates: null,
                goalFiber: null,
                goalEnergy: null,
                goalFat: null,
                goalProtein: null,
                onlyLogging: false,
            })
            , expect.anything());
        expect(addMutate).not.toHaveBeenCalled();
    });

    test('Creating a new plan', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <PlanForm />
            </QueryClientProvider>
        );
        const descriptionInput = await screen.findByLabelText('description');
        await user.clear(descriptionInput);
        await user.type(descriptionInput, 'a new, cool plan');

        // Assert
        await user.click(screen.getByRole('button', { name: 'submit' }));
        expect(addMutate).toHaveBeenCalledWith(expect.objectContaining({
                description: 'a new, cool plan',
                onlyLogging: true,
                goalCarbohydrates: null,
                goalEnergy: null,
                goalFat: null,
                goalProtein: null,
                goalFiber: null,
            })
            , expect.anything());
        expect(editMutate).not.toHaveBeenCalled();
    });

    test('The goal fields only appear once the goals are switched on', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <PlanForm />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.queryByLabelText('nutrition.goalEnergy')).not.toBeInTheDocument();

        // Act
        await user.click(screen.getByRole('switch', { name: 'nutrition.useGoalsHelpText' }));

        // Assert
        expect(screen.getByLabelText('nutrition.goalEnergy')).toBeInTheDocument();
        expect(screen.getByLabelText('nutrition.goalProtein')).toBeInTheDocument();
        expect(screen.getByLabelText('nutrition.goalCarbohydrates')).toBeInTheDocument();
        expect(screen.getByLabelText('nutrition.goalFat')).toBeInTheDocument();
        expect(screen.getByLabelText('nutrition.goalFiber')).toBeInTheDocument();
    });

    test('Submits the entered goals', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <PlanForm />
            </QueryClientProvider>
        );
        await user.click(screen.getByRole('switch', { name: 'nutrition.useGoalsHelpText' }));
        await user.type(screen.getByLabelText('nutrition.goalEnergy'), '2500');
        await user.type(screen.getByLabelText('nutrition.goalProtein'), '150');
        await user.click(screen.getByRole('button', { name: 'submit' }));

        // Assert
        expect(addMutate).toHaveBeenCalledWith(expect.objectContaining({
            goalEnergy: '2500',
            goalProtein: '150',
            goalCarbohydrates: null,
            goalFat: null,
            goalFiber: null,
        }), expect.anything());
    });

    test('Switching the goals back off clears them from the payload', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <PlanForm />
            </QueryClientProvider>
        );
        const goalsSwitch = screen.getByRole('switch', { name: 'nutrition.useGoalsHelpText' });
        await user.click(goalsSwitch);
        await user.type(screen.getByLabelText('nutrition.goalEnergy'), '2500');
        await user.click(goalsSwitch);
        await user.click(screen.getByRole('button', { name: 'submit' }));

        // Assert
        // The entered value must not be sent once the user turned the goals off again
        expect(addMutate).toHaveBeenCalledWith(expect.objectContaining({
            goalEnergy: null,
            goalProtein: null,
            goalCarbohydrates: null,
            goalFat: null,
            goalFiber: null,
        }), expect.anything());
    });
});
