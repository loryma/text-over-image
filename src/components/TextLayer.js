import React, { useRef } from 'react';
import classes from './textOverlayStyles.scss';
import useCalcAccessibleColor from './useCalcAccessibleColor';

function TextOverlay({ url, type, children, wrapperClassname }) {
  const imgRef = useRef();
  const canvasRef = useRef();

  const isTypeArray = Array.isArray(type);
  const isAccessibleOverlayColor =  isTypeArray ? type.includes('accessibleOverlayColor') : type === 'accessibleOverlayColor';
  const accessibleOpacity = useCalcAccessibleColor(isAccessibleOverlayColor  ? { imgRef, canvasRef } : {});

  const typeClass = isTypeArray ? type.map(el => classes[`textOverlay--${el}`]).join(' ') : classes[`textOverlay--${type}`];

  return (
    <div className={[classes.textOverlay, typeClass,  wrapperClassname ? wrapperClassname : '' ].join(' ')}>
      {isAccessibleOverlayColor ? (
        <>
          <img 
            className={classes.textOverlay__img} 
            src={url} 
            crossOrigin="*"
            ref={imgRef}
          />
          <div className={classes.textOverlay__accessibleOverlayColor} style={{ opacity: accessibleOpacity}}></div>
          <canvas className={classes.textOverlay__canvas} ref={canvasRef}></canvas>
          </>
      ) : (
        <img 
          className={classes.textOverlay__img} 
          src={url} 
        />
      )}
      <div className={classes.textOverlay__textContainer}>
        {children}
      </div>
    </div>
  );
};
export default TextOverlay;