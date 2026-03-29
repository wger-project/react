import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { SsidChart } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
    Button,
    ButtonGroup,
    IconButton,
    Typography,
    useTheme
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { LoadingProgressIcon } from "components/Core/LoadingWidget/LoadingWidget";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { makeLink, WgerLink } from "utils/url";


export const SlotHeader = (props: {
    slot: Slot,
    index: number,
    dragHandleProps: DraggableProvidedDragHandleProps | null | undefined,
    routineId: number,
    onDelete: (slotId: number) => void,
    onAddSuperset: (slotId: number) => void,
    addSupersetIsPending: boolean,
}) => {
    const [t, i18n] = useTranslation();
    const theme = useTheme();

    return (
        <Grid
            sx={{
                backgroundColor: theme.palette.common.white,
            }}
            size={12}>
            <Grid container justifyContent="space-between" alignItems="center">
                <Grid>
                    <Typography variant={"h6"}>
                        <IconButton {...props.dragHandleProps}>
                            <DragIndicatorIcon />
                        </IconButton>

                        <IconButton onClick={() => props.onDelete(props.slot.id!)}>
                            <DeleteIcon />
                        </IconButton>
                        {props.slot.entries.length > 1 ? t('routines.supersetNr', { number: props.index + 1 }) : t('routines.exerciseNr', { number: props.index + 1 })}
                    </Typography>
                </Grid>

                <Grid>
                    {props.slot.entries.length > 0 && <ButtonGroup variant="outlined">
                        <Button
                            onClick={() => props.onAddSuperset(props.slot.id!)}
                            size={"small"}
                            disabled={props.addSupersetIsPending}
                            startIcon={props.addSupersetIsPending ?
                                <LoadingProgressIcon /> :
                                <AddIcon />}
                        >
                            {t('routines.addSuperset')}
                        </Button>

                        {props.slot.entries.length > 0 &&
                            <Button
                                startIcon={<SsidChart />}
                                component={Link}
                                size={"small"}
                                to={makeLink(WgerLink.ROUTINE_EDIT_PROGRESSION, i18n.language, {
                                    id: props.routineId,
                                    id2: props.slot.id!
                                })}
                            >
                                {t('routines.editProgression')}
                            </Button>
                        }
                    </ButtonGroup>}
                </Grid>
            </Grid>
        </Grid>
    );
};
