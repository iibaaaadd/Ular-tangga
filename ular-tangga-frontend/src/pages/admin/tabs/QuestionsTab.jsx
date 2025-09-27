import React from 'react';
import { motion } from 'motion/react';
import QuestionBank from '../../../components/QuestionBank';
import { ToastProvider } from '../../../components/ui/ToastProvider';

const QuestionsTab = () => {
  return (
    <ToastProvider>
      <motion.div
        key="questions"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <QuestionBank />
      </motion.div>
    </ToastProvider>
  );
};

export default QuestionsTab;