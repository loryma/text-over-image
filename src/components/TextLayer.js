import React from 'react';
import classes from './textOverlayStyles.scss';

function TextOverlay({ url, type, children, wrapperClassname }) {
  console.log(`textOverlay--${type}`)
  return (
    <div className={[classes.textOverlay, classes[`textOverlay--${type}`],  wrapperClassname ? wrapperClassname : '' ].join(' ')}>
      <img className={classes.textOverlay__img} src={url} />
      <div className={classes.textOverlay__textContainer}>
        {children}
      </div>
    </div>
  );
};
export default TextOverlay;