# Decision Simulator: Calibration & Uncertainty Assessment

A sophisticated, two-stage behavioral experiment tool designed to measure and improve decision-making calibration. This simulator focuses on how participants express uncertainty and adapt to feedback, moving beyond simple domain knowledge testing.

## 🧠 Overview

The Decision Simulator implements a professional behavioral assessment methodology. It distinguishes between **accuracy** (getting things right) and **calibration** (knowing how likely you are to be right).

### Module A: Baseline Elicitation (10–12 mins)
*   **Task**: 15 rapid judgment trials across diverse, non-financial domains (geography, visual estimation, logic).
*   **Inputs**:
    *   **Prediction**: Binary choice.
    *   **Confidence**: Reported probability between 50% and 100%.
    *   **Rationale**: A brief one-sentence justification to capture heuristics.
*   **Output**: A baseline calibration curve comparing subjective confidence bins against objective hit rates.

### Reflection Stage
A mid-session pause designed for meta-cognitive awareness. Participants review their Round 1 calibration curve and self-diagnose patterns of overconfidence or underconfidence.

### Module B: Adaptive Calibration (10–15 mins)
*   **Task**: 10 new judgment trials.
*   **Goal**: Measure how the participant updates their confidence expression based on previous feedback.
*   **Analysis**: Compares shift in Brier scores and calibration error between the two modules.

## 🚀 Key Features

*   **Brier Scoring**: Uses a proper scoring rule that rewards honest reporting and punishes both overconfidence and extreme underconfidence.
*   **Calibration Visualizations**: Interactive Recharts-powered curves showing the "Perfect Calibration" reference line.
*   **AI-Powered Insights**: Integrates with **Google Gemini 3 Flash** to generate dynamic, non-trivial questions and provide qualitative behavioral feedback on adaptive shifts.
*   **Exportable Reports**: Professional scoreboard for final performance review, including a comprehensive trial log.

## 🛠 Technical Stack

*   **Frontend**: React 19, TypeScript, Tailwind CSS.
*   **Visualization**: Recharts.
*   **Intelligence**: Google GenAI SDK (Gemini API).
*   **Icons**: FontAwesome 6.

## 📊 Evaluation Metrics

1.  **Raw Accuracy**: Percentage of correct predictions.
2.  **Brier Score**: Quadratic scoring rule where 0.0 is perfect and 0.25 is random guessing.
3.  **Calibration Error**: Weighted mean absolute difference between reported confidence and observed accuracy.
4.  **Adaptive Shift**: Qualitative and quantitative measurement of behavioral change after feedback.

---

*Built for high-stakes decision-making training and behavioral interview simulations.*