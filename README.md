# EduAI – AI-Powered Personalized learning Marketplace 🎓🤖

**Developed by [Waqar-ahmedkhan](mailto:waqarahmed44870@gmail.com)**
🚀 *Full-Stack DevOps Engineer | ML Engineer | AI Researcher*

EduAI is an intelligent, open-source e-learning marketplace built to revolutionize education in Pakistan through affordability, accessibility, and AI-powered personalization. Whether you’re preparing for MDCAT, CSS, or NTS or seeking skills for your future, EduAI is your gateway to success.

---

## 🌟 Key Features

* 🤖 **AI-powered Personalized Learning Paths**
* 🎓 **Instructor-led Multimedia Course Uploads**
* 🧠 **Smart Course Recommendations (Fine-tuned Kimi-2 Model)**
* 📈 **Performance Analytics & Real-time Dashboards**
* 🧾 **Mock Exams, Adaptive Quizzes, and Progress Tracking**
* 🧠 **Quiz Generator with Weakness Identification & Auto Improvement**
* 🗣️ **Live Webinars, Messaging, and Discussion Forums**
* 🧩 **Gamification: Badges, Certificates, and Leaderboards**
* 🌐 **Bilingual: Urdu & English Interface**
* 📱 **Mobile-First & Low-Bandwidth Optimized**
* 💳 **Secure Payments & Instructor Revenue Sharing**

---

## 🧠 Advanced AI Integrations

* 🧬 **Kimi-2 Finetuned Model** for Personalized Recommendations
* 🧠 **Quiz Generator with ML Feedback Loop** for targeted learning
* 📚 **Future Expansion**: Open-source LLM agents, AI tutors, speech recognition for voice-based learning

---

## 🛠️ Tech Stack

### 🔹 Frontend

* Next.js (App Router) + TypeScript
* Tailwind CSS + Material UI
* React.js

### 🔹 Backend

* Node.js + Express.js (RESTful APIs)
* MongoDB + Mongoose
* Redis (for caching, sessions)
* JWT (Authentication)
* Cloudinary (Media storage)

### 🔹 DevOps & Infrastructure

* Docker + Docker Compose
* CI/CD (GitHub Actions)
* NGINX for reverse proxy
* PM2 for production process management
* Deployment: Railway / Render / EC2

### 🔹 AI/ML

* Python (FastAPI for AI services)
* Scikit-learn, TensorFlow (for recommender systems)
* Open-source finetuned [Kimi-2](https://huggingface.co/01-ai/Yi-1.5-6B-Kimi) integration

---

## 🔐 Authentication & Authorization

* JWT-based user login/registration
* Secure password hashing (bcrypt)
* Role-based Access Control (RBAC):

  * 👨‍🎓 Student
  * 👨‍🏫 Instructor
  * 🛡️ Admin (via `/auth/admin-login`)

---

## 📦 Installation (Development Setup)

```bash
# Clone the repo
$ git clone https://github.com/Waqar-ahmedkhan/eduai.git
$ cd eduai

# Backend Setup
$ cd server
$ npm install
$ touch .env
# Add variables like:
# MONGODB_URI=your_mongo_uri
# JWT_SECRET=your_jwt_secret

# Start backend
$ npm run dev

# Frontend Setup
$ cd ../frontend
$ npm install
$ npm run dev
```

---

## 🎯 Demo & Admin Access

* Admin Route: `/auth/admin-login` and `/auth/inital-admin`
* Admin Email: `waqarahmed44870@gmail.com`
* Admin RegNo: `regNo$` *(change in `.env`)*

---

## 🔮 Future Roadmap

* [ ] AI-powered chatbot tutor (LLM agent)
* [ ] Real-time Urdu/English voice lectures
* [ ] SCORM-compliant content ingestion
* [ ] Teacher performance analytics + feedback
* [ ] Firebase or Supabase-based mobile version

---

## 🤝 Contributing

Contributions are welcome! If you're passionate about education, DevOps, or AI, join us in making learning more intelligent and inclusive.

---

## 📄 License

MIT License — feel free to use, modify, and share.

---

## 🧠 Developed by

**Waqar Ahmed Khan**
📫 [waqarahmed44870@gmail.com](mailto:waqarahmed44870@gmail.com)
🔧 Full-Stack DevOps Engineer | AI/ML Engineer
🔗 GitHub: [Waqar-ahmedkhan](https://github.com/Waqar-ahmedkhan)

> “Revolutionizing education through AI, one learner at a time.”
