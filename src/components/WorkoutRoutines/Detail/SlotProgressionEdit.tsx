import { Button, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerFullWidth } from "components/Core/Widgets/Container";
import { Language } from "components/Exercises/models/language";
import { useLanguageQuery } from "components/Exercises/queries";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import { ProgressionForm } from "components/WorkoutRoutines/widgets/forms/ProgressionForm";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { getLanguageByShortName } from "services";
import { makeLink, WgerLink } from "utils/url";

export const SlotProgressionEdit = () => {

    const { i18n } = useTranslation();
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
            optionsMenu={<Button
                component={Link}
                variant={"outlined"}
                size={"small"}
                to={makeLink(WgerLink.ROUTINE_EDIT, i18n.language, { id: routineId })}
            >
                back to routine edit
            </Button>}
        >
            {slot.configs.map((config) =>
                <React.Fragment key={config.id}>
                    <Typography variant="h5" gutterBottom>
                        {config.exercise?.getTranslation(language).name}
                    </Typography>
                    <Grid container>
                        <ProgressionForm
                            type="weight"
                            configs={config.weightConfigs}
                            configsMax={config.maxWeightConfigs}
                            slotEntryId={config.id}
                            routineId={routineId}
                            iterations={iterations}
                        />
                        <ProgressionForm
                            type="reps"
                            configs={config.repsConfigs}
                            configsMax={config.maxRepsConfigs}
                            slotEntryId={config.id}
                            routineId={routineId}
                            iterations={iterations}
                        />
                        <ProgressionForm
                            type="sets"
                            configs={config.nrOfSetsConfigs}
                            configsMax={config.maxNrOfSetsConfigs}
                            slotEntryId={config.id}
                            routineId={routineId}
                            iterations={iterations}
                            forceInteger={true}
                        />
                        <ProgressionForm
                            type="rest"
                            configs={config.restTimeConfigs}
                            configsMax={config.maxRestTimeConfigs}
                            slotEntryId={config.id}
                            routineId={routineId}
                            iterations={iterations}
                        />
                    </Grid>
                </React.Fragment>
            )}
        </WgerContainerFullWidth>
    </>;
};


