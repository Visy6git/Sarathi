# 🚀 Sarathi: Your Guide to Government Schemes

![Sarathi Banner](docs/banner.png) <!-- Replace with your custom image -->

> **Sarathi** is an AI-powered multilingual chatbot that simplifies access to Indian government schemes by providing personalized, language-inclusive, real-time assistance — built for accessibility, awareness, and empowerment.

---

## 🎯 Problem Statement

Many citizens — especially in rural areas — struggle to access government schemes due to:
- Complex paperwork
- Lack of awareness
- Language barriers

**Sarathi bridges this gap** by offering a conversational platform that understands user needs and guides them toward the most relevant schemes.

---

## ✨ Key Features

- 🗣️ **Multilingual Support** – 14 Indian languages using voice/text
- 📚 **Scheme Finder** – Personalized suggestions based on user concerns
- 📦 **Document Checklist** – Dynamic, need-based list of required documents
- 🧠 **RAG + LLM Integration** – Fast, accurate responses powered by retrieval-augmented generation
- 🔗 **Live NJDG Integration** – Real-time access to judicial data (e.g., case status)
- 🖼️ **Visual Storytelling Mode** *(Upcoming)* – Converts user queries into interactive narratives

---

## 🖼️ Demo & Screenshots

| Home Screen | Scheme Search | Voice Input | Results View |
|-------------|---------------|-------------|---------------|
| ![home](docs/home.png) | ![search](docs/search.png) | ![voice](docs/voice.png) | ![result](docs/result.png) |

> https://youtu.be/BeUDbRJ5Ufg
  
---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|------------|
| 💬 LLM | Llama 3.1 (Groq API) |
| 🧠 RAG | LlamaIndex + HuggingFace embeddings |
| 🌐 Frontend | HTML CSS JS |
| 🐍⚗️| Framework | Flask |
| 🗃️ Database | FAISS / SQLite (for lightweight RAG DB) |
| 🗣️ Voice | Web Speech API / gTTS / Whisper |


---

## 🚀 Quick Start

### 1. Clone the Repo
```bash
git clone https://github.com/<your-username>/Sarathi.git
cd Sarathi
```
### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```
### 3. Run the App
```bash
py main.py
```
### 🛠️ Folder Structure
```bash
Sarathi/
├── main.py                # Back End [Flask]
├── static/              # Front End
├── data/                 # Scheme dataset
├── rag_engine/           # RAG components
└── docs/                 # Images, GIFs, assets
```
### 🤝 Contributing
We welcome your contributions!
Fork the repo
Create a new branch (feature/my-feature)
Commit changes
Push and submit a Pull Request

## 🙌 Acknowledgements
Thanks to the mentors, contributors, and open-source libraries that power Sarathi.
> Made for 🇮🇳 in India
