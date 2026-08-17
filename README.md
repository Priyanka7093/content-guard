# Content Guard

A full-stack AI-powered application for real-time multi-modal content moderation.

The system provides a centralized platform to analyze text and images using Natural Language Processing and Computer Vision models, generate moderation decisions, and maintain moderation history through a microservices-based backend.

## Features

- Real-time text toxicity detection
- Image content moderation
- General object detection using YOLOv8
- Custom-trained weapons detection
- NSFW image classification
- Centralized moderation decision engine
- Configurable moderation thresholds
- Moderation history and statistics
- System health monitoring
- AI model insights dashboard
- Responsive React frontend
- FastAPI microservices architecture
- SQLite database integration
- RESTful communication between frontend and backend services

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- HTML
- CSS

### Backend

- Python
- FastAPI
- HTTPX

### AI / Machine Learning

- Hugging Face Transformers
- Toxic-BERT
- YOLOv8
- Custom-trained YOLOv8 Weapons Detector
- NSFW Image Classification

### Database

- SQLite

### Tools

- Git
- GitHub
- Google Colab
- Roboflow

## Project Structure

```text
content-guard/
│
├── backend/
│   ├── api_gateway/
│   │   ├── config.py
│   │   └── main.py
│   │
│   ├── image_moderation_service/
│   │   └── main.py
│   │
│   ├── logging_service/
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── moderation_decision_service/
│   │   ├── config.py
│   │   ├── decision_engine.py
│   │   └── main.py
│   │
│   └── text_moderation_service/
│       └── main.py
│
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── ml/
│   └── weapons_detection/
│       └── training/
│           └── weapons_detector_training.ipynb
│
├── screenshots/
│   ├── about_1.png
│   ├── about_2.png
│   ├── architecture.png
│   ├── dashboard.png
│   ├── dashboard2.png
│   ├── history.png
│   ├── home.png
│   ├── image_moderation.png
│   ├── image_moderaton2.png
│   ├── model_insights.png
│   ├── system_health.png
│   ├── text_moderation.png
│   └── text_moderation2.png
│
├── data.yaml
├── main.py
├── test_image_model.py
├── test_text_model.py
└── .gitignore

Application Architecture

The application follows a microservices-based architecture with an API Gateway connecting the frontend to independent moderation, decision, and logging services.

Architecture Flow
                    React + Vite
                         |
                         | HTTP
                         v
                 API Gateway :8000
                    /          \
                   /            \
                  v              v
       Text Moderation      Image Moderation
           :8001                :8002
             |                    |
        Toxic-BERT        ┌───────┼────────┐
                          |       |        |
                        YOLO   Weapons   NSFW
                          |       |        |
                          └───────┼────────┘
                                  |
                    Moderation Decision :8003
                                  |
                                  v
                       Logging Service :8004
                                  |
                                  v
                              SQLite
Backend Setup
1. Clone the Repository
git clone https://github.com/Priyanka7093/content-guard.git

Navigate to the project directory:

cd content-guard
2. Create a Python Virtual Environment
python -m venv venv

Activate the virtual environment on Windows:

venv\Scripts\Activate.ps1
3. Install Backend Dependencies
pip install fastapi uvicorn httpx python-multipart
pip install ultralytics transformers torch torchvision
4. Run the Backend Services

Start each service from its respective directory.

API Gateway
cd backend/api_gateway
uvicorn main:app --reload --port 8000
Text Moderation Service
cd backend/text_moderation_service
uvicorn main:app --reload --port 8001
Image Moderation Service
cd backend/image_moderation_service
uvicorn main:app --reload --port 8002
Moderation Decision Service
cd backend/moderation_decision_service
uvicorn main:app --reload --port 8003
Logging Service
cd backend/logging_service
uvicorn main:app --reload --port 8004

Each backend service provides a health endpoint for service monitoring.

Frontend Setup

Navigate to the frontend directory:

cd frontend

Install dependencies:

npm install

Start the React development server:

npm run dev

Then open the local URL displayed by Vite in the terminal.

Custom Model Training

The project includes a custom-trained YOLOv8 weapons detection model.

The model was trained using a labeled dataset containing 671 images and 7 classes:

Handgun
Knife
Missile
Rifle
Shotgun
Sword
Tank

The model was trained for 50 epochs using a Google Colab GPU.

The complete training notebook is included in:

ml/weapons_detection/training/weapons_detector_training.ipynb
Project Status

Fully working end-to-end

The backend microservices, AI moderation pipeline, React frontend, moderation logging, dashboard, and moderation history are integrated and tested.

Technologies

React Vite JavaScript Python FastAPI HTTPX Toxic-BERT YOLOv8 Transformers SQLite Google Colab Roboflow Git GitHub

Application Screenshots
Home Page

Dashboard

Text Moderation

Image Moderation

Model Insights

System Health

Moderation History

About

Application Architecture

If you find this project useful, consider giving it a star.



