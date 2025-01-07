import { Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerFullWidth } from "components/Core/Widgets/Container";
import { Language } from "components/Exercises/models/language";
import { useLanguageQuery } from "components/Exercises/queries";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import { ProgressionForm } from "components/WorkoutRoutines/widgets/forms/ProgressionForm";
import { SlotEntryRoundingField } from "components/WorkoutRoutines/widgets/forms/SlotEntryForm";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { getLanguageByShortName } from "services";
import { makeLink, WgerLink } from "utils/url";

export const SlotProgressionEdit = () => {

    const { t, i18n } = useTranslation();
    const params = useParams<{ routineId: string, slotId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : -1;
    const slotId = params.slotId ? parseInt(params.slotId) : -1;
    const routineQuery = useRoutineDetailQuery(routineId);
    const languageQuery = useLanguageQuery();

    if (routineQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    const routine = routineQuery.data!;

    let language: Language | undefined = undefined;
    if (languageQuery.isSuccess) {
        language = getLanguageByShortName(
            i18n.language,
            languageQuery.data!
        );
    }


    let slot: Slot | null = null;
    for (const day of routine.days) {
        const foundSlot = day.slots.find((s) => s.id === slotId);
        if (foundSlot) {
            slot = foundSlot;
            break;
        }
    }

    if (slot === null) {
        return <p>Slot not found!</p>;
    }

    const iterations = Object.keys(routine.groupedDayDataByIteration).map(Number);

    return <>
        <WgerContainerFullWidth
            title={`Edit progression`}
            backToUrl={makeLink(WgerLink.ROUTINE_EDIT, i18n.language, { id: routineId })}
        >
            {slot.configs.map((slotEntry) =>
                <React.Fragment key={slotEntry.id}>
                    <Typography variant="h5" gutterBottom>
                        {slotEntry.exercise?.getTranslation(language).name}
                    </Typography>
                    <Grid container spacing={1}>
                        <Grid size={2} display="flex" alignItems="end">
                            <Typography variant={"body2"}>
                                {t('routines.rounding')}
                            </Typography>
                        </Grid>

                        <Grid size={5}>
                            <SlotEntryRoundingField
                                routineId={routineId}
                                entryId={slotEntry.id}
                                initialValue={slotEntry.weightRounding}
                                rounding="weight"
                                editProfile={false}
                            />
                        </Grid>
                        <Grid size={5}>
                            <SlotEntryRoundingField
                                routineId={routineId}
                                entryId={slotEntry.id}
                                initialValue={slotEntry.repetitionRounding}
                                rounding="reps"
                                editProfile={false}
                            />
                        </Grid>

                        <ProgressionForm
                            type="sets"
                            configs={slotEntry.nrOfSetsConfigs}
                            configsMax={slotEntry.maxNrOfSetsConfigs}
                            slotEntryId={slotEntry.id}
                            routineId={routineId}
                            iterations={iterations}
                            forceInteger={true}
                            cycleLength={routine.cycleLength}
                        />
                        <ProgressionForm
                            type="weight"
                            configs={slotEntry.weightConfigs}
                            configsMax={slotEntry.maxWeightConfigs}
                            slotEntryId={slotEntry.id}
                            routineId={routineId}
                            iterations={iterations}
                            cycleLength={routine.cycleLength}
                        />
                        <ProgressionForm
                            type="reps"
                            configs={slotEntry.repsConfigs}
                            configsMax={slotEntry.maxRepsConfigs}
                            slotEntryId={slotEntry.id}
                            routineId={routineId}
                            iterations={iterations}
                            cycleLength={routine.cycleLength}
                        />
                        <ProgressionForm
                            type="rir"
                            configs={slotEntry.rirConfigs}
                            configsMax={slotEntry.maxRirConfigs}
                            slotEntryId={slotEntry.id}
                            routineId={routineId}
                            iterations={iterations}
                            cycleLength={routine.cycleLength}
                        />
                        <ProgressionForm
                            type="rest"
                            configs={slotEntry.restTimeConfigs}
                            configsMax={slotEntry.maxRestTimeConfigs}
                            slotEntryId={slotEntry.id}
                            routineId={routineId}
                            iterations={iterations}
                            cycleLength={routine.cycleLength}
                        />
                    </Grid>
                </React.Fragment>
            )}
        </WgerContainerFullWidth>
    </>;
};


