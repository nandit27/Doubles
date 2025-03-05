import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Doubles.css';
import NameModal from './NameModal';
import Leaderboard from './Leaderboard';

const Doubles = () => {
  const [currentNumber, setCurrentNumber] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameMode, setGameMode] = useState('hard');
  const [startingNumber, setStartingNumber] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [showNameModal, setShowNameModal] = useState(true);
  const [leaderboardScores, setLeaderboardScores] = useState([]);
  const timerRef = useRef(null);
  const leaderboardTimerRef = useRef(null);

  const gameModes = {
    easy: { time: 10, label: 'Easy (10s ⏰⏰⏰)' },
    medium: { time: 8, label: 'Medium (8s ⏰⏰)' },
    hard: { time: 6, label: 'Hard (6s ⏰ - Default)' },
    evil: { time: 4, label: 'Evil (4s 😈)' }
  };

  useEffect(() => {
    generateInitialNumber();
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    // Start leaderboard update interval
    leaderboardTimerRef.current = setInterval(fetchLeaderboard, 3000);
    return () => {
      clearInterval(timerRef.current);
      clearInterval(leaderboardTimerRef.current);
    };
  }, [playerName, highScore]);

  const generateInitialNumber = () => {
    if (startingNumber) {
      setCurrentNumber(parseInt(startingNumber));
    } else {
      const min = 10;
      const max = 100;
      setCurrentNumber(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    setTimeLeft(gameModes[gameMode].time);
  };

  const generateNewNumber = () => {
    if (startingNumber) {
      setCurrentNumber(parseInt(startingNumber));
    } else {
      const min = 10;
      const max = 100;
      setCurrentNumber(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    setTimeLeft(gameModes[gameMode].time);
    startTimer();
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGameOver = () => {
    clearInterval(timerRef.current);
    setIsGameOver(true);
    setCorrectAnswer(currentNumber * 2);
    if (streak > highScore) {
      setHighScore(streak);
      setTimeout(fetchLeaderboard, 0);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const answer = parseInt(userAnswer);
    if (answer === currentNumber * 2) {
      setStreak(streak + 1);
      setCurrentNumber(answer);
      setUserAnswer('');
      setTimeLeft(gameModes[gameMode].time);
      clearInterval(timerRef.current);
      startTimer();
    } else {
      handleGameOver();
    }
  };

  const startNewGame = () => {
    setIsGameOver(false);
    setStreak(0);
    setUserAnswer('');
    setIsGameStarted(false);
    generateInitialNumber();
  };

  const updateStartingNumber = () => {
    if (startingNumber && !isNaN(startingNumber)) {
      startNewGame();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserAnswer(value);
    
    // Start the timer on first input if not started
    if (!isGameStarted && value) {
      setIsGameStarted(true);
      startTimer();
    }
  };

  const fetchLeaderboard = () => {
    // Get scores from localStorage
    const savedScores = JSON.parse(localStorage.getItem('doublesLeaderboard') || '[]');
    
    // Add current player's score if it's high enough
    if (playerName && highScore > 0) {
      const playerExists = savedScores.findIndex(score => score.name === playerName);
      
      if (playerExists >= 0) {
        // Update existing player's score if new score is higher
        if (savedScores[playerExists].score < highScore) {
          savedScores[playerExists] = { name: playerName, score: highScore, isNew: true };
        }
      } else {
        // Add new player score
        savedScores.push({ name: playerName, score: highScore, isNew: true });
      }

      // Sort scores and keep top 10
      savedScores.sort((a, b) => b.score - a.score);
      savedScores.splice(10);

      // Save to localStorage
      localStorage.setItem('doublesLeaderboard', JSON.stringify(savedScores));
    }

    setLeaderboardScores(savedScores);
  };

  const handleNameSubmit = (name) => {
    setPlayerName(name);
    setShowNameModal(false);
    generateInitialNumber();
  };

  return (
    <motion.div 
      className="doubles-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <NameModal isOpen={showNameModal} onSubmit={handleNameSubmit} />
      
      {!showNameModal && <Leaderboard scores={leaderboardScores} />}

      <motion.h1 
        className="title"
        whileHover={{ scale: 1.1 }}
      >
        Doubles
      </motion.h1>

      <motion.button
        className="settings-button"
        onClick={() => setShowSettings(!showSettings)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        ⚙️
      </motion.button>

      {showSettings && (
        <motion.div 
          className="settings-panel"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>Choose a fixed starting number:</h2>
          <div className="starting-number-container">
            <input
              type="number"
              value={startingNumber}
              onChange={(e) => setStartingNumber(e.target.value)}
              placeholder="Enter a starting number"
            />
            <button onClick={updateStartingNumber}>Update Number</button>
            <button onClick={() => setStartingNumber('')}>Clear Starting Number</button>
          </div>

          <h2>Timer Mode:</h2>
          <div className="timer-modes">
            {Object.entries(gameModes).map(([mode, { label }]) => (
              <label key={mode}>
                <input
                  type="radio"
                  name="gameMode"
                  value={mode}
                  checked={gameMode === mode}
                  onChange={(e) => setGameMode(e.target.value)}
                />
                {label}
              </label>
            ))}
          </div>
        </motion.div>
      )}

      {!isGameOver ? (
        <div className="game-container">
          <div className="current-number">
            Current Number: {currentNumber}
          </div>

          {!isGameStarted ? (
            <div className="start-prompt">
              Start typing to begin the timer
            </div>
          ) : (
            <motion.div 
              className="timer"
              animate={{ scale: timeLeft <= 3 ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.5 }}
            >
              {timeLeft}s
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="number"
              value={userAnswer}
              onChange={handleInputChange}
              placeholder="Enter your answer"
              autoFocus
            />
          </form>

          <div className="streak">Streak: {streak}</div>
        </div>
      ) : (
        <motion.div 
          className="game-over"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>Game Over!</h2>
          <p>You doubled {streak} times on {gameMode}</p>
          <p>The correct answer was: {currentNumber * 2}</p>
          <p>Your highest score: {highScore}</p>
          
          <div className="game-over-buttons">
            <motion.button
              onClick={startNewGame}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              Start New Game
            </motion.button>
            
            <motion.button
              onClick={() => {
                // Implement share functionality
                alert('Share functionality coming soon!');
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              Share Your Score
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Doubles; 