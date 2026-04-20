import React, { useState } from "react";
import { VariationSelect } from "components/Exercises/forms/VariationSelect";
import { useProfileQuery } from "components/User/queries/profile";
import { editExercise } from "services";

export function EditExerciseVariation(props: { exerciseId: number, initial: string | null }) {
    const [selectedVariationId, setSelectedVariationId] = useState<string | null>(props.initial);
    const [selectedNewVariationExerciseId, setSelectedNewVariationExerciseId] = useState<number | null>(null);
    const profileQuery = useProfileQuery();

    const handleChangeVariationId = async (id: string | null) => {
        setSelectedVariationId(id);
        setSelectedNewVariationExerciseId(null);

        await editExercise(props.exerciseId, {
            // eslint-disable-next-line camelcase
            variation_group: id,
            // eslint-disable-next-line camelcase
            license_author: profileQuery.data!.username
        });
    };

    const handleChangeNewVariationExerciseId = async (id: number | null) => {
        const previousVariationId = selectedVariationId;
        setSelectedNewVariationExerciseId(id);
        setSelectedVariationId(null);

        if (id !== null) {
            // Generate a new variation group UUID and assign both exercises to it
            const variationGroup = crypto.randomUUID();
            try {
                await editExercise(props.exerciseId, {
                    // eslint-disable-next-line camelcase
                    variation_group: variationGroup,
                    // eslint-disable-next-line camelcase
                    license_author: profileQuery.data!.username
                });
                await editExercise(id, {
                    // eslint-disable-next-line camelcase
                    variation_group: variationGroup,
                    // eslint-disable-next-line camelcase
                    license_author: profileQuery.data!.username
                });
                setSelectedVariationId(variationGroup);
                setSelectedNewVariationExerciseId(null);
            } catch {
                // Rollback on failure
                setSelectedVariationId(previousVariationId);
                setSelectedNewVariationExerciseId(null);
            }
        } else {
            try {
                await editExercise(props.exerciseId, {
                    // eslint-disable-next-line camelcase
                    variation_group: null,
                    // eslint-disable-next-line camelcase
                    license_author: profileQuery.data!.username
                });
            } catch {
                setSelectedVariationId(previousVariationId);
            }
        }
    };

    return (
        <VariationSelect
            exerciseId={props.exerciseId}
            selectedVariationId={selectedVariationId}
            selectedNewVariationExerciseId={selectedNewVariationExerciseId}
            onChangeVariationId={handleChangeVariationId}
            onChangeNewVariationExerciseId={handleChangeNewVariationExerciseId}
        />
    );
}
