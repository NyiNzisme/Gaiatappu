import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [throughputs, setThroughputs] = useState(0); // Tracks taps (resets at 20)
  const [gaiaPoints, setGaiaPoints] = useState(0); // Tracks Gaia Points
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem('tapTapHighScore')) || 0
  ); // High score for Gaia Points
  const [timeLeft, setTimeLeft] = useState(20);
  const [animations, setAnimations] = useState([]); // Store animation elements
  const [purchasedModels, setPurchasedModels] = useState([]); // Track purchased models
  const [amirCalled, setAmirCalled] = useState(false); // Tracks if "Call Amir" has been used
  const [ratio, setRatio] = useState('pc'); // Tracks the selected ratio ('pc' or 'mobile')
  const intervalRef = useRef(null);

  // Calculate the total multiplier based on purchased models
  const calculateMultiplier = () => {
    let multiplier = 1; // Default multiplier
    if (purchasedModels.includes('Qwen')) multiplier *= 2;
    if (purchasedModels.includes('Gemma')) multiplier *= 10;
    if (purchasedModels.includes('Llama')) multiplier *= 50;
    return multiplier;
  };

  // Function to start the timer
  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(intervalRef.current); // Stop the timer when it reaches 0
          if (gaiaPoints > highScore) {
            setHighScore(gaiaPoints);
            localStorage.setItem('tapTapHighScore', gaiaPoints);
          }
          return 0;
        }
      });
    }, 1000);
  };

  useEffect(() => {
    // Start the timer when the component mounts
    startTimer();

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalRef.current);
  }, []); // Empty dependency array ensures the timer runs independently

  const handleTap = () => {
    if (timeLeft > 0) {
      const multiplier = calculateMultiplier();
      setThroughputs((prevThroughputs) => {
        const newThroughputs = prevThroughputs + multiplier;

        // Check if Throughputs reach 20
        if (newThroughputs >= 20) {
          const extraThroughputs = newThroughputs - 20; // Handle overflow
          setGaiaPoints((prevGaiaPoints) => prevGaiaPoints + 1); // Award 1 Gaia Point
          return extraThroughputs; // Reset Throughputs to overflow value
        }

        return newThroughputs;
      });

      // Create a new animation element
      const newAnimation = {
        id: Date.now(), // Unique ID for each animation
        x: Math.random() * 40 - 20, // Random horizontal offset (-20px to 20px)
        y: Math.random() * -50 - 30, // Random vertical offset (-30px to -80px),
      };

      // Limit the number of concurrent animations to 10
      setAnimations((prev) => [...prev.slice(-10), newAnimation]);

      // Remove the animation after it finishes
      setTimeout(() => {
        setAnimations((prev) => prev.filter((anim) => anim.id !== newAnimation.id));
      }, 1000);
    }
  };

  const resetGame = () => {
    clearInterval(intervalRef.current); // Clear the existing interval
    setTimeLeft(20); // Reset the timer
    setThroughputs(0); // Reset Throughputs
    setAmirCalled(false); // Reset "Call Amir" button state
    startTimer(); // Restart the timer
  };

  // Handle purchasing a model
  const purchaseModel = (model, cost) => {
    if (gaiaPoints >= cost && !purchasedModels.includes(model)) {
      setGaiaPoints((prev) => prev - cost); // Deduct Gaia Points
      setPurchasedModels((prev) => [...prev, model]); // Add model to purchased list
      alert(`You bought ${model}!`);
    } else if (purchasedModels.includes(model)) {
      alert(`You already own ${model}!`);
    } else {
      alert(`Not enough Gaia Points to buy ${model}. You need ${cost} Gaia Points.`);
    }
  };

  // Handle "Call Amir" button
  const callAmir = () => {
    if (!amirCalled && timeLeft > 0) {
      setAmirCalled(true); // Disable the button after use
      const multiplier = calculateMultiplier();

      // Simulate automatic tapping for 5 seconds at 1.5x speed (approx every 66ms)
      const interval = setInterval(() => {
        setThroughputs((prevThroughputs) => {
          const newThroughputs = prevThroughputs + multiplier * 1.5;

          // Check if Throughputs reach 20
          if (newThroughputs >= 20) {
            const extraThroughputs = newThroughputs - 20; // Handle overflow
            setGaiaPoints((prevGaiaPoints) => prevGaiaPoints + 1); // Award 1 Gaia Point
            return extraThroughputs; // Reset Throughputs to overflow value
          }

          return newThroughputs;
        });
      }, 66);

      // Stop the automatic tapping after 5 seconds
      setTimeout(() => {
        clearInterval(interval);
      }, 5000);
    }
  };

  return (
    <div
      className={`min-h-screen bg-cover bg-center flex flex-col items-center justify-center text-white font-sans relative ${
        ratio === 'pc' ? 'aspect-video' : 'aspect-[9/16]'
      }`}
      style={{
        backgroundImage: `url('/gaianet-bg.jpg')`,
        backdropFilter: 'blur(4px)', // Blurred background effect
      }}
    >
      {/* Header */}
      <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: 'monospace' }}>
        Gaia Tappy
      </h1>

      {/* Top Throughputs and High Score */}
      <div className="absolute top-4 left-4 text-lg font-medium">
        Throughputs: {Math.floor(throughputs)}/20
      </div>
      <div className="absolute top-4 right-4 text-lg font-medium">
        Gaia Points: {Math.floor(gaiaPoints)}
      </div>

      {/* Call Amir Button */}
      <div className="absolute top-20 right-4 w-40 text-sm font-medium">
        <button
          onClick={callAmir}
          className={`${
            !amirCalled && timeLeft > 0
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-gray-500 cursor-not-allowed'
          } text-white font-bold py-2 px-4 rounded-full w-full`}
          disabled={amirCalled || timeLeft === 0}
        >
          Call Amir
        </button>
      </div>

      {/* Timer */}
      <div className="mb-8 flex flex-col items-center">
        <div className="text-2xl font-semibold">Time Left: {timeLeft}s</div>
        <div className="w-64 bg-gray-200 rounded-full h-4 mt-2">
          <div
            className="bg-green-500 h-4 rounded-full"
            style={{ width: `${(timeLeft / 20) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Run Node Button */}
      <div className="relative">
        <button
          onClick={handleTap}
          aria-label="Run Node Button" // Accessibility improvement
          className={`${
            timeLeft > 0 ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-gray-400'
          } text-black font-bold py-4 px-8 rounded-full shadow-lg transform transition-transform duration-100 active:scale-95`}
          disabled={timeLeft === 0}
        >
          {timeLeft > 0 ? 'Run Node' : 'Game Over'}
        </button>

        {/* GaiaNet Logo as animation */}
        {animations.map((anim) => (
          <img
            key={anim.id}
            src="/gaianet-logo-anim.png"
            alt="GaiaNet"
            onError={(e) => (e.target.src = '/placeholder.png')} // Fallback image
            className="absolute pointer-events-none"
            style={{
              width: '32px',
              top: `calc(50% + ${anim.y}px)`,
              left: `calc(50% + ${anim.x}px)`,
              transform: 'translate(-50%, -50%)',
              animation: 'fade-out 1s ease-in-out forwards',
            }}
          />
        ))}
      </div>

      {/* Your Models Tab */}
      <div className="absolute top-32 left-4 w-48 text-sm font-medium space-y-2">
        <h2 className="text-lg font-bold mb-2">Your Models:</h2>
        {purchasedModels.length === 0 ? (
          <p className="text-gray-400 italic">No models purchased yet.</p>
        ) : (
          purchasedModels.map((model, index) => (
            <div key={index} className="flex justify-between">
              <span>{model}</span>
              <span className="text-green-400">
                {model === 'Qwen' && 'x2'} 
                {model === 'Gemma' && 'x10'} 
                {model === 'Llama' && 'x50'}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Purchase Models */}
      <div className="absolute bottom-20 left-4 w-48 text-sm font-medium space-y-2">
        <h2 className="text-lg font-bold mb-2">Purchase Models:</h2>
        <button
          onClick={() => purchaseModel('Qwen', 20)}
          className={`${
            gaiaPoints >= 20 && !purchasedModels.includes('Qwen')
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-gray-500 cursor-not-allowed'
          } text-white font-bold py-2 px-4 rounded-full w-full`}
          disabled={gaiaPoints < 20 || purchasedModels.includes('Qwen')}
        >
          Buy Qwen (20 GP)
        </button>
        <button
          onClick={() => purchaseModel('Gemma', 60)}
          className={`${
            gaiaPoints >= 60 && !purchasedModels.includes('Gemma')
              ? 'bg-purple-500 hover:bg-purple-600'
              : 'bg-gray-500 cursor-not-allowed'
          } text-white font-bold py-2 px-4 rounded-full w-full`}
          disabled={gaiaPoints < 60 || purchasedModels.includes('Gemma')}
        >
          Buy Gemma (60 GP)
        </button>
        <button
          onClick={() => purchaseModel('Llama', 800)}
          className={`${
            gaiaPoints >= 800 && !purchasedModels.includes('Llama')
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gray-500 cursor-not-allowed'
          } text-white font-bold py-2 px-4 rounded-full w-full`}
          disabled={gaiaPoints < 800 || purchasedModels.includes('Llama')}
        >
          Buy Llama (800 GP)
        </button>
      </div>

      {/* Ratio Selection */}
      <div className="absolute bottom-4 right-4 text-xs font-medium text-gray-400 space-x-2">
        <button
          onClick={() => setRatio('pc')}
          className={`${
            ratio === 'pc' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-gray-300'
          } font-bold py-1 px-2 rounded-full`}
        >
          PC Ratio
        </button>
        <button
          onClick={() => setRatio('mobile')}
          className={`${
            ratio === 'mobile' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-gray-300'
          } font-bold py-1 px-2 rounded-full`}
        >
          Mobile Ratio
        </button>
      </div>

      {/* Disclaimer and Footer */}
      <div className="absolute bottom-4 left-4 text-xs font-medium text-gray-400">
        <p>This project is purely for entertainment</p>
        <p>and is not affiliated with the GaiaNet project or its reward system.</p>
        <p className="mt-2">Made with ❤️ by B</p>
      </div>

      {/* Restart Button */}
      {timeLeft === 0 && (
        <button
          onClick={resetGame}
          aria-label="Restart Game Button" // Accessibility improvement
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full shadow-md"
        >
          Restart
        </button>
      )}

      {/* Animation Keyframes */}
      <style>
        {`
          @keyframes fade-out {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(1.5);
            }
          }
        `}
      </style>
    </div>
  );
}
