import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { useLanguageQuery } from "components/Exercises/queries";
import { useAddRoutineLogsQuery, useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import { SessionLogsForm } from 'components/WorkoutRoutines/widgets/forms/SessionLogsForm';
import { DateTime } from "luxon";
import { testLanguages } from "tests/exerciseTestdata";
import { testRoutine1 } from "tests/workoutRoutinesTestData";


jest.mock("components/Exercises/queries");
jest.mock("components/WorkoutRoutines/queries");

describe('SessionLogsForm', () => {

    const mockUseLanguageQuery = useLanguageQuery as jest.Mock;
    const mockAddLogsQuery = useAddRoutineLogsQuery as jest.Mock;
    const mockRoutineDetailQuery = useRoutineDetailQuery as jest.Mock;
    const mockMutateAsync = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
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
    });


    test('renders correct exercises from routine', async () => {
        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            selectedDate={DateTime.now()}
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
            selectedDate={DateTime.fromISO('2024-05-05T12:00:00.000Z')}
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

    test('add log action buttons works', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(<SessionLogsForm
            dayId={5}
            routineId={1}
            selectedDate={DateTime.fromISO('2024-05-05T12:00:00.000Z')}
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
        />);
        await user.click(screen.getAllByTestId('DeleteOutlinedIcon')[0]);

        // Assert
        expect(screen.queryByText('Squats')).not.toBeInTheDocument();
    });
});
