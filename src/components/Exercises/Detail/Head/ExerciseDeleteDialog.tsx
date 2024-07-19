import { ContentCopy } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";
import ClearIcon from "@mui/icons-material/Clear";
import PhotoIcon from "@mui/icons-material/Photo";
import {
    Avatar,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    ListItem,
    ListItemAvatar,
    ListItemText,
    TextField,
    Tooltip
} from "@mui/material";
import { NameAutocompleter } from "components/Exercises/Filter/NameAutcompleter";
import { Exercise } from "components/Exercises/models/exercise";
import { Language } from "components/Exercises/models/language";
import { SERVER_URL } from "config";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { deleteExercise, deleteExerciseTranslation, getExercise } from "services";
import { ExerciseSearchResponse } from "services/responseType";

export function ExerciseDeleteDialog(props: {
    onClose: Function,
    onChangeLanguage: Function,
    currentExercise: Exercise,
    currentLanguage: Language | undefined,
}) {
    const [replacementId, setReplacementId] = React.useState<number | null>(null);
    const [replacementExercise, setReplacementExercise] = React.useState<Exercise | null>(null);

    const [t] = useTranslation();
    const navigate = useNavigate();

    const resetReplacement = () => {
        setReplacementExercise(null);
        setReplacementId(null);
    };

    const handleDeleteTranslation = async () => {
        await deleteExerciseTranslation(props.currentExercise.getTranslation(props.currentLanguage)?.id!);
        props.onClose();
        props.onChangeLanguage();
    };

    const handleDeleteBase = async (handleReplacement: boolean = false) => {
        if (handleReplacement) {
            await deleteExercise(props.currentExercise.id!, replacementExercise?.uuid!);
        } else {
            await deleteExercise(props.currentExercise.id!);
        }
        props.onClose();
        navigate('../overview');
    };

    const loadCurrentReplacement = async (exerciseId?: number) => {
        const id = exerciseId !== undefined ? exerciseId : replacementId;

        if (id !== null) {
            try {
                const exercise = await getExercise(id);
                setReplacementExercise(exercise);
            } catch (e) {
                setReplacementExercise(null);
            }
        }
    };


    return <>
        <DialogTitle id="alert-dialog-title">
            {t('delete')}
        </DialogTitle>
        <DialogContent>
            <p>{t('exercises.deleteExerciseBody',
                {
                    name: props.currentExercise.getTranslation(props.currentLanguage)?.name,
                    language: props.currentLanguage?.nameLong
                })
            }</p>
            <p>{t('cannotBeUndone')}</p>

            <p><b>{t('exercises.replacements')}</b></p>
            <p>{t('exercises.replacementsInfoText')}</p>
            <p>{t('exercises.replacementsSearch')}</p>

            <NameAutocompleter
                callback={(exercise: ExerciseSearchResponse) => {
                    if (exercise !== null) {
                        setReplacementId(exercise.data.base_id);
                        loadCurrentReplacement(exercise.data.base_id);
                    }
                }}
            />

            <TextField
                data-testid="exercise-id-field"
                id="foo"
                label="Exercise ID"
                onBlur={() => loadCurrentReplacement()}
                onChange={async (event) => {
                    setReplacementId(event.target.value !== '' ? parseInt(event.target.value) : null);
                }}
                value={replacementId ?? ""}
                InputProps={{
                    endAdornment:
                        <InputAdornment position="start">
                            <IconButton onClick={() => loadCurrentReplacement()}>
                                <CachedIcon />
                            </IconButton>
                        </InputAdornment>
                }}
                fullWidth={true}
                variant="standard"
            />
            {replacementExercise === null && <>
                <p><i>{t('exercises.noReplacementSelected')}</i></p>
            </>}

            {replacementExercise !== null && <>
                <p>Selected exercise for replacement:
                    <Tooltip title={t('copyToClipboard')}>
                        <IconButton
                            onClick={() => navigator.clipboard.writeText(replacementExercise!.id!.toString())}>
                            <ContentCopy />
                        </IconButton>
                    </Tooltip>
                </p>

                <ListItem disablePadding>
                    <ListItemAvatar>
                        <Avatar>
                            {replacementExercise.mainImage ?
                                <Avatar
                                    alt="" src={`${SERVER_URL}${replacementExercise.mainImage.url}`}
                                    variant="rounded" />
                                : <PhotoIcon />}
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={replacementExercise.getTranslation().name}
                        secondary={`${replacementExercise.id} (${replacementExercise.uuid})`}
                    />
                    <IconButton onClick={resetReplacement}>
                        <ClearIcon />
                    </IconButton>
                </ListItem>
            </>}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => props.onClose()}>{t('cancel')}</Button>
            <Button
                data-testid="button-delete-translation"
                size={"small"}
                onClick={handleDeleteTranslation}
                variant="contained"
            >
                {t('exercises.deleteTranslation')}
            </Button>
            <Button
                data-testid="button-delete-all"
                size={"small"}
                onClick={() => handleDeleteBase()}
                variant="contained"
            >
                {t('exercises.deleteExerciseFull')}
            </Button>
            <Button
                data-testid="button-delete-and-replace"
                size={"small"}
                disabled={replacementExercise === null}
                onClick={() => handleDeleteBase(true)}
                variant="contained"
            >
                {t('exercises.deleteExerciseReplace')}
            </Button>
        </DialogActions>
    </>;
}