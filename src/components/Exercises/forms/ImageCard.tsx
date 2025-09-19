import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Box, Button, Card, CardActions, CardMedia } from "@mui/material";
import { ExerciseImage } from "components/Exercises/models/image";
import { useAddExerciseImageQuery, useDeleteExerciseImageQuery } from "components/Exercises/queries";
import { useProfileQuery } from "components/User/queries/profile";
import React from "react";
import { useTranslation } from "react-i18next";

type ImageCardProps = {
    exerciseId: number;
    image: ExerciseImage;
    canDelete: boolean
};

export const ImageEditCard = ({ exerciseId, image, canDelete }: ImageCardProps) => {
    const [t] = useTranslation();
    const deleteImageQuery = useDeleteExerciseImageQuery(exerciseId);

    return <Card>
        <CardMedia
            component="img"
            image={image.url}
            sx={{ height: 120 }}
            alt=""
        />
        <CardActions>
            {canDelete &&
                <Button
                    color="primary"
                    onClick={() => deleteImageQuery.mutate(image.id)}
                >
                    {t('delete')}
                </Button>}
        </CardActions>
    </Card>;
};

type AddImageCardProps = {
    exerciseId: number;
};

export const AddImageCard = ({ exerciseId }: AddImageCardProps) => {

    const [t] = useTranslation();
    const profileQuery = useProfileQuery();
    const addImageQuery = useAddExerciseImageQuery(exerciseId);

    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) {
            return;
        }
        const [uploadedFile] = e.target.files;
        if (profileQuery.isSuccess) {

            await addImageQuery.mutateAsync({
                exerciseId: exerciseId,
                image: uploadedFile,
                imageData: {
                    url: '',
                    file: uploadedFile,
                    author: '',
                    authorUrl: '',
                    title: '',
                    objectUrl: '',
                    derivativeSourceUrl: '',
                    style: ''
                },
            });
        }
    };

    return <Card>
        <CardMedia>
            <Box sx={{ backgroundColor: "lightgray", height: 120 }}
                 display="flex"
                 alignItems="center"
                 justifyContent="center">
                <AddCircleIcon sx={{ fontSize: 80, color: "gray" }} />
            </Box>
        </CardMedia>
        <CardActions>
            <Button component="label">
                {t('add')}
                <input
                    style={{ display: "none" }}
                    id="camera-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileInputChange}
                />
            </Button>
        </CardActions>
    </Card>;
};
