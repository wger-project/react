import React from "react";
import {
    Avatar,
    AvatarGroup,
    Box,
    Button,
    Grid,
    List,
    ListItem,
    ListItemButton,
    Switch,
    Typography
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useBasesQuery } from "components/Exercises/queries";
import { addExerciseDataType, ExerciseBase } from "components/Exercises/models/exerciseBase";
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";

//const ExerciseInfoListItem = () =>

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
const ExerciseInfoListItem = ({ bases, setNewExerciseData, newExerciseData }: {
    bases: ExerciseBase[],
    setNewExerciseData: React.Dispatch<React.SetStateAction<addExerciseDataType>>;
    newExerciseData: addExerciseDataType
}) => {

    const variationId = bases[0].variationId!;
    const MAX_EXERCISE_IMAGES = 4;
    const MAX_EXERCISE_NAMES = 5;

    const handleToggle = (variationId: number | null) => () => {

        if (variationId === newExerciseData.variationId) {
            variationId = null;
        }

        setNewExerciseData({
            ...newExerciseData,
            variationId: variationId,
        });
    };

    return <ListItem>
        <ListItemButton onClick={handleToggle(variationId)}>
            <Grid container>
                <Grid item xs={3} display="flex" justifyContent={"start"} alignItems={"center"}>
                    <AvatarGroup max={MAX_EXERCISE_IMAGES}>
                        {bases.map((base) => <Avatar key={base.id}
                                                     src={base.mainImage ? base.mainImage.url : "https://mui.com/static/images/cards/contemplative-reptile.jpg"}
                        />)}
                    </AvatarGroup>
                </Grid>
                <Grid item xs={7}>
                    { /* map the bases */}
                    {bases.slice(0, MAX_EXERCISE_NAMES).map((base) =>
                        <p style={{ margin: 0 }} key={base.id}>{base.getTranslation().name}</p>
                    )}
                    {bases.length > MAX_EXERCISE_NAMES ? <p style={{ margin: 0 }}>...</p> : null}
                </Grid>
                <Grid item xs={2}>
                    <Switch
                        key={`variation-${variationId}`}
                        edge="start"
                        checked={newExerciseData.variationId === variationId}
                        tabIndex={-1}
                        disableRipple
                    />
                </Grid>
            </Grid>
        </ListItemButton>
    </ListItem>;
};


export const Step2Variations = ({
                                    onContinue,
                                    onBack,
                                    setNewExerciseData,
                                    newExerciseData,
                                }: StepProps) => {
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
            <LoadingWidget />
        ) : (
            <List style={{ maxHeight: "400px", overflowY: "scroll" }}>
                {[...groupedBases.keys()].map(variationId =>
                    <ExerciseInfoListItem
                        bases={groupedBases.get(variationId)!}
                        key={variationId}
                        setNewExerciseData={setNewExerciseData}
                        newExerciseData={newExerciseData}
                    />
                )}
            </List>
        )}

        <Box sx={{ mb: 2 }}>
            <div>
                <Button
                    variant="contained"
                    onClick={onContinue}
                    sx={{ mt: 1, mr: 1 }}
                >
                    {t('continue')}
                </Button>
                <Button
                    disabled={false}
                    onClick={onBack}
                    sx={{ mt: 1, mr: 1 }}
                >
                    {t('goBack')}
                </Button>
            </div>
        </Box>
    </>;
};