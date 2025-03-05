import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Leaderboard.css';

const Leaderboard = ({ scores }) => {
  return (
    <div className="leaderboard">
      <h3>🏆 Leaderboard</h3>
      <div className="scores-container">
        {scores.length === 0 ? (
          <motion.div
            className="no-scores"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Be the first to set a high score!
          </motion.div>
        ) : (
          <AnimatePresence>
            {scores.map((score, index) => (
              <motion.div
                key={`${score.name}-${score.score}`}
                className="score-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="rank">#{index + 1}</div>
                <div className="player-info">
                  <span className="name">{score.name}</span>
                  <span className="score">{score.score}</span>
                </div>
                {score.isNew && (
                  <motion.div
                    className="new-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    NEW!
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Leaderboard; 