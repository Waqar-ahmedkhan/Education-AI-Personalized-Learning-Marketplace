"use strict";
// import { Request, Response } from "express";
// import UserModel from "../models/user.model";
// import CourseModel from "../models/Course.model";
// import mongoose from "mongoose";
// // Get user's current recommendations
// export const getUserRecommendations = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.id; 
//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     // Populate course details for recommendations
//     const populatedUser = await UserModel.findById(userId).populate({
//       path: "recommendedCourses.courseId",
//       select: "name description thumbnail level rating purchased tags topics"
//     });
//     res.status(200).json({ 
//       recommendations: populatedUser?.recommendedCourses || [],
//       lastUpdated: populatedUser?.recommendedCourses[0]?.lastUpdated || null
//     });
//   } catch (error: any) {
//     res.status(500).json({ message: "Error fetching recommendations", error: error.message });
//   }
// };
// // Generate personalized recommendations based on user preferences and history
// export const generateRecommendations = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.id;
//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     // Extract user preferences and interests
//     const { preferences } = user;
//     const interests = user.interests || [];
//     const interestTopics = interests.map(interest => interest.topic);
//     // Combine explicit preferences with weighted interests
//     const allPreferences = [...new Set([...preferences, ...interestTopics])];
//     // Get enrolled courses to exclude
//     const enrolledCourseIds = user.courses.map(course => course.courseId);
//     const inProgressCourseIds = user.courseProgress?.map(progress => progress.courseId.toString()) || [];
//     // Get user course history for analyzing completed courses
//     const userHistory = user.courseProgress?.filter(course => course.progress === 100) || [];
//     const completedCourseIds = userHistory.map(course => course.courseId.toString());
//     // Fetch courses matching preferences but not already enrolled or in progress
//     const candidateCourses = await CourseModel.find({
//       $or: [
//         { tags: { $in: allPreferences } },
//         { topics: { $in: allPreferences } },
//         { level: user.skillLevel || "beginner" }
//       ],
//       _id: { 
//         $nin: [...enrolledCourseIds, ...inProgressCourseIds] 
//       }
//     }).lean();
//     // Calculate scores and reasons for each candidate course
//     const recommendations = candidateCourses.map(course => {
//       // Initial score based on tag matches
//       let score = 0;
//       let reasons = [];
//       // Score for matching preferences
//       const preferenceMatches = course.tags.filter(tag => preferences.includes(tag)).length;
//       if (preferenceMatches > 0) {
//         score += preferenceMatches * 10;
//         reasons.push("Matches your preferred topics");
//       }
//       // Score for matching interests with weighted importance
//       const interestMatches = interests.filter(interest => 
//         course.tags.includes(interest.topic) || course.topics?.includes(interest.topic)
//       );
//       if (interestMatches.length > 0) {
//         const interestScore = interestMatches.reduce((total, interest) => total + interest.weight, 0);
//         score += interestScore * 5;
//         reasons.push("Aligned with your interests");
//       }
//       // Popularity bonus
//       if (course.popularity > 50) {
//         score += Math.min(course.popularity / 10, 20);
//         reasons.push("Popular among other learners");
//       }
//       // Skill level matching
//       if (course.level === user.skillLevel) {
//         score += 15;
//         reasons.push("Matches your skill level");
//       }
//       // Continuous learning path bonus (if completed prerequisites)
//       const hasCompletedPrereqs = course.prerequisites?.every(prereq => 
//         completedCourseIds.some(id => id === prereq.title?.toString())
//       );
//       if (hasCompletedPrereqs && course.prerequisites?.length > 0) {
//         score += 25;
//         reasons.push("Builds on courses you've completed");
//       }
//       return { 
//         courseId: course._id, 
//         score, 
//         reason: reasons[0] || "Recommended based on your profile",
//         lastUpdated: new Date(),
//         course // Include full course data for the response
//       };
//     });
//     // Sort by score and take the top recommendations
//     recommendations.sort((a, b) => b.score - a.score);
//     const topRecommendations = recommendations.slice(0, 10);
//     // Update user recommendations
//     user.recommendedCourses = topRecommendations.map(({ courseId, score, reason, lastUpdated }) => ({
//       courseId,
//       score,
//       reason,
//       lastUpdated
//     }));
//     await user.save();
//     // Return recommendations with course details
//     res.status(200).json({ 
//       message: "Recommendations generated successfully", 
//       recommendations: topRecommendations
//     });
//   } catch (error: any) {
//     res.status(500).json({ message: "Error generating recommendations", error: error.message });
//   }
// };
// // Update user preferences to refine recommendations
// export const updateUserPreferences = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.id;
//     const { preferences, interests } = req.body;
//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     // Update preferences if provided
//     if (preferences && Array.isArray(preferences)) {
//       user.preferences = preferences;
//     }
//     // Update interests if provided
//     if (interests && Array.isArray(interests)) {
//       // Convert simple array to weighted interests if needed
//       const formattedInterests = interests.map(interest => {
//         if (typeof interest === 'string') {
//           return {
//             topic: interest,
//             weight: 5, // Default mid-weight
//             dateAdded: new Date()
//           };
//         }
//         return interest;
//       });
//       user.interests = formattedInterests;
//     }
//     await user.save();
//     // Regenerate recommendations with updated preferences
//     await generateRecommendations(req, res);
//   } catch (error: any) {
//     res.status(500).json({ message: "Error updating preferences", error: error.message });
//   }
// };
// // Get popular courses (unfiltered recommendations)
// export const getPopularCourses = async (req: Request, res: Response) => {
//   try {
//     const { limit = 10, category } = req.query;
//     const query: any = {};
//     if (category) {
//       query.category = category;
//     }
//     const popularCourses = await CourseModel.find(query)
//       .sort({ popularity: -1, rating: -1 })
//       .limit(Number(limit))
//       .select("name description thumbnail level rating purchased tags topics");
//     res.status(200).json({ popularCourses });
//   } catch (error: any) {
//     res.status(500).json({ message: "Error fetching popular courses", error: error.message });
//   }
// };
// // Get similar courses to a specific course
// export const getSimilarCourses = async (req: Request, res: Response) => {
//   try {
//     const { courseId } = req.params;
//     const { limit = 5 } = req.query;
//     const course = await CourseModel.findById(courseId);
//     if (!course) {
//       return res.status(404).json({ message: "Course not found" });
//     }
//     // First check if the course has explicit related courses
//     if (course.relatedCourses && course.relatedCourses.length > 0) {
//       const relatedCourses = await CourseModel.find({
//         _id: { $in: course.relatedCourses, $ne: courseId }
//       })
//       .limit(Number(limit))
//       .select("name description thumbnail level rating purchased tags topics");
//       return res.status(200).json({ similarCourses: relatedCourses });
//     }
//     // Otherwise, find by tags and topics similarity
//     const similarCourses = await CourseModel.find({
//       $or: [
//         { tags: { $in: course.tags } },
//         { topics: { $in: course.topics } },
//       ],
//       _id: { $ne: courseId },
//       level: course.level
//     })
//     .limit(Number(limit))
//     .select("name description thumbnail level rating purchased tags topics");
//     res.status(200).json({ similarCourses });
//   } catch (error: any) {
//     res.status(500).json({ message: "Error fetching similar courses", error: error.message });
//   }
// };
// // Get recommendations by specific topic
// export const getRecommendationsByTopic = async (req: Request, res: Response) => {
//   try {
//     const { topic } = req.params;
//     const { limit = 10 } = req.query;
//     const userId = req.user?.id;
//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     // Get courses user has already enrolled in
//     const enrolledCourseIds = user.courses.map(course => course.courseId);
//     // Find courses by topic that user hasn't enrolled in yet
//     const topicCourses = await CourseModel.find({
//       $or: [
//         { tags: topic },
//         { topics: topic },
//         { category: topic }
//       ],
//       _id: { $nin: enrolledCourseIds }
//     })
//     .sort({ popularity: -1, rating: -1 })
//     .limit(Number(limit))
//     .select("name description thumbnail level rating purchased tags topics");
//     res.status(200).json({ 
//       topic,
//       courses: topicCourses 
//     });
//   } catch (error: any) {
//     res.status(500).json({ message: "Error fetching topic recommendations", error: error.message });
//   }
// };
// // Mark recommendation as seen/clicked to improve future recommendations
// export const markCourseRecommendationSeen = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.id;
//     const { courseId } = req.params;
//     const { action = "clicked" } = req.body; // clicked, ignored, enrolled
//     // Record this interaction for future recommendation improvements
//     await recordInteraction(userId, courseId, action);
//     res.status(200).json({ message: "Interaction recorded successfully" });
//   } catch (error: any) {
//     res.status(500).json({ message: "Error recording interaction", error: error.message });
//   }
// };
// // Record general user interaction with courses for recommendation improvement
// export const recordUserInteraction = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.id;
//     const { courseId, action, duration, section } = req.body;
//     await recordInteraction(userId, courseId, action, { duration, section });
//     res.status(200).json({ message: "Interaction recorded successfully" });
//   } catch (error: any) {
//     res.status(500).json({ message: "Error recording interaction", error: error.message });
//   }
// };
// // Get post-completion course suggestions
// export const getCompletedCoursesSuggestions = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.id;
//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     // Get completed courses
//     const completedCourseIds = user.courseProgress
//       ?.filter(progress => progress.progress === 100)
//       .map(progress => progress.courseId) || [];
//     if (completedCourseIds.length === 0) {
//       return res.status(200).json({ 
//         message: "No completed courses found",
//         nextCourses: [] 
//       });
//     }
//     // Get the completed courses to analyze their tags and topics
//     const completedCourses = await CourseModel.find({
//       _id: { $in: completedCourseIds }
//     });
//     // Extract all tags and topics from completed courses
//     const completedTags = completedCourses.flatMap(course => course.tags);
//     const completedTopics = completedCourses.flatMap(course => course.topics || []);
//     // Find the most common tags/topics
//     const tagCounts = countOccurrences(completedTags);
//     const topicCounts = countOccurrences(completedTopics);
//     // Get top tags and topics
//     const topTags = Object.entries(tagCounts)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 5)
//       .map(entry => entry[0]);
//     const topTopics = Object.entries(topicCounts)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 5)
//       .map(entry => entry[0]);
//     // Find advanced courses in the same topics that user hasn't taken
//     const nextLevelCourses = await CourseModel.find({
//       $or: [
//         { tags: { $in: topTags } },
//         { topics: { $in: topTopics } }
//       ],
//       level: { $in: ["intermediate", "advanced"] },
//       _id: { $nin: user.courses.map(course => course.courseId) }
//     })
//     .sort({ popularity: -1 })
//     .limit(5)
//     .select("name description thumbnail level rating purchased tags topics");
//     res.status(200).json({ 
//       nextCourses: nextLevelCourses,
//       basedOn: {
//         completedCourses: completedCourses.length,
//         topTopics: [...topTags, ...topTopics].slice(0, 5)
//       }
//     });
//   } catch (error: any) {
//     res.status(500).json({ message: "Error generating suggestions", error: error.message });
//   }
// };
// // Get personalized learning path (sequence of recommended courses)
// export const getPersonalizedLearningPath = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.id;
//     const { goalTopic, timeframe } = req.query; // e.g., "web-development", "3months"
//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     // Get user's current skill level and completed courses
//     const userLevel = determineUserLevel(user);
//     const completedCourseIds = user.courseProgress
//       ?.filter(progress => progress.progress === 100)
//       .map(progress => progress.courseId) || [];
//     // Build a progressive learning path
//     let learningPath = [];
//     // If user specified a goal topic
//     if (goalTopic) {
//       // Find foundational courses first
//       const foundation = await CourseModel.find({
//         $or: [
//           { tags: goalTopic },
//           { topics: goalTopic },
//           { category: goalTopic }
//         ],
//         level: "beginner",
//         _id: { $nin: completedCourseIds }
//       })
//       .sort({ popularity: -1 })
//       .limit(1);
//       if (foundation.length > 0) {
//         learningPath.push({
//           phase: "Foundation",
//           course: foundation[0]
//         });
//       }
//       // Find intermediate level courses
//       const intermediate = await CourseModel.find({
//         $or: [
//           { tags: goalTopic },
//           { topics: goalTopic },
//           { category: goalTopic }
//         ],
//         level: "intermediate",
//         _id: { $nin: completedCourseIds }
//       })
//       .sort({ popularity: -1 })
//       .limit(2);
//       intermediate.forEach(course => {
//         learningPath.push({
//           phase: "Building Skills",
//           course
//         });
//       });
//       // Find advanced level courses
//       const advanced = await CourseModel.find({
//         $or: [
//           { tags: goalTopic },
//           { topics: goalTopic },
//           { category: goalTopic }
//         ],
//         level: "advanced",
//         _id: { $nin: completedCourseIds }
//       })
//       .sort({ popularity: -1 })
//       .limit(1);
//       if (advanced.length > 0) {
//         learningPath.push({
//           phase: "Mastery",
//           course: advanced[0]
//         });
//       }
//     } else {
//       // Without a specific goal, recommend based on user interests
//       const { preferences, interests } = user;
//       const interestTopics = interests?.map(i => i.topic) || [];
//       const allInterests = [...new Set([...preferences, ...interestTopics])];
//       if (allInterests.length === 0) {
//         return res.status(200).json({ 
//           message: "Please update your preferences to get a learning path",
//           learningPath: []
//         });
//       }
//       // Find courses based on user interests and skill level progression
//       for (const level of ["beginner", "intermediate", "advanced"]) {
//         const courses = await CourseModel.find({
//           $or: [
//             { tags: { $in: allInterests } },
//             { topics: { $in: allInterests } }
//           ],
//           level,
//           _id: { $nin: completedCourseIds }
//         })
//         .sort({ popularity: -1 })
//         .limit(level === "intermediate" ? 2 : 1);
//         courses.forEach(course => {
//           learningPath.push({
//             phase: levelToPhase(level),
//             course
//           });
//         });
//       }
//     }
//     res.status(200).json({ 
//       learningPath,
//       estimatedCompletionTime: calculateCompletionTime(learningPath, timeframe)
//     });
//   } catch (error: any) {
//     res.status(500).json({ message: "Error generating learning path", error: error.message });
//   }
// };
// // Get recommendations based on difficulty level
// export const getDifficultyBasedRecommendations = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.id;
//     const { level } = req.params; // beginner, intermediate, advanced
//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     // Get courses user has already enrolled in
//     const enrolledCourseIds = user.courses.map(course => course.courseId);
//     // Find courses matching the difficulty level
//     const courses = await CourseModel.find({
//       level,
//       _id: { $nin: enrolledCourseIds }
//     })
//     .sort({ popularity: -1 })
//     .limit(10)
//     .select("name description thumbnail level rating purchased tags topics");
//     res.status(200).json({
//       difficultyLevel: level,
//       courses
//     });
//   } catch (error: any) {
//     res.status(500).json({ message: "Error fetching recommendations", error: error.message });
//   }
// };
// // Helper function to record user interaction
// async function recordInteraction(userId: string, courseId: string, action: string, details: any = {}) {
//   // Here you would typically record this to a separate collection for analytics
//   // This is a simplified version
//   const user = await UserModel.findById(userId);
//   if (!user) {
//     throw new Error("User not found");
//   }
//   // Update interaction history (you'd need to add this field to your user schema)
//   // This is just an example of how you might track this data
//   if (!user.interactionHistory) {
//     user.interactionHistory = [];
//   }
//   user.interactionHistory.push({
//     courseId,
//     action,
//     timestamp: new Date(),
//     ...details
//   });
//   // Limit history size if needed
//   if (user.interactionHistory.length > 100) {
//     user.interactionHistory = user.interactionHistory.slice(-100);
//   }
//   await user.save();
//   return true;
// }
// // Helper function to count occurrences in an array
// function countOccurrences(arr: string[]) {
//   return arr.reduce((acc, curr) => {
//     acc[curr] = (acc[curr] || 0) + 1;
//     return acc;
//   }, {} as Record<string, number>);
// }
// // Helper to determine user's skill level based on completed courses
// function determineUserLevel(user: any) {
//   const completedCourses: { courseId: string; progress: number }[] = user.courseProgress?.filter((p: { progress: number }) => p.progress === 100) || [];
//   if (completedCourses.length === 0) return "beginner";
//   if (completedCourses.length >= 10) return "advanced";
//   return "intermediate";
// }
// // Helper to convert level to phase name
// function levelToPhase(level: string) {
//   switch (level) {
//     case "beginner": return "Foundation";
//     case "intermediate": return "Building Skills";
//     case "advanced": return "Mastery";
//     default: return "Learning";
//   }
// }
// // Helper to calculate estimated completion time
// function calculateCompletionTime(learningPath: any[], timeframe: any) {
//   // Calculate total minutes
//   const totalMinutes = learningPath.reduce((total, item) => {
//     return total + (item.course.duration || 0);
//   }, 0);
//   // Convert to hours
//   const hours = Math.round(totalMinutes / 60);
//   // If user specified a timeframe, calculate weekly commitment
//   if (timeframe) {
//     const weeks = parseInt(timeframe);
//     if (!isNaN(weeks) && weeks > 0) {
//       const hoursPerWeek = Math.ceil(hours / weeks);
//       return `${hours} hours total (${hoursPerWeek} hours/week for ${weeks} weeks)`;
//     }
//   }
//   return `Approximately ${hours} hours`;
// }
