import React from 'react';
import TextOverlay from './components/TextLayer';
import classes from './styles/app.scss';

function App() {
  return (
    <div className={classes.masonery}>
      <TextOverlay 
        url="https://images.unsplash.com/photo-1517886703796-91acf7e02e1b" 
        wrapperClassname={classes.masonery__item}
        type="transparentTextLayer"
      >
          <h4 className={classes.masonery__header}>Transparent Text Layer</h4>
          <p className={classes.masonery__description}> Long and detailed description of the image content</p>
      </TextOverlay>
      <TextOverlay 
        url="https://images.unsplash.com/photo-1517886703796-91acf7e02e1b" 
        wrapperClassname={classes.masonery__item}
        type="gradientTextLayer"
      >
          <h4 className={classes.masonery__header}>Gradient Text Layer</h4>
          <p className={classes.masonery__description}> Long and detailed description of the image content</p>
      </TextOverlay>
  </div>
  );
};

export default App;