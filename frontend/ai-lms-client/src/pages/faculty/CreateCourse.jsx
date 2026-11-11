import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import {
  BookOpen,
  Image,
  Layers,
  Trash2,
  Plus,
  ArrowLeft,
  Video
} from "lucide-react";
import { Card, Button, Input, Alert } from "../../components/common/UIPrimitives";
import { useAuth } from "../../context/AuthContext";

function CreateCourse() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState({
    title: "",
    category: "Computer Science",
    level: "Beginner",
    description: "",
    thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
    price: 0,
    chapters: [
      {
        id: "ch-1",
        title: "Introduction & Fundamentals",
        lessons: [
          { id: "les-1", title: "Course Overview & Objectives", duration: "10 mins", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
        ]
      }
    ]
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("basic"); // "basic", "media", "curriculum"

  const categories = [
    "Computer Science",
    "Artificial Intelligence",
    "Web Development",
    "Data Science",
    "Cloud Computing",
    "Cybersecurity"
  ];

  const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];

  const handleAddChapter = () => {
    const newChapterId = `ch-${Date.now()}`;
    setCourse({
      ...course,
      chapters: [
        ...course.chapters,
        {
          id: newChapterId,
          title: `Chapter ${course.chapters.length + 1}: New Topic`,
          lessons: [
            { id: `les-${Date.now()}`, title: "Introduction", duration: "15 mins", videoUrl: "" }
          ]
        }
      ]
    });
  };

  const handleRemoveChapter = (chIndex) => {
    const updated = course.chapters.filter((_, idx) => idx !== chIndex);
    setCourse({ ...course, chapters: updated });
  };

  const handleAddLesson = (chIndex) => {
    const updated = [...course.chapters];
    updated[chIndex].lessons.push({
      id: `les-${Date.now()}`,
      title: "New Lesson",
      duration: "15 mins",
      videoUrl: ""
    });
    setCourse({ ...course, chapters: updated });
  };

  const handleRemoveLesson = (chIndex, lesIndex) => {
    const updated = [...course.chapters];
    updated[chIndex].lessons = updated[chIndex].lessons.filter((_, idx) => idx !== lesIndex);
    setCourse({ ...course, chapters: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!course.title.trim()) {
      setErrorMsg("Course title is required.");
      return;
    }
    if (!course.description.trim()) {
      setErrorMsg("Course description is required.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      const payload = {
        title: course.title.trim(),
        description: course.description.trim(),
        category: course.category,
        level: course.level,
        thumbnail: course.thumbnailUrl?.trim() || "/images/courses/default-course.jpg",
        thumbnailUrl: course.thumbnailUrl?.trim() || "/images/courses/default-course.jpg",
        price: Number(course.price) || 0,
        instructorId: user?.id || "",
        instructorName: user?.name || "Faculty Instructor",
        chapters: course.chapters.map((ch, chIdx) => ({
          title: ch.title.trim() || `Chapter ${chIdx + 1}`,
          order: chIdx + 1,
          lessons: ch.lessons.map((les, lesIdx) => ({
            title: les.title.trim() || `Lesson ${lesIdx + 1}`,
            duration: les.duration?.trim() || "15 mins",
            videoUrl: les.videoUrl?.trim() || "",
            order: lesIdx + 1
          }))
        }))
      };

      await api.post("/Courses", payload);
      navigate("/faculty/courses");
    } catch (err) {
      console.error("Course creation failed:", err);
      const serverErrors = err.response?.data?.errors;
      const errorDetails = serverErrors
        ? Object.values(serverErrors).flat().join(" ")
        : null;
      setErrorMsg(
        err.response?.data?.message ||
          errorDetails ||
          err.response?.data?.title ||
          "Failed to publish course. Please verify details."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <Link to="/faculty/courses" className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Course</h1>
            <p className="text-xs text-slate-500">Design curriculum chapters, lectures, and pedagogical metadata.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/faculty/courses">
            <Button variant="outline" size="sm">Cancel</Button>
          </Link>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={saving}>
            {saving ? "Publishing..." : "Publish Course"}
          </Button>
        </div>
      </div>

      {errorMsg && (
        <Alert type="error">
          {errorMsg}
        </Alert>
      )}

      {/* Navigation Steps / Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("basic")}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "basic"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <BookOpen className="w-4 h-4" /> 1. Course Information
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("media")}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "media"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <Image className="w-4 h-4" /> 2. Media & Thumbnail
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("curriculum")}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "curriculum"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <Layers className="w-4 h-4" /> 3. Curriculum Builder ({course.chapters.length})
        </button>
      </div>

      {/* Tab 1: Basic Information */}
      {activeTab === "basic" && (
        <Card className="p-6 space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Core Course Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Course Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Advanced Operating Systems: Kernel Design & Synchronization"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={course.category}
                  onChange={(e) => setCourse({ ...course, category: e.target.value })}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty Level</label>
                <select
                  value={course.level}
                  onChange={(e) => setCourse({ ...course, level: e.target.value })}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {levels.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Price (USD)</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0 (Free)"
                  value={course.price}
                  onChange={(e) => setCourse({ ...course, price: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Comprehensive Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Provide a detailed overview of what students will learn, prerequisites, and learning outcomes..."
                value={course.description}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                className="w-full p-3.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button variant="primary" size="sm" onClick={() => setActiveTab("media")}>
              Next: Media & Assets →
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 2: Media & Thumbnail */}
      {activeTab === "media" && (
        <Card className="p-6 space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Course Banner & Thumbnail
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Thumbnail Image URL
              </label>
              <Input
                placeholder="https://images.unsplash.com/..."
                value={course.thumbnailUrl}
                onChange={(e) => setCourse({ ...course, thumbnailUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Preview:</span>
              <div className="w-full max-w-md h-52 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                <img
                  src={course.thumbnailUrl}
                  alt="Course Thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80";
                  }}
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-medium text-slate-500">Quick Pre-set Banners:</span>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: "Algorithms & AI", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80" },
                  { label: "Database Engineering", url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80" },
                  { label: "Cloud Systems", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80" },
                  { label: "Software Architecture", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80" }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setCourse({ ...course, thumbnailUrl: preset.url })}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-indigo-300 cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setActiveTab("basic")}>
              ← Back: Information
            </Button>
            <Button variant="primary" size="sm" onClick={() => setActiveTab("curriculum")}>
              Next: Curriculum Builder →
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 3: Curriculum Builder */}
      {activeTab === "curriculum" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Chapters & Lessons
            </h2>
            <Button variant="outline" size="sm" onClick={handleAddChapter}>
              <Plus className="w-4 h-4 mr-1" /> Add Chapter
            </Button>
          </div>

          <div className="space-y-4">
            {course.chapters.map((chapter, chIdx) => (
              <Card key={chapter.id} className="p-5 border-l-4 border-l-indigo-600 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      Chapter {chIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => {
                        const updated = [...course.chapters];
                        updated[chIdx].title = e.target.value;
                        setCourse({ ...course, chapters: updated });
                      }}
                      className="font-bold text-sm text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1 py-0.5 flex-1"
                    />
                  </div>

                  {course.chapters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveChapter(chIdx)}
                      className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      title="Remove Chapter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Lessons List */}
                <div className="space-y-2.5 pl-4 border-l border-slate-100">
                  {chapter.lessons.map((lesson, lesIdx) => (
                    <div
                      key={lesson.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 flex-1 w-full">
                        <Video className="w-4 h-4 text-indigo-500 shrink-0" />
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => {
                            const updated = [...course.chapters];
                            updated[chIdx].lessons[lesIdx].title = e.target.value;
                            setCourse({ ...course, chapters: updated });
                          }}
                          placeholder="Lesson Title"
                          className="text-xs font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1 py-0.5 flex-1"
                        />
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="text"
                          value={lesson.duration}
                          onChange={(e) => {
                            const updated = [...course.chapters];
                            updated[chIdx].lessons[lesIdx].duration = e.target.value;
                            setCourse({ ...course, chapters: updated });
                          }}
                          placeholder="15 mins"
                          className="w-20 text-[11px] text-slate-500 bg-white border border-slate-200 rounded-lg px-2 py-1 text-center"
                        />
                        <input
                          type="text"
                          value={lesson.videoUrl}
                          onChange={(e) => {
                            const updated = [...course.chapters];
                            updated[chIdx].lessons[lesIdx].videoUrl = e.target.value;
                            setCourse({ ...course, chapters: updated });
                          }}
                          placeholder="Video URL (YouTube/Vimeo)"
                          className="w-44 text-[11px] text-slate-500 bg-white border border-slate-200 rounded-lg px-2 py-1 truncate"
                        />
                        {chapter.lessons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLesson(chIdx, lesIdx)}
                            className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddLesson(chIdx)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 pt-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Lesson
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setActiveTab("media")}>
              ← Back: Media
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={saving}>
              {saving ? "Publishing Course..." : "Publish Course Now"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateCourse;
