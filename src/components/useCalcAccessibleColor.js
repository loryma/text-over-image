import { useEffect, useState } from "react";

const desiredContrast = 4.5;
// Contrast level AA = 4.5, Level AAA = 7
// Reference: https://www.w3.org/WAI/WCAG21/quickref/?versions=2.0&showtechniques=143#qr-visual-audio-contrast-contrast

const state = {
  textColor: {r:255, g:255, b:255},
  overlayColor: {r:0, g:0, b:0},
}

function useCalcAccessibleColor({ imgRef, canvasRef }) {

  const [optimalContrast, setOptimalContast] = useState();

  useEffect(() => {
    if (imgRef && canvasRef && imgRef.current && canvasRef.current) {
      imgRef.current.addEventListener('load', loadListener)
      function loadListener() {
        updateOverlay();
      }
    }
    return () => imgRef.current && imgRef.current.removeListener('load', loadListener);
  }, [imgRef, canvasRef]);

  if (!imgRef || !canvasRef) return null;

  function updateOverlay() {
    const { textColor, overlayColor } = state;

    const imagePixelColors = getImagePixelColorsUsingCanvas(imgRef.current, canvasRef.current);

    const worstContrastColorInImage = getWorstContrastColorInImage(textColor, imagePixelColors);

    const optimalOpacity = findOptimalOverlayOpacity(textColor, overlayColor, worstContrastColorInImage, desiredContrast);

    setOptimalContast(optimalOpacity);
  }

  function getImagePixelColorsUsingCanvas(image, canvas) {
    const ctx = canvas.getContext('2d');

    canvas.height = getCanvasHeightToMatchImageProportions(canvas, image);

    const sourceImageCoordinates = [0, 0, image.width, image.height];
    const destinationCanvasCoordinates = [0, 0, canvas.width, canvas.height];

    ctx.drawImage(
      image,
      ...sourceImageCoordinates,
      ...destinationCanvasCoordinates
    );

    // Remember getImageData only works for same-origin or cross-origin-enabled images.
    // See https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image for more info.
    const imagePixelColors = ctx.getImageData(...destinationCanvasCoordinates);

    return imagePixelColors;
  }

  function getCanvasHeightToMatchImageProportions(canvas, image) {
    return (image.height / image.width) * canvas.width;
  }

  function getWorstContrastColorInImage(textColor, imagePixelColors) {

    let worstContrastColorInImage;
    let worstContrast = Infinity;

    for (let i = 0; i < imagePixelColors.data.length; i += 4) {
      let pixelColor = {
        r: imagePixelColors.data[i],
        g: imagePixelColors.data[i + 1],
        b: imagePixelColors.data[i + 2],
      };

      let contrast = getContrast(textColor, pixelColor);

      if(contrast < worstContrast) {
        worstContrast = contrast;
        worstContrastColorInImage = pixelColor;
      }
    }

    return worstContrastColorInImage;
  }

  function getContrast(color1, color2) {
    const color1_luminance = getLuminance(color1);
    const color2_luminance = getLuminance(color2);

    const lighterColorLuminance = Math.max(color1_luminance, color2_luminance);
    const darkerColorLuminance = Math.min(color1_luminance, color2_luminance);

    const contrast = (lighterColorLuminance + 0.05) / (darkerColorLuminance + 0.05);
    return contrast;
  }

  function getLuminance({r,g,b}) {
    return (0.2126 * getLinearRGB(r) + 0.7152 * getLinearRGB(g) + 0.0722 * getLinearRGB(b));
  }

  function getLinearRGB(primaryColor_8bit) {
    // First convert from 8-bit rbg (0-255) to standard RGB (0-1)
    const primaryColor_sRGB = convert_8bit_RGB_to_standard_RGB(primaryColor_8bit);

    // Then convert from sRGB to linear RGB so we can use it to calculate luminance
    const primaryColor_RGB_linear = convert_standard_RGB_to_linear_RGB(primaryColor_sRGB);

    return primaryColor_RGB_linear;
  }

  function convert_8bit_RGB_to_standard_RGB(primaryColor_8bit) {
    return primaryColor_8bit / 255;
  }

  function convert_standard_RGB_to_linear_RGB(primaryColor_sRGB) {
    const primaryColor_linear = primaryColor_sRGB < 0.03928 ?
      primaryColor_sRGB/12.92 :
      Math.pow((primaryColor_sRGB + 0.055) / 1.055, 2.4);
    return primaryColor_linear;
  }

  function getTextContrastWithImagePlusOverlay({textColor, overlayColor, imagePixelColor, overlayOpacity}) {
    const colorOfImagePixelPlusOverlay = mixColors(imagePixelColor, overlayColor, overlayOpacity);
    const contrast = getContrast(state.textColor, colorOfImagePixelPlusOverlay);
    return contrast;
  }

  function mixColors(baseColor, overlayColor, overlayOpacity) {
    const mixedColor = {
      r: baseColor.r + (overlayColor.r - baseColor.r) * overlayOpacity,
      g: baseColor.g + (overlayColor.g - baseColor.g) * overlayOpacity,
      b: baseColor.b + (overlayColor.b - baseColor.b) * overlayOpacity,
    }
    return mixedColor;
  }

  function findOptimalOverlayOpacity(textColor, overlayColor, worstContrastColorInImage, desiredContrast) {
    const isOverlayNecessary = isOverlayNeeded(textColor, worstContrastColorInImage, desiredContrast);
    if (!isOverlayNecessary) {
      return 0;
    }

    const opacityGuessRange = {
      lowerBound: 0,
      midpoint: 0.5,
      upperBound: 1,
    };

    let numberOfGuesses = 0;
    const maxGuesses = 8;
    const opacityLimit = 0.99;

    while (numberOfGuesses < maxGuesses) {
      numberOfGuesses++;
      const currentGuess = opacityGuessRange.midpoint;

      const contrastOfGuess = getTextContrastWithImagePlusOverlay({
        textColor,
        overlayColor,
        imagePixelColor: worstContrastColorInImage,
        overlayOpacity: currentGuess,
      });

      const isGuessTooLow = contrastOfGuess < desiredContrast;
      const isGuessTooHigh = contrastOfGuess > desiredContrast;

      if (isGuessTooLow) {
        opacityGuessRange.lowerBound = currentGuess;
      }
      else if (isGuessTooHigh) {
        opacityGuessRange.upperBound = currentGuess;
      }

      const newMidpoint = ((opacityGuessRange.upperBound - opacityGuessRange.lowerBound) / 2) + opacityGuessRange.lowerBound;
      opacityGuessRange.midpoint = newMidpoint;
    }

    const optimalOpacity = opacityGuessRange.midpoint;

    if (optimalOpacity > opacityLimit) {
      return opacityLimit;
    }
    return optimalOpacity;
  }

  function isOverlayNeeded(textColor, worstContrastColorInImage, desiredContrast) {
    const contrastWithoutOverlay = getContrast(textColor, worstContrastColorInImage);
    return contrastWithoutOverlay < desiredContrast;
  }

  return optimalContrast;

}

export default useCalcAccessibleColor;

