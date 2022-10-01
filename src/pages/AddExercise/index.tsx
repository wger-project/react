import React from 'react';
import { AddExerciseStepper } from "components/Exercises/Add/AddExerciseStepper";
import { useCanContributeExercises } from "components/User/queries/contribute";
import { NotEnoughRights } from "components/Exercises/Add/NotEnoughRights";

export const AddExercise = () => {
    const contributeQuery = useCanContributeExercises();

    return <>
        {contributeQuery.canContribute
            ? <AddExerciseStepper />
            : <NotEnoughRights />}

    </>;
};