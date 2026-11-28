import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import {
    useAddMeasurementCategoryQuery,
    useEditMeasurementCategoryQuery,
    useCategoryEntryFlagsQuery
} from "@/components/Measurements/queries";
import { useProfileQuery } from "@/components/User";
import { MeasurementCategory, TrendCharacter } from "@/components/Measurements/models/Category";
import { CategoryForm } from "@/components/Measurements/widgets/CategoryForm";
import React from 'react';
import { TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2 } from "@/tests/measurementsTestData";
import type { Mock } from 'vitest';

vi.mock("@/components/Measurements/api/bodyWeight");

vi.mock("@/components/Measurements/queries");
vi.mock("@/components/User");
// The parameter block reads exercises; without this the suite would hit the
// network for the language list and for every exercise a chip names
vi.mock("@/components/Exercises", async (importOriginal) => ({
    ...await importOriginal<typeof import("@/components/Exercises")>(),
    useLanguageQuery: vi.fn(() => ({ isSuccess: true, data: [] })),
    useExercisesDetailQueries: vi.fn((ids: number[]) => {
        const names: Record<number, string> = { 73: 'Bench press', 615: 'Squats', 184: 'Deadlifts' };
        return ids.map(id => ({
            data: { id: id, getTranslation: () => ({ name: names[id] ?? `Exercise ${id}` }) },
        }));
    }),
    usePrimeExercise: vi.fn(() => vi.fn()),
    useFetchExercisesByUuidsQuery: vi.fn(() => async () => [
        { id: 73, getTranslation: () => ({ name: 'Bench press' }) },
        { id: 615, getTranslation: () => ({ name: 'Squats' }) },
        { id: 184, getTranslation: () => ({ name: 'Deadlifts' }) },
    ]),
}));
// The autocompleter reads the language list from the module directly
vi.mock("@/components/Exercises/queries", async (importOriginal) => ({
    ...await importOriginal<typeof import("@/components/Exercises/queries")>(),
    useLanguageQuery: vi.fn(() => ({ isSuccess: true, data: [] })),
}));

// an entry-free category, eligible as a group parent
const TEST_GROUP_CATEGORY = new MeasurementCategory(
    'cccccccc-cccc-cccc-cccc-000000000042',
    'Blood pressure',
    'mmHg',
);

/**
 * The same category the way the API layer hands it over once it has a
 * component: top-level, with the child attached to it. The children are never
 * rows of their own in that list.
 */
