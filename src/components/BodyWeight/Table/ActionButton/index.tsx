import React from 'react';
import { ProcessedWeight } from '..';
import { Button, Card, CardActions, CardContent, CardHeader, Menu, MenuItem, Modal } from "@mui/material";
import { Trans } from "react-i18next";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { WeightForm } from "components/BodyWeight/Form";

interface ActionButtonProps {
    weight: ProcessedWeight
}

export const ActionButton = ({ weight }: ActionButtonProps) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [openModal, setOpenModal] = React.useState(false);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        console.log("Edit clicked");
        handleClose();
        handleOpenModal();
    };

    const handleDelete = () => {
        console.log("Delete clicked");
        handleClose();
    };

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        p: 2,
        minWidth: '400px'
    };


    return (
        <div>
            <Button onClick={handleClick}>
                <ArrowDropDownIcon/>
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem onClick={handleEdit}><Trans i18nKey={"edit"}/></MenuItem>
                <MenuItem onClick={handleDelete}><Trans i18nKey={"delete"}/></MenuItem>
            </Menu>
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Card sx={style}>
                    <CardHeader title="Title" subheader="September 14, 2016"/>
                    <CardContent>
                        <WeightForm/>
                        <p>Content goes here...</p>
                    </CardContent>
                    <CardActions>
                        <Button size="small" onClick={handleCloseModal}>Close</Button>
                    </CardActions>
                </Card>
            </Modal>
        </div>
    );
};
