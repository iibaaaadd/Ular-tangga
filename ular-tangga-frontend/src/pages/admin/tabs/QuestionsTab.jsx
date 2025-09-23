import React from 'react';
import { motion } from 'motion/react';
import QuestionBank from '../../../components/QuestionBank';

const QuestionsTab = () => {
  return (
    <motion.div
      key="questions"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <QuestionBank />
    </motion.div>
  );
};

export default QuestionsTab;