import { AddExerciseStepper, NotEnoughRights } from "@/components/Exercises";
import { useCanContributeExercises } from "@/components/User";
import React from 'react';

export const AddExercise = () => {
    const contributeQuery = useCanContributeExercises();

    return <>
        {contributeQuery.canContribute
            ? <AddExerciseStepper />
            : <NotEnoughRights />}

    </>;
};