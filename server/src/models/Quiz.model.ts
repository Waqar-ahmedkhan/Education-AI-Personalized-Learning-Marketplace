import mongoose, { Schema, Document } from 'mongoose';

interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface IQuiz extends Document {
  courseId: mongoose.Types.ObjectId;
  moduleId: string;
  questions: IQuizQuestion[];
}

const quizQuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
});

const quizSchema = new Schema<IQuiz>({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  moduleId: { type: String, required: true },
  questions: [quizQuestionSchema],
});

export default mongoose.model<IQuiz>('Quiz', quizSchema);