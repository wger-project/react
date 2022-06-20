import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { getCategories, getEquipment, getExerciseBases, getLanguages, getMuscles } from "services";
import { Category } from "components/Exercises/models/category";
import { ExerciseOverview } from "components/Exercises/ExerciseOverview";
import { Muscle } from "components/Exercises/models/muscle";
import { Equipment } from "components/Exercises/models/equipment";
import { ExerciseTranslation } from "components/Exercises/models/exerciseTranslation";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { BrowserRouter } from 'react-router-dom';
import { Language } from "components/Exercises/models/language";
import { QueryClient, QueryClientProvider } from "react-query";

jest.mock("services");

describe("Test the ExerciseOverview component", () => {

    const categories = [
        new Category(1, 'Arms'),
        new Category(2, 'Legs'),
        new Category(3, 'Chest')
    ];
    const languages = [
        new Language(1, 'de', 'Deutsch'),
        new Language(2, 'en', 'English')
    ];
    const muscles = [
        new Muscle(1, 'Big muscle', true),
        new Muscle(2, 'Finger muscle', true),
        new Muscle(3, 'Deltoid', false),
        new Muscle(4, 'Abs', true),
    ];
    const equipment = [
        new Equipment(1, 'Barbell'),
        new Equipment(2, 'Dumbbell'),
        new Equipment(10, "Kettlebell"),
        new Equipment(42, "Rocks"),
    ];

    const exerciseBase = new ExerciseBase(
        345,
        "c788d643-150a-4ac7-97ef-84643c6419bf",
        categories[1],
        [equipment[0], equipment[3]],
        [muscles[0], muscles[3]],
        [],
        [],
        null,
        [],
        [
            new ExerciseTranslation(111,
                '583281c7-2362-48e7-95d5-8fd6c455e0fb',
                'Squats',
                'Do a squat',
                2
            ),
            new ExerciseTranslation(9,
                'dae6f6ed-9408-4e62-a59a-1a33f4e8ab36',
                'Kniebeuge',
                'Kniebeuge machen',
                1
            )
        ]
    );
    const exerciseBase2 = new ExerciseBase(
        2,
        "abcdef-150a-4ac7-97ef-84643c6419bf",
        categories[1],
        [equipment[0], equipment[3]],
        [muscles[1], muscles[2]],
        [],
        [],
        null,
        [],
        [
            new ExerciseTranslation(111,
                '583281c7-2362-48e7-95d5-8fd6c455e0fb',
                'Benchpress',
                'Do a benchpress',
                2
            ),
        ]
    );
    const exerciseBase3 = new ExerciseBase(
        3,
        "abcdef-150a-4ac7-97ef-84643c6419bf",
        categories[0],
        [equipment[1]],
        [muscles[0], muscles[1]],
        [],
        [],
        null,
        [],
        [
            new ExerciseTranslation(111,
                '583281c7-2362-48e7-95d5-8fd6c455e0fb',
                'Curls',
                'curls! yeah!',
                2
            ),

        ]
    );
    const exerciseBase4 = new ExerciseBase(
        4,
        "abcdef-150a-4ac7-97ef-84643c6419bf",
        categories[2],
        [equipment[3]],
        [muscles[2]],
        [],
        [],
        1,
        [],
        [
            new ExerciseTranslation(111,
                '583281c7-2362-48e7-95d5-8fd6c455e0fb',
                'Crunches',
                'Do some crunches',
                2
            ),

        ]
    );
    const exerciseBase5 = new ExerciseBase(
        5,
        "abcdef-150a-4ac7-97ef-84643c6419bf",
        categories[0],
        [equipment[0]],
        [muscles[3]],
        [],
        [],
        2,
        [],
        [
            new ExerciseTranslation(111,
                '583281c7-2362-48e7-95d5-8fd6c455e0fb',
                'Skull crusher',
                'get some sick triceps pump',
                2
            ),

        ]
    );

    beforeEach(() => {
        // @ts-ignore
        getLanguages.mockImplementation(() => Promise.resolve(languages));
        // @ts-ignore
        getCategories.mockImplementation(() => Promise.resolve(categories));
        // @ts-ignore
        getMuscles.mockImplementation(() => Promise.resolve(muscles));
        // @ts-ignore
        getEquipment.mockImplementation(() => Promise.resolve(equipment));
        // @ts-ignore
        getExerciseBases.mockImplementation(() => Promise.resolve([
            exerciseBase,
            exerciseBase2,
            exerciseBase3,
            exerciseBase4,
            exerciseBase5
        ]));
    });


    test('renders all exercises', async () => {


        // Act
        // since  OverviewCard inside ExerciseOverview renders a Link, we need to wrap in a BrowserRouter
        const queryClient = new QueryClient();
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ExerciseOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(() => Promise.resolve());

        // Assert
        expect(getCategories).toHaveBeenCalledTimes(1);
        expect(getMuscles).toHaveBeenCalledTimes(1);
        expect(getEquipment).toHaveBeenCalledTimes(1);
        expect(getExerciseBases).toHaveBeenCalledTimes(1);

        expect(screen.getByText('Benchpress')).toBeInTheDocument();
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('Curls')).toBeInTheDocument();
        expect(screen.getByText('Crunches')).toBeInTheDocument();
        expect(screen.getByText('Skull crusher')).toBeInTheDocument();
    });

    test('filter one category', async () => {

        // Act
        // since  OverviewCard inside ExerciseOverview renders a Link, we need to wrap in a BrowserRouter
        const queryClient = new QueryClient();
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ExerciseOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(() => Promise.resolve());
        const { getByText: categoriesComponent } = within(screen.getByTestId('categories'));
        fireEvent.click(categoriesComponent("exercises.arms"));

        // Assert
        expect(screen.queryByText('Benchpress')).not.toBeInTheDocument();
        expect(screen.queryByText('Squats')).not.toBeInTheDocument();
        expect(screen.getByText('Curls')).toBeInTheDocument();
        expect(screen.queryByText('Crunches')).not.toBeInTheDocument();
        expect(screen.getByText('Skull crusher')).toBeInTheDocument();
    });

    test('filter two categories', async () => {

        // Act
        // since  OverviewCard inside ExerciseOverview renders a Link, we need to wrap in a BrowserRouter
        const queryClient = new QueryClient();
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ExerciseOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(() => Promise.resolve());
        const { getByText: categoriesComponent } = within(screen.getByTestId('categories'));
        fireEvent.click(categoriesComponent("exercises.arms"));
        fireEvent.click(categoriesComponent("exercises.legs"));

        // Assert
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('Benchpress')).toBeInTheDocument();
        expect(screen.getByText('Curls')).toBeInTheDocument();
        expect(screen.queryByText('Crunches')).not.toBeInTheDocument();
        expect(screen.getByText('Skull crusher')).toBeInTheDocument();
    });

    test('filter equipment', async () => {

        // Act
        // since  OverviewCard inside ExerciseOverview renders a Link, we need to wrap in a BrowserRouter
        const queryClient = new QueryClient();
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ExerciseOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(() => Promise.resolve());
        const { getByText: equipmentComponent } = within(screen.getByTestId('equipment'));
        fireEvent.click(equipmentComponent("exercises.barbell"));

        // Assert
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('Benchpress')).toBeInTheDocument();
        expect(screen.queryByText('Curls')).not.toBeInTheDocument();
        expect(screen.queryByText('Crunches')).not.toBeInTheDocument();
        expect(screen.getByText('Skull crusher')).toBeInTheDocument();
    });

    test('filter muscles', async () => {

        // Act
        // since  OverviewCard inside ExerciseOverview renders a Link, we need to wrap in a BrowserRouter
        const queryClient = new QueryClient();
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ExerciseOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(() => Promise.resolve());
        const { getByText: musclesComponent } = within(screen.getByTestId('muscles'));
        fireEvent.click(musclesComponent("Big muscle"));

        // Assert
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.queryByText('Benchpress')).not.toBeInTheDocument();
        expect(screen.getByText('Curls')).toBeInTheDocument();
        expect(screen.queryByText('Crunches')).not.toBeInTheDocument();
        expect(screen.queryByText('Skull crusher')).not.toBeInTheDocument();
    });

    test('filter equipment and category', async () => {

        // Act
        // since  OverviewCard inside ExerciseOverview renders a Link, we need to wrap in a BrowserRouter
        const queryClient = new QueryClient();
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ExerciseOverview />
                </QueryClientProvider>
            </BrowserRouter>
        );
        await act(() => Promise.resolve());

        const { getByText: categoryComponent } = within(screen.getByTestId('categories'));
        fireEvent.click(categoryComponent('exercises.legs'));

        const { getByText: equipmentComponent } = within(screen.getByTestId('equipment'));
        fireEvent.click(equipmentComponent('exercises.rocks'));

        // Assert
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('Benchpress')).toBeInTheDocument();
        expect(screen.queryByText('Curls')).not.toBeInTheDocument();
        expect(screen.queryByText('Crunches')).not.toBeInTheDocument();
        expect(screen.queryByText('Skull crusher')).not.toBeInTheDocument();
    });

});
