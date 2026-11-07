import { categoryDisplayName, MeasurementCategory } from "@/components/Measurements/models/Category";
import { useReorderMeasurementCategoriesQuery } from "@/components/Measurements/queries";
import { FormQueryErrorsSnackbar } from "@/core/ui/Widgets/FormError";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Drag-and-drop reordering of the top-level measurement categories.
 *
 * Children of multi-value groups are not listed; they keep their in-group
 * order and follow their parent.
 */
export const CategoryReorderList = (props: { categories: MeasurementCategory[] }) => {
    const [t] = useTranslation();

    // The list is kept locally so a drop is reflected immediately, the new
    // order is persisted per drop like in the flutter app
    const [categories, setCategories] = useState(props.categories);
    const reorderQuery = useReorderMeasurementCategoriesQuery();

    const onDragEnd = (result: DropResult) => {
        if (result.destination === null || result.destination.index === result.source.index) {
            return;
        }

        const reordered = [...categories];
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);

        // Shown in the new order right away, and put  back where it was if the
        // server refuses: a silent revert on the next load looks like a bug
        const previous = categories;
        setCategories(reordered);
        reorderQuery.mutate(reordered, { onError: () => setCategories(previous) });
    };

    return <DragDropContext onDragEnd={onDragEnd}>
        <FormQueryErrorsSnackbar mutationQuery={reorderQuery} />
        <Droppable droppableId="categoryReorderDroppable">
            {(provided) => (
                <List ref={provided.innerRef} {...provided.droppableProps}>
                    {categories.map((category, index) => (
                        <Draggable draggableId={category.id!} index={index} key={category.id}>
                            {(providedDraggable) => (
                                <ListItem
                                    ref={providedDraggable.innerRef}
                                    {...providedDraggable.draggableProps}
                                    {...providedDraggable.dragHandleProps}
                                >
                                    <ListItemIcon>
                                        <DragHandleIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={categoryDisplayName(category, t)}
                                        secondary={category.unit} />
                                </ListItem>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </List>
            )}
        </Droppable>
    </DragDropContext>;
};
