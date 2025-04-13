import mongoose, { Schema, Document } from "mongoose";

interface IQuiz extends Document {
  courseId: mongoose.Types.ObjectId;
  moduleId: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    difficulty: "easy" | "medium" | "hard";
  }>;
}

const quizSchema = new Schema<IQuiz>({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  moduleId: { type: String, required: true },
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String,
      difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    },
  ],
});

export default mongoose.model<IQuiz>("Quiz", quizSchema);
