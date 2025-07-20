// import express, { Request, Response } from 'express';
// import QuizModel from '../models/Quiz.model';

// const router = express.Router();

// // Mock AI-generated quiz questions
// const generateMockQuiz = (topic: string) => {
//   return [
//     {
//       question: `What is a key concept in ${topic}?`,
//       options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'],
//       correctAnswer: 0,
//       explanation: `Concept A is fundamental to ${topic} because it forms the basis of its core principles.`,
//       difficulty: 'easy' as const,
//     },
//     {
//       question: `Which of these is associated with ${topic}?`,
//       options: ['Item 1', 'Item 2', 'Item 3', 'Item 4'],
//       correctAnswer: 1,
//       explanation: `Item 2 is directly related to ${topic} due to its common application.`,
//       difficulty: 'easy' as const,
//     },
//     {
//       question: `What is a primary benefit of ${topic}?`,
//       options: ['Benefit A', 'Benefit B', 'Benefit C', 'Benefit D'],
//       correctAnswer: 2,
//       explanation: `Benefit C is a well-known advantage of ${topic}.`,
//       difficulty: 'easy' as const,
//     },
//   ];
// };

// router.post(
//   '/generate-quiz',
//   (async (req: Request, res: Response) => {
//     const { courseId, lessonId, topic, difficulty } = req.body;

//     if (!courseId || !lessonId || !topic) {
//       res.status(400).json({ success: false, message: 'Missing required fields' });
//       return;
//     }

//     // Replace with actual AI API call (e.g., Grok's API at https://x.ai/api)
//     const questions = generateMockQuiz(topic);

//     const quiz = new QuizModel({
//       courseId,
//       moduleId: lessonId,
//       questions,
//     });

//     await quiz.save();

//     res.json({
//       success: true,
//       questions,
//       quizId: quiz._id,
//     });
//   })
// );

// export default router;