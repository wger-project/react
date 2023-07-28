import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { TEST_NUTRITIONAL_PLAN_1 } from "tests/nutritionTestdata";
import { PlanForm } from "components/Nutrition/widgets/forms/PlanForm";

import { useAddNutritionalPlanQuery, useEditNutritionalPlanQuery } from "components/Nutrition/queries";

jest.mock("services/weight");
jest.mock("components/Nutrition/queries");

describe("Test the PlanForm component", () => {
    const queryClient = new QueryClient();
    let mutate = jest.fn();

    beforeEach(() => {
        mutate = jest.fn();

        useEditNutritionalPlanQuery.mockImplementation(() => ({
            mutate: mutate
        }));

        useAddNutritionalPlanQuery.mockImplementation(() => ({
            mutate: mutate
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
        expect(mutate).toHaveBeenCalledWith({
            id: 101,
            description: "a better name",
        });
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
        await user.type(await screen.findByLabelText('description'), 'a new, cool plan');

        // Assert
        await user.click(screen.getByRole('button', { name: 'submit' }));
        expect(mutate).toHaveBeenCalledWith({
            description: 'a new, cool plan',
        });
    });
});
