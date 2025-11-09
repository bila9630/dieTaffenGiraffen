# TripTune: The Logical Travel AI

**TripTune** is an AI-powered travel tuner that re-frames "busyness" into "preference." It's a "Map + Chat" interface designed to solve the overtourism paradox, guiding users to more sustainable and satisfying experiences by transforming raw data into psychological context.

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-green?logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Gemini-AI-purple?logo=google)](https://ai.google.dev/)

<img width="1918" height="977" alt="image" src="https://github.com/user-attachments/assets/f086cba9-e828-4744-90be-7b5f74254e5e" />


## 🌟 Hackathon Context

This project is a submission for the **Tourism Technology Festival 3.0**.

* **Challenge:** Challenge 5 - Sustainable Visitor Flow & Overtourism
* **Core Data:** Frequency data provided by the **Österreich Werbung DataHub**

## ✨ Key Features

Our interface is built on a "Psycho-Logical" dual-panel design:

### 🗺️ The "Rational" Map (The Context)

* **Interactive POI & Hike Plotting:** Fetches and displays all hikes (with GPX tracks) and Points of Interest (POIs) from the Supabase backend.
* **Dynamic Selection:** Clicking any hike or POI on the map instantly loads its detailed information and busyness data.
* **Visual Data Layer:** Uses MapBox to provide a clean, fast, and familiar map interface for users to ground themselves spatially.

### 💬 The Chat (The Personality)

* **Conversational AI:** Powered by the ChatGPT 4o-mini API, the chat acts as a "travel tuner" and guide.
* **Context-Aware:** The chat is fed real-time data about the user's selected hike, POI, and its associated busyness/weather patterns.
* **Preference "Tuning":** Instead of just saying "Hallstatt is busy," the AI re-frames it: "Hallstatt is vibrant and social at 2 PM. If you're looking for a quieter, more contemplative experience, I'd recommend going before 9 AM or exploring this nearby 'Hidden Gem'..."

### 📊 The "Busyness-to-Preference" Engine

* **Data-Driven Cards:** Dynamically renders `HikingCard`, `POICard`, and `HiddenGemCard` components based on map selection.
* **Frequency Charts:** When a POI is selected (like the Hallstatt Marktplatz), the app queries and displays its historical frequency data (from Bernard) in a clean `Recharts` graph.
* 
## 💻 Tech Stack & Architecture

This is the application layer that consumes the data from our [Rational Engine](https://github.com/spheppner/dieTaffenGiraffenDaten).

* **Frontend:** React, TypeScript, Vite
* **UI Components:** shadcn/ui
* **Styling:** Tailwind CSS
* **Mapping:** React Leaflet
* **Charts:** Recharts
* **Backend:** Supabase (PostgreSQL Database)
* **AI Model:** ChatGPT 4o-mini

### 🏛️ The "Psycho-Logical" Data Flow

1.  A backend Python script (the "Rational Engine") provisions the Supabase database, enriching Bernard's frequency data with weather and time context.
2.  The **TripTune** frontend queries this pre-processed, rational data from Supabase to populate the map and charts.
3.  When a user chats, the React app provides the Gemini AI with this rich, rational context (e.g., "The user is looking at Hallstatt Marktplatz. It is 2 PM. The busyness is 8/10, and the weather is sunny.").
4.  The AI uses this context to deliver its "psycho-logical" response, "tuning" the user's preference.

-> [Supabase DB] -> [React Map/Chart] -> [Gemini AI] -> [React Chat Response]]

## 🚀 How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/bila9630/dieTaffenGiraffen
    cd dieTaffenGiraffen
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

## 🙏 Acknowledgments

* **Österreich Werbung** for providing the core Challenge 5 data.
* **Supabase** for the incredible all-in-one backend.
* **shadcn/ui** for the beautiful and accessible components.
* **MapBox** for making mapping simple.
