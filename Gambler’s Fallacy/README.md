# 🎲 Probability Pilot

**Probability Pilot** is a high-fidelity interactive experiment designed to surface and analyze classic cognitive biases in human decision-making. By engaging in repeated games of chance, users can visualize how their intuition—often flawed by perceived patterns—clashes with the cold reality of randomness.

## 🧠 Mechanics

The application captures the gap between belief and action through a simple three-step loop:

1.  **Prediction**: Before each outcome, users answer: *“What do you think happens next?”* (e.g., Heads vs. Tails).
2.  **Confidence & Bet**: Users quantify their intuition: *“How strongly would you bet on it?”* by adjusting confidence levels (0–100%) and wagering virtual points.
3.  **Outcome & Analysis**: The app logs streak lengths, prediction accuracy, and betting sizing to identify patterns like the **Gambler's Fallacy** or **Hot Hand Fallacy**.

## 🚀 Key Features

-   **Dual Modes**: Switch between binary **Coin Flips** and 1-in-6 **Dice Rolls**.
-   **AI Bias Lab**: Uses the **Gemini 3 Flash** model to analyze your last 5+ rounds and provide a scientific breakdown of your specific cognitive patterns.
-   **Live Analytics**: A dynamic trend chart (powered by `Recharts`) overlays your confidence against your bet sizing over time.
-   **Streak Tracking**: Real-time detection of outcome streaks to test if you believe "tails is due" after many heads.
-   **Responsive Glassmorphism UI**: A sleek, dark-themed interface built with Tailwind CSS and Lucide icons.

## 🛠️ Technical Stack

-   **Frontend**: React 19 + TypeScript
-   **AI Engine**: [Google Gemini API](https://ai.google.dev/) (`gemini-3-flash-preview`)
-   **Styling**: Tailwind CSS
-   **Visuals**: Recharts (Analytics) & Lucide (Icons)
-   **Build Tool**: Vite

## 💻 Local Setup & Installation

To run this project on your machine, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/luyangsi/Finance-concept-analysis.git
    cd Gambler’s Fallacy
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory and add your Gemini API Key:
    ```env
    VITE_API_KEY=your_gemini_api_key_here
    ```
    *Note: The `vite.config.ts` is configured to map `VITE_API_KEY` to `process.env.API_KEY` for the application logic.*

4.  **Run in Development Mode**:
    ```bash
    npm run dev
    ```

5.  **Build for Production**:
    ```bash
    npm run build
    ```

## 📂 Project Structure

-   `App.tsx`: Main application logic and UI layout.
-   `services/geminiService.ts`: Integration with the Google GenAI SDK for bias analysis.
-   `types.ts`: Shared TypeScript interfaces for game rounds and statistics.
-   `vite.config.ts`: Configured to inject environment variables into the client-side code.

## ⚖️ Analyzed Biases

-   **Gambler's Fallacy**: Betting against a streak because it's "due" to change.
-   **Hot Hand Fallacy**: Betting with a streak because it's "on a roll."
-   **Escalation of Commitment**: Increasing bet sizes after losses to "chase" points.
-   **Overconfidence**: High betting on low-probability outcomes.

## Simulator Interface
<img width="1099" height="873" alt="截屏2026-01-22 下午3 36 45" src="https://github.com/user-attachments/assets/c5b15a97-c7ef-4b41-a234-9f3b95857643" />

