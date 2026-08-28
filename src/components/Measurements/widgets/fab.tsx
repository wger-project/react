import React from "react";
import { CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import { WgerFab } from "@/core/ui/Widgets/Fab";
import { WgerModal } from "@/core/ui/Modals/WgerModal";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { NewCategoryPicker } from "@/components/Measurements/widgets/MetricPicker";
import { EntryForm, GroupEntryForm } from "@/components/Measurements/widgets/EntryForm";
import { WeightForm } from "@/components/Measurements/widgets/WeightForm";

/**
 * @param isLoading whether the overview is (re)reading its categories. A new
 * category invalidates that query, and reading the histories again takes long
 * enough that the button has to say so instead of looking idle.
 */
export const AddMeasurementCategoryFab = ({ isLoading = false }: { isLoading?: boolean }) => {
    const [t] = useTranslation();
    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);


    return (
        <div>
            <WgerFab onClick={handleOpenModal} disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
            </WgerFab>
            {/* The picker turns into the category form, and that form grows
              * with what is picked in it */}
            <WgerModal title={t('add')} isOpen={openModal} closeFn={handleCloseModal} stableHeight>
                <NewCategoryPicker closeFn={handleCloseModal} />
            </WgerModal>
        </div>
    );
};

export const AddMeasurementEntryFab = ({ category }: { category: MeasurementCategory }) => {
    const [t] = useTranslation();
    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    // The entries of a calculated category are maintained by the server
    if (category.isCalculated) {
        return null;
    }

    return (<>
        <WgerFab onClick={handleOpenModal}>
            <AddIcon />
        </WgerFab>
        <WgerModal title={t('add')} isOpen={openModal} closeFn={handleCloseModal}>
            {category.isGroup
                ? <GroupEntryForm closeFn={handleCloseModal} group={category} />
                : <EntryForm closeFn={handleCloseModal} category={category} />}
        </WgerModal>
    </>);
};

export const AddBodyWeightEntryFab = () => {
    const [t] = useTranslation();
    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    return (
        <div>
            <WgerFab onClick={handleOpenModal}>
                <AddIcon />
            </WgerFab>
            <WgerModal title={t('add')} isOpen={openModal} closeFn={handleCloseModal}>
                <WeightForm closeFn={handleCloseModal} />
            </WgerModal>
        </div>
    );
};
