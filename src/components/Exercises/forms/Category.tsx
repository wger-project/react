import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useCategoriesQuery } from "components/Exercises/queries";
import { useProfileQuery } from "components/User/queries/profile";
import React from "react";
import { useTranslation } from "react-i18next";
import { editExercise } from "services";

export function EditExerciseCategory(props: { exerciseId: number, initial: number }) {
    const { t } = useTranslation();
    const [value, setValue] = React.useState<string>(props.initial.toString());
    const categoryQuery = useCategoriesQuery();
    const profileQuery = useProfileQuery();

    const handleOnChange = async (e: SelectChangeEvent) => {
        setValue(e.target.value);
        await editExercise(props.exerciseId, {
            category: parseInt(e.target.value),

            // eslint-disable-next-line camelcase
            license_author: profileQuery.data!.username
        });
    };

    return categoryQuery.isSuccess
        ? <FormControl fullWidth>
            <InputLabel id="label-category">{t("category")}</InputLabel><Select
            labelId="label-category"
            id="category"
            label={t("category")}
            value={value}
            onChange={handleOnChange}
        >
            {categoryQuery.data!.map(category => (
                <MenuItem key={category.id} value={category.id}>
                    {category.translatedName}
                </MenuItem>
            ))}
        </Select>
        </FormControl>
        : null;
}