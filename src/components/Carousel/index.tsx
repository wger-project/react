import React, { useEffect, useState } from 'react';
import styles from './carousel.module.css';

export interface CarouselItemProps  { 
    children: React.ReactNode
};

export const CarouselItem = ({children}: CarouselItemProps) => {
    return (
      <div className={styles.carousel_item}>
        {children}
      </div>
    );
};

export interface CarouselProps  { 
    children: React.ReactChild | React.ReactChild[]
};

export const Carousel: React.FC<CarouselProps> = ({children}: CarouselProps) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const updateIndex = (newIndex: number) => {
        if (newIndex < 0) {
          newIndex = React.Children.count(children) - 1;
          
        } else if (newIndex >= React.Children.count(children)) {
          newIndex = 0;
        }
    
        setActiveIndex(newIndex);
    };

    useEffect(() => {
        
    });

  return (
    <div className={styles.carousel}>
        <div
            className={styles.inner}
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child);
                }
            })}
        </div>
        <div className={styles.indicators}>
            {React.Children.map(children, (child, index) => {
            return (
                    <button
                        className={`${index === activeIndex ? "active" : ""}`}
                        onClick={() => {
                            updateIndex(index);
                        }}
                    >
                        {index + 1}
                    </button>
            );
            })}
        </div>
    </div>
  );
};
