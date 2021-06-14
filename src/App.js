import React, { useEffect, useState } from 'react';
import TextOverlay from './components/TextLayer';
import classes from './styles/app.scss';
import { API } from './api';
import accessibleImg from './accessible.jpg';

const TEXT_OVERLAY_TYPES = [
  "transparentTextLayer",
  "gradientTextLayer",
  "textShadow",
  "tintedBackground",
  "textBackground",
  "accessibleOverlayColor",
];

function App() {
  const [posts, setPosts] = useState();

  useEffect(() => {
    API.getPosts(5)
      .then(data => data.json())
      .then(data => setPosts(data.data))
      .catch(error => console.log(error));
  }, [setPosts]);

  if (!posts) return <div>...Loading</div>

  return (
    <div className={classes.masonery}>
      {posts.map(({text, image}, i) => (
        <TextOverlay 
          url={image} 
          wrapperClassname={classes.masonery__item}
          type={TEXT_OVERLAY_TYPES[i]}
          key={TEXT_OVERLAY_TYPES[i]}
        >
            <h4 className={classes.masonery__header}>{TEXT_OVERLAY_TYPES[i]}</h4>
            <p className={classes.masonery__description}> {text} </p>
        </TextOverlay>
      ))}
      <TextOverlay 
        url={accessibleImg} 
        wrapperClassname={classes.masonery__item}
        type={'accessibleOverlayColor'}
      >
          <h4 className={classes.masonery__header}>accessibleOverlayColor</h4>
          <p className={classes.masonery__description}> accessibleOverlayColor </p>
      </TextOverlay>
  </div>
  );
};

export default App;