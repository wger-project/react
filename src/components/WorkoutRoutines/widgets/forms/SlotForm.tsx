import { TextField } from "@mui/material";
import { LoadingProgressIcon } from "components/Core/LoadingWidget/LoadingWidget";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { useEditSlotQuery } from "components/WorkoutRoutines/queries/slots";
import React, { useState } from "react";
import { useDebounce } from "use-debounce";

export const SlotForm = (props: { slot: Slot, routineId: number }) => {
    const editSlotQuery = useEditSlotQuery(props.routineId);
    const [slotComment, setSlotComment] = useState<string>(props.slot.comment);
    const [debouncedSlotData] = useDebounce(slotComment, 500);
    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (value: string) => {
        setIsEditing(true);
        setSlotComment(value);
    };

    const handleBlur = () => {
        if (isEditing) {
            editSlotQuery.mutate({ id: props.slot.id, comment: debouncedSlotData });
            setIsEditing(false);
        }
    };

    return (
        <>
            <TextField
                label="Comment"
                variant="standard"
                fullWidth
                size={"small"}
                value={slotComment}
                disabled={editSlotQuery.isLoading}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur} // Call handleBlur when input loses focus
                InputProps={{
                    endAdornment: editSlotQuery.isLoading && <LoadingProgressIcon />,
                }}
            />
        </>
    );
};