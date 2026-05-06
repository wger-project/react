import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CollectionsIcon from '@mui/icons-material/Collections';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import {
    Box,
    Button,
    IconButton,
    ImageListItem,
    ImageListItemBar,
    Stack,
    Typography
} from "@mui/material";
import Grid from '@mui/material/Grid';
import ImageList from '@mui/material/ImageList';
import { StepProps } from "@/components/Exercises/screens/Add/AddExerciseStepper";
import { ImageFormModal } from "@/components/Exercises/forms/ImageModal";
import { ImageFormData } from "@/components/Exercises/models/exercise";
import { ImageStyle } from "@/components/Exercises/models/image";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useExerciseSubmissionStateValue } from "@/components/Exercises/screens/Add/state";
import { setImages } from "@/components/Exercises/screens/Add/state/exerciseSubmissionReducer";

export const Step5Images = ({ onContinue, onBack }: StepProps) => {
    const [t] = useTranslation();

    const [state, dispatch] = useExerciseSubmissionStateValue();
    const [localImages, setLocalImages] = useState<ImageFormData[]>(state.images);
    const [selectedImage, setSelectedImage] = useState<ImageFormData | null>(null);

    const [openModal, setOpenModal] = useState(false);
    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedImage(null);
    };

    useEffect(() => {
        dispatch(setImages(localImages));
    }, [dispatch, localImages]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) {
            return;
        }

        const [uploadedFile] = e.target.files;
        const objectURL = URL.createObjectURL(uploadedFile);

        setSelectedImage({
            url: objectURL,
            file: uploadedFile,
            author: "",
            authorUrl: "",
            title: "",
            derivativeSourceUrl: "",
            objectUrl: "",
            style: ImageStyle.PHOTO
        });
        setOpenModal(true);
    };

    const handleAddFullImage = (data: ImageFormData) => {
        setLocalImages(prevImages => prevImages.concat(data));
        handleCloseModal();
    };

    const handleDeleteImage = (imageURL: string) => {
        const updatedImagesURLS = localImages.filter(i => i.url !== imageURL);
        setLocalImages(updatedImagesURLS);
    };

    const handleContinue = () => {
        onContinue!();
    };

    return (
        (<div>
            <ImageFormModal
                open={openModal}
                onClose={handleCloseModal}
                image={selectedImage}
                onSubmit={handleAddFullImage}
                submitLabel={t('add')}
            />
            <Typography>
                {t("exercises.compatibleImagesCC")}

            </Typography>
            <Stack direction={"row"} sx={{ justifyContent: "center" }}>
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
                style={{ maxHeight: "400px" }}>
                {localImages.map(imageEntry => (
                    <ImageListItem key={imageEntry.url}>
                        <img
                            style={{ maxHeight: "400px", maxWidth: "400px" }}
                            src={imageEntry.url}
                            alt=""
                            loading="lazy"
                        />
                        <ImageListItemBar
                            title={imageEntry.title}
                            subtitle={imageEntry.author}
                            actionIcon={
                                <IconButton
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
                <Grid sx={{ display: "flex", justifyContent: "end" }} size={12}>
                    <Box sx={{ mb: 2 }}>
                        <>
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
                        </>
                    </Box>
                </Grid>
            </Grid>
        </div>)
    );
};
