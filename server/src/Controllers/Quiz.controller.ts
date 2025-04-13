// import { Request, Response } from "express";
// import asyncHandler from "";
// import QuizModel from "../models/QuizModel"; // Import your Quiz model
// import UserModel from "../models/UserModel"; // Import your User model

// export const getPersonalizedQuiz = asyncHandler(async (req: Request, res: Response) => {
//   const { courseId } = req.params;
//   const userId = req.user._id;

//   const user = await UserModel.findById(userId);
//   const courseProgress = user.courseProgress.find(p => p.courseId.toString() === courseId);

//   // Determine quiz difficulty based on quiz scores
//   const difficulty = determineDifficulty(courseProgress);

//   const quiz = await QuizModel.findOne({
//     courseId,
//     'questions.difficulty': difficulty,
//   });

//   res.json({
//     quizId: quiz._id,
//     questions: quiz.questions.filter(q => q.difficulty === difficulty),
//     recommendedBy: "adaptive",  // Adaptive quiz recommendation
//   });
// });

// // Function to determine difficulty based on progress
// function determineDifficulty(courseProgress: any) {
//   if (courseProgress && courseProgress.quizScores.length) {
//     const avgScore = courseProgress.quizScores.reduce((acc, score) => acc + score.score, 0) / courseProgress.quizScores.length;
//     if (avgScore > 80) return "hard";
//     if (avgScore > 50) return "medium";
//     return "easy";
//   }
//   return "easy"; // Default to easy if no quiz history
// }


// export const trackProgress = asyncHandler(async (req, res) => {
//   const { courseId, lessonId, quizId, score } = req.body;
//   const userId = req.user._id;

//   const user = await UserModel.findById(userId);
//   const courseProgress = user.courseProgress.find(p => p.courseId.toString() === courseId);

//   // Update progress and quiz scores
//   courseProgress.completedLessons.push(lessonId);
//   courseProgress.quizScores.push({ quizId, score, attemptDate: new Date() });

//   // Calculate new progress
//   const progress = (courseProgress.completedLessons.length / totalLessonsInCourse) * 100;
//   courseProgress.progress = progress;

//   await user.save();
//   res.json({ message: "Progress tracked successfully" });
// });


// export const getRecommendedCourses = asyncHandler(async (req, res) => {
//   const userId = req.user._id;
//   const user = await UserModel.findById(userId);

//   // Use preferences, progress, and interaction history to recommend courses
//   const recommendedCourses = generateRecommendations(user);

//   res.json(recommendedCourses);
// });

// // Example recommendation logic (can be replaced with ML-based system)
// function generateRecommendations(user) {
//   return user.preferences.map(pref => ({
//     courseId: pref,
//     score: Math.random() * 100, // Example: score can be calculated based on user behavior
//   }));
// }
