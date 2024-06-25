import React from 'react'

import Lottie from 'react-lottie-player'
// Alternatively:
// import Lottie from 'react-lottie-player/dist/LottiePlayerLight'

import lottieJson from '../../public/coffeerun.json'

export default function Animation() {
  return (
    <Lottie
      speed = {0.5}
      loop
      animationData={lottieJson}
      play
    />
  );
}