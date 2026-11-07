import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { useLanguageQuery } from "@/components/Exercises";
import {
    useAddRoutineLogsQuery,
    useRoutineDetailQuery,
    useRoutineLogQuery,
    useSessionOfDay
} from "@/components/Routines/queries";
import { WorkoutLog } from "@/components/Routines/models/WorkoutLog";
import { WorkoutSession } from "@/components/Routines/models/WorkoutSession";
import { SessionLogsForm } from '@/components/Routines/widgets/forms/SessionLogsForm';
import { DateTime } from "luxon";
import { testLanguages } from "@/tests/exerciseTestdata";
import { testWorkoutLogs, testWorkoutSession } from "@/tests/workoutLogsRoutinesTestData";
import { testRoutine1 } from "@/tests/workoutRoutinesTestData";
import type { Mock } from 'vitest';


vi.mock("@/components/Exercises/queries");
vi.mock("@/components/Routines/queries");

describe('SessionLogsForm', () => {

    const mockUseLanguageQuery = useLanguageQuery as Mock;
    const mockAddLogsQuery = useAddRoutineLogsQuery as Mock;
    const mockRoutineDetailQuery = useRoutineDetailQuery as Mock;
    const mockUseSessionOfDay = useSessionOfDay as Mock;
    const mockRoutineLogQuery = useRoutineLogQuery as Mock;
    const mockMutateAsync = vi.fn();
    const mockSaveSession = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockSaveSession.mockResolvedValue(testWorkoutSession.id);
        mockRoutineDetailQuery.mockReturnValue({
            isLoading: false,
            data: testRoutine1,
        });
        mockAddLogsQuery.mockReturnValue({
            isPending: false,
            data: {},
            mutateAsync: mockMutateAsync,
        });
        mockUseLanguageQuery.mockReturnValue({
            isLoading: false,
            data: testLanguages,
        });
        mockUseSessionOfDay.mockReturnValue({
            sessions: [testWorkoutSession],
            session: testWorkoutSession,
            isLoading: false,
            isSuccess: true,
        });
        mockRoutineLogQuery.mockReturnValue({
            isSuccess: false,
            data: [],
        });
    });


    test('renders correct exercises from routine', async () => {
        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            selectedDate={DateTime.now()}
            chosenSessionId={null}
            saveSession={mockSaveSession}
        />);

        expect(screen.getByText('Squats')).toBeInTheDocument();
    });

    test('submits with correct parameters', async () => {
        // Arrange
        const user = userEvent.setup();
        const originalData = {
            routine: 1,
            day: 5,
            exercise: 345,
            repetitions: 5,
            rir: 2,
            weight: 20,

        };
        const updatedData = {
            ...originalData,
            repetitions: "17",
            weight: "42",
        };

        // Act
        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            selectedDate={DateTime.fromISO('2024-05-05T12:00:00')}
            chosenSessionId={null}
            saveSession={mockSaveSession}
        />);

        const weightElements = screen.getAllByRole('textbox').filter(input => (input as HTMLInputElement).value === '20');
        await user.click(weightElements[0]);
        await user.clear(weightElements[0]);
        await user.type(weightElements[0], "42");

        const repsElements = screen.getAllByRole('textbox').filter(input => (input as HTMLInputElement).value === '5');
        await user.click(repsElements[0]);
        await user.clear(repsElements[0]);
        await user.type(repsElements[0], "17");
        await user.click(screen.getByRole('button', { name: /^save$/i }));


        // Assert
        await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
        expect(mockMutateAsync.mock.calls[0][0].length).toEqual(4);
        expect(mockMutateAsync.mock.calls[0][0][0]).toMatchObject(updatedData);
        expect(mockMutateAsync.mock.calls[0][0][1]).toMatchObject(originalData);
        expect(mockMutateAsync.mock.calls[0][0][2]).toMatchObject(originalData);
        expect(mockMutateAsync.mock.calls[0][0][3]).toMatchObject(originalData);
    });

    test('writes the logs into the session saved before them', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            selectedDate={DateTime.fromISO('2024-05-05T12:00:00')}
            chosenSessionId={testWorkoutSession.id}
            saveSession={mockSaveSession}
        />);
        await user.click(screen.getByRole('button', { name: /^save$/i }));

        // Assert
        await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
        expect(mockSaveSession).toHaveBeenCalledBefore(mockMutateAsync);
        expect(mockMutateAsync.mock.calls[0][0][0].session).toEqual(testWorkoutSession.id);
    });

    test('add log action buttons works', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            selectedDate={DateTime.fromISO('2024-05-05T12:00:00')}
            chosenSessionId={null}
            saveSession={mockSaveSession}
        />);
        await user.click(screen.getByRole('button', { name: 'routines.addSet' }));
        await user.click(screen.getByRole('button', { name: /^save$/i }));

        // Assert - one more than before
        await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
        expect(mockMutateAsync.mock.calls[0][0].length).toEqual(5);
    });

    test('delete exercise action buttons works', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            selectedDate={DateTime.now()}
            chosenSessionId={null}
            saveSession={mockSaveSession}
        />);
        await user.click(screen.getByRole('button', { name: 'actions' }));
        await user.click(screen.getByRole('menuitem', { name: 'delete' }));

        // Assert
        expect(screen.queryByText('Squats')).not.toBeInTheDocument();
    });

    test('removing a single set drops just that log', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            selectedDate={DateTime.fromISO('2024-05-05T12:00:00')}
            chosenSessionId={null}
            saveSession={mockSaveSession}
        />);
        await user.click(screen.getAllByRole('button', { name: 'routines.setNr: delete' })[0]);
        await user.click(screen.getByRole('button', { name: /^save$/i }));

        // Assert
        await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(mockMutateAsync.mock.calls[0][0].length).toEqual(3);
    });

    test('a weight that is not a number shows the error and blocks the submit', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            selectedDate={DateTime.fromISO('2024-05-05T12:00:00')}
            chosenSessionId={null}
            saveSession={mockSaveSession}
        />);
        const weightInput = screen.getAllByRole('textbox').filter(input => (input as HTMLInputElement).value === '20')[0];
        await user.clear(weightInput);
        await user.type(weightInput, 'heavy');
        await user.tab();

        // Assert
        expect(await screen.findByText('forms.enterNumber')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled();
        expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    test('opens the note field of a set on request', async () => {
        const user = userEvent.setup();
        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            selectedDate={DateTime.now()}
            chosenSessionId={null}
            saveSession={mockSaveSession}
        />);

        expect(screen.queryByRole('textbox', { name: /notes/i })).not.toBeInTheDocument();
        await user.click(screen.getAllByRole('button', { name: 'routines.setNr: notes' })[0]);
        expect(screen.getAllByRole('textbox', { name: /notes/i })).toHaveLength(1);
    });

    test('shows the last note of the exercise from an earlier day', async () => {
        mockRoutineLogQuery.mockReturnValue({
            isSuccess: true,
            data: [new WorkoutLog({
                ...testWorkoutLogs[0],
                exerciseId: 345,
                date: new Date(2024, 4, 4, 18, 0),
                notes: 'Felt great last time',
            })],
        });

        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            selectedDate={DateTime.fromISO('2024-05-05T12:00:00')}
            chosenSessionId={null}
            saveSession={mockSaveSession}
        />);

        expect(screen.getAllByText('routines.lastSession').length).toBeGreaterThan(0);
    });

    test('ignores notes from the logged day and later ones', async () => {
        const noteOn = (date: Date) => new WorkoutLog({
            ...testWorkoutLogs[0],
            exerciseId: 345,
            date: date,
            notes: 'Not from an earlier day',
        });
        mockRoutineLogQuery.mockReturnValue({
            isSuccess: true,
            data: [noteOn(new Date(2024, 4, 5, 0, 0)), noteOn(new Date(2024, 4, 6, 9, 0))],
        });

        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            selectedDate={DateTime.fromISO('2024-05-05T12:00:00')}
            chosenSessionId={null}
            saveSession={mockSaveSession}
        />);

        expect(screen.queryByText('routines.lastSession')).not.toBeInTheDocument();
    });

    test('a note on a set without values shows the error and blocks the submit', async () => {
        const user = userEvent.setup();

        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            // No iteration planned for this date, so the sets start without values
            selectedDate={DateTime.now()}
            chosenSessionId={null}
            saveSession={mockSaveSession}
        />);
        await user.click(screen.getAllByRole('button', { name: 'routines.setNr: notes' })[0]);
        const notesField = screen.getByRole('textbox', { name: /notes/i });
        await user.type(notesField, 'Grip slipped');
        await user.tab();

        expect(await screen.findByText('routines.notesNeedValues')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled();
    });

    test('submits notes value with log entry', async () => {
        const user = userEvent.setup();

        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            selectedDate={DateTime.fromISO('2024-05-05T12:00:00')}
            chosenSessionId={null}
            saveSession={mockSaveSession}
        />);

        await user.click(screen.getAllByRole('button', { name: 'routines.setNr: notes' })[0]);
        await user.type(screen.getByRole('textbox', { name: /notes/i }), 'Good session');
        await user.click(screen.getByRole('button', { name: /^save$/i }));

        await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
        expect(mockMutateAsync.mock.calls[0][0][0]).toMatchObject({ notes: 'Good session' });
    });

    test('saves no logs when the session was not saved', async () => {
        const user = userEvent.setup();
        mockSaveSession.mockResolvedValue(false);

        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            selectedDate={DateTime.fromISO('2024-05-05T12:00:00')}
            chosenSessionId={null}
            saveSession={mockSaveSession}
        />);
        await user.click(screen.getByRole('button', { name: /^save$/i }));

        await waitFor(() => expect(mockSaveSession).toHaveBeenCalled());
        expect(mockMutateAsync).not.toHaveBeenCalled();
        expect(screen.queryByText('success')).not.toBeInTheDocument();
    });

    test('saves just the session when no set is filled in', async () => {
        const user = userEvent.setup();

        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            // No iteration planned for this date, so the sets start without values
            selectedDate={DateTime.now()}
            chosenSessionId={null}
            saveSession={mockSaveSession}
        />);
        await user.click(screen.getByRole('button', { name: /^save$/i }));

        expect(await screen.findByText('success')).toBeInTheDocument();
        expect(mockSaveSession).toHaveBeenCalled();
        expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    test('can not save while the user still has to pick one of the day\'s sessions', async () => {
        mockUseSessionOfDay.mockReturnValue({
            sessions: [testWorkoutSession, new WorkoutSession({ ...testWorkoutSession, id: 'other' })],
            session: undefined,
            isLoading: false,
            isSuccess: true,
        });

        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            selectedDate={DateTime.now()}
            chosenSessionId={null}
            saveSession={mockSaveSession}
        />);

        expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled();
    });
});