const groupWithComponent = (childId: string): MeasurementCategory => {
    const group = MeasurementCategory.clone(TEST_GROUP_CATEGORY);
    group.children = [new MeasurementCategory(
        childId,
        'Systolic',
        'mmHg',
        'blood_pressure',
        false,
        TEST_GROUP_CATEGORY.id,
    )];

    return group;
};

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
        // the two measurement categories hold entries, the group is free
        (useCategoryEntryFlagsQuery as Mock).mockImplementation(() => ({
            data: [
                { category: TEST_MEASUREMENT_CATEGORY_1, hasEntries: true },
                { category: TEST_MEASUREMENT_CATEGORY_2, hasEntries: true },
                { category: TEST_GROUP_CATEGORY, hasEntries: false },
            ]
        }));
        (useProfileQuery as Mock).mockImplementation(() => ({
            data: { height: 180 }
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
        ), expect.anything());
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
        expect(mutate).toHaveBeenCalledWith(new MeasurementCategory(null, 'calves', 'cm'), expect.anything());
    });

    test('The metric type is not offered', () => {
        // It is picked when the category is created and immutable from then
        // on, the server refuses a change

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.queryByRole('combobox', { name: 'measurements.metricType' })).toBeNull();
    });

    test('A typed category has neither a name nor a unit field', () => {
        // Arrange: both come from the metric type, which is also what is shown
        const typed = MeasurementCategory.clone(TEST_MEASUREMENT_CATEGORY_1, {
            metricType: 'heart_rate',
        });

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={typed} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.queryByLabelText('name')).toBeNull();
        expect(screen.queryByLabelText('unit')).toBeNull();
        expect(screen.getByRole('combobox', { name: 'measurements.chartType' })).toBeInTheDocument();
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
            'custom',
            false,
            TEST_GROUP_CATEGORY.id,
        ), expect.anything());
    });

    test('A typed category cannot be put into a group', () => {
        // Arrange
        const typed = MeasurementCategory.clone(TEST_MEASUREMENT_CATEGORY_1, {
            metricType: 'steps',
        });

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={typed} />
            </QueryClientProvider>
        );

        // Assert - the group selector is gone, a typed category stays top-level
        expect(screen.queryByRole('combobox', { name: 'measurements.partOfGroup' })).toBeNull();
    });

    test('A group is not offered as a parent, it only holds its own components', async () => {
        // Arrange
        (useCategoryEntryFlagsQuery as Mock).mockImplementation(() => ({
            data: [{
                category: MeasurementCategory.clone(TEST_GROUP_CATEGORY, { metricType: 'blood_pressure' }),
                hasEntries: false,
            }]
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
        // Arrange: an eligible parent exists, so the dropdown is only absent
        // because the edited category is a group itself
        const group = groupWithComponent('cccccccc-cccc-cccc-cccc-000000000043');
        const candidate = new MeasurementCategory(
            'cccccccc-cccc-cccc-cccc-000000000045',
            'Waist',
            'cm',
        );
        (useCategoryEntryFlagsQuery as Mock).mockImplementation(() => ({
            data: [
                { category: group, hasEntries: false },
                { category: candidate, hasEntries: false },
            ]
        }));

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={group} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.queryByRole('combobox', { name: 'measurements.partOfGroup' })).toBeNull();
    });

    test('A rejected write keeps the form open and is shown', async () => {

        // Arrange: the mutation reports the failure, as react-query does
        const user = userEvent.setup();
        const closeFn = vi.fn();
        (useAddMeasurementCategoryQuery as Mock).mockImplementation(() => ({
            mutate: mutate,
            isError: true,
            error: { message: 'Request failed', response: { data: { name: ['Already exists'] } } },
        }));

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm closeFn={closeFn} />
            </QueryClientProvider>
        );
        await user.type(await screen.findByLabelText('name'), 'calves');
        await user.type(await screen.findByLabelText('unit'), 'cm');
        await user.click(screen.getByRole('button', { name: 'submit' }));

        // Assert: the form only closes from the success callback, which a
        // failed mutation never runs
        expect(closeFn).not.toHaveBeenCalled();
        expect(screen.getByText('name: Already exists')).toBeInTheDocument();
    });

    test('A category with children gets no chart type picker', () => {

        // Arrange: its chart follows from what its components are to each
        // other, which is what groupChart decides; a pick would have no effect
        const group = groupWithComponent('cccccccc-cccc-cccc-cccc-000000000044');
        (useCategoryEntryFlagsQuery as Mock).mockImplementation(() => ({
            data: [{ category: group, hasEntries: false }]
        }));

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={group} />
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

    test('A leaf category gets the line chart settings', () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={TEST_MEASUREMENT_CATEGORY_1} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByRole('combobox', { name: 'measurements.chartTrend' }))
            .toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: 'measurements.chartAverageWindow' }))
            .toBeInTheDocument();
    });

    test('A summed type has no line to configure', () => {
        // Its chart is one bar per day, which has neither a trend nor an average
        const steps = new MeasurementCategory(
            'cccccccc-cccc-cccc-cccc-000000000045', 'Steps', 'steps', 'steps',
        );

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={steps} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.queryByRole('combobox', { name: 'measurements.chartTrend' })).toBeNull();
        expect(screen.queryByRole('combobox', { name: 'measurements.chartAverageWindow' }))
            .toBeNull();
    });

    test('The line settings are disabled for a chart without a line', () => {
        // Kept rather than hidden: switching the chart type back applies them
        // again, and a field that vanishes takes the reason with it
        const category = MeasurementCategory.clone(
            TEST_MEASUREMENT_CATEGORY_1, { chartType: 'delta' },
        );

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={category} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByRole('combobox', { name: 'measurements.chartTrend' }))
            .toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByRole('combobox', { name: 'measurements.chartAverageWindow' }))
            .toHaveAttribute('aria-disabled', 'true');
    });

    test('Picking a trend keeps the settings of another client', async () => {
        // Arrange
        const user = userEvent.setup();
        const category = MeasurementCategory.clone(TEST_MEASUREMENT_CATEGORY_1);
        category.chartConfig = { goal_line: 75 };

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={category} />
            </QueryClientProvider>
        );
        await user.click(screen.getByRole('combobox', { name: 'measurements.chartTrend' }));
        await user.click(screen.getByRole('option', { name: 'measurements.trends.reactive' }));
        await user.click(screen.getByRole('button', { name: 'submit' }));

        // Assert
        expect(mutate.mock.calls[0][0].chartConfig)
            .toEqual({ goal_line: 75, trend: 'reactive' });
    });

    test('Both lines of the chart can be turned off', async () => {
        // Arrange
        const user = userEvent.setup();
        const category = MeasurementCategory.clone(TEST_MEASUREMENT_CATEGORY_1);

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={category} />
            </QueryClientProvider>
        );
        await user.click(screen.getByRole('combobox', { name: 'measurements.chartTrend' }));
        await user.click(screen.getByRole('option', { name: 'off' }));
        await user.click(screen.getByRole('combobox', { name: 'measurements.chartAverageWindow' }));
        await user.click(screen.getByRole('option', { name: 'off' }));
        await user.click(screen.getByRole('button', { name: 'submit' }));

        // Assert
        expect(mutate.mock.calls[0][0].chartConfig)
            .toEqual({ trend: 'none', average_window: 'none' });
    });

    test('A rename keeps a setting this release does not know', async () => {
        // 'glacial' reads as the default here, and writing that default back
        // would drop it. Only a setting the user changed is written.
        const user = userEvent.setup();
        const category = MeasurementCategory.clone(TEST_MEASUREMENT_CATEGORY_1);
        category.chartConfig = { trend: 'glacial' as TrendCharacter };

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={category} />
            </QueryClientProvider>
        );
        const nameInput = await screen.findByLabelText('name');
        await user.clear(nameInput);
        await user.type(nameInput, 'a better name');
        await user.click(screen.getByRole('button', { name: 'submit' }));

        // Assert
        expect(mutate.mock.calls[0][0].chartConfig).toEqual({ trend: 'glacial' });
    });

    test('An untouched category keeps its empty configuration', async () => {
        // Renaming a category must not fill its config with the defaults
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={TEST_MEASUREMENT_CATEGORY_1} />
            </QueryClientProvider>
        );
        await user.click(screen.getByRole('button', { name: 'submit' }));

        // Assert
        expect(mutate.mock.calls[0][0].chartConfig).toEqual({});
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

    test('Switching a new category to calculated prefills it and offers the types', async () => {

        // Arrange
        const user = userEvent.setup();
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm />
            </QueryClientProvider>
        );

        // Act
        await user.click(screen.getByRole('button', { name: 'measurements.calculations.sourceCalculated' }));

        // Assert: the first calculation is picked, with its name and unit
        expect(await screen.findByLabelText('measurements.calculations.type')).toBeInTheDocument();
        await waitFor(() =>
            expect(screen.getByLabelText('name')).toHaveValue('measurements.calculations.names.BMI'));
        expect(screen.getByLabelText('unit')).toHaveValue('kg/m²');
    });

    test('A calculated category is saved with its type and parameters', async () => {

        // Arrange
        const user = userEvent.setup();
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm />
            </QueryClientProvider>
        );

        // Act
        await user.click(screen.getByRole('button', { name: 'measurements.calculations.sourceCalculated' }));
        await waitFor(() => expect(screen.getByLabelText('unit')).toHaveValue('kg/m²'));
        await user.click(screen.getByRole('button', { name: 'submit' }));

        // Assert
        await waitFor(() => expect(mutate).toHaveBeenCalled());
        expect(mutate.mock.calls[0][0].dynamicType).toBe('BMI');
        expect(mutate.mock.calls[0][0].dynamicParams).toStrictEqual({});
    });

    test('A category the user fills in themselves is not offered a calculation', async () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={TEST_MEASUREMENT_CATEGORY_1} />
            </QueryClientProvider>
        );

        // Assert: what a category computes is set when it is created
        expect(screen.queryByRole('button', { name: 'measurements.calculations.sourceCalculated' }))
            .not.toBeInTheDocument();
        expect(screen.queryByRole('combobox', { name: 'measurements.calculations.type' }))
            .not.toBeInTheDocument();
    });

    test('A calculation this release does not know is left alone', async () => {

        // Arrange
        const user = userEvent.setup();
        const newer = MeasurementCategory.clone(TEST_GROUP_CATEGORY);
        newer.dynamicType = 'FFMI';
        newer.dynamicParams = { category_id: 'c-body-fat' };

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={newer} />
            </QueryClientProvider>
        );

        // Assert: nothing to switch or configure, and saving keeps the
        // stored configuration as it is
        expect(screen.queryByRole('button', { name: 'measurements.calculations.sourceCalculated' }))
            .not.toBeInTheDocument();
        expect(screen.queryByRole('combobox', { name: 'measurements.calculations.type' }))
            .not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'submit' }));
        await waitFor(() => expect(mutate).toHaveBeenCalled());
        expect(mutate.mock.calls[0][0].dynamicType).toBe('FFMI');
        expect(mutate.mock.calls[0][0].dynamicParams).toStrictEqual({ category_id: 'c-body-fat' });
    });

    test('A calculation without a unit is accepted, a hand-kept category still needs one', async () => {

        // Arrange
        const user = userEvent.setup();
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm />
            </QueryClientProvider>
        );
        await user.type(screen.getByLabelText('name'), 'Ratio');

        // Act + Assert: without a calculation the unit is required
        await user.click(screen.getByRole('button', { name: 'submit' }));
        await waitFor(() =>
            expect(screen.getByLabelText('unit')).toHaveAttribute('aria-invalid', 'true'));
        expect(mutate).not.toHaveBeenCalled();

        // Act: the ratio is a bare number, so it may go without one
        await user.click(screen.getByRole('button', { name: 'measurements.calculations.sourceCalculated' }));
        await user.clear(screen.getByLabelText('unit'));
        await user.click(screen.getByRole('button', { name: 'submit' }));

        // Assert
        await waitFor(() => expect(mutate).toHaveBeenCalled());
        expect(mutate.mock.calls[0][0].unit).toBe('');
    });

    test('An existing calculated category keeps its calculation', async () => {

        // Arrange
        const calculated = MeasurementCategory.clone(TEST_GROUP_CATEGORY);
        calculated.dynamicType = 'ONE_REP_MAX';
        calculated.dynamicParams = { exercise_id: 1, max_reps: 5 };

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={calculated} />
            </QueryClientProvider>
        );

        // Assert: no way back to hand entry and no way to another calculation
        expect(screen.queryByRole('button', { name: 'measurements.calculations.sourceManual' }))
            .not.toBeInTheDocument();
        expect(screen.getByLabelText('measurements.calculations.type')).toHaveAttribute(
            'aria-disabled',
            'true',
        );
        expect(screen.getByText('measurements.calculations.locked')).toBeInTheDocument();
    });

    test('An existing calculation shows the exercise it reads, by name', async () => {

        // Arrange
        const calculated = MeasurementCategory.clone(TEST_GROUP_CATEGORY);
        calculated.dynamicType = 'ONE_REP_MAX';
        calculated.dynamicParams = { exercise_id: 42 };

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={calculated} />
            </QueryClientProvider>
        );

        // Assert: the chip resolves the stored id into the exercise name
        expect(await screen.findByText('Exercise 42')).toBeInTheDocument();
    });

    test('A total starts with bench press, squat and deadlift', async () => {

        // Arrange
        const user = userEvent.setup();
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm />
            </QueryClientProvider>
        );

        // Act: switch to a calculation and pick the total
        await user.click(screen.getByRole('button', { name: 'measurements.calculations.sourceCalculated' }));
        await user.click(await screen.findByRole('combobox', {
            name: 'measurements.calculations.type',
        }));
        await user.click(screen.getByRole('option', {
            name: 'measurements.calculations.names.ONE_RM_TOTAL',
        }));

        // Assert: the three are in, and they are what gets saved
        expect(await screen.findByText('Bench press')).toBeInTheDocument();
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('Deadlifts')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'submit' }));
        await waitFor(() => expect(mutate).toHaveBeenCalled());
        expect(mutate.mock.calls[0][0].dynamicParams).toStrictEqual({
            exercise_ids: [73, 615, 184],
            max_reps: 5,
            window_days: 30,
        });
    });

    test('An incomplete calculation is complained about when the form is saved', async () => {

        // Arrange
        const user = userEvent.setup();
        (useCategoryEntryFlagsQuery as Mock).mockImplementation(() => ({ data: [] }));

        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm />
            </QueryClientProvider>
        );

        const pick = async (name: RegExp) => {
            await user.click(await screen.findByRole('combobox', {
                name: 'measurements.calculations.type',
            }));
            await user.click(await screen.findByRole('option', { name: name }));
        };

        // Act & assert: an exercise that is still missing says nothing yet
        await user.click(screen.getByRole('button', {
            name: 'measurements.calculations.sourceCalculated',
        }));
        await pick(/names.ONE_REP_MAX/);
        expect(screen.queryByText('measurements.calculations.paramsIncomplete')).toBeNull();

        // Sending the form says it, and saves nothing
        await user.click(screen.getByRole('button', { name: 'submit' }));
        expect(await screen.findByText('measurements.calculations.paramsIncomplete'))
            .toBeInTheDocument();
        expect(mutate).not.toHaveBeenCalled();

        // The complaint belongs to what is picked now, not to what was before
        await pick(/names.BMI/);
        await waitFor(() =>
            expect(screen.queryByText('measurements.calculations.paramsIncomplete')).toBeNull()
        );
    });

    test('A calculation the user already has cannot be picked twice', async () => {

        // Arrange
        const user = userEvent.setup();
        const bmi = MeasurementCategory.clone(TEST_GROUP_CATEGORY, { id: 'c-bmi', name: 'BMI' });
        bmi.dynamicType = 'BMI';
        (useCategoryEntryFlagsQuery as Mock).mockImplementation(() => ({
            data: [{ category: bmi, hasEntries: false }]
        }));

        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm />
            </QueryClientProvider>
        );

        // Act: the switch skips BMI, and the list offers it disabled
        await user.click(screen.getByRole('button', { name: 'measurements.calculations.sourceCalculated' }));
        const select = await screen.findByRole('combobox', {
            name: 'measurements.calculations.type',
        });

        // Assert: the switch lands on the first calculation still to be had
        expect(select).toHaveTextContent('names.WHTR');
        expect(screen.getByLabelText('name')).toHaveValue(
            'measurements.calculations.names.WHTR'
        );

        await user.click(select);
        expect(screen.getByRole('option', { name: /names.BMI/ }))
            .toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByRole('option', { name: /names.WHTR/ }))
            .not.toHaveAttribute('aria-disabled');
    });
});
