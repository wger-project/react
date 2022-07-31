import React, { useState } from "react";
import {
    Avatar,
    AvatarGroup,
    Box,
    Button,
    Divider,
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
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { LoadingPlaceholder } from "components/Exercises/ExerciseOverview";

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

    const variationId = bases[0].variationId;
    const MAX_EXERCISE_IMAGES = 4;
    const MAX_EXERCISE_NAMES = 5;
    const [showMore, setShowMore] = useState<boolean>(false);

    const handleToggle = (variationId: number | null, newVariationId: number | null) => () => {

        if (variationId !== null) {
            if (variationId === newExerciseData.variationId) {
                variationId = null;
            }
        } else {
            if (newVariationId === newExerciseData.newVariationBaseId) {
                newVariationId = null;
            }
        }

        setNewExerciseData({
            ...newExerciseData,
            variationId: variationId,
            newVariationBaseId: newVariationId
        });
    };

    let isChecked = false;
    if (variationId === null) {
        isChecked = newExerciseData.newVariationBaseId === bases[0].id;
    } else {
        isChecked = variationId === newExerciseData.variationId;
    }

    return <ListItem>
        <ListItemButton onClick={handleToggle(variationId, bases[0].id)}>
            <Grid container>
                <Grid item xs={3} display="flex" justifyContent={"start"} alignItems={"center"}>
                    <AvatarGroup max={MAX_EXERCISE_IMAGES} spacing={"small"}>
                        {bases.map((base) => <Avatar key={base.id}
                                                     src={base.mainImage ? base.mainImage.url : "https://mui.com/static/images/cards/contemplative-reptile.jpg"}
                        />)}
                    </AvatarGroup>
                </Grid>
                <Grid item xs={7}>
                    { /* map the bases */}
                    {bases.slice(0, showMore ? bases.length : MAX_EXERCISE_NAMES).map((base) =>
                        <p style={{ margin: 0 }} key={base.id}>{base.getTranslation().name}</p>
                    )}
                    {!showMore && bases.length > MAX_EXERCISE_NAMES ?
                        <p style={{ margin: 0 }} onMouseEnter={() => console.log(setShowMore(true))}>...</p> : null}
                </Grid>
                <Grid item xs={2}>
                    <Switch
                        key={`variation-${variationId}`}
                        edge="start"
                        checked={isChecked}
                        tabIndex={-1}
                        disableRipple
                    />
                </Grid>
                <Grid item xs={12} sx={{ pt: 1 }}>
                    <Divider />
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
        //groupedBases = new Map();
    }

    return <>
        <Typography>{t('exercises.whatVariationsExist')}</Typography>

        {basesQuery.isLoading ? (
            <LoadingPlaceholder />
        ) : (
            <List style={{ maxHeight: "400px", overflowY: "scroll" }}>
                {basesQuery.data!.filter(b => b.variationId === null).map(base =>
                    <ExerciseInfoListItem
                        bases={[base]}
                        key={'base-' + base.id}
                        setNewExerciseData={setNewExerciseData}
                        newExerciseData={newExerciseData}
                    />
                )}
                {[...groupedBases.keys()].map(variationId =>
                    <ExerciseInfoListItem
                        bases={groupedBases.get(variationId)!}
                        key={'variation-' + variationId}
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