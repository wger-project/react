import { TextField } from "@mui/material";
import { LoadingProgressIcon } from "components/Core/LoadingWidget/LoadingWidget";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { useEditSlotQuery } from "components/WorkoutRoutines/queries";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export const SlotForm = (props: { slot: Slot, routineId: number }) => {
    const { t } = useTranslation();
    const editSlotQuery = useEditSlotQuery(props.routineId);
    const [slotComment, setSlotComment] = useState<string>(props.slot.comment);

    const handleChange = (value: string) => {
        setSlotComment(value);
    };

    const handleBlur = () => {
        editSlotQuery.mutate(Slot.clone(props.slot, { comment: slotComment }));
    };

    return (<>
        <TextField
            label={t('comment')}
            variant="standard"
            fullWidth
            size={"small"}
            value={slotComment}
            disabled={editSlotQuery.isPending}
            onChange={(e) => setSlotComment(e.target.value)}
            onBlur={handleBlur}
            slotProps={{
                input: { endAdornment: editSlotQuery.isPending && <LoadingProgressIcon /> }
            }}
        />
    </>);
};
