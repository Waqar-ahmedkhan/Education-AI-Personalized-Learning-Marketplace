# EduAI – AI-Powered Personalized Learning Marketplace 🎓🤖

**Built with 💻 by [Waqar-ahmedkhan](https://github.com/Waqar-ahmedkhan)**
📩 Contact: [waqarahmed44870@gmail.com](mailto:waqarahmed44870@gmail.com)

EduAI is a full-stack, AI-powered e-learning platform designed to offer personalized, affordable, and accessible education to millions of students across Pakistan. It helps prepare for competitive exams (MDCAT, CSS, NTS), offers skill-building courses, and supports instructor-led learning using modern web and AI technologies.

---

## 🚀 Key Features

* 🤖 **AI-Powered Personalized Learning Paths**
* 📚 **Instructor-Uploaded Multimedia Courses**
* 🧠 **ML Recommendation System (Cosine Similarity Based)**
* 📊 **Progress Analytics Dashboards & Weakness Tracking**
* 📄 **AI-Based Quiz Generator with Performance Reports**
* 🧪 **Mock Exams, Timed Quizzes, and Leaderboards**
* 🧩 **Gamification: Badges, XP, Certificates**
* 🗣️ **Live Webinars, Forums, Chat**
* 🌐 **Urdu & English Language Support**
* 💳 **Secure Payments & Instructor Revenue Sharing**

---

## 🤖 Advanced AI Integrations

### 🧠 Machine Learning Recommendation Engine

* Built using **cosine similarity** to suggest courses based on user history & preferences.
* Deployed using Python & Scikit-Learn.

### 💬 Fine-tuned AI Chatbot (Kimi K2)

* Integrated and **fine-tuned** [Kimi K2 open-source LLM](https://github.com) for education-focused conversations.
* Custom dataset includes FAQs, course content, user questions.

### 📝 AI Quiz Generator + Weakness Tracker

* Automatically generates quizzes from course material.
* Tracks incorrect answers to generate follow-up personalized quizzes.
* Generates weekly **learning reports** and visual progress analytics.

---

## 🛠️ Tech Stack

### Frontend

* [Next.js](https://nextjs.org/) + TypeScript + Tailwind CSS
* React.js with Material UI

### Backend

* Node.js + Express.js
* MongoDB (Mongoose ODM)
* JWT & **Refresh Token-based Auth**
* Redis (optional for caching)

### DevOps & Infra

* Dockerized Microservices (Frontend, Backend, ML API)
* CI/CD using GitHub Actions
* Nginx + PM2 for production
* Deployed on **AWS EC2** with S3 for media, CloudFront CDN

### AI/ML

* Python + Scikit-learn + TensorFlow (for future upgrades)
* Custom fine-tuned LLM (Kimi K2)

---

## 🔐 Authentication System

* JWT + Refresh Token based session management
* Role-Based Access: Admin, Instructor, Student
* Admin Routes:

  * `/auth/admin-login`
  * `/auth/initial-admin`

---

## 📦 Installation (Local Dev)

```bash
# Clone the repo
https://github.com/Waqar-ahmedkhan/eduai.git
cd eduai

# Setup Backend
cd server
npm install
cp .env.example .env  # Add MONGODB_URI, JWT_SECRET, REFRESH_SECRET, etc.
npm run dev

# Setup Frontend
cd ../frontend
npm install
npm run dev
```

---

## 🎓 DEMO Credentials

**Admin**
Email: [waqarahmed44870@gmail.com](mailto:waqarahmed44870@gmail.com)
Routes: `/auth/admin-login`, `/auth/initial-admin`

**Test Student / Instructor**
Auto-generated from registration or request via contact.

---

## 📈 Future Roadmap

* 🔮 AI Co-Pilot for exam prep guidance
* 📖 NLP-driven auto summarization & video Q/A
* 📱 Native App (React Native + Expo)
* 🧑‍🏫 LMS features with offline support

---

## 🤝 Contributing

1. Fork the project
2. Create a new branch
3. Make changes & commit
4. Submit a PR 🚀

---

## 📄 License

MIT © [Waqar-ahmedkhan](https://github.com/Waqar-ahmedkhan)
