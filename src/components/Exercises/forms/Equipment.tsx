import { Autocomplete, TextField } from "@mui/material";
import { useEquipmentQuery } from "components/Exercises/queries";
import { useProfileQuery } from "components/User/queries/profile";
import React from "react";
import { useTranslation } from "react-i18next";
import { editExercise } from "services";
import { getTranslationKey } from "utils/strings";

export function EditExerciseEquipment(props: { exerciseId: number, initial: number[] }) {
    const { t } = useTranslation();
    const [value, setValue] = React.useState<number[]>(props.initial);
    const equipmentQuery = useEquipmentQuery();
    const profileQuery = useProfileQuery();

    const handleOnChange = async (newValue: number[]) => {
        setValue(newValue);

        // eslint-disable-next-line camelcase
        await editExercise(props.exerciseId, { equipment: newValue, license_author: profileQuery.data!.username });
    };

    return equipmentQuery.isSuccess
        ? <Autocomplete
            multiple
            value={value}
            options={equipmentQuery.data.map(e => e.id)}
            getOptionLabel={option => t(getTranslationKey(equipmentQuery.data.find(e => e.id === option)!.name))}
            onChange={(event, newValue) => handleOnChange(newValue)}
            renderInput={params => (
                <TextField
                    variant="standard"
                    label={t("exercises.equipment")}
                    value={value}
                    {...params}
                />
            )}
        />
        : null;
}