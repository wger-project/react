import { Box, Button, Typography } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@mui/styles";
import { addExerciseDataType } from "../models/exerciseBase";

const useStyles = makeStyles({
	root: {
		marginTop: "2rem",
	},
	icons: {
		// some CSS that accesses the theme
		// backgroundColor: "green",
		display: "flex",
		justifyContent: "center",
		gap: "2rem",
	},
	svg: {
		height: "6vh",
		cursor: "pointer",
	},
	images: {
		display: "grid",
		gridTemplateColumns: "1fr 1fr",
		gap: "0.5rem",
		margin: "1rem auto",
	},
	imageWrapper: {
		position: "relative",
		width: "30vw",
	},
	image: {
		width: "100%",
		height: "100%",
		objectFit: "cover",
		borderRadius: "0.5rem",
	},
	deleteIcon: {
		position: "absolute",
		bottom: "1rem",
		right: "1rem",
		height: "3rem",
		width: "3rem",
		color: "#fff",
		cursor: "pointer",
	},
});

type Step5BasicsProps = {
	onContinue: () => void;
	onBack: () => void;
	setNewExerciseData: React.Dispatch<React.SetStateAction<addExerciseDataType>>;
	newExerciseData: addExerciseDataType;
};

export const Step5Images = ({
	setNewExerciseData,
	newExerciseData,
	onContinue,
	onBack,
}: Step5BasicsProps) => {
	const [t] = useTranslation();
	const classes = useStyles();
	const [imagesURLS, setImagesURLS] = useState<string[]>([]);

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files?.length) {
			return;
		}
		const [uploadedFile] = e.target.files;
		const objectURL = URL.createObjectURL(uploadedFile);

		setImagesURLS(imagesURLS?.concat(objectURL));
	};

	const handleDeleteImage = (imageURL: string) => {
		const updatedImagesURLS = imagesURLS.filter(i => i !== imageURL);
		setImagesURLS(updatedImagesURLS);
	};

	const handleContinue = () => {
		setNewExerciseData({ ...newExerciseData, images: imagesURLS });
		onContinue();
	};

	return (
		<div className={classes.root}>
			<Typography>
				Images must be compatible with the CC BY SA license. If in doubt, upload
				only photos you've taken yourself.
			</Typography>
			<div className={classes.icons}>
				<div>
					<label htmlFor="camera-input">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className={classes.svg}
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
								clipRule="evenodd"
							/>
						</svg>
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
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className={classes.svg}
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
								clipRule="evenodd"
							/>
						</svg>
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
			</div>
			<div className={classes.images}>
				{imagesURLS?.map(imageURL => {
					return (
						<div key={imageURL} className={classes.imageWrapper}>
							<img className={classes.image} src={imageURL} alt={imageURL} />
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className={classes.deleteIcon}
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={1}
								onClick={() => handleDeleteImage(imageURL)}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
						</div>
					);
				})}
			</div>
			<Typography>
				Only JPEG, PNG and WEBP files below 20Mb are supported
			</Typography>
			<Box sx={{ mb: 2 }}>
				<div>
					<Button
						variant="contained"
						onClick={handleContinue}
						sx={{ mt: 1, mr: 1 }}
					>
						{t("continue")}
					</Button>
					<Button disabled={false} onClick={onBack} sx={{ mt: 1, mr: 1 }}>
						{t("back")}
					</Button>
				</div>
			</Box>
		</div>
	);
};
