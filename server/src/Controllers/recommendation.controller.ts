import { Request, Response } from "express";
import UserModel from "../models/user.model";
import CourseModel from "../models/Course.model";

// Recommendation Logic
export const generateRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Assuming authenticated user
    const user = await UserModel.findById(userId).populate("courses.courseId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract user preferences and exclude enrolled courses
    const { preferences, courses } = user;
    const enrolledCourseIds = courses.map((course) => course.courseId);

    // Fetch courses matching preferences but not already enrolled
    const candidateCourses = await CourseModel.find({
      tags: { $in: preferences },
      _id: { $nin: enrolledCourseIds },
    }).lean();

    // Calculate scores based on tag matches and popularity
    const recommendations = candidateCourses.map((course) => {
      const matchCount = course.tags.filter((tag) => preferences.includes(tag)).length;
      const score = matchCount * 2 + course?.purchased; // Example scoring formula
      return { courseId: course._id, score, course };
    });

    // Sort by score and take the top 10
    recommendations.sort((a, b) => b.score - a.score);

    // Update user recommendations
    user?.recommendedCourses = recommendations.slice(0, 10).map(({ courseId, score }) => ({
      courseId,
      score,
    }));
    await user.save();

    res.status(200).json({ message: "Recommendations generated", recommendations });
  } catch (error) {
    res.status(500).json({ message: "Error generating recommendations", error: error.message });
  }
};
