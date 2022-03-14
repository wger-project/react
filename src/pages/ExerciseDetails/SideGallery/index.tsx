import React from 'react';
import styles from './side_gallery.module.css';

export const SideGallery = () => {
  return (
    <div className={styles.side_gallery}>
        <div className={styles.main_image}>
            <img  style={{width: "100%"}} src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80" alt="detail" />
        </div>
        <div className={styles.secondary_images}>
            <div className={styles.image_thumb}>
                <img  style={{width: "100%"}} src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80" alt="detail" />
            </div>
            <div className={styles.image_thumb}>
                <img  style={{width: "100%"}} src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80" alt="detail" />
            </div>
            <div className={styles.image_thumb}>
                <img  style={{width: "100%"}} src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80" alt="detail" />
            </div>
            <div className={styles.image_thumb}>
                <img  style={{width: "100%"}} src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80" alt="detail" />
            </div>
        </div>
    </div>
  );
};
