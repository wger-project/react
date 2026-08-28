import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { useLanguageQuery } from "@/components/Exercises";
import { useAddRoutineLogsQuery, useRoutineDetailQuery, useSessionOfDay } from "@/components/Routines/queries";
import { SessionLogsForm } from '@/components/Routines/widgets/forms/SessionLogsForm';
import { DateTime } from "luxon";
import { testLanguages } from "@/tests/exerciseTestdata";
import { testWorkoutSession } from "@/tests/workoutLogsRoutinesTestData";
import { testRoutine1 } from "@/tests/workoutRoutinesTestData";
import type { Mock } from 'vitest';


vi.mock("@/components/Exercises/queries");
vi.mock("@/components/Routines/queries");

describe('SessionLogsForm', () => {

    const mockUseLanguageQuery = useLanguageQuery as Mock;
    const mockAddLogsQuery = useAddRoutineLogsQuery as Mock;
    const mockRoutineDetailQuery = useRoutineDetailQuery as Mock;
    const mockUseSessionOfDay = useSessionOfDay as Mock;
    const mockMutateAsync = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
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
    });


    test('renders correct exercises from routine', async () => {
        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            selectedDate={DateTime.now()}
            chosenSessionId={null}
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
        />);

        const weightElements = screen.getAllByRole('textbox').filter(input => (input as HTMLInputElement).value === '20');
        await user.click(weightElements[0]);
        await user.clear(weightElements[0]);
        await user.type(weightElements[0], "42");

        const repsElements = screen.getAllByRole('textbox').filter(input => (input as HTMLInputElement).value === '5');
        await user.click(repsElements[0]);
        await user.clear(repsElements[0]);
        await user.type(repsElements[0], "17");
        await user.click(screen.getByRole('button', { name: /submit/i }));


        // Assert
        expect(mockMutateAsync.mock.calls[0][0].length).toEqual(4);
        expect(mockMutateAsync.mock.calls[0][0][0]).toMatchObject(updatedData);
        expect(mockMutateAsync.mock.calls[0][0][1]).toMatchObject(originalData);
        expect(mockMutateAsync.mock.calls[0][0][2]).toMatchObject(originalData);
        expect(mockMutateAsync.mock.calls[0][0][3]).toMatchObject(originalData);
    });

    test('writes the logs into the session the screen works on', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            selectedDate={DateTime.fromISO('2024-05-05T12:00:00')}
            chosenSessionId={testWorkoutSession.id}
        />);
        await user.click(screen.getByRole('button', { name: /submit/i }));

        // Assert
        // Without the id the server would sort the logs into a session by their
        // time, which is a guess as soon as the day holds more than one
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
        />);
        await user.click(screen.getByTestId('AddIcon'));
        await user.click(screen.getByRole('button', { name: /submit/i }));

        // Assert - one more than before
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
        />);
        await user.click(screen.getAllByTestId('DeleteOutlinedIcon')[0]);

        // Assert
        expect(screen.queryByText('Squats')).not.toBeInTheDocument();
    });
});
