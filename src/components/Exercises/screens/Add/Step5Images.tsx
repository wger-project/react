import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useExerciseSubmissionStateValue } from "@/components/Exercises/screens/Add/state";
import { setImages } from "@/components/Exercises/screens/Add/state/exerciseSubmissionReducer";

const emptyImageFormData = (): ImageFormData => ({
    url: '',
    file: undefined,
    author: '',
    authorUrl: '',
    title: '',
    derivativeSourceUrl: '',
    objectUrl: '',
    style: ImageStyle.PHOTO,
    isAi: false,
});

export const Step5Images = ({ onContinue, onBack }: StepProps) => {
    const [t] = useTranslation();

    const [state, dispatch] = useExerciseSubmissionStateValue();
    const [localImages, setLocalImages] = useState<ImageFormData[]>(state.images);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        dispatch(setImages(localImages));
    }, [dispatch, localImages]);

    const handleAddFullImage = (data: ImageFormData) => {
        setLocalImages(prevImages => prevImages.concat(data));
        setOpenModal(false);
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
                onClose={() => setOpenModal(false)}
                image={openModal ? emptyImageFormData() : null}
                onSubmit={handleAddFullImage}
                submitLabel={t('add')}
            />
            <Typography>
                {t("exercises.compatibleImagesCC")}

            </Typography>
            <Stack direction={"row"} sx={{ justifyContent: "center" }}>
                <Button
                    variant="outlined"
                    startIcon={<AddPhotoAlternateIcon />}
                    onClick={() => setOpenModal(true)}
                    sx={{ m: 2 }}
                >
                    {t('exercises.addImage')}
                </Button>
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
