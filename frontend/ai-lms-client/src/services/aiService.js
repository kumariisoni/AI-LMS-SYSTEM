import api from "./api";

export const aiService = {
  /**
   * Send a chat message to the Gemini-powered AI Tutor via C# backend.
   * Supports both positional parameters and object parameters.
   *
   * @param {string|Object} messageOrParams
   * @param {string} [courseId]
   * @param {string} [chapterId]
   * @param {string} [lessonId]
   * @param {string} [previousInteractionId]
   * @returns {Promise<{reply: string, previousInteractionId: string, interactionId: string, sender: string, timestamp: string}>}
   */
  async chat(messageOrParams, courseId, chapterId, lessonId, previousInteractionId) {
    let payload;
    if (typeof messageOrParams === "object" && messageOrParams !== null) {
      payload = {
        message: messageOrParams.message,
        courseId: messageOrParams.courseId || undefined,
        chapterId: messageOrParams.chapterId || undefined,
        lessonId: messageOrParams.lessonId || undefined,
        previousInteractionId: messageOrParams.previousInteractionId || undefined,
        history: messageOrParams.history || undefined,
        conversation: messageOrParams.conversation || undefined
      };
    } else {
      payload = {
        message: messageOrParams,
        courseId: courseId || undefined,
        chapterId: chapterId || undefined,
        lessonId: lessonId || undefined,
        previousInteractionId: previousInteractionId || undefined
      };
    }

    const res = await api.post("/AI/chat", payload);
    return res.data;
  },

  /**
   * Backward-compatible alias for existing callers
   */
  async sendMessage(params) {
    return this.chat(params);
  },

  /**
   * Get personalized recommendations grounded in MongoDB progress
   */
  async getRecommendations() {
    const res = await api.get("/AI/recommendations");
    return res.data;
  },

  /**
   * Generate diagnostic quiz
   */
  async generateQuiz(topic, questionCount = 3) {
    const res = await api.post("/AI/generate-quiz", { topic, questionCount });
    return res.data;
  },

  /**
   * Generate custom study plan
   */
  async generateStudyPlan(goal, hoursPerWeek = 10) {
    const res = await api.post("/AI/study-plan", { goal, hoursPerWeek });
    return res.data;
  }
};

export default aiService;
