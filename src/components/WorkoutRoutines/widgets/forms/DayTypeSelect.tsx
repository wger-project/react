import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useField } from "formik";
import { useTranslation } from "react-i18next";

interface DayTypeSelectProps {
    fieldName: string,
    title: string,
}

export const DayTypeSelect = (props: DayTypeSelectProps) => {
    const { t } = useTranslation();
    const [field] = useField(props.fieldName);
    const options = [
        {
            value: 'custom',
            label: t('routines.day.custom'),
        },
        {
            value: 'enom',
            label: t('routines.day.enom'),
        },
        {
            value: 'amrap',
            label: t('routines.day.amrap'),
        },
        {
            value: 'hiit',
            label: t('routines.day.hiit'),
        },
        {
            value: 'tabata',
            label: t('routines.day.tabata'),
        },
        {
            value: 'edt',
            label: t('routines.day.edt'),
        },
        {
            value: 'rft',
            label: t('routines.day.rft'),
        },
        {
            value: 'afap',
            label: t('routines.day.afap'),
        }
    ] as const;


    return <>
        <TextField
            fullWidth
            select
            label={t('routines.set.type')}
            variant="standard"
            {...field}
        >
            {options!.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.value.toUpperCase()} - <small>{option.label}</small>
                </MenuItem>
            ))}
        </TextField>
    </>;
};
