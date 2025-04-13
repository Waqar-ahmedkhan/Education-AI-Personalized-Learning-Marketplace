"use strict";
// import { Router } from "express";
// import { isAuthenticated } from "../middleware/auth";
// import { 
//   generateRecommendations, 
//   getUserRecommendations, 
//   updateUserPreferences, 
//   getPopularCourses,
//   getSimilarCourses,
//   getRecommendationsByTopic,
//   markCourseRecommendationSeen,
//   recordUserInteraction,
//   getCompletedCoursesSuggestions,
//   getPersonalizedLearningPath,
//   getDifficultyBasedRecommendations
// } from "../controllers/recommendation.controller";
// const router = Router();
// // Core recommendation endpoints
// router.get("/recommendations", isAuthenticated, getUserRecommendations);
// router.post("/recommendations/generate", isAuthenticated, generateRecommendations);
// router.put("/preferences", isAuthenticated, updateUserPreferences);
// // Course-specific recommendations
// router.get("/recommendations/similar/:courseId", getSimilarCourses);
// router.get("/recommendations/topic/:topic", isAuthenticated, getRecommendationsByTopic);
// router.get("/recommendations/popular", getPopularCourses);
// router.get("/recommendations/difficulty/:level", isAuthenticated, getDifficultyBasedRecommendations);
// // Learning path recommendations
// router.get("/learning-path", isAuthenticated, getPersonalizedLearningPath);
// router.get("/recommendations/after-completion", isAuthenticated, getCompletedCoursesSuggestions);
// // User interaction and feedback
// router.post("/recommendations/:courseId/seen", isAuthenticated, markCourseRecommendationSeen);
// router.post("/interaction", isAuthenticated, recordUserInteraction);
// export default router;
