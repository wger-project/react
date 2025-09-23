import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import {
    SlotEntryRepetitionUnitField,
    SlotEntryRoundingField,
    SlotEntryTypeField,
    SlotEntryWeightUnitField
} from "components/WorkoutRoutines/widgets/forms/SlotEntryForm";
import { editProfile, editSlotEntry, getProfile, getRoutineRepUnits, getRoutineWeightUnits } from "services";
import { testQueryClient } from "tests/queryClient";
import { testProfileDataVerified } from "tests/userTestdata";
import { testDayLegs, testRepetitionUnits, testWeightUnits } from "tests/workoutRoutinesTestData";
import { DEBOUNCE_ROUTINE_FORMS } from "utils/consts";


jest.mock("services");

let user: ReturnType<typeof userEvent.setup>;
const mockEditSlotEntry = editSlotEntry as jest.Mock;

describe('SlotEntryTypeField', () => {

    beforeEach(() => {
        user = userEvent.setup();
        jest.resetAllMocks();
    });

    test('correctly updates the slot entry on change', async () => {
        render(
            <QueryClientProvider client={testQueryClient}>
                <SlotEntryTypeField
                    slotEntry={testDayLegs.slots[0].entries[0]}
                    routineId={1}
                />
            </QueryClientProvider>
        );

        const dropdown = screen.getByRole('combobox', { name: 'routines.set.type' });
        await user.click(dropdown);

        expect(screen.queryAllByText('routines.set.normalSet')).toHaveLength(2); // One in the options menu, one in the selected value
        expect(screen.getByText('routines.set.dropSet')).toBeInTheDocument();
        expect(screen.getByText('routines.set.myo')).toBeInTheDocument();
        expect(screen.getByText('routines.set.partial')).toBeInTheDocument();
        expect(screen.getByText('routines.set.forced')).toBeInTheDocument();
        expect(screen.getByText('routines.set.tut')).toBeInTheDocument();
        expect(screen.getByText('routines.set.iso')).toBeInTheDocument();
        expect(screen.getByText('routines.set.jump')).toBeInTheDocument();

        const myoOption = screen.getByRole('option', { name: 'routines.set.myo' });
        await user.click(myoOption);
        expect(mockEditSlotEntry).toHaveBeenCalledWith({ "id": 1, "type": "myo" });
    });
});

describe('SlotEntryRepetitionUnitField', () => {

    beforeEach(() => {
        jest.resetAllMocks();
        user = userEvent.setup();
        (getRoutineRepUnits as jest.Mock).mockResolvedValue(testRepetitionUnits);
    });

    test('correctly updates the slot entry on change', async () => {
        render(
            <QueryClientProvider client={testQueryClient}>
                <SlotEntryRepetitionUnitField
                    slotEntry={testDayLegs.slots[0].entries[0]}
                    routineId={1}
                />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(getRoutineRepUnits).toHaveBeenCalled();
        });

        const dropdown = screen.getByRole('combobox', { name: 'unit' });
        await user.click(dropdown);

        const minutesOption = screen.getByRole('option', { name: 'Minutes' });
        await user.click(minutesOption);
        expect(mockEditSlotEntry).toHaveBeenCalledWith({ "id": 1, "repetition_unit": 3 });
    });
});

describe('SlotEntryWeightUnitField', () => {

    beforeEach(() => {
        jest.resetAllMocks();
        user = userEvent.setup();

        (getRoutineWeightUnits as jest.Mock).mockResolvedValue(testWeightUnits);
        (getProfile as jest.Mock).mockResolvedValue(testProfileDataVerified);
    });

    test('correctly updates the slot entry on change', async () => {
        render(
            <QueryClientProvider client={testQueryClient}>
                <SlotEntryWeightUnitField
                    slotEntry={testDayLegs.slots[0].entries[0]}
                    routineId={1}
                />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(getRoutineWeightUnits).toHaveBeenCalled();
            expect(getProfile).toHaveBeenCalled();
        });


        const dropdown = screen.getByRole('combobox', { name: 'unit' });
        await user.click(dropdown);

        const platesOption = screen.getByRole('option', { name: 'Plates' });
        await user.click(platesOption);
        expect(mockEditSlotEntry).toHaveBeenCalledWith({ "id": 1, "weight_unit": 3 });
    });
});

describe('SlotEntryRoundingField', () => {

    const mockEditProfile = editProfile as jest.Mock;

    beforeEach(() => {
        jest.resetAllMocks();
        user = userEvent.setup();

        (getProfile as jest.Mock).mockResolvedValue(testProfileDataVerified);
    });

    test('correctly updates the weight rounding for the slot entry', async () => {
        // Arrange
        render(
            <QueryClientProvider client={testQueryClient}>
                <SlotEntryRoundingField
                    editProfile={false}
                    entryId={101}
                    initialValue={42}
                    rounding={'weight'}
                    routineId={1}
                />
            </QueryClientProvider>
        );

        // Act
        const inputElement = screen.getByRole('textbox', { name: 'weight' });
        await user.click(inputElement);
        await user.clear(inputElement);
        await user.type(inputElement, '33');
        await user.tab();

        // Assert
        await waitFor(() => {
            expect(mockEditSlotEntry).toHaveBeenCalledWith({ "id": 101, "weight_rounding": 33 });
            expect(mockEditProfile).not.toHaveBeenCalled();
        }, { timeout: DEBOUNCE_ROUTINE_FORMS + 100 });
    });

    test('correctly updates the weight rounding for the slot entry and the user profile', async () => {
        // Arrange
        render(
            <QueryClientProvider client={testQueryClient}>
                <SlotEntryRoundingField
                    editProfile={true}
                    initialValue={42}
                    rounding={'weight'}
                    routineId={1}
                />
            </QueryClientProvider>
        );

        // Act
        const inputElement = screen.getByRole('textbox', { name: 'weight' });
        await user.click(inputElement);
        await user.clear(inputElement);
        await user.type(inputElement, '34');
        await user.tab();

        // Assert
        await waitFor(() => {
            expect(mockEditProfile).toHaveBeenCalledWith({ "weight_rounding": 34 });
            expect(mockEditSlotEntry).not.toHaveBeenCalled();
        }, { timeout: DEBOUNCE_ROUTINE_FORMS + 100 });
    });

    test('correctly updates the reps rounding for the slot entry', async () => {
        // Arrange
        render(
            <QueryClientProvider client={testQueryClient}>
                <SlotEntryRoundingField
                    editProfile={false}
                    entryId={101}
                    initialValue={42}
                    rounding={'reps'}
                    routineId={1}
                />
            </QueryClientProvider>
        );

        // Act
        const inputElement = screen.getByRole('textbox', { name: 'routines.reps' });
        await user.click(inputElement);
        await user.clear(inputElement);
        await user.type(inputElement, '33');
        await user.tab();

        // Assert
        await waitFor(() => {
            expect(mockEditSlotEntry).toHaveBeenCalledWith({ "id": 101, "reps_rounding": 33 });
            expect(mockEditProfile).not.toHaveBeenCalled();
        }, { timeout: DEBOUNCE_ROUTINE_FORMS + 100 });
    });
});
