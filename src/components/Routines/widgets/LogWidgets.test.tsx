import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { useDeleteRoutineLogQuery, useEditRoutineLogQuery } from '@/components/Routines/queries';
import { WorkoutLog } from "@/components/Routines/models/WorkoutLog";
import { ExerciseLog, formatData } from "@/components/Routines/widgets/LogWidgets";
import { WEIGHT_UNIT_KG, WEIGHT_UNIT_LB } from "@/core/lib/consts";
import { testExerciseBenchPress } from "@/tests/exerciseTestdata";
import { testWorkoutLogs } from "@/tests/workoutLogsRoutinesTestData";
import type { Mock } from 'vitest';

vi.mock('@/components/Routines/queries', () => ({
    useDeleteRoutineLogQuery: vi.fn(),
    useEditRoutineLogQuery: vi.fn()
}));
vi.mock('@/components/User/queries/profile', () => ({
    useProfileQuery: () => ({ isLoading: false, data: { useMetric: true } }),
}));

describe('ExerciseLog', () => {
    let mockDeleteMutate: Mock;
    let mockEditMutate: Mock;

    beforeEach(() => {
        vi.clearAllMocks();

        mockDeleteMutate = vi.fn();
        mockEditMutate = vi.fn();
        (useDeleteRoutineLogQuery as Mock).mockReturnValue({ mutate: mockDeleteMutate });
        (useEditRoutineLogQuery as Mock).mockReturnValue({ mutate: mockEditMutate });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });
    const mockRoutineId = 123;
    const user = userEvent.setup();

    test('renders the DataGrid table correctly', () => {
        render(
            <ExerciseLog
                exercise={testExerciseBenchPress}
                routineId={mockRoutineId}
                logEntries={testWorkoutLogs}
            />
        );

        expect(screen.getByRole('grid')).toBeInTheDocument();
        expect(screen.getByText('Benchpress')).toBeInTheDocument();
        expect(mockDeleteMutate).not.toHaveBeenCalled();
        expect(mockEditMutate).not.toHaveBeenCalled();
    });

    test('calls deleteLogQuery when DeleteIcon is clicked', async () => {
        render(
            <ExerciseLog
                exercise={testExerciseBenchPress}
                routineId={mockRoutineId}
                logEntries={testWorkoutLogs}
            />
        );

        await user.click(screen.getAllByRole('button', { name: /delete/i })[0]);
        expect(mockDeleteMutate).toHaveBeenCalledWith('aaaaaaaa-aaaa-aaaa-aaaa-000000000005');
        expect(mockEditMutate).not.toHaveBeenCalled();

    });

    test('calls editLogQuery when SaveIcon is clicked', async () => {
        render(
            <ExerciseLog
                exercise={testExerciseBenchPress}
                routineId={mockRoutineId}
                logEntries={testWorkoutLogs}
            />
        );

        await user.click(screen.getAllByRole('button', { name: /edit/i })[0]);
        await user.click(screen.getAllByRole('button', { name: /save/i })[0]);

        expect(mockDeleteMutate).not.toHaveBeenCalled();
        expect(mockEditMutate).toHaveBeenCalled();
    });
});

describe('formatData', () => {
    const logIn = (weight: number | null, weightUnitId: number | null) =>
        new WorkoutLog({ ...testWorkoutLogs[0], weight: weight, weightUnitId: weightUnitId });

    test('converts weights logged in kg or lb to the chart unit', () => {
        const data = [logIn(100, WEIGHT_UNIT_LB), logIn(50, WEIGHT_UNIT_KG)];

        expect(formatData(data, 'kg').map(entry => entry.value)).toEqual([45.36, 50]);
        expect(formatData(data, 'lb').map(entry => entry.value)).toEqual([100, 110.23]);
    });

    test('passes other units and missing weights through unchanged', () => {
        const data = [logIn(12, 3), logIn(null, WEIGHT_UNIT_LB)];

        expect(formatData(data, 'lb').map(entry => entry.value)).toEqual([12, null]);
    });
});
