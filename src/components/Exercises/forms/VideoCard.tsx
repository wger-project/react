import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Box, Button, Card, CardActions, CardMedia } from "@mui/material";
import { ExerciseVideo } from "components/Exercises/models/video";
import { FormQueryErrorsSnackbar } from "components/Core/Widgets/FormError";
import { useProfileQuery } from "components/User/queries/profile";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAddExerciseVideoQuery, useDeleteExerciseVideoQuery } from "../queries";

type VideoCardProps = {
    exerciseId: number;
    video: ExerciseVideo;
    canDelete: boolean;
};

/**
 * A card component to edit (delete) an existing exercise video
 * Will render MUI's isLoading in the button state while any actions are in progress
 * @param {number} exerciseId - Exercise ID to which the uploaded video will be added to
 * @param {ExerciseVideo} video - The ExerciseVideo object to display
 * @param {boolean} canDelete - Whether the delete button should be shown
 * @returns {JSX.Element} The rendered AddVideoCard component
 */
export const VideoEditCard = ({ exerciseId, video, canDelete }: VideoCardProps) => {
    const [t] = useTranslation();
    const deleteExerciseVideoQuery = useDeleteExerciseVideoQuery(exerciseId);

    const onDeleteClick = () => {
        deleteExerciseVideoQuery.mutate(video.id);
    };

    return (
        <>
            <Card>
                <CardMedia component={"video"} src={video.url} sx={{ height: 120 }} controls preload="metadata" />
                <CardActions>
                    {canDelete && (
                        <Button loading={deleteExerciseVideoQuery.isPending} color="primary" onClick={onDeleteClick}>
                            {t("delete")}
                        </Button>
                    )}
                </CardActions>
            </Card>
            {deleteExerciseVideoQuery.isError && <FormQueryErrorsSnackbar mutationQuery={deleteExerciseVideoQuery} />}
        </>
    );
};

type AddVideoCardProps = {
    exerciseId: number;
};

/**
 * A card component to add a new exercise video
 * Uses the query to handle uploading the video file
 * Will render MUI's isLoading in the button state while the upload is in progress
 * @param {number} exerciseId - Exercise ID to which the uploaded video will be added to
 * @returns {JSX.Element} The rendered AddVideoCard component
 */
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
        <>
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
                    <Button component="label" loading={addVideoQuery.isPending}>
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
            {addVideoQuery.isError && <FormQueryErrorsSnackbar mutationQuery={addVideoQuery} />}
        </>
    );
};
