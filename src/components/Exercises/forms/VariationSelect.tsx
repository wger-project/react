import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhotoIcon from '@mui/icons-material/Photo';
import SearchIcon from '@mui/icons-material/Search';
import {
    Avatar,
    AvatarGroup,
    InputAdornment,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Switch,
    TextField,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { Exercise } from "components/Exercises/models/exercise";
import { useExercisesQuery } from "components/Exercises/queries";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

/*
 * Groups a list of objects by a property
 */

function groupBy<T, K>(list: T[], keyGetter: (item: T) => K): Map<K, T[]> {
    const map = new Map<K, T[]>();
    list.forEach((item: T) => {
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

interface ExerciseInfoListItemProps {
    exercises: Exercise[];
    selectedVariationId: string | null;
    selectedNewVariationExerciseId: number | null;
    onToggle: (variationId: string | null, newVariationId: number | null) => void;
    highlight?: boolean;
}

const ExerciseInfoListItem = ({
                                  exercises,
                                  selectedVariationId,
                                  selectedNewVariationExerciseId,
                                  onToggle,
                                  highlight = false,
                              }: ExerciseInfoListItemProps) => {
    const MAX_EXERCISE_IMAGES = 4;
    const MAX_EXERCISE_NAMES = 5;
    const variationId = exercises[0].variationGroup;
    const exerciseId = exercises[0].id;

    const [showMore, setShowMore] = useState<boolean>(false);

    const handleToggle = () => {
        let newVarId = variationId;
        let newExId: number | null = exerciseId;

        if (newVarId !== null) {
            newExId = null;
            if (newVarId === selectedVariationId) {
                newVarId = null;
            }
        } else {
            newVarId = null;
            if (newExId === selectedNewVariationExerciseId) {
                newExId = null;
            }
        }

        onToggle(newVarId, newExId);
    };

    let isChecked;
    if (variationId === null) {
        isChecked = selectedNewVariationExerciseId === exerciseId;
    } else {
        isChecked = variationId === selectedVariationId;
    }

    return (
        <ListItem disableGutters sx={highlight ? { backgroundColor: 'action.selected' } : undefined}>
            <ListItemButton onClick={handleToggle}>
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
                    key={`variation-${variationId}`}
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


export interface VariationSelectProps {
    exerciseId?: number;
    selectedVariationId: string | null;
    selectedNewVariationExerciseId: number | null;
    onChangeVariationId: (id: string | null) => void;
    onChangeNewVariationExerciseId: (id: number | null) => void;
}

export function VariationSelect({
                                    exerciseId,
                                    selectedVariationId,
                                    selectedNewVariationExerciseId,
                                    onChangeVariationId,
                                    onChangeNewVariationExerciseId,
                                }: VariationSelectProps) {
    const [t] = useTranslation();
    const exercisesQuery = useExercisesQuery();
    const [searchTerm, setSearchTerms] = useState<string>('');

    // Group exercises by variationId
    let allExercises: Exercise[] = [];
    let exercises: Exercise[] = [];
    let groupedExercises = new Map<string, Exercise[]>();
    if (exercisesQuery.isSuccess) {
        allExercises = exercisesQuery.data;

        if (searchTerm !== '') {
            allExercises = allExercises.filter((base) => base.getTranslation().name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // Group first (including current exercise, so groups show all members)
        groupedExercises = groupBy(allExercises.filter(b => b.variationGroup !== null), (b: Exercise) => b.variationGroup as string);

        // Filter out the current exercise only for the standalone list
        exercises = exerciseId
            ? allExercises.filter((e) => e.id !== exerciseId)
            : allExercises;
    }

    const handleToggle = (variationId: string | null, newVariationId: number | null) => {
        onChangeVariationId(variationId);
        onChangeNewVariationExerciseId(newVariationId);
    };

    return <>
        <Grid container>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    fullWidth
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
                    {/* Show the current variation group first */}
                    {selectedVariationId !== null && groupedExercises.has(selectedVariationId) && (
                        <ExerciseInfoListItem
                            exercises={groupedExercises.get(selectedVariationId)!}
                            key={'variation-current-' + selectedVariationId}
                            selectedVariationId={selectedVariationId}
                            selectedNewVariationExerciseId={selectedNewVariationExerciseId}
                            onToggle={handleToggle}
                            highlight
                        />
                    )}

                    {/* Remaining variation groups */}
                    {[...groupedExercises.keys()]
                        .filter(id => id !== selectedVariationId)
                        .map(variationId =>
                            <ExerciseInfoListItem
                                exercises={groupedExercises.get(variationId)!}
                                key={'variation-' + variationId}
                                selectedVariationId={selectedVariationId}
                                selectedNewVariationExerciseId={selectedNewVariationExerciseId}
                                onToggle={handleToggle}
                            />
                        )}

                    {/* Standalone exercises (no variation group) */}
                    {exercises.filter(b => b.variationGroup === null).map(exercise =>
                        <ExerciseInfoListItem
                            exercises={[exercise]}
                            key={'exercise-' + exercise.id}
                            selectedVariationId={selectedVariationId}
                            selectedNewVariationExerciseId={selectedNewVariationExerciseId}
                            onToggle={handleToggle}
                        />
                    )}
                </List>
            </Paper>
        }
    </>;
}
