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
    Divider,
    InputAdornment,
    List,
    ListItem,
    ListItemButton,
    Paper,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { Exercise } from "components/Exercises/models/exercise";
import { useExercisesQuery } from "components/Exercises/queries";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useExerciseSubmissionStateValue } from "state";
import { setNewBaseVariationId, setVariationId } from "state/exerciseSubmissionReducer";

/*
 * Groups a list of objects by a property
 */
function groupBy(list: any[], keyGetter: Function) {
    const map = new Map();
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
    const variationId = exercises[0].variationId;
    const exerciseId = exercises[0].id;

    const [state, dispatch] = useExerciseSubmissionStateValue();
    const [showMore, setShowMore] = useState<boolean>(false);

    const [stateVariationId, setStateVariationId] = useState<number | null>(state.variationId);
    const [stateNewVariationId, setStateNewVariationId] = useState<number | null>(state.newVariationExerciseId);

    useEffect(() => {
        dispatch(setVariationId(stateVariationId));
    }, [dispatch, stateVariationId]);

    useEffect(() => {
        dispatch(setNewBaseVariationId(stateNewVariationId));
    }, [dispatch, stateNewVariationId]);


    const handleToggle = (variationId: number | null, newVariationId: number | null) => () => {

        if (variationId !== null) {
            newVariationId = null;
            if (variationId === state.variationId) {
                variationId = null;
            }
        } else {
            variationId = null;
            if (newVariationId === state.newVariationExerciseId) {
                newVariationId = null;
            }
        }

        setStateVariationId(variationId);
        setStateNewVariationId(newVariationId);
    };

    let isChecked;
    if (variationId === null) {
        isChecked = state.newVariationExerciseId === exerciseId;
    } else {
        isChecked = variationId === state.variationId;
    }

    return (
        <ListItem disableGutters>
            <ListItemButton onClick={handleToggle(variationId, exerciseId)}>
                <Grid container>
                    <Grid
                        display="flex"
                        justifyContent={"start"}
                        alignItems={"center"}
                        size={{
                            xs: 12,
                            sm: 3
                        }}>
                        <AvatarGroup max={MAX_EXERCISE_IMAGES} spacing={"small"}>
                            {exercises.map((base) =>
                                base.mainImage
                                    ? <Avatar key={base.id} src={base.mainImage.url} />
                                    : <Avatar key={base.id} children={<PhotoIcon />} />
                            )}
                        </AvatarGroup>
                    </Grid>
                    <Grid
                        size={{
                            xs: 10,
                            sm: 7
                        }}>
                        { /* map the bases */}
                        {exercises.slice(0, showMore ? exercises.length : MAX_EXERCISE_NAMES).map((base) =>
                            <p style={{ margin: 0 }} key={base.id}>{base.getTranslation().name}</p>
                        )}
                        {!showMore && exercises.length > MAX_EXERCISE_NAMES
                            ? <ExpandMoreIcon onMouseEnter={() => setShowMore(true)} />
                            : null
                        }
                    </Grid>
                    <Grid
                        display="flex"
                        justifyContent={"end"}
                        size={{
                            xs: 2,
                            sm: 2
                        }}>
                        <Switch
                            key={`variation-${variationId}`}
                            edge="start"
                            checked={isChecked}
                            tabIndex={-1}
                            disableRipple
                        />
                    </Grid>
                    <Grid size={12}>
                        <Divider sx={{ pt: 1 }} />
                    </Grid>
                </Grid>
            </ListItemButton>
        </ListItem>
    );
};


export const Step2Variations = ({ onContinue, onBack }: StepProps) => {
    const [t] = useTranslation();
    const basesQuery = useExercisesQuery();

    const [searchTerm, setSearchTerms] = useState<string>('');

    // Group bases by variationId
    let bases: Exercise[] = [];
    let groupedBases = new Map<number, Exercise[]>();
    if (basesQuery.isSuccess) {
        bases = basesQuery.data;
        if (searchTerm !== '') {
            bases = bases.filter((base) => base.getTranslation().name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
    }
    groupedBases = groupBy(bases.filter(b => b.variationId !== null), (b: Exercise) => b.variationId);

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
                display="flex"
                justifyContent={"end"}
                size={{
                    xs: 12,
                    sm: 6
                }}>
                <TextField label={t('exercises.filterVariations')}
                           variant="standard"
                           onChange={(event) => setSearchTerms(event.target.value)}
                           InputProps={{
                               startAdornment: (
                                   <InputAdornment position="start">
                                       <SearchIcon />
                                   </InputAdornment>
                               ),
                           }}
                />
            </Grid>
        </Grid>

        {basesQuery.isLoading ? (
            <LoadingPlaceholder />
        ) : (
            <Paper elevation={2} sx={{ mt: 2 }}>
                <List style={{ maxHeight: "400px", overflowY: "scroll" }}>
                    {bases.filter(b => b.variationId === null).map(base =>
                        <ExerciseInfoListItem
                            exercises={[base]}
                            key={'base-' + base.id}
                        />
                    )}
                    {[...groupedBases.keys()].map(variationId =>
                        <ExerciseInfoListItem
                            exercises={groupedBases.get(variationId)!}
                            key={'variation-' + variationId}
                        />
                    )}
                </List>
            </Paper>
        )}

        <Alert severity="info" variant="filled" sx={{ mt: 2 }}>
            <AlertTitle>{t("exercises.identicalExercise")}</AlertTitle>
            {t('exercises.identicalExercisePleaseDiscard')}
        </Alert>

        <Grid container>
            <Grid display="flex" justifyContent={"end"} size={12}>
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