import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";

import { useAddNutritionalPlanQuery, useEditNutritionalPlanQuery } from "components/Nutrition/queries";
import { PlanForm } from "components/Nutrition/widgets/forms/PlanForm";
import React from 'react';
import { TEST_NUTRITIONAL_PLAN_1 } from "tests/nutritionTestdata";

jest.mock("services/weight");
jest.mock("components/Nutrition/queries");

describe("Test the PlanForm component", () => {
    const queryClient = new QueryClient();
    let mutate = jest.fn();

    beforeEach(() => {
        mutate = jest.fn();

        // @ts-ignore
        useEditNutritionalPlanQuery.mockImplementation(() => ({
            mutate: mutate
        }));

        // @ts-ignore
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
            // eslint-disable-next-line camelcase
            goal_carbohydrates: null,
            // eslint-disable-next-line camelcase
            goal_fibers: null,
            // eslint-disable-next-line camelcase
            goal_energy: null,
            // eslint-disable-next-line camelcase
            goal_fat: null,
            // eslint-disable-next-line camelcase
            goal_protein: null,
            // eslint-disable-next-line camelcase
            only_logging: false,
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
        const descriptionInput = await screen.findByLabelText('description');
        await user.clear(descriptionInput);
        await user.type(descriptionInput, 'a new, cool plan');

        // Assert
        await user.click(screen.getByRole('button', { name: 'submit' }));
        expect(mutate).toHaveBeenCalledWith({
            description: 'a new, cool plan',
            // eslint-disable-next-line camelcase
            only_logging: true,
            // eslint-disable-next-line camelcase
            goal_carbohydrates: null,
            // eslint-disable-next-line camelcase
            goal_energy: null,
            // eslint-disable-next-line camelcase
            goal_fat: null,
            // eslint-disable-next-line camelcase
            goal_protein: null,
            // eslint-disable-next-line camelcase
            goal_fibers: null,
        });
    });
});
