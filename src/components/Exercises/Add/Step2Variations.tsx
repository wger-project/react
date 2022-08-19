import React, { useEffect, useState } from "react";
import {
    Alert,
    Avatar,
    AvatarGroup,
    Box,
    Button,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemButton,
    Paper,
    Switch,
    Typography
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useBasesQuery } from "components/Exercises/queries";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { LoadingPlaceholder } from "components/Exercises/ExerciseOverview";
import { useExerciseStateValue } from "state";
import { setNewBaseVariationId, setVariationId } from "state/exerciseReducer";

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
const ExerciseInfoListItem = ({ bases }: {
    bases: ExerciseBase[],
}) => {
    const MAX_EXERCISE_IMAGES = 4;
    const MAX_EXERCISE_NAMES = 5;
    const basesVariationId = bases[0].variationId;
    const baseId = bases[0].id;

    const [state, dispatch] = useExerciseStateValue();
    const [showMore, setShowMore] = useState<boolean>(false);

    const [stateVariationId, setStateVariationId] = useState<number | null>(state.variationId);
    const [stateNewBaseVariationId, setStateNewBaseVariationId] = useState<number | null>(state.newVariationBaseId);

    useEffect(() => {
        dispatch(setVariationId(stateVariationId));
    }, [dispatch, stateVariationId]);

    useEffect(() => {
        dispatch(setNewBaseVariationId(stateNewBaseVariationId));
    }, [dispatch, stateNewBaseVariationId]);


    const handleToggle = (variationId: number | null, newVariationId: number | null) => () => {

        if (variationId !== null) {
            newVariationId = null;
            if (variationId === state.variationId) {
                variationId = null;
            }
        } else {
            variationId = null;
            if (newVariationId === state.newVariationBaseId) {
                newVariationId = null;
            }
        }

        setStateVariationId(variationId);
        setStateNewBaseVariationId(newVariationId);
    };

    let isChecked;
    if (basesVariationId === null) {
        isChecked = state.newVariationBaseId === baseId;
    } else {
        isChecked = basesVariationId === state.variationId;
    }

    return <ListItem disableGutters>
        <ListItemButton onClick={handleToggle(basesVariationId, baseId)}>
            <Grid container>
                <Grid item xs={12} sm={3} display="flex" justifyContent={"start"} alignItems={"center"}>
                    <AvatarGroup max={MAX_EXERCISE_IMAGES} spacing={"small"}>
                        {bases.map((base) => <Avatar key={base.id}
                                                     src={base.mainImage ? base.mainImage.url : "https://mui.com/static/images/cards/contemplative-reptile.jpg"}
                        />)}
                    </AvatarGroup>
                </Grid>
                <Grid item xs={10} sm={7}>
                    { /* map the bases */}
                    {bases.slice(0, showMore ? bases.length : MAX_EXERCISE_NAMES).map((base) =>
                        <p style={{ margin: 0 }} key={base.id}>{base.getTranslation().name}</p>
                    )}
                    {!showMore && bases.length > MAX_EXERCISE_NAMES ?
                        <p style={{ margin: 0 }} onMouseEnter={() => setShowMore(true)}>...</p> : null}
                </Grid>
                <Grid item xs={2} sm={2} display="flex" justifyContent={"end"}>
                    <Switch
                        key={`variation-${basesVariationId}`}
                        edge="start"
                        checked={isChecked}
                        tabIndex={-1}
                        disableRipple
                    />
                </Grid>
                <Grid item xs={12}>
                    <Divider sx={{ pt: 1 }} />
                </Grid>
            </Grid>
        </ListItemButton>
    </ListItem>;
};


export const Step2Variations = ({ onContinue, onBack }: StepProps) => {
    const [t] = useTranslation();
    const basesQuery = useBasesQuery();

    // Group bases by variationId
    let groupedBases = new Map<number, ExerciseBase[]>();
    if (basesQuery.isSuccess) {
        groupedBases = groupBy(basesQuery.data.filter(b => b.variationId !== null), (b: ExerciseBase) => b.variationId);
    }

    return <>
        <Typography>{t('exercises.whatVariationsExist')}</Typography>

        {basesQuery.isLoading ? (
            <LoadingPlaceholder />
        ) : (
            <Paper elevation={2}>
                <List style={{ maxHeight: "400px", overflowY: "scroll" }}>
                    {basesQuery.data!.filter(b => b.variationId === null).map(base =>
                        <ExerciseInfoListItem
                            bases={[base]}
                            key={'base-' + base.id}
                        />
                    )}
                    {[...groupedBases.keys()].map(variationId =>
                        <ExerciseInfoListItem
                            bases={groupedBases.get(variationId)!}
                            key={'variation-' + variationId}
                        />
                    )}
                </List>
            </Paper>
        )}

        <Alert severity="info" sx={{ mt: 2 }}>
            {t('exercises.identicalExercisePleaseDiscard')}
        </Alert>

        <Grid container>
            <Grid item xs={12} display="flex" justifyContent={"end"}>
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