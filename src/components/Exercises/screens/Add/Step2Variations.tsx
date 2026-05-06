import { Exercise } from "@/components/Exercises/models/exercise";

import { useExercisesQuery } from "@/components/Exercises/queries";
import { StepProps } from "@/components/Exercises/screens/Add/AddExerciseStepper";
import { useExerciseSubmissionStateValue } from "@/components/Exercises/screens/Add/state";
import {
    setNewBaseVariationId,
    setVariationId
} from "@/components/Exercises/screens/Add/state/exerciseSubmissionReducer";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhotoIcon from '@mui/icons-material/Photo';
import SearchIcon from '@mui/icons-material/Search';
import {
    Alert,
    AlertTitle,
    Avatar,
    AvatarGroup,
    Box,
    Button,
    InputAdornment,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import Grid from '@mui/material/Grid';
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/*
 * Groups a list of objects by a property
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function groupBy(list: any[], keyGetter: Function) {
    const map = new Map();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    list.forEach((item: any) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}

// New component that displays the exercise info in a ListItem
const ExerciseInfoListItem = ({ exercises }: { exercises: Exercise[] }) => {
    const MAX_EXERCISE_IMAGES = 4;
    const MAX_EXERCISE_NAMES = 5;
    const variationGroup = exercises[0].variationGroup;
    const exerciseId = exercises[0].id;

    const [state, dispatch] = useExerciseSubmissionStateValue();
    const [showMore, setShowMore] = useState<boolean>(false);

    const [stateVariationGroup, setStateVariationGroup] = useState<string | null>(state.variationGroup);
    const [stateNewVariationId, setStateNewVariationId] = useState<number | null>(state.newVariationExerciseId);

    useEffect(() => {
        dispatch(setVariationId(stateVariationGroup));
    }, [dispatch, stateVariationGroup]);

    useEffect(() => {
        dispatch(setNewBaseVariationId(stateNewVariationId));
    }, [dispatch, stateNewVariationId]);


    const handleToggle = (variationGroup: string | null, newVariationId: number | null) => () => {

        if (variationGroup !== null) {
            newVariationId = null;
            if (variationGroup === state.variationGroup) {
                variationGroup = null;
            }
        } else {
            variationGroup = null;
            if (newVariationId === state.newVariationExerciseId) {
                newVariationId = null;
            }
        }

        setStateVariationGroup(variationGroup);
        setStateNewVariationId(newVariationId);
    };

    let isChecked;
    if (variationGroup === null) {
        isChecked = state.newVariationExerciseId === exerciseId;
    } else {
        isChecked = variationGroup === state.variationGroup;
    }

    return (
        <ListItem disableGutters>
            <ListItemButton onClick={handleToggle(variationGroup, exerciseId)}>
                <ListItemIcon>
                    <AvatarGroup max={MAX_EXERCISE_IMAGES} spacing={"small"}>
                        {exercises.map((base) =>
                            base.mainImage
                                ? <Avatar key={base.id} src={base.mainImage.url} />
                                : <Avatar key={base.id} children={<PhotoIcon />} />
                        )}
                    </AvatarGroup>
                </ListItemIcon>
                <ListItemText
                    primary={exercises.slice(0, showMore ? exercises.length : MAX_EXERCISE_NAMES).map((exercise) =>
                        <p style={{ margin: 0 }} key={exercise.id}>{exercise.getTranslation().name}</p>
                    )} />

                <Switch
                    key={`variation-${variationGroup}`}
                    edge="start"
                    checked={isChecked}
                    tabIndex={-1}
                    disableRipple
                />

                {!showMore && exercises.length > MAX_EXERCISE_NAMES
                    ? <ExpandMoreIcon onMouseEnter={() => setShowMore(true)} />
                    : null
                }

            </ListItemButton>
        </ListItem>
    );
};


export const Step2Variations = ({ onContinue, onBack }: StepProps) => {
    const [t] = useTranslation();
    const exercisesQuery = useExercisesQuery();
    const [state, dispatch] = useExerciseSubmissionStateValue();

    const [searchTerm, setSearchTerms] = useState<string>('');

    // Group exercises by variationGroup
    let exercises: Exercise[] = [];
    let groupedExercises = new Map<string, Exercise[]>();
    if (exercisesQuery.isSuccess) {
        exercises = exercisesQuery.data;
        if (searchTerm !== '') {
            exercises = exercises.filter((base) => base.getTranslation().name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
    }
    groupedExercises = groupBy(exercises.filter(b => b.variationGroup !== null), (b: Exercise) => b.variationGroup);

    return <>
        <Grid container>
            <Grid
                size={{
                    xs: 12,
                    sm: 6
                }}>
                <Typography>{t('exercises.whatVariationsExist')}</Typography>
            </Grid>
            <Grid
                sx={{ display: "flex", justifyContent: "end" }}
                size={{
                    xs: 12,
                    sm: 6
                }}>
                <TextField
                    label={t('name')}
                    helperText={t('exercises.filterVariations')}
                    variant="standard"
                    onChange={(event) => setSearchTerms(event.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }
                    }}
                />
            </Grid>
        </Grid>

        {exercisesQuery.isLoading
            ? <LoadingPlaceholder />
            : <Paper elevation={2} sx={{ mt: 2 }}>
                <List style={{ height: "400px", overflowY: "scroll" }}>
                    {exercises.filter(b => b.variationGroup === null).map(exercise =>
                        <ExerciseInfoListItem
                            exercises={[exercise]}
                            key={'exercise-' + exercise.id}
                        />
                    )}
                    {[...groupedExercises.keys()].map(variationGroup =>
                        <ExerciseInfoListItem
                            exercises={groupedExercises.get(variationGroup)!}
                            key={'variation-' + variationGroup}
                        />
                    )}
                </List>
            </Paper>
        }

        <Alert severity="info" variant="filled" sx={{ mt: 2 }}>
            <AlertTitle>{t("exercises.identicalExercise")}</AlertTitle>
            {t('exercises.identicalExercisePleaseDiscard')}
        </Alert>

        <Grid container>
            <Grid sx={{ display: "flex", justifyContent: "end" }} size={12}>
                <Box sx={{ mb: 2 }}>
                    <div>
                        <Button
                            disabled={false}
                            onClick={onBack}
                            sx={{ mt: 1, mr: 1 }}
                        >
                            {t('goBack')}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={onContinue}
                            sx={{ mt: 1, mr: 1 }}
                        >
                            {t('continue')}
                        </Button>
                    </div>
                </Box>
            </Grid>
        </Grid>
    </>;
};
