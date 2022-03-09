import React from 'react';
import styles from './variant_card.module.css';

export const VariantCard = () => {
  return (
    <div className={styles.card}>
        
        <img src="https://images.unsplash.com/photo-1532384661798-58b53a4fbe37?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzY2xlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60" alt="dumbell" />
        <div className={styles.card__details}>
            <div className={styles.category_pill}>Arms</div>
            <h3>Lorem, ipsum dolor.</h3>
            <p>No equipment</p>
        </div>
    </div>
  );
};
