import { ContentCopy } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";
import ClearIcon from "@mui/icons-material/Clear";
import PhotoIcon from "@mui/icons-material/Photo";
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
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

export function ExerciseDeleteDialog(props: {
    onClose: () => void,
    onChangeLanguage: () => void,
    currentExercise: Exercise,
    currentLanguage: Language | undefined,
}) {
    const [replacementId, setReplacementId] = React.useState<number | null>(null);
    const [replacementExercise, setReplacementExercise] = React.useState<Exercise | null>(null);
    const [sameExerciseError, setSameExerciseError] = React.useState(false);
    const [transferMedia, setTransferMedia] = React.useState(true);
    const [transferTranslations, setTransferTranslations] = React.useState(true);
    const [isProcessing, setIsProcessing] = React.useState(false);

    const [t] = useTranslation();
    const navigate = useNavigate();

    const resetReplacement = () => {
        setReplacementExercise(null);
        setReplacementId(null);
        setSameExerciseError(false);
    };

    const handleDeleteTranslation = async () => {
        await deleteExerciseTranslation(props.currentExercise.getTranslation(props.currentLanguage)!.id!);
        props.onClose();
        props.onChangeLanguage();
    };

    const handleDeleteBase = async (handleReplacement: boolean = false) => {
        setIsProcessing(true);
        try {
            if (handleReplacement) {
                await deleteExercise(props.currentExercise.id!, {
                    replacementUUID: replacementExercise!.uuid!,
                    transferMedia,
                    transferTranslations,
                });
            } else {
                await deleteExercise(props.currentExercise.id!);
            }
        } finally {
            setIsProcessing(false);
        }
        props.onClose();
        navigate('../overview');
    };

    const loadCurrentReplacement = async (exerciseId?: number) => {
        const id = exerciseId !== undefined ? exerciseId : replacementId;

        if (id !== null) {
            if (id === props.currentExercise.id) {
                setReplacementExercise(null);
                setSameExerciseError(true);
                return;
            }

            setSameExerciseError(false);
            try {
                const exercise = await getExercise(id);
                setReplacementExercise(exercise);
            } catch {
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
                callback={(exercise: Exercise | null) => {
                    if (exercise !== null) {
                        if (exercise.id === props.currentExercise.id) {
                            setReplacementId(null);
                            setReplacementExercise(null);
                            setSameExerciseError(true);
                            return;
                        }
                        setReplacementId(exercise.id!);
                        loadCurrentReplacement(exercise.id!);
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
                slotProps={{
                    input: {
                        endAdornment:
                            <InputAdornment position="start">
                                <IconButton onClick={() => loadCurrentReplacement()}>
                                    <CachedIcon />
                                </IconButton>
                            </InputAdornment>
                    }
                }
                }
                fullWidth={true}
                variant="standard"
            />
            {sameExerciseError && <>
                <p style={{ color: 'red' }}><i>{t('exercises.replacementCannotBeSame')}</i></p>
            </>}

            {replacementExercise === null && !sameExerciseError && <>
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

                <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={transferMedia}
                                onChange={(e) => setTransferMedia(e.target.checked)}
                                disabled={isProcessing}
                            />
                        }
                        label={t('exercises.transferMediaLabel')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={transferTranslations}
                                onChange={(e) => setTransferTranslations(e.target.checked)}
                                disabled={isProcessing}
                            />
                        }
                        label={t('exercises.transferTranslationsLabel')}
                    />
                </Box>
            </>}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => props.onClose()} disabled={isProcessing}>{t('cancel')}</Button>
            <Button
                data-testid="button-delete-translation"
                size={"small"}
                onClick={handleDeleteTranslation}
                disabled={isProcessing}
                variant="contained"
            >
                {t('exercises.deleteTranslation')}
            </Button>
            <Button
                data-testid="button-delete-all"
                size={"small"}
                onClick={() => handleDeleteBase()}
                disabled={isProcessing}
                variant="contained"
            >
                {t('exercises.deleteExerciseFull')}
            </Button>
            <Button
                data-testid="button-delete-and-replace"
                size={"small"}
                disabled={replacementExercise === null || isProcessing}
                loading={isProcessing}
                onClick={() => handleDeleteBase(true)}
                variant="contained"
            >
                {t('exercises.deleteExerciseReplace')}
            </Button>
        </DialogActions>
    </>;
}