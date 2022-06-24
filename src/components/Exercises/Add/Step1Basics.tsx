import React from "react";
import {
	Autocomplete,
	Box,
	Button,
	Chip,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { Form, Formik } from "formik";
import { addExerciseDataType } from "components/Exercises/models/exerciseBase";
import {
	useCategoriesQuery,
	useMusclesQuery,
} from "components/Exercises/queries";
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { Muscle } from "components/Exercises/models/muscle";
import { getTranslationKey } from "utils/strings";

type Step1BasicsProps = {
	onContinue: () => void;
	setNewExerciseData: React.Dispatch<React.SetStateAction<addExerciseDataType>>;
	newExerciseData: addExerciseDataType;
};

export const Step1Basics = ({
	onContinue,
	setNewExerciseData,
	newExerciseData,
}: Step1BasicsProps) => {
	const [t] = useTranslation();

	const [alternativeNamesEn, setAlternativeNamesEn] = React.useState<string[]>(
		newExerciseData.alternativeNamesEn
	);

	const [musclesState, setMuscleState] = React.useState<Muscle[]>();

	const categoryQuery = useCategoriesQuery();
	const musclesQuery = useMusclesQuery();

	const validationSchema = yup.object({
		nameEn: yup
			.string()
			.min(5, t("forms.value-too-short"))
			.max(40, t("forms.value-too-long"))
			.required(t("forms.field-required")),
		newAlternativeNameEn: yup
			.string()
			.min(5, t("forms.value-too-short, min 5 letters"))
			.max(40, t("forms.value-too-long")),
		category: yup.number().required(),
	});

	return (
		<Formik
			initialValues={{
				nameEn: newExerciseData.nameEn,
				newAlternativeNameEn: "",
				category: newExerciseData.category,
				muscles: [0],
			}}
			validationSchema={validationSchema}
			onSubmit={values => {
				setNewExerciseData({
					...newExerciseData,
					nameEn: values.nameEn,
					category: values.category,
				});

				if (values.newAlternativeNameEn) {
					setNewExerciseData({
						...newExerciseData,
						alternativeNamesEn: [
							...alternativeNamesEn,
							values.newAlternativeNameEn,
						],
					});
				}

				if (values.muscles) {
					setNewExerciseData({
						...newExerciseData,
						muscles: [...values.muscles],
					});
				}

				onContinue();
			}}
		>
			{formik => {
				return (
					<Form>
						<Typography>Help text goes here</Typography>
						<Stack spacing={2}>
							<TextField
								id="nameEn"
								label="Name"
								variant="standard"
								error={Boolean(formik.errors.nameEn && formik.touched.nameEn)}
								helperText={
									Boolean(formik.errors.nameEn && formik.touched.nameEn)
										? formik.errors.nameEn
										: ""
								}
								{...formik.getFieldProps("nameEn")}
							/>

							<Autocomplete
								multiple
								id="tags-filled"
								options={alternativeNamesEn}
								freeSolo
								value={alternativeNamesEn}
								onChange={(event, newValue) => {
									setAlternativeNamesEn(newValue);
								}}
								renderTags={(value: readonly string[], getTagProps) =>
									value.map((option: string, index: number) => (
										<Chip label={option} {...getTagProps({ index })} />
									))
								}
								renderInput={params => (
									<TextField
										{...params}
										id="newAlternativeNameEn"
										variant="standard"
										label="Alternative names"
										value={formik.getFieldProps("newAlternativeNameEn").value}
										onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
											formik.setFieldValue(
												formik.getFieldProps("newAlternativeNameEn").name,
												event.target.value
											);
										}}
										error={Boolean(
											formik.touched.newAlternativeNameEn &&
												formik.errors.newAlternativeNameEn
										)}
										helperText={
											Boolean(
												formik.errors.newAlternativeNameEn &&
													formik.touched.newAlternativeNameEn
											)
												? formik.errors.newAlternativeNameEn
												: ""
										}
									/>
								)}
							/>

							{categoryQuery.isLoading ? (
								<Box>
									<LoadingWidget />
								</Box>
							) : (
								<FormControl fullWidth>
									<InputLabel id="label-category">Category</InputLabel>
									<Select
										labelId="label-category"
										id="category"
										value={formik.getFieldProps("category").value}
										onChange={e => {
											formik.setFieldValue(
												formik.getFieldProps("category").name,
												e.target.value
											);
											// setCategory(e.target.value);
										}}
										label="Category"
										error={Boolean(
											formik.touched.category && formik.errors.category
										)}
									>
										<MenuItem value=""></MenuItem>
										{categoryQuery.data!.map(category => (
											<MenuItem key={category.id} value={category.id}>
												{t(getTranslationKey(category.name))}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							)}
							{musclesQuery.isLoading ? (
								<Box>
									<LoadingWidget />
								</Box>
							) : (
								<Autocomplete
									multiple
									id="tags-standard"
									options={musclesQuery.data!}
									getOptionLabel={option => option.name}
									value={musclesState}
									isOptionEqualToValue={(option, value) =>
										option.id === value.id
									}
									onChange={(event, newValue) => {
										setMuscleState(newValue);
									}}
									renderInput={params => (
										<TextField
											{...params}
											variant="standard"
											label={t("exercises.muscles")}
											value={formik.getFieldProps("muscles").value}
											onChange={e => {
												console.log("event.target.value: ", e.target.value);

												formik.setFieldValue(
													formik.getFieldProps("muscles").name,
													e.target.value
												);
											}}
										/>
									)}
								/>
							)}
							{musclesQuery.isLoading ? (
								<Box>
									<LoadingWidget />
								</Box>
							) : (
								<Autocomplete
									multiple
									// freeSolo
									id="tags-standard"
									options={musclesQuery.data!}
									getOptionLabel={option => option.name}
									renderInput={params => (
										<TextField
											{...params}
											variant="standard"
											label={t("exercises.secondaryMuscles")}
											value={formik.getFieldProps("muscles").value}
										/>
									)}
								/>
							)}
						</Stack>

						<Box sx={{ mb: 2 }}>
							<div>
								<Button variant="contained" type="submit" sx={{ mt: 1, mr: 1 }}>
									{t("continue")}
								</Button>
								<Button disabled={true} sx={{ mt: 1, mr: 1 }}>
									{t("back")}
								</Button>
							</div>
						</Box>
					</Form>
				);
			}}
		</Formik>
	);
};
