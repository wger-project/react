import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Box, Button, Card, CardActions, CardMedia } from "@mui/material";
import { ExerciseVideo } from "components/Exercises/models/video";
import { useProfileQuery } from "components/User/queries/profile";
import React from "react";
import { useTranslation } from "react-i18next";
import { deleteExerciseVideo, postExerciseVideo } from "services";
import { useAddExerciseVideoQuery } from "../queries";

type VideoCardProps = {
    video: ExerciseVideo;
    canDelete: boolean;
};

export const VideoEditCard = ({ video, canDelete }: VideoCardProps) => {
    const [t] = useTranslation();

    return <Card>
        <CardMedia
            component={'video'}
            src={video.url}
            sx={{ height: 120 }}
            controls
            preload="metadata"
        />
            <CardActions>
            {canDelete &&
                <Button
                    color="primary"
                    onClick={() => deleteExerciseVideo(video.id)}
                >
                    {t('delete')}
                    </Button>
            }
            </CardActions>
    </Card>;
};


type AddVideoCardProps = {
    exerciseId: number;
};

export const AddVideoCard = ({ exerciseId }: AddVideoCardProps) => {

    const [t] = useTranslation();
    const profileQuery = useProfileQuery();
    const addVideoQuery = useAddExerciseVideoQuery(exerciseId);

    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) {
            return;
        }
        const [uploadedFile] = e.target.files;
        if (profileQuery.isSuccess) {
            addVideoQuery.mutate({
                exerciseId: exerciseId,
                video: uploadedFile,
                author: profileQuery.data!.username,
            });
        }
    };

    return (
        <Card>
            <CardMedia>
                <Box
                    sx={{ backgroundColor: "lightgray", height: 120 }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <AddCircleIcon sx={{ fontSize: 80, color: "gray" }} />
                </Box>
            </CardMedia>
            <CardActions>
                <Button component="label">
                    {t("add")}
                    <input
                        style={{ display: "none" }}
                        id="camera-input"
                        type="file"
                        accept="video/*"
                        capture="environment"
                        onChange={handleFileInputChange}
                    />
                </Button>
            </CardActions>
        </Card>
    );
};
