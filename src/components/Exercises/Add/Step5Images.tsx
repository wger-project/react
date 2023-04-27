import {
    Box,
    Button,
    Grid,
    IconButton,
    ImageListItem,
    ImageListItemBar,
    Modal,
    Stack,
    Typography
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CollectionsIcon from '@mui/icons-material/Collections';
import ImageList from '@mui/material/ImageList';
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { ImageFormData } from "components/Exercises/models/exerciseBase";
import { useExerciseStateValue } from "state";
import { setImages } from "state/exerciseReducer";
import { Form, Formik } from "formik";
import { LicenseAuthor } from "components/Common/forms/LicenseAuthor";
import { LicenseTitle } from "components/Common/forms/LicenseTitle";
import { LicenseObjectUrl } from "components/Common/forms/LicenseObjectUrl";
import { LicenseAuthorUrl } from "components/Common/forms/LicenseAuthorUrl";
import { ImageStyleToggle } from "components/Exercises/forms/ImageStyle";
import { LicenseDerivativeSourceUrl } from "components/Common/forms/LicenseDerivativeSourceUrl";

export const Step5Images = ({ onContinue, onBack }: StepProps) => {
    const [t] = useTranslation();
    const [state, dispatch] = useExerciseStateValue();
    const [localImages, setLocalImages] = useState<ImageFormData[]>(state.images);
    const [popupImage, setPopupImage] = useState<ImageFormData | undefined>(undefined);

    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    useEffect(() => {
        dispatch(setImages(localImages));
    }, [dispatch, localImages]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) {
            return;
        }
        const [uploadedFile] = e.target.files;
        const objectURL = URL.createObjectURL(uploadedFile);

        setOpenModal(true);

        setPopupImage({ url: objectURL, file: uploadedFile });
        //setLocalImages(localImages?.concat({ url: objectURL, file: uploadedFile }));
    };

    const handleDeleteImage = (imageURL: string) => {
        const updatedImagesURLS = localImages.filter(i => i.url !== imageURL);
        setLocalImages(updatedImagesURLS);
    };

    const handleContinue = () => {
        onContinue!();
    };

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'background.paper',
        //border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    return (
        <div>
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >

                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Image details
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            {popupImage && <img
                                style={{ width: "100%", }}
                                src={popupImage.url}
                                alt=""
                                loading="lazy"
                            />}
                        </Grid>
                        <Grid item xs={8}>
                            <Formik
                                initialValues={{
                                    nameEn: state.nameEn,
                                    newAlternativeNameEn: state.alternativeNamesEn,
                                    category: state.category !== null ? state.category : '',
                                    muscles: state.muscles,
                                    equipment: state.equipment,
                                    musclesSecondary: state.musclesSecondary,
                                }}
                                onSubmit={values => {

                                }}
                            >
                                {formik => {
                                    return (
                                        <Form>
                                            <Stack spacing={2}>
                                                <LicenseAuthor fieldName={'licenseAuthor'} />
                                                <LicenseAuthorUrl fieldName={'licenseAuthorUrl'} />
                                                <LicenseTitle fieldName={'licenseTitle'} />
                                                <LicenseObjectUrl fieldName={'licenseObjectUrl'} />
                                                <LicenseDerivativeSourceUrl fieldName={'licenseDerivativeSourceUrl'} />
                                                <ImageStyleToggle fieldName={'imageStyle'} />
                                            </Stack>
                                        </Form>
                                    );
                                }}
                            </Formik>
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                            </Typography>
                        </Grid>
                    </Grid>


                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                    </Typography>
                </Box>
            </Modal>

            <Typography>
                {t("exercises.compatibleImagesCC")}

            </Typography>
            <Stack direction={"row"} justifyContent="center">
                <div>
                    <label htmlFor="camera-input">
                        <CameraAltIcon fontSize="large" sx={{ m: 2 }} />
                    </label>
                    <input
                        style={{ display: "none" }}
                        id="camera-input"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="image-input">
                        <CollectionsIcon fontSize="large" sx={{ m: 2 }} />
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        name="image-file"
                        id="image-input"
                        style={{ display: "none" }}
                        onChange={handleFileInputChange}
                    />
                </div>
            </Stack>
            <ImageList
                cols={3}
                style={{ maxHeight: "400px", }}>
                {localImages.map(imageEntry => (
                    <ImageListItem key={imageEntry.url}>
                        <img
                            style={{ maxHeight: "400px", maxWidth: "400px" }}
                            src={imageEntry.url}
                            alt=""
                            loading="lazy"
                        />
                        <ImageListItemBar

                            actionIcon={
                                <IconButton
                                    // title="abc"
                                    // subtitle="def"
                                    onClick={() => handleDeleteImage(imageEntry.url)}
                                    sx={{ color: 'white' }}
                                >
                                    <DeleteOutlineIcon />
                                </IconButton>
                            }
                        />
                    </ImageListItem>
                ))}
            </ImageList>
            <Typography>
                {t("forms.supportedImageFormats")}
            </Typography>
            <Grid container>
                <Grid item xs={12} display="flex" justifyContent={"end"}>
                    <Box sx={{ mb: 2 }}>
                        <div>
                            <Button
                                onClick={onBack}
                                sx={{ mt: 1, mr: 1 }}
                            >
                                {t('goBack')}
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleContinue}
                                sx={{ mt: 1, mr: 1 }}
                            >
                                {t('continue')}
                            </Button>
                        </div>
                    </Box>
                </Grid>
            </Grid>
        </div>
    );
};
