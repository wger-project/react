import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import {
    SlotEntryRepetitionUnitField,
    SlotEntryTypeField,
    SlotEntryWeightUnitField
} from "components/WorkoutRoutines/widgets/forms/SlotEntryForm";
import { editSlotEntry, getProfile, getRoutineRepUnits, getRoutineWeightUnits } from "services";
import { testQueryClient } from "tests/queryClient";
import { testProfileDataVerified } from "tests/userTestdata";
import { testDayLegs, testRepetitionUnits, testWeightUnits } from "tests/workoutRoutinesTestData";


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
                    slotEntry={testDayLegs.slots[0].configs[0]}
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
                    slotEntry={testDayLegs.slots[0].configs[0]}
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
                    slotEntry={testDayLegs.slots[0].configs[0]}
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
