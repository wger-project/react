import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { useDeleteRoutineLogQuery, useEditRoutineLogQuery } from '@/components/Routines/queries';
import { ExerciseLog } from "@/components/Routines/widgets/LogWidgets";
import { testExerciseBenchPress } from "@/tests/exerciseTestdata";
import { testWorkoutLogs } from "@/tests/workoutLogsRoutinesTestData";
import type { Mock } from 'vitest';

vi.mock('@/components/Routines/queries', () => ({
    useDeleteRoutineLogQuery: vi.fn(),
    useEditRoutineLogQuery: vi.fn()
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

        await user.click(screen.getAllByRole('menuitem', { name: /delete/i })[0]);
        expect(mockDeleteMutate).toHaveBeenCalledWith(5);
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

        await user.click(screen.getAllByRole('menuitem', { name: /edit/i })[0]);
        await user.click(screen.getAllByRole('menuitem', { name: /save/i })[0]);

        expect(mockDeleteMutate).not.toHaveBeenCalled();
        expect(mockEditMutate).toHaveBeenCalled();
    });
});