import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Box, Button, Card, CardActions, CardMedia } from "@mui/material";
import { FormQueryErrorsSnackbar } from "@/core/ui/Widgets/FormError";
import { ImageFormModal } from "@/components/Exercises/forms/ImageModal";
import { ImageFormData } from "@/components/Exercises/models/exercise";
import { ExerciseImage, ImageStyle } from "@/components/Exercises/models/image";
import { useAddExerciseImageQuery, useDeleteExerciseImageQuery } from "@/components/Exercises/queries";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

type ImageCardProps = {
    exerciseId: number;
    image: ExerciseImage;
    canDelete: boolean
    onEdit: (image: ExerciseImage) => void;
};

export const ImageEditCard = ({ exerciseId, image, canDelete, onEdit }: ImageCardProps) => {
    const [t] = useTranslation();
    const deleteImageQuery = useDeleteExerciseImageQuery(exerciseId);

    return <Card>
        <CardMedia
            component="img"
            image={image.url}
            sx={{ height: 120 }}
            alt=""
        />
        <CardActions style={{ justifyContent: 'space-between' }}>
            {canDelete &&
                <Button
                    color="primary"
                    onClick={() => deleteImageQuery.mutate(image.id)}
                >
                    {t('delete')}
                </Button>}
            {canDelete &&
                <Button
                    color="primary"
                    onClick={() => onEdit(image)}
                    data-testid={`edit-image-${image.id}`}
                >
                    {t('edit')}
                </Button>
            }
        </CardActions>
    </Card>;
};

type AddImageCardProps = {
    exerciseId: number;
};

const emptyImageFormData = (): ImageFormData => ({
    url: '',
    file: undefined,
    author: '',
    authorUrl: '',
    title: '',
    objectUrl: '',
    derivativeSourceUrl: '',
    style: ImageStyle.PHOTO,
    isAi: false,
});

export const AddImageCard = ({ exerciseId }: AddImageCardProps) => {

    const [t] = useTranslation();
    const addImageQuery = useAddExerciseImageQuery();

    const [openModal, setOpenModal] = useState(false);

    const handleSubmit = (values: ImageFormData) => {
        if (!values.file) {
            return;
        }
        addImageQuery.mutate({
            exerciseId: exerciseId,
            image: values.file,
            imageData: values,
        });
        setOpenModal(false);
    };

    return <>
        <Card>
            <CardMedia>
                <Box sx={{
                    backgroundColor: "lightgray",
                    height: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <AddCircleIcon sx={{ fontSize: 80, color: "gray" }} />
                </Box>
            </CardMedia>
            <CardActions>
                <Button onClick={() => setOpenModal(true)}>
                    {t('add')}
                </Button>
            </CardActions>
        </Card>
        <ImageFormModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            image={openModal ? emptyImageFormData() : null}
            onSubmit={handleSubmit}
            submitLabel={t('add')}
        />
        {addImageQuery.isError &&
            <FormQueryErrorsSnackbar mutationQuery={addImageQuery} />
        }
    </>;
};
