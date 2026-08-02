import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import {
    useAddMeasurementCategoryQuery,
    useEditMeasurementCategoryQuery,
    useMeasurementsCategoryQuery
} from "@/components/Measurements/queries";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { CategoryForm } from "@/components/Measurements/widgets/CategoryForm";
import React from 'react';
import { TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2 } from "@/tests/measurementsTestData";
import type { Mock } from 'vitest';

vi.mock("@/components/Measurements/api/bodyWeight");

vi.mock("@/components/Measurements/queries");

// an entry-free category, eligible as a group parent
const TEST_GROUP_CATEGORY = new MeasurementCategory(
    'cccccccc-cccc-cccc-cccc-000000000042',
    'Blood pressure',
    'mmHg',
);

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
        (useMeasurementsCategoryQuery as Mock).mockImplementation(() => ({
            data: [TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2, TEST_GROUP_CATEGORY]
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

    test('The body weight and component metric types are not offered', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm />
            </QueryClientProvider>
        );
        await user.click(screen.getByRole('combobox', { name: 'measurements.metricType' }));

        // Assert
        expect(screen.getByRole('option', { name: 'measurements.metricTypes.steps' })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: 'measurements.metricTypes.body_weight' })).toBeNull();
        expect(screen.queryByRole('option', { name: 'measurements.metricTypes.blood_pressure_systolic' })).toBeNull();
        expect(screen.queryByRole('option', { name: 'measurements.metricTypes.blood_pressure_diastolic' })).toBeNull();
    });

    test('Creating a category inside a group', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm />
            </QueryClientProvider>
        );
        await user.type(await screen.findByLabelText('name'), 'Something');
        await user.type(await screen.findByLabelText('unit'), 'mmHg');

        await user.click(screen.getByRole('combobox', { name: 'measurements.partOfGroup' }));
        await user.click(screen.getByRole('option', { name: 'Blood pressure' }));

        await user.click(screen.getByRole('button', { name: 'submit' }));

        // Assert
        expect(mutate).toHaveBeenCalledWith(new MeasurementCategory(
            null,
            'Something',
            'mmHg',
            undefined,
            'custom',
            false,
            TEST_GROUP_CATEGORY.id,
        ));
    });

    test('A typed category cannot be put into a group', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm />
            </QueryClientProvider>
        );
        await user.click(screen.getByRole('combobox', { name: 'measurements.metricType' }));
        await user.click(screen.getByRole('option', { name: 'measurements.metricTypes.steps' }));

        // Assert - the group selector is gone, a typed category stays top-level
        expect(screen.queryByRole('combobox', { name: 'measurements.partOfGroup' })).toBeNull();
    });

    test('A group is not offered as a parent, it only holds its own components', async () => {
        // Arrange
        (useMeasurementsCategoryQuery as Mock).mockImplementation(() => ({
            data: [MeasurementCategory.clone(TEST_GROUP_CATEGORY, { metricType: 'blood_pressure' })]
        }));

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm />
            </QueryClientProvider>
        );

        // Assert - no eligible parent left, so the selector is not rendered
        expect(screen.queryByRole('combobox', { name: 'measurements.partOfGroup' })).toBeNull();
    });

    test('Only entry-free top-level categories are offered as parents', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm />
            </QueryClientProvider>
        );
        await user.click(screen.getByRole('combobox', { name: 'measurements.partOfGroup' }));

        // Assert - the categories with entries are not eligible
        expect(screen.getByRole('option', { name: 'Blood pressure' })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: 'Biceps' })).toBeNull();
        expect(screen.queryByRole('option', { name: 'Body fat' })).toBeNull();
    });

    test('The group dropdown is hidden for a category with children', () => {
        // Arrange
        const child = new MeasurementCategory(
            'cccccccc-cccc-cccc-cccc-000000000043',
            'Systolic',
            'mmHg',
            undefined,
            'blood_pressure',
            false,
            TEST_GROUP_CATEGORY.id,
        );
        (useMeasurementsCategoryQuery as Mock).mockImplementation(() => ({
            data: [TEST_GROUP_CATEGORY, child]
        }));

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={TEST_GROUP_CATEGORY} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.queryByRole('combobox', { name: 'measurements.partOfGroup' })).toBeNull();
    });

    test('A category with children gets no chart type picker', () => {

        // Arrange: its chart follows from what its components are to each
        // other, which is what groupChart decides; a pick would have no effect
        const child = new MeasurementCategory(
            'cccccccc-cccc-cccc-cccc-000000000044',
            'Systolic',
            'mmHg',
            undefined,
            'blood_pressure',
            false,
            TEST_GROUP_CATEGORY.id,
        );
        (useMeasurementsCategoryQuery as Mock).mockImplementation(() => ({
            data: [TEST_GROUP_CATEGORY, child]
        }));

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={TEST_GROUP_CATEGORY} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.queryByRole('combobox', { name: 'measurements.chartType' })).toBeNull();
    });

    test('A leaf category gets the chart type picker', () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={TEST_MEASUREMENT_CATEGORY_1} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByRole('combobox', { name: 'measurements.chartType' }))
            .toBeInTheDocument();
    });
});
