import { FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { useEditRoutineQuery } from "components/WorkoutRoutines/queries/routines";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";


export const RoutineTemplateForm = (props: { routine: Routine }) => {

    const { t } = useTranslation();
    const editRoutineQuery = useEditRoutineQuery(props.routine.id!);

    const [isTemplate, setIsTemplate] = useState<boolean>(props.routine.isTemplate);
    const [isPublic, setIsPublic] = useState<boolean>(props.routine.isPublic);

    const handleSetTemplate = (isTemplate: boolean) => {
        const newIsPublic = isTemplate && isPublic;
        setIsTemplate(isTemplate);
        setIsPublic(newIsPublic);

        handleSave(isTemplate, newIsPublic);
    };

    const handleSetPublic = (isPublic: boolean) => {
        const newIsPublic = isPublic && isTemplate;
        setIsPublic(newIsPublic);
        handleSave(isTemplate, newIsPublic);
    };

    const handleSave = (isTemplate: boolean, isPublic: boolean) => {
        editRoutineQuery.mutate({
            id: props.routine.id,
            is_template: isTemplate,
            is_public: isPublic
        });
    };

    return (
        <Grid container spacing={2}>
            <Grid size={12}>
                <Stack>
                    <FormControlLabel
                        disabled={editRoutineQuery.isPending}
                        control={<Switch checked={isTemplate} onChange={async () => handleSetTemplate(!isTemplate)} />}
                        label={t('routines.template')}
                    />
                    <Typography variant="caption">
                        {t('routines.templatesHelpText')}
                    </Typography>
                </Stack>
            </Grid>
            <Grid size={12}>
                <Stack>
                    <FormControlLabel
                        disabled={editRoutineQuery.isPending || !isTemplate}
                        control={<Switch checked={isPublic} onChange={async () => handleSetPublic(!isPublic)} />}
                        label={t('routines.publicTemplate')}
                    />
                    <Typography variant="caption">
                        {t('routines.publicTemplateHelpText')}
                    </Typography>
                </Stack>
            </Grid>
        </Grid>
    );
};
