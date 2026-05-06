import { Alert, Box, Button, Grid, Modal, Stack, Typography } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import { LicenseAuthor } from "@/core/forms/LicenseAuthor";
import { LicenseAuthorUrl } from "@/core/forms/LicenseAuthorUrl";
import { LicenseDerivativeSourceUrl } from "@/core/forms/LicenseDerivativeSourceUrl";
import { LicenseObjectUrl } from "@/core/forms/LicenseObjectUrl";
import { LicenseTitle } from "@/core/forms/LicenseTitle";
import { Form, Formik } from "formik";
import { ImageStyleToggle } from "./ImageStyle";
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

                <Grid container spacing={2}>
                    <Grid size={4}>
                        <img
                            style={{ width: "100%", borderRadius: '4px' }}
                            src={image.url}
                            alt="Preview"
                        />
                    </Grid>
                    <Grid size={8}>
                        <Formik
                            // Important: initialValues now come from the 'image' prop
                            initialValues={image}
                            enableReinitialize={true} // Allows form to update if 'image' prop changes
                            onSubmit={onSubmit}
                        >
                            {({ submitForm }) => (
                                <Form>
                                    <Stack spacing={2}>
                                        <LicenseTitle fieldName={'title'} />
                                        <LicenseObjectUrl fieldName={'objectUrl'} />
                                        <LicenseAuthor fieldName={'author'} />
                                        <LicenseAuthorUrl fieldName={'authorUrl'} />
                                        <LicenseDerivativeSourceUrl fieldName={'derivativeSourceUrl'} />
                                        <ImageStyleToggle fieldName={'style'} />
                                        
                                        <Alert icon={<InfoIcon fontSize="inherit" />} severity="info">
                                            By submitting this image, you agree to release it under the <a
                                            href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank"
                                            rel="noreferrer">CC
                                            BY-SA 4.0</a> license. The image must be either your own work or the
                                            author must have released in under
                                            a license compatible with CC BY-SA 4.0.
                                        </Alert>
                                    </Stack>

                                    <Stack direction="row" sx={{ justifyContent: "end", mt: 2 }}>
                                        <Button 
                                            variant="contained" 
                                            onClick={submitForm}
                                            data-testid="submit-edit-image-form"
                                        >
                                            {submitLabel}
                                        </Button>
                                    </Stack>
                                </Form>
                            )}
                        </Formik>
                    </Grid>
                </Grid>
            </Box>
        </Modal>
    );
};