import React, { useEffect, useState } from 'react';
import '../../assets/skeleton/skeleton.scss';

const Skeleton = () => {
  const [skeletonUILength, setSkeletonUILength] = useState<number[]>([]);
  const loadingDataLength = 8;

  const skeletonUISetting = () => {
    const initialSkeletonArray = [...skeletonUILength];

    for (let i = 0; i < loadingDataLength; i++) {
      initialSkeletonArray.push(i);
    }

    setSkeletonUILength(initialSkeletonArray);
  };

  useEffect(() => {
    skeletonUISetting();
  }, []);
  return (
    <div className='skeleton-loading'>
      {skeletonUILength.map((number) => {
        return (
          <div className='contents-worldcup-card' key={number}>
            <div className='card-thumbnail'></div>
            <div className='worldcup-title'></div>
            <div className='worldcup-description'></div>
            <div className='card-category'></div>
          </div>
        );
      })}
    </div>
  );
};

export default Skeleton;
