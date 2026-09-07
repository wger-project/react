import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useFieldContext } from "@/core/forms/formContexts";
import { useTranslation } from "react-i18next";

/** The type of a day, bound to the form field it is rendered in via form.AppField */
export const DayTypeSelect = () => {
    const { t } = useTranslation();
    const field = useFieldContext<string>();
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
            name={field.name}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
        >
            {options!.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.value.toUpperCase()} - <small>{option.label}</small>
                </MenuItem>
            ))}
        </TextField>
    </>;
};
