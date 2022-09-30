import { useTranslation } from "react-i18next";
import { Autocomplete, TextField } from "@mui/material";
import React from "react";
import { getTranslationKey } from "utils/strings";
import { useEquipmentQuery } from "components/Exercises/queries";
import { editExerciseBase } from "services/exerciseBase";
import { useProfileQuery } from "components/User/queries/profile";

export function EditExerciseEquipment(props: { baseId: number, initial: number[] }) {
    const { t } = useTranslation();
    const [value, setValue] = React.useState<number[]>(props.initial);
    const equipmentQuery = useEquipmentQuery();
    const profileQuery = useProfileQuery();

    const handleOnChange = async (newValue: number[]) => {
        setValue(newValue);
        
        // eslint-disable-next-line camelcase
        await editExerciseBase(props.baseId, { equipment: newValue, license_author: profileQuery.data!.username });
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