import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { SlotEntry } from "@/components/Routines/models/SlotEntry";
import {
    SlotEntryRepetitionUnitField,
    SlotEntryRoundingField,
    SlotEntryTypeField,
    SlotEntryWeightUnitField
} from "@/components/Routines/widgets/forms/SlotEntryForm";
import type { Mock } from 'vitest';
import { editSlotEntry } from "@/components/Routines/api/slot_entry";
import { getRoutineRepUnits, getRoutineWeightUnits } from "@/components/Routines/api/workoutUnits";
import { editProfile, getProfile } from "@/components/User/api/profile";
import { getTestQueryClient } from "@/tests/queryClient";
import { testProfileDataVerified } from "@/tests/userTestdata";
import { testDayLegs, testRepetitionUnits, testWeightUnits } from "@/tests/workoutRoutinesTestData";
import { DEBOUNCE_ROUTINE_FORMS } from "@/core/lib/consts";


vi.mock("@/components/Routines/api/slot_entry");
vi.mock("@/components/Routines/api/workoutUnits");
vi.mock("@/components/User/api/profile");

let user: ReturnType<typeof userEvent.setup>;
const mockEditSlotEntry = editSlotEntry as Mock;

describe('SlotEntryTypeField', () => {

    beforeEach(() => {
        user = userEvent.setup();
        vi.resetAllMocks();
    });

    test('correctly updates the slot entry on change', async () => {
        render(
            <QueryClientProvider client={getTestQueryClient()}>
                <SlotEntryTypeField
                    slotEntry={testDayLegs.slots[0].entries[0]}
                    routineId={1}
                />
            </QueryClientProvider>
        );

        const dropdown = screen.getByRole('combobox', { name: 'routines.set.type' });
        await user.click(dropdown);

        // One in the options menu, one in the selected value
        expect(screen.queryAllByText(/routines\.set\.normalSet/)).toHaveLength(2);
        expect(screen.getByText(/routines\.set\.dropSet/)).toBeInTheDocument();
        expect(screen.getByText(/routines\.set\.myo/)).toBeInTheDocument();
        expect(screen.getByText(/routines\.set\.partial/)).toBeInTheDocument();
        expect(screen.getByText(/routines\.set\.forced/)).toBeInTheDocument();
        expect(screen.getByText(/routines\.set\.tut/)).toBeInTheDocument();
        expect(screen.getByText(/routines\.set\.iso/)).toBeInTheDocument();
        expect(screen.getByText(/routines\.set\.jump/)).toBeInTheDocument();


        const myoOption = screen.getByRole('option', { name: /routines\.set\.myo/ });
        await user.click(myoOption);
        expect(mockEditSlotEntry).toHaveBeenCalledWith(SlotEntry.clone(testDayLegs.slots[0].entries[0], { type: 'myo' }));
    });
});

describe('SlotEntryRepetitionUnitField', () => {

    const testSlotEntry = testDayLegs.slots[0].entries[0];

    beforeEach(() => {
        vi.resetAllMocks();
        user = userEvent.setup();
        (getRoutineRepUnits as Mock).mockResolvedValue(testRepetitionUnits);
    });

    test('correctly updates the slot entry on change', async () => {
        render(
            <QueryClientProvider client={getTestQueryClient()}>
                <SlotEntryRepetitionUnitField
                    slotEntry={testSlotEntry}
                    routineId={1}
                />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(getRoutineRepUnits).toHaveBeenCalled();
        });

        await waitFor(async () => {
            const dropdown = screen.getByRole('combobox', { name: 'unit' });
            await user.click(dropdown);
        });

        const minutesOption = screen.getByRole('option', { name: 'Minutes' });
        await user.click(minutesOption);
        expect(mockEditSlotEntry).toHaveBeenCalledWith(SlotEntry.clone(testSlotEntry, { repetitionUnitId: 3 }));
    });
});

describe('SlotEntryWeightUnitField', () => {

    const testSlotEntry = testDayLegs.slots[0].entries[0];

    beforeEach(() => {
        vi.resetAllMocks();
        user = userEvent.setup();

        (getRoutineWeightUnits as Mock).mockResolvedValue(testWeightUnits);
        (getProfile as Mock).mockResolvedValue(testProfileDataVerified);
    });

    test('correctly updates the slot entry on change', async () => {
        render(
            <QueryClientProvider client={getTestQueryClient()}>
                <SlotEntryWeightUnitField
                    slotEntry={testSlotEntry}
                    routineId={1}
                />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(getRoutineWeightUnits).toHaveBeenCalled();
            expect(getProfile).toHaveBeenCalled();
        });

        await waitFor(async () => {
            const dropdown = screen.getByRole('combobox', { name: 'unit' });
            await user.click(dropdown);
        });

        const platesOption = screen.getByRole('option', { name: 'Plates' });
        await user.click(platesOption);
        expect(mockEditSlotEntry).toHaveBeenCalledWith(SlotEntry.clone(testSlotEntry, { weightUnitId: 3 }));
    });
});

describe('SlotEntryRoundingField', () => {

    const mockEditProfile = editProfile as Mock;
    const testSlotEntry = testDayLegs.slots[0].entries[0];

    beforeEach(() => {
        vi.resetAllMocks();
        (editProfile as Mock).mockResolvedValue(testProfileDataVerified);
        (getProfile as Mock).mockResolvedValue(testProfileDataVerified);

        user = userEvent.setup();
    });

    test('correctly updates the weight rounding for the slot entry', async () => {
        // Arrange
        render(
            <QueryClientProvider client={getTestQueryClient()}>
                <SlotEntryRoundingField
                    editProfile={false}
                    slotEntry={testSlotEntry}
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
            expect(mockEditSlotEntry).toHaveBeenCalledWith(SlotEntry.clone(testSlotEntry, { weightRounding: 33 }));
            expect(mockEditProfile).not.toHaveBeenCalled();
        }, { timeout: DEBOUNCE_ROUTINE_FORMS + 100 });
    });

    test('correctly updates the weight rounding for the slot entry and the user profile', async () => {
        // Arrange
        render(
            <QueryClientProvider client={getTestQueryClient()}>
                <SlotEntryRoundingField
                    editProfile={true}
                    initialValue={42}
                    rounding={'weight'}
                    routineId={1}
                />
            </QueryClientProvider>
        );

        // Act
        const inputElement = await screen.findByRole('textbox', { name: 'weight' });
        await user.click(inputElement);
        await user.clear(inputElement);
        await user.type(inputElement, '34');
        await user.tab();

        // Assert

        await waitFor(() => {
            expect(mockEditProfile).toHaveBeenCalledWith({ "weightRounding": 34 });
            expect(mockEditSlotEntry).not.toHaveBeenCalled();
        }, { timeout: DEBOUNCE_ROUTINE_FORMS + 100 });
    });

    test('correctly updates the reps rounding for the slot entry', async () => {
        // Arrange
        render(
            <QueryClientProvider client={getTestQueryClient()}>
                <SlotEntryRoundingField
                    editProfile={false}
                    slotEntry={testSlotEntry}
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
            expect(mockEditSlotEntry).toHaveBeenCalledWith(SlotEntry.clone(testSlotEntry, { repetitionRounding: 33 }));
            expect(mockEditProfile).not.toHaveBeenCalled();
        }, { timeout: DEBOUNCE_ROUTINE_FORMS + 100 });
    });
});
