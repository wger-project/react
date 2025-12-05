import { Button, Card, CardActions, CardContent, CardHeader } from "@mui/material";
import { WgerModal } from "components/Core/Modals/WgerModal";
import { OverviewEmpty } from "components/Core/Widgets/OverviewEmpty";
import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";

export const EmptyCard = (props: {
    title: string,
    link?: string,
    modalTitle?: string,
    modalContent?: ReactElement
}) => {

    const [t] = useTranslation();

    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);


    const button = props.link !== undefined
        ? <Button size="small"
                  variant="contained"
                  href={props.link}>
            {t('add')}
        </Button>
        : <Button
            size="small"
            variant="contained"
            onClick={handleOpenModal}>
            {t('add')}
        </Button>;

    return (<>
        <Card sx={{ paddingTop: 0, height: "100%", }}>
            <CardHeader
                title={props.title}
                subheader={'.'}
                sx={{ paddingBottom: 0 }} />

            <CardContent>
                <OverviewEmpty height={'50%'} />
            </CardContent>

            <CardActions>
                {button}
            </CardActions>
        </Card>
        <WgerModal
            title={t('add')}
            isOpen={openModal}
            closeFn={handleCloseModal}>
            {props.modalContent!}
        </WgerModal>
    </>);
};