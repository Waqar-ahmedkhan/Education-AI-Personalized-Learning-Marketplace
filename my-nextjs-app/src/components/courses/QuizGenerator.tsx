'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Star, CheckCircle, XCircle, Loader2, AlertTriangle, Trophy } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface WeakZone {
  topic: string;
  incorrectCount: number;
  suggestions: string[];
}

interface QuizGeneratorProps {
  courseId: string;
  lessonId: string;
  onCompleteQuiz: (score: number, lessonId: string) => void;
  courseName?: string; // Optional course name
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ courseId, lessonId, onCompleteQuiz, courseName = "Custom Course" }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [userTopic, setUserTopic] = useState<string>('Neural Networks'); // Default to Neural Networks
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [weakZones, setWeakZones] = useState<WeakZone[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);

  // Load and save weak zones to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedWeakZones = localStorage.getItem(`weakZones-${courseId}-${lessonId}`);
      if (storedWeakZones) setWeakZones(JSON.parse(storedWeakZones));
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`weakZones-${courseId}-${lessonId}`, JSON.stringify(weakZones));
    }
  }, [weakZones, courseId, lessonId]);

  const generateQuiz = useCallback(async (quizDifficulty: 'easy' | 'medium' | 'hard', weakZoneTopics: string[] = []) => {
    if (!userTopic.trim()) {
      setError('Please enter a topic to generate the quiz.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const topicToUse = weakZoneTopics.length > 0 ? weakZoneTopics.join(', ') : userTopic;
      const prompt = `Generate a JSON array of exactly 10 multiple-choice questions for the course "${courseName}", lesson ${lessonId}, on the topic: ${topicToUse}. Difficulty: ${quizDifficulty}. Each question must have 4 options, a correctAnswer (index 0-3), an explanation, and a topic related to ${topicToUse}. Format: [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": 0, "explanation": "...", "topic": "...", "difficulty": "..."}] Ensure valid JSON and provide meaningful options relevant to Neural Networks if the topic is Neural Networks.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer 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',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model: 'moonshotai/kimi-k2:free',
          messages: [
            { role: 'system', content: `You are EduAI, a quiz generator for "${courseName}", created by xAI.` },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
        }),
      });

      const data = await response.json();
      let parsedQuestions: QuizQuestion[] = [];
      try {
        parsedQuestions = JSON.parse(data.choices?.[0]?.message?.content || '[]');
        if (!Array.isArray(parsedQuestions) || parsedQuestions.length !== 10 || parsedQuestions.some(q => !q.question || q.options.length !== 4 || q.correctAnswer < 0 || q.correctAnswer > 3 || !q.explanation || !q.topic)) {
          throw new Error('Invalid quiz format or incorrect number of questions');
        }
      } catch (parseError) {
        console.error('Parse error:', parseError, 'Response:', data.choices?.[0]?.message?.content);
        parsedQuestions = [
          { question: "What is a key concept of Neural Networks in Neural Networks (Q1)?", options: ["Activation Function", "Database Query", "HTML Tag", "CSS Style"], correctAnswer: 0, explanation: "Activation functions introduce non-linearity in Neural Networks.", topic: "Neural Networks", difficulty: quizDifficulty },
          { question: "What is the purpose of a hidden layer in Neural Networks (Q2)?", options: ["Data Storage", "Feature Extraction", "User Interface", "Network Security"], correctAnswer: 1, explanation: "Hidden layers extract features from input data.", topic: "Neural Networks", difficulty: quizDifficulty },
          { question: "Which function is commonly used as an activation in Neural Networks (Q3)?", options: ["ReLU", "SQL", "JavaScript", "HTTP"], correctAnswer: 0, explanation: "ReLU (Rectified Linear Unit) is widely used for its simplicity.", topic: "Neural Networks", difficulty: quizDifficulty },
          { question: "What does backpropagation do in Neural Networks (Q4)?", options: ["Forwards Data", "Adjusts Weights", "Renders Graphics", "Compiles Code"], correctAnswer: 1, explanation: "Backpropagation adjusts weights to minimize error.", topic: "Neural Networks", difficulty: quizDifficulty },
          { question: "What is an advantage of deep Neural Networks (Q5)?", options: ["Faster Execution", "Better Feature Learning", "Less Memory", "Simpler Design"], correctAnswer: 1, explanation: "Deep networks learn complex features effectively.", topic: "Neural Networks", difficulty: quizDifficulty },
          { question: "What is the role of neurons in Neural Networks (Q6)?", options: ["Process Inputs", "Store Files", "Display Images", "Manage Networks"], correctAnswer: 0, explanation: "Neurons process and transform input data.", topic: "Neural Networks", difficulty: quizDifficulty },
          { question: "Which layer receives input data in Neural Networks (Q7)?", options: ["Output Layer", "Input Layer", "Hidden Layer", "Connection Layer"], correctAnswer: 1, explanation: "The input layer receives the initial data.", topic: "Neural Networks", difficulty: quizDifficulty },
          { question: "What is overfitting in Neural Networks (Q8)?", options: ["Perfect Fit", "Model Overcomplication", "Underfitting", "Data Loss"], correctAnswer: 1, explanation: "Overfitting occurs when the model learns noise.", topic: "Neural Networks", difficulty: quizDifficulty },
          { question: "What technique helps prevent overfitting in Neural Networks (Q9)?", options: ["Dropout", "Overloading", "Caching", "Encryption"], correctAnswer: 0, explanation: "Dropout randomly disables neurons during training.", topic: "Neural Networks", difficulty: quizDifficulty },
          { question: "What is the output of a Neural Network typically (Q10)?", options: ["Prediction", "Database", "Website", "Email"], correctAnswer: 0, explanation: "Neural Networks often output predictions or classifications.", topic: "Neural Networks", difficulty: quizDifficulty },
        ];
      }

      setQuestions(parsedQuestions);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setShowResults(false);
      setScore(0);
      setSelectedAnswer(null);
    } catch (err) {
      setError('Failed to generate quiz. Using fallback data due to an error.');
      setQuestions([
        { question: "What is a key concept of Neural Networks in Neural Networks (Q1)?", options: ["Activation Function", "Database Query", "HTML Tag", "CSS Style"], correctAnswer: 0, explanation: "Activation functions introduce non-linearity in Neural Networks.", topic: "Neural Networks", difficulty: quizDifficulty },
        { question: "What is the purpose of a hidden layer in Neural Networks (Q2)?", options: ["Data Storage", "Feature Extraction", "User Interface", "Network Security"], correctAnswer: 1, explanation: "Hidden layers extract features from input data.", topic: "Neural Networks", difficulty: quizDifficulty },
        { question: "Which function is commonly used as an activation in Neural Networks (Q3)?", options: ["ReLU", "SQL", "JavaScript", "HTTP"], correctAnswer: 0, explanation: "ReLU (Rectified Linear Unit) is widely used for its simplicity.", topic: "Neural Networks", difficulty: quizDifficulty },
        { question: "What does backpropagation do in Neural Networks (Q4)?", options: ["Forwards Data", "Adjusts Weights", "Renders Graphics", "Compiles Code"], correctAnswer: 1, explanation: "Backpropagation adjusts weights to minimize error.", topic: "Neural Networks", difficulty: quizDifficulty },
        { question: "What is an advantage of deep Neural Networks (Q5)?", options: ["Faster Execution", "Better Feature Learning", "Less Memory", "Simpler Design"], correctAnswer: 1, explanation: "Deep networks learn complex features effectively.", topic: "Neural Networks", difficulty: quizDifficulty },
        { question: "What is the role of neurons in Neural Networks (Q6)?", options: ["Process Inputs", "Store Files", "Display Images", "Manage Networks"], correctAnswer: 0, explanation: "Neurons process and transform input data.", topic: "Neural Networks", difficulty: quizDifficulty },
        { question: "Which layer receives input data in Neural Networks (Q7)?", options: ["Output Layer", "Input Layer", "Hidden Layer", "Connection Layer"], correctAnswer: 1, explanation: "The input layer receives the initial data.", topic: "Neural Networks", difficulty: quizDifficulty },
        { question: "What is overfitting in Neural Networks (Q8)?", options: ["Perfect Fit", "Model Overcomplication", "Underfitting", "Data Loss"], correctAnswer: 1, explanation: "Overfitting occurs when the model learns noise.", topic: "Neural Networks", difficulty: quizDifficulty },
        { question: "What technique helps prevent overfitting in Neural Networks (Q9)?", options: ["Dropout", "Overloading", "Caching", "Encryption"], correctAnswer: 0, explanation: "Dropout randomly disables neurons during training.", topic: "Neural Networks", difficulty: quizDifficulty },
        { question: "What is the output of a Neural Network typically (Q10)?", options: ["Prediction", "Database", "Website", "Email"], correctAnswer: 0, explanation: "Neural Networks often output predictions or classifications.", topic: "Neural Networks", difficulty: quizDifficulty },
      ]);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setShowResults(false);
      setScore(0);
      setSelectedAnswer(null);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, lessonId, courseName, userTopic]);

  const handleGenerateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    generateQuiz(difficulty);
  };

  const handleAnswer = (answerIndex: number) => {
    if (answerIndex < 0 || answerIndex > 3) return;
    setSelectedAnswer(answerIndex);

    setTimeout(() => {
      const newAnswers = [...userAnswers, answerIndex];
      setUserAnswers(newAnswers);
      setSelectedAnswer(null);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        let correctCount = 0;
        const newWeakZones = [...weakZones];

        newAnswers.forEach((answer, index) => {
          const question = questions[index];
          if (answer === question.correctAnswer) {
            correctCount++;
          } else {
            const existingWeakZone = newWeakZones.find(wz => wz.topic === question.topic);
            if (existingWeakZone) {
              existingWeakZone.incorrectCount++;
              if (!existingWeakZone.suggestions.includes(question.explanation)) {
                existingWeakZone.suggestions.push(question.explanation);
              }
            } else {
              newWeakZones.push({
                topic: question.topic,
                incorrectCount: 1,
                suggestions: [question.explanation],
              });
            }
          }
        });

        const finalScore = (correctCount / questions.length) * 100;
        setScore(finalScore);
        setWeakZones(newWeakZones);
        setShowResults(true);
        onCompleteQuiz(finalScore, lessonId);
      }
    }, 500);
  };

  const handleRetry = () => {
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setScore(0);
    setSelectedAnswer(null);
    generateQuiz(difficulty);
  };

  const handlePracticeWeakZones = () => {
    if (weakZones.length === 0) {
      setError('No weak zones identified yet.');
      return;
    }
    generateQuiz(difficulty, weakZones.map(wz => wz.topic).sort((a, b) => {
      const countA = weakZones.find(w => w.topic === a)?.incorrectCount || 0;
      const countB = weakZones.find(w => w.topic === b)?.incorrectCount || 0;
      return countB - countA;
    }));
    setShowResults(false);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'from-green-400 to-emerald-500';
      case 'medium': return 'from-yellow-400 to-amber-500';
      case 'hard': return 'from-red-400 to-rose-500';
      default: return 'from-blue-400 to-indigo-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-green-400 to-emerald-500';
    if (score >= 70) return 'from-blue-400 to-cyan-500';
    if (score >= 50) return 'from-yellow-400 to-amber-500';
    return 'from-red-400 to-rose-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`w-full max-w-5xl mx-auto my-8 p-6 rounded-2xl shadow-lg bg-gradient-to-br ${isDark ? 'from-gray-800/70 via-slate-800/70 to-gray-900/70' : 'from-white/90 to-gray-100/90'} border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}`}
    >
      {!questions.length && !showResults && (
        <div className="space-y-6">
          <h2 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${getDifficultyColor('medium')} flex items-center gap-3`}>
            <Star className="w-7 h-7" /> {courseName} Quiz Generator
          </h2>
          <p className={`text-md ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Lesson {lessonId} - Enter a topic to generate 10 questions</p>
          <form onSubmit={handleGenerateQuiz} className="space-y-5">
            <div>
              <label className={`block text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                Enter Topic to Study
              </label>
              <input
                type="text"
                value={userTopic}
                onChange={(e) => setUserTopic(e.target.value)}
                placeholder="e.g., Neural Networks, Linear Regression"
                className={`w-full p-3 mt-2 rounded-lg border-2 ${isDark ? 'bg-gray-700 text-white border-gray-600 focus:border-indigo-500' : 'bg-white text-gray-900 border-gray-300 focus:border-indigo-500'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            <div>
              <label className={`block text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                Choose Difficulty Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <motion.button
                    key={level}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDifficulty(level)}
                    className={`p-5 rounded-xl border-2 text-center transition-all duration-300 ${difficulty === level
                        ? `bg-gradient-to-r ${getDifficultyColor(level)} text-white shadow-md border-transparent`
                        : `${isDark ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-600/70' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}`}
                  >
                    <p className="font-semibold capitalize">{level}</p>
                    <p className="text-sm opacity-90">
                      {level === 'easy' && 'Perfect for beginners'}
                      {level === 'medium' && 'Balanced challenge'}
                      {level === 'hard' && 'Advanced mastery'}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isLoading || !userTopic.trim()}
              className={`w-full py-3 rounded-lg text-white font-bold shadow-md transition-all duration-300 ${isLoading || !userTopic.trim() ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'} flex items-center justify-center gap-2`}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5" />}
              Start Quiz on {userTopic || 'Selected Topic'}
            </motion.button>
          </form>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 rounded-xl flex items-center gap-3 ${isDark ? 'bg-red-900/30 border border-red-700/50' : 'bg-red-50 border border-red-200'} text-${isDark ? 'red-400' : 'red-600'}`}
            >
              <AlertTriangle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </div>
      )}

      {questions.length > 0 && !showResults && (
        <motion.div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className={`text-xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              Question {currentQuestionIndex + 1} of 10
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getDifficultyColor(questions[currentQuestionIndex].difficulty)} text-white`}>
              {questions[currentQuestionIndex].topic}
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl bg-gradient-to-br ${isDark ? 'from-gray-700/50 to-gray-800/50' : 'from-blue-50/50 to-purple-50/50'} border ${isDark ? 'border-gray-600/50' : 'border-gray-200/50'} shadow-md`}
          >
            <p className={`text-lg font-medium mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {questions[currentQuestionIndex].question}
            </p>
            <div className="grid gap-3">
              {questions[currentQuestionIndex].options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === questions[currentQuestionIndex].correctAnswer;
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-lg flex items-center gap-4 transition-all duration-300 ${selectedAnswer !== null
                        ? isSelected
                          ? isCorrect
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-red-600 text-white shadow-lg'
                          : isCorrect
                            ? 'bg-green-100 border-2 border-green-600 dark:bg-green-900/40'
                            : isDark
                              ? 'bg-gray-600/60 border border-gray-500'
                              : 'bg-gray-100 border border-gray-300'
                        : isDark
                          ? 'bg-gray-700/60 border border-gray-500 hover:bg-gray-600/70'
                          : 'bg-white border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50'}`}
                  >
                    <span className={`w-8 h-8 flex items-center justify-center font-semibold text-sm ${isSelected && selectedAnswer !== null ? 'text-white' : isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 text-base">{option}</span>
                    {selectedAnswer !== null && (
                      <>
                        {isSelected && (isCorrect ? <CheckCircle className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />)}
                        {!isSelected && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                      </>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}

      {showResults && (
        <motion.div className="space-y-6">
          <div className={`p-6 rounded-xl text-center bg-gradient-to-br ${isDark ? 'from-gray-700/50 to-gray-800/50' : 'from-blue-50/50 to-purple-50/50'} border ${isDark ? 'border-gray-600/50' : 'border-gray-200/50'} shadow-lg`}>
            <Trophy className={`w-14 h-14 mx-auto mb-4 text-transparent bg-gradient-to-r ${getScoreColor(score)} bg-clip-text`} />
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Quiz Completed: {courseName}</h3>
            <div className={`text-5xl font-extrabold mt-3 mb-4 text-transparent bg-gradient-to-r ${getScoreColor(score)} bg-clip-text`}>
              {score.toFixed(1)}%
            </div>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {score >= 90 && 'Outstanding! You’re a master! 🌟'}
              {score >= 70 && score < 90 && 'Great job! Well done! 👏'}
              {score >= 50 && score < 70 && 'Good effort! Practice more! 💪'}
              {score < 50 && 'Keep learning! You’ll improve! 📚'}
            </p>
          </div>
          <div className="space-y-4">
            <h4 className={`text-xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Review Your Answers</h4>
            {questions.map((q, index) => {
              const isCorrect = userAnswers[index] === q.correctAnswer;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border-l-4 ${isCorrect ? 'border-green-600 bg-green-50 dark:bg-green-900/30' : 'border-red-600 bg-red-50 dark:bg-red-900/30'} shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? <CheckCircle className="w-5 h-5 text-green-600 mt-1" /> : <XCircle className="w-5 h-5 text-red-600 mt-1" />}
                    <div className="flex-1">
                      <p className="font-medium mb-1">{q.question}</p>
                      <p className="text-sm mb-1"><strong>Your Answer:</strong> {q.options[userAnswers[index]] || 'Not answered'}</p>
                      <p className="text-sm mb-1"><strong>Correct Answer:</strong> {q.options[q.correctAnswer]}</p>
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <p className="text-sm"><strong>Explanation:</strong> {q.explanation}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {weakZones.length > 0 && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-yellow-900/30 border border-yellow-700/50' : 'bg-yellow-50 border border-yellow-200'} shadow-md`}>
              <h4 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                <AlertTriangle className="w-5 h-5" /> Weak Areas in {courseName}
              </h4>
              <div className="mt-2 space-y-2">
                {weakZones.sort((a, b) => b.incorrectCount - a.incorrectCount).map((wz, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                    <p className="font-medium">{wz.topic} <span className="text-sm text-red-400">({wz.incorrectCount} errors)</span></p>
                    <ul className="list-disc list-inside mt-1 text-sm">
                      {wz.suggestions.map((s, sIdx) => (
                        <li key={sIdx} className={isDark ? 'text-gray-400' : 'text-gray-600'}>{s}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRetry}
              className="w-full sm:w-auto py-3 px-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold flex items-center gap-2 shadow-md"
            >
              <Star className="w-5 h-5" /> Retry Quiz
            </motion.button>
            {weakZones.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePracticeWeakZones}
                className="w-full sm:w-auto py-3 px-6 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold flex items-center gap-2 shadow-md"
              >
                <AlertTriangle className="w-5 h-5" /> Focus on Weak Areas
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuizGenerator;