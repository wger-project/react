import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { useDeleteRoutineLogQuery, useEditRoutineLogQuery } from 'components/WorkoutRoutines/queries';
import { ExerciseLog } from "components/WorkoutRoutines/widgets/LogWidgets";
import { testExerciseBenchPress } from "tests/exerciseTestdata";
import { testWorkoutLogs } from "tests/workoutLogsRoutinesTestData";


const { ResizeObserver } = window;

jest.mock('components/WorkoutRoutines/queries', () => ({
    useDeleteRoutineLogQuery: jest.fn(),
    useEditRoutineLogQuery: jest.fn()
}));

describe('ExerciseLog', () => {
    let mockDeleteMutate: jest.Mock;
    let mockEditMutate: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockDeleteMutate = jest.fn();
        mockEditMutate = jest.fn();

        // @ts-ignore
        delete window.ResizeObserver;
        window.ResizeObserver = jest.fn().mockImplementation(() => ({
            observe: jest.fn(),
            unobserve: jest.fn(),
            disconnect: jest.fn()
        }));

        (useDeleteRoutineLogQuery as jest.Mock).mockReturnValue({ mutate: mockDeleteMutate });
        (useEditRoutineLogQuery as jest.Mock).mockReturnValue({ mutate: mockEditMutate });
    });

    afterEach(() => {
        window.ResizeObserver = ResizeObserver;
        jest.restoreAllMocks();
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