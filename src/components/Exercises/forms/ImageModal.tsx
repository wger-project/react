import { Alert, Box, Button, Grid, Modal, Stack, Typography } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import { useAppForm } from "@/core/forms/appForm";
import { submitHandler } from "@/core/forms/formUtils";
import { ImageDropZone } from "./ImageDropZone";
import { ImageIsAiCheckbox, ImageStyleToggle } from "./ImageStyle";
import { useTranslation } from "react-i18next";
import { ImageFormData } from "../models/exercise";

interface ImageFormModalProps {
    open: boolean;
    onClose: () => void;
    // The image data to display and edit (can be a new upload or existing image)
    image: ImageFormData | null;
    // The specific action to take when the user clicks "Save/Add"
    onSubmit: (values: ImageFormData) => void;
    // Change the button text (e.g., "Add" vs "Save Changes")
    submitLabel: string;
}

const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    //border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export const ImageFormModal = ({
                                   open,
                                   onClose,
                                   image,
                                   onSubmit,
                                   submitLabel
}: ImageFormModalProps) => {
    const { t } = useTranslation();

    // If no image is provided, don't render or show a loader
    if (!image) return null;

    return (
        <Modal open={open} onClose={onClose}>
            <Box
              sx={style}
            >
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                    {t('exercises.imageDetails')}
                </Typography>

                {/* The form freezes its default values, so another image gets a fresh form via the key */}
                <ImageForm key={JSON.stringify(image)} image={image} onSubmit={onSubmit} submitLabel={submitLabel} />
            </Box>
        </Modal>
    );
};

const ImageForm = ({ image, onSubmit, submitLabel }: Pick<ImageFormModalProps, 'onSubmit' | 'submitLabel'> & {
    image: ImageFormData,
}) => {
    const { t } = useTranslation();
    const form = useAppForm({
        defaultValues: image,
        onSubmit: async ({ value }) => onSubmit(value),
    });

    return (
        <form onSubmit={submitHandler(form)}>
            <Grid container spacing={2}>
                <Grid size={4}>
                    <form.Subscribe selector={state => state.values.url}>
                        {url => <ImageDropZone
                            url={url}
                            onPick={(file, pickedUrl) => {
                                form.setFieldValue('file', file);
                                form.setFieldValue('url', pickedUrl);
                            }}
                        />}
                    </form.Subscribe>
                </Grid>
                <Grid size={8}>
                    <Stack spacing={2}>
                        <form.AppField name="title">
                            {field => <field.WgerTextField
                                title={t('licenses.originalTitle')}
                                variant="standard"
                            />}
                        </form.AppField>
                        <form.AppField name="objectUrl">
                            {field => <field.WgerTextField
                                title={t('licenses.originalObjectUrl')}
                                variant="standard"
                                fieldProps={{ placeholder: "https://" }}
                            />}
                        </form.AppField>
                        <form.AppField name="author">
                            {field => <field.WgerTextField
                                title={t('licenses.authors')}
                                variant="standard"
                            />}
                        </form.AppField>
                        <form.AppField name="authorUrl">
                            {field => <field.WgerTextField
                                title={t('licenses.authorProfile')}
                                variant="standard"
                                fieldProps={{ placeholder: "https://" }}
                            />}
                        </form.AppField>
                        <form.AppField name="derivativeSourceUrl">
                            {field => <field.WgerTextField
                                title={t('licenses.derivativeSourceUrl')}
                                variant="standard"
                                helperText={t('licenses.derivativeSourceUrlHelper')}
                                fieldProps={{ placeholder: "https://" }}
                            />}
                        </form.AppField>
                        <form.AppField name="style">{() => <ImageStyleToggle />}</form.AppField>
                        <form.AppField name="isAi">{() => <ImageIsAiCheckbox />}</form.AppField>

                        <Alert icon={<InfoIcon fontSize="inherit" />} severity="info">
                            By submitting this image, you agree to release it under the <a
                            href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank"
                            rel="noreferrer">CC
                            BY-SA 4.0</a> license. The image must be either your own work or the
                            author must have released in under
                            a license compatible with CC BY-SA 4.0.
                        </Alert>
                    </Stack>
                </Grid>
            </Grid>

            <Stack direction="row" sx={{ justifyContent: "end", mt: 2 }}>
                <form.Subscribe selector={state => state.values.url}>
                    {url => <Button
                        variant="contained"
                        type="submit"
                        disabled={!url}
                        data-testid="submit-edit-image-form"
                    >
                        {submitLabel}
                    </Button>}
                </form.Subscribe>
            </Stack>
        </form>
    );
};
