# AnveshanProject – Farmer Crop Advice with Login & Image Analysis

**CropWise** is an AI-powered farming assistant that delivers instant crop-care guidance.  
Farmers can log in to access a smart chatbot for personalized agricultural advice and upload crop images for real-time disease detection and health analysis—empowering them with data-driven insights to improve yield and reduce crop loss.

 Features
- User Authentication – Secure login/signup with Supabase Auth  
- Farmer Dashboard – Real-time metrics, weather data, and quick access to AI tools  
- AI Chat Assistant – Conversational AI powered by Groq for agricultural expertise  
- Image Analysis – AI-powered crop disease & pest identification  
- Voice Interface – Multi-language speech recognition for hands-free interaction  
- Analytics & Insight – Personalized crop advice and yield optimization  

 Prerequisites
- Node.js **18+** and npm
- Supabase account
- Groq API account

 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/AnveshanProject-Farmer-Crop-advise-with-login-and-Imageanalysis.git
   cd AnveshanProject-Farmer-Crop-advise-with-login-and-Imageanalysis

Environment Variables
Create a .env.local file and add:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GROQ_API_KEY=your_groq_api_key
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url

Install dependencies<br>
npm install

Start development server<br>
npm run dev

Usage Guide<br>
Getting Started

Sign Up – Create an account with email and password
Complete Profile – Add farm details and crop information
Explore Dashboard – View weather, crop status, and quick actions

<img src="s1.png" width="400" height="356"><br><br>
<img src="s2.png" width="500" height="356"><br>

1. AI Chat Assistant

Ask about crop management, pest control, soil health
Get personalized advice based on location and crop data
View conversation history & save recommendations

<img src="s3.png" width="500" height="356"><br>

2. Image Analysis

Upload crop/leaf/soil photos
Get instant disease/pest detection and treatment advice
Track analysis history over time

<img src="s4.png" width="500" height="356"><br>

3. Voice Interface

Hands-free speech-to-text interaction
Multi-language support with audio responses

<img src="s5.png" width="500" height="356"><br>

4. Analytics & Insights

Personalized crop reports and planting calendars
Seasonal recommendations and weather-based suggestions

<img src="s6.png" width="500" height="356"><br>

 API Endpoints<br><br>
Generative Chat API<br>
Send messages to AI assistant<br>
Supports streaming responses and context maintenance<br>

Image Analysis API<br><br>
Upload and analyze crop images<br>
Returns disease/pest identification & treatment steps<br>

Voice Chat API<br><br>
Process voice interactions<br>
Multi-language conversational responses<br>

Tech Stack<br><br>
Next.js 14 (App Router)<br>
Supabase for Auth & Database<br>
Groq API for AI chat<br>
Tailwind CSS for UI styling<br>
TypeScript for type safety<br>

📂 Project Structure
```bash
farmer-crop-advice/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   ├── sign-up/
│   │   └── callback/
│   ├── dashboard/
│   ├── chat/
│   ├── image-analysis/
│   ├── voice/
│   ├── analytics/
│   └── api/
│       ├── chat/
│       ├── analyze-image/
│       ├── voice-chat/
│       └── generate-advice/
├── components/
│   ├── ui/
│   ├── chat-interface.tsx
│   ├── image-analysis-interface.tsx
│   ├── voice-interface.tsx
│   └── crop-advice-system.tsx
├── lib/
│   └── supabase/
├── scripts/
└── public/
    ├── s1.png
    ├── s2.png
    ├── s3.png
    ├── s4.png
    ├── s5.png
    └── s6.png



