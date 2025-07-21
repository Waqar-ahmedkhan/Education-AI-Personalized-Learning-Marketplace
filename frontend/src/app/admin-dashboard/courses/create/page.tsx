"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Upload,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  BookOpen,
  DollarSign,
  User,
  Video,
  Eye,
  Star,
  Clock,
  Tag,
  GraduationCap,
  PlayCircle,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface CourseData {
  title: string;
  description: string;
  videoUrl: string;
  videoLength: number;
  videoSection: string;
  videoPlayer: string;
  order: number;
}

interface CourseForm {
  name: string;
  description: string;
  price: number;
  estimatedPrice: number;
  thumbnail: string;
  tags: string;
  level: string;
  demoUrl: string;
  category: string;
  instructor: {
    name: string;
    bio?: string;
    avatar?: string;
  };
  courseData: CourseData[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const categories = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "AI & Deep Learning",
  "DevOps",
  "Cloud Computing",
  "Cybersecurity",
  "Database Management",
  "UI/UX Design",
  "Digital Marketing",
  "Project Management",
  "Business Analytics",
  "Photography",
  "Graphic Design",
];

const levels = ["Beginner", "Intermediate", "Advanced", "Expert"];
const videoPlayers = [
  "YouTube",
  "Vimeo",
  "VdoCipher",
  "AWS S3",
  "Custom Player",
];

export default function CreateCoursePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<CourseForm>({
    name: "",
    description: "",
    price: 0,
    estimatedPrice: 0,
    thumbnail: "",
    tags: "",
    level: "",
    demoUrl: "",
    category: "",
    instructor: { name: "" },
    courseData: [
      {
        title: "",
        description: "",
        videoUrl: "",
        videoLength: 0,
        videoSection: "",
        videoPlayer: "YouTube",
        order: 1,
      },
    ],
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set([0])
  );
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const steps = [
    { id: 1, title: "Basic Info", icon: BookOpen },
    { id: 2, title: "Pricing", icon: DollarSign },
    { id: 3, title: "Media", icon: ImageIcon },
    { id: 4, title: "Content", icon: Video },
    { id: 5, title: "Review", icon: Eye },
  ];

  const getFormProgress = () => {
    const totalFields = 12;
    let filledFields = 0;

    if (formData.name) filledFields++;
    if (formData.description) filledFields++;
    if (formData.category) filledFields++;
    if (formData.level) filledFields++;
    if (formData.instructor.name) filledFields++;
    if (formData.price > 0) filledFields++;
    if (formData.thumbnail) filledFields++;
    if (formData.tags) filledFields++;
    if (formData.demoUrl) filledFields++;
    if (formData.courseData.length > 0 && formData.courseData[0].title)
      filledFields++;
    if (formData.courseData.length > 0 && formData.courseData[0].videoUrl)
      filledFields++;
    if (formData.courseData.length > 0 && formData.courseData[0].description)
      filledFields++;

    return (filledFields / totalFields) * 100;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (file.size > 5 * 1024 * 1024) {
          setError("Thumbnail file size must be under 5MB");
          toast.error("Thumbnail file size must be under 5MB");
          return;
        }

        setLoading(true);
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        setFormData({ ...formData, thumbnail: base64 });
        setThumbnailPreview(base64);
        toast.success("Thumbnail uploaded successfully!");
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to process thumbnail";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("No authentication token found");
      toast.error("No authentication token found");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const submitData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        courseData: formData.courseData.map((item, index) => ({
          ...item,
          order: index + 1,
        })),
      };

      await axios.post<ApiResponse<unknown>>(
        `http://localhost:8080/api/v1/upload-course`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("🎉 Course created!");
      router.push("/admin-dashboard/courses");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create course";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCourseData = (
    index: number,
    field: keyof CourseData,
    value: string | number
  ) => {
    const updatedCourseData = [...formData.courseData];
    updatedCourseData[index] = { ...updatedCourseData[index], [field]: value };
    setFormData({ ...formData, courseData: updatedCourseData });
  };

  const addCourseContent = () => {
    const newContent = {
      title: "",
      description: "",
      videoUrl: "",
      videoLength: 0,
      videoSection: "",
      videoPlayer: "YouTube",
      order: formData.courseData.length + 1,
    };

    setFormData({
      ...formData,
      courseData: [...formData.courseData, newContent],
    });

    setExpandedSections(
      new Set([...expandedSections, formData.courseData.length])
    );
    toast.success("New lesson added!");
  };

  const removeCourseContent = (index: number) => {
    if (formData.courseData.length > 1) {
      const updatedCourseData = formData.courseData.filter(
        (_, i) => i !== index
      );
      updatedCourseData.forEach((item, i) => (item.order = i + 1));
      setFormData({ ...formData, courseData: updatedCourseData });

      const newExpandedSections = new Set(expandedSections);
      newExpandedSections.delete(index);
      setExpandedSections(newExpandedSections);

      toast.success("Lesson removed!");
    }
  };

  const toggleSection = (index: number) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(index)) {
      newExpandedSections.delete(index);
    } else {
      newExpandedSections.add(index);
    }
    setExpandedSections(newExpandedSections);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItem === null) return;

    const newCourseData = [...formData.courseData];
    const draggedContent = newCourseData[draggedItem];
    newCourseData.splice(draggedItem, 1);
    newCourseData.splice(dropIndex, 0, draggedContent);

    // Update order
    newCourseData.forEach((item, index) => (item.order = index + 1));

    setFormData({ ...formData, courseData: newCourseData });
    setDraggedItem(null);
    toast.success("Lesson reordered!");
  };

  const getTotalDuration = () => {
    return formData.courseData.reduce(
      (total, item) => total + item.videoLength,
      0
    );
  };

  const getTagsArray = () => {
    return formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/admin-dashboard/courses")}
              className="group border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Courses
            </Button>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Progress
                </div>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {Math.round(getFormProgress())}%
                </div>
              </div>
              <div className="w-32">
                <Progress value={getFormProgress()} className="h-2" />
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Create Amazing Course
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Design and build comprehensive learning experiences that inspire
              and educate students worldwide
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="destructive"
            className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 animate-in slide-in-from-top-2"
          >
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="group shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-t-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 animate-pulse"></div>
              <CardTitle className="text-2xl font-bold flex items-center relative z-10">
                <BookOpen className="h-6 w-6 mr-3" />
                Course Information
                <Badge
                  variant="secondary"
                  className="ml-auto bg-white/20 text-white"
                >
                  Step 1
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label
                    htmlFor="name"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center"
                  >
                    <Star className="h-4 w-4 mr-2 text-yellow-500" />
                    Course Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Enter an engaging course name"
                    className="h-12 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="category"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center"
                  >
                    <Tag className="h-4 w-4 mr-2 text-blue-500" />
                    Category *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className="h-12 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="lg:col-span-2 space-y-3">
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Course Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    placeholder="Describe what students will learn and achieve in this course..."
                    rows={6}
                    className="border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 text-base"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing and Details */}
          <Card className="group shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-t-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-teal-600/20 animate-pulse"></div>
              <CardTitle className="text-2xl font-bold flex items-center relative z-10">
                <DollarSign className="h-6 w-6 mr-3" />
                Pricing & Details
                <Badge
                  variant="secondary"
                  className="ml-auto bg-white/20 text-white"
                >
                  Step 2
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="price"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Price ($) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                    required
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    className="h-12 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="estimatedPrice"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Original Price ($)
                  </Label>
                  <Input
                    id="estimatedPrice"
                    type="number"
                    value={formData.estimatedPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedPrice: Number(e.target.value),
                      })
                    }
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    className="h-12 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="level"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center"
                  >
                    <GraduationCap className="h-4 w-4 mr-2 text-purple-500" />
                    Difficulty Level *
                  </Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) =>
                      setFormData({ ...formData, level: value })
                    }
                  >
                    <SelectTrigger className="h-12 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500 transition-all duration-300">
                      <SelectValue placeholder="Select difficulty level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="instructorName"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center"
                  >
                    <User className="h-4 w-4 mr-2 text-indigo-500" />
                    Instructor Name *
                  </Label>
                  <Input
                    id="instructorName"
                    value={formData.instructor.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instructor: {
                          ...formData.instructor,
                          name: e.target.value,
                        },
                      })
                    }
                    required
                    placeholder="Enter instructor name"
                    className="h-12 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="instructorBio"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Instructor Bio
                  </Label>
                  <Input
                    id="instructorBio"
                    value={formData.instructor.bio || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instructor: {
                          ...formData.instructor,
                          bio: e.target.value,
                        },
                      })
                    }
                    placeholder="Brief instructor biography"
                    className="h-12 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="instructorAvatar"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Instructor Avatar URL
                  </Label>
                  <Input
                    id="instructorAvatar"
                    value={formData.instructor.avatar || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instructor: {
                          ...formData.instructor,
                          avatar: e.target.value,
                        },
                      })
                    }
                    placeholder="https://example.com/avatar.jpg"
                    className="h-12 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="demoUrl"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center"
                  >
                    <PlayCircle className="h-4 w-4 mr-2 text-red-500" />
                    Demo URL
                  </Label>
                  <Input
                    id="demoUrl"
                    value={formData.demoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, demoUrl: e.target.value })
                    }
                    placeholder="https://example.com/demo"
                    className="h-12 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="tags"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Tags (comma-separated)
                  </Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="react, javascript, frontend, programming"
                    className="h-12 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Tags Preview */}
              {getTagsArray().length > 0 && (
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tags Preview:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getTagsArray().map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Thumbnail Upload */}
          <Card className="group shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white rounded-t-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-rose-600/20 animate-pulse"></div>
              <CardTitle className="text-2xl font-bold flex items-center relative z-10">
                <ImageIcon className="h-6 w-6 mr-3" />
                Course Thumbnail
                <Badge
                  variant="secondary"
                  className="ml-auto bg-white/20 text-white"
                >
                  Step 3
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label
                    htmlFor="thumbnail"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Upload Thumbnail Image
                  </Label>
                  <div className="relative group">
                    <label
                      htmlFor="thumbnail"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 hover:from-indigo-50 hover:to-purple-50 dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all duration-300 group-hover:border-indigo-400 dark:group-hover:border-indigo-500"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 mb-4 text-slate-400 group-hover:text-indigo-500 transition-colors duration-300" />
                        <p className="mb-2 text-base text-slate-600 dark:text-slate-300">
                          <span className="font-bold">Click to upload</span> or
                          drag and drop
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          PNG, JPG or GIF (MAX. 5MB)
                        </p>
                      </div>
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {thumbnailPreview && (
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Thumbnail Preview
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <img
                        src={thumbnailPreview}
                        alt="Course thumbnail"
                        className="relative w-full h-48 object-cover rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Course Content */}
          <Card className="group shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-t-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-pink-600/20 animate-pulse"></div>
              <CardTitle className="text-2xl font-bold flex items-center justify-between relative z-10">
                <div className="flex items-center">
                  <Video className="h-6 w-6 mr-3" />
                  Course Content
                  <Badge
                    variant="secondary"
                    className="ml-3 bg-white/20 text-white"
                  >
                    {formData.courseData.length} Lessons
                  </Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm bg-white/20 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4 mr-1" />
                    {getTotalDuration()} min
                  </div>
                  <Button
                    type="button"
                    onClick={addCourseContent}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 transition-colors"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {formData.courseData.map((data, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className="relative group transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="absolute -left-4 top-4 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:scale-110 transition-transform duration-300">
                      {index + 1}
                    </div>
                    <div
                      className={`ml-8 p-6 border-2 rounded-xl transition-all duration-300 ${
                        expandedSections.has(index)
                          ? "border-orange-200 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/10"
                          : "border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700/50"
                      } group-hover:border-orange-300 dark:group-hover:border-orange-600`}
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection(index)}
                      >
                        <div className="flex items-center space-x-4">
                          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                            Lesson {index + 1}: {data.title || "Untitled"}
                          </h4>
                          <Badge
                            variant="outline"
                            className="text-sm border-slate-300 dark:border-slate-600"
                          >
                            {data.videoLength || 0} min
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4">
                          {formData.courseData.length > 1 && (
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCourseContent(index);
                              }}
                              variant="outline"
                              size="sm"
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          {expandedSections.has(index) ? (
                            <ChevronUp className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          )}
                        </div>
                      </div>

                      {expandedSections.has(index) && (
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in-20">
                          <div className="space-y-3">
                            <Label
                              htmlFor={`content-title-${index}`}
                              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                            >
                              Lesson Title *
                            </Label>
                            <Input
                              id={`content-title-${index}`}
                              value={data.title}
                              onChange={(e) =>
                                updateCourseData(index, "title", e.target.value)
                              }
                              required
                              placeholder="Enter lesson title"
                              className="h-12 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 transition-all duration-300"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label
                              htmlFor={`content-videoLength-${index}`}
                              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                            >
                              Video Length (minutes) *
                            </Label>
                            <Input
                              id={`content-videoLength-${index}`}
                              type="number"
                              value={data.videoLength}
                              onChange={(e) =>
                                updateCourseData(
                                  index,
                                  "videoLength",
                                  Number(e.target.value)
                                )
                              }
                              required
                              min={0}
                              placeholder="0"
                              className="h-12 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 transition-all duration-300"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label
                              htmlFor={`content-videoSection-${index}`}
                              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                            >
                              Section Name *
                            </Label>
                            <Input
                              id={`content-videoSection-${index}`}
                              value={data.videoSection}
                              onChange={(e) =>
                                updateCourseData(
                                  index,
                                  "videoSection",
                                  e.target.value
                                )
                              }
                              required
                              placeholder="e.g., Introduction, Basics"
                              className="h-12 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 transition-all duration-300"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label
                              htmlFor={`content-videoPlayer-${index}`}
                              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                            >
                              Video Player *
                            </Label>
                            <Select
                              value={data.videoPlayer}
                              onValueChange={(value) =>
                                updateCourseData(index, "videoPlayer", value)
                              }
                            >
                              <SelectTrigger className="h-12 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 transition-all duration-300">
                                <SelectValue placeholder="Select video player" />
                              </SelectTrigger>
                              <SelectContent>
                                {videoPlayers.map((player) => (
                                  <SelectItem key={player} value={player}>
                                    {player}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label
                              htmlFor={`content-order-${index}`}
                              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                            >
                              Order *
                            </Label>
                            <Input
                              id={`content-order-${index}`}
                              type="number"
                              value={data.order}
                              onChange={(e) =>
                                updateCourseData(
                                  index,
                                  "order",
                                  Number(e.target.value)
                                )
                              }
                              required
                              min={1}
                              placeholder="1"
                              className="h-12 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 transition-all duration-300"
                            />
                          </div>

                          <div className="lg:col-span-2 space-y-3">
                            <Label
                              htmlFor={`content-description-${index}`}
                              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                            >
                              Lesson Description *
                            </Label>
                            <Textarea
                              id={`content-description-${index}`}
                              value={data.description}
                              onChange={(e) =>
                                updateCourseData(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              required
                              placeholder="Describe what students will learn in this lesson..."
                              rows={4}
                              className="border-slate-500 dark:border-slate-400 focus:border-orange-600 focus:ring-orange-600 transition-all duration-300"
                            />
                          </div>

                          <div className="lg:col-span-2 space-y-3">
                            <Label
                              htmlFor={`content-videoUrl-${index}`}
                              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                            >
                              Video URL *
                            </Label>
                            <Input
                              id={`content-videoUrl-${index}`}
                              value={data.videoUrl}
                              onChange={(e) =>
                                updateCourseData(
                                  index,
                                  "videoUrl",
                                  e.target.value
                                )
                              }
                              required
                              placeholder="https://example.com/video"
                              className="h-12 border-slate-300 dark:border-gray-600 focus:border-orange-500 focus:ring-blue-500 transition-all duration-300"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Review Section */}
          <Card className="group shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 animate-pulse"></div>
              <CardTitle className="text-2xl font-bold flex items-center relative z-10">
                <Eye className="h-6 w-6 mr-3" />
                Review & Preview
                <Badge
                  variant="secondary"
                  className="ml-auto bg-white/20 text-white"
                >
                  Step 5
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Course Overview
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Course Name
                      </Label>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formData.name || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Category
                      </Label>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formData.category || "N/A"}
                      </p>
                    </div>
                    <div className="lg:col-span-2 space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Description
                      </Label>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formData.description || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Price
                      </Label>
                      <p className="text-gray-600 dark:text-gray-400">
                        ${formData.price || 0}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Original Price
                      </Label>
                      <p className="text-gray-600 dark:text-gray-400">
                        ${formData.estimatedPrice || 0}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Level
                      </Label>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formData.level || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Instructor
                      </Label>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formData.instructor.name || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Demo URL
                      </Label>
                      <p className="text-blue-600 dark:text-blue-400">
                        {formData.demoUrl || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Tags
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {getTagsArray().map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator className="lg:col-span-2 my-4" />
                    <div className="lg:col-span-2 space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Course Content
                      </Label>
                      <div className="space-y-4">
                        {formData.courseData.map((item, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            <h5 className="font-semibold text-gray-800 dark:text-gray-200">
                              Lesson {index + 1}: {item.title}
                            </h5>
                            <p className="text-gray-600 dark:text-gray-400">
                              {item.description}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Section: {item.videoSection} | Duration:{" "}
                              {item.videoLength} min | Player:{" "}
                              {item.videoPlayer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {thumbnailPreview && (
                      <div className="lg:col-span-2 space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Thumbnail Preview
                        </Label>
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center space-x-4 sticky bottom-0 bg-white/80 dark:bg-gray-800/80 py-4 px-4 border-t border-gray-200 dark:border-gray-700 backdrop-blur-sm">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin-dashboard/courses")}
              className="px-8 py-4 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-all duration-300"
            >
              Cancel
            </Button>
            <div className="flex space-x-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-8 py-4 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Previous
                </Button>
              )}
              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-bg-700 text-white transition-all duration-300"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Course...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Publish Course
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
