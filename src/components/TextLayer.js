import React from 'react';
import classes from './textOverlayStyles.scss';

function TextOverlay({ url, type, children, wrapperClassname }) {
  const isTypeArray = Array.isArray(type);
  const typeClass = isTypeArray ? type.map(el => classes[`textOverlay--${el}`]).join(' ') : classes[`textOverlay--${type}`];
  return (
    <div className={[classes.textOverlay, typeClass,  wrapperClassname ? wrapperClassname : '' ].join(' ')}>
      <img className={classes.textOverlay__img} src={url} />
      <div className={classes.textOverlay__textContainer}>
        {children}
      </div>
    </div>
  );
};
export default TextOverlay;