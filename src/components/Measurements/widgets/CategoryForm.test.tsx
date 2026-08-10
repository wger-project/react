import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { useAddMeasurementCategoryQuery, useEditMeasurementCategoryQuery } from "@/components/Measurements/queries";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { CategoryForm } from "@/components/Measurements/widgets/CategoryForm";
import React from 'react';
import { TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2 } from "@/tests/measurementsTestData";
import type { Mock } from 'vitest';

vi.mock("@/components/Weight/api/weight");

vi.mock("@/components/Measurements/queries");


describe("Test the CategoryForm component", () => {
    const queryClient = new QueryClient();
    let mutate = vi.fn();

    beforeEach(() => {
        mutate = vi.fn();

        (useEditMeasurementCategoryQuery as Mock).mockImplementation(() => ({
            mutate: mutate
        }));
        (useAddMeasurementCategoryQuery as Mock).mockImplementation(() => ({
            mutate: mutate
        }));
    });

    test('Passing an existing entry renders its values in the form', () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={TEST_MEASUREMENT_CATEGORY_1} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByDisplayValue('Biceps')).toBeInTheDocument();
        expect(screen.getByDisplayValue('cm')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'submit' })).toBeInTheDocument();
    });

    test('Editing an existing category', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={TEST_MEASUREMENT_CATEGORY_2} />
            </QueryClientProvider>
        );
        const submitButton = screen.getByRole('button', { name: 'submit' });
        const nameInput = await screen.findByLabelText('name');
        const unitInput = await screen.findByLabelText('unit');

        await user.clear(nameInput);
        await user.type(nameInput, 'a better name');
        await user.clear(unitInput);
        await user.type(unitInput, 'K/m2');

        // Assert
        await user.click(submitButton);
        expect(mutate).toHaveBeenCalledWith(MeasurementCategory.clone(
            TEST_MEASUREMENT_CATEGORY_2,
            { name: "a better name", unit: 'K/m2' }
        ));
    });

    test('Creating a new category', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm />
            </QueryClientProvider>
        );
        const nameInput = await screen.findByLabelText('name');
        const unitInput = await screen.findByLabelText('unit');
        const submitButton = screen.getByRole('button', { name: 'submit' });
        await user.type(nameInput, 'calves');
        await user.type(unitInput, 'cm');

        // Assert
        await user.click(submitButton);
        expect(mutate).toHaveBeenCalledWith(new MeasurementCategory(null, 'calves', 'cm'));
    });

    test('The name field error state follows validity, not just touched', async () => {

        // Arrange
        const user = userEvent.setup();
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={TEST_MEASUREMENT_CATEGORY_1} />
            </QueryClientProvider>
        );
        const nameInput = await screen.findByLabelText('name');

        // Act + Assert: touching a valid field must not mark it as an error
        await user.click(nameInput);
        await user.tab();
        expect(nameInput).not.toHaveAttribute('aria-invalid', 'true');

        // Act + Assert: clearing it violates the required rule
        await user.clear(nameInput);
        await user.tab();
        await waitFor(() => expect(nameInput).toHaveAttribute('aria-invalid', 'true'));

        // Act + Assert: correcting it must clear the error state again
        await user.type(nameInput, 'Biceps');
        await waitFor(() => expect(nameInput).not.toHaveAttribute('aria-invalid', 'true'));
    });
});
