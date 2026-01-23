
# LifeWealth Simulator

An interactive financial lifecycle simulation designed to teach complex economic concepts through gamified iteration.

## 🚀 Overview
LifeWealth models a financial journey from age 25 to 65. Players manage a career, navigate market volatility, and make critical consumption/investment decisions. Unlike traditional retirement calculators, LifeWealth uses a "Lifetime Utility" approach, rewarding consumption smoothing and risk management over simple final wealth maximization.

## 🕹️ Core Mechanics
- **40 Discrete Rounds**: One round per year.
- **Consumption vs. Saving**: Decide how much of your annual income to spend today versus save for tomorrow.
- **Asset Allocation**: Dynamic control over Portfolio splits (Stocks, Bonds, Cash).
- **State of the World**: Each year simulates unique market returns, inflation rates, and unexpected life shocks (Health/Employment).

## 🎓 Educational Goals
1.  **Glide Path Intuition**: Learn why sequence-of-returns risk makes aggressive equity portfolios dangerous near retirement.
2.  **Human Capital as an Asset**: View future labor income as part of your balance sheet. Stable wages (bond-like) allow for higher financial risk; cyclical wages (equity-like) require conservative investing.
3.  **Consumption Smoothing**: High utility is earned by maintaining a steady standard of living, rather than feast-or-famine cycles.
4.  **Ruin Risk**: Understand how employment or health shocks can break strategies that look "optimal" on paper under stable conditions.

## 🛠️ Technical Stack
- **React 19 + TypeScript**: Robust application logic and state management.
- **Tailwind CSS**: Modern, responsive UI design.
- **Recharts**: High-performance visualization of wealth trajectories and balance sheets.
- **Lucide React**: Clean, semantic iconography.
- **LocalStorage Persistence**: Tracking career history and high scores locally.

## 📉 Financial Model
- **Market Returns**: Simulated using Box-Muller transforms for standard normal distributions.
- **Utility Function**: Logarithmic utility function ($U = \ln(C)$) to model diminishing returns on consumption.
- **Human Capital**: Present value calculations discounted by career growth and risk rates.

## 💻 Local Development

To run this application on your local machine:

### Option 1: Using Vite (Recommended)
Vite provides the best experience for handling TypeScript and JSX files.

1.  **Install Node.js**: Ensure you have Node.js installed on your system.
2.  **Initialize Project**:
    ```bash
    mkdir lifewealth-sim
    cd lifewealth-sim
    # Copy all project files into this directory
    npm init -y
    npm install vite @types/react @types/react-dom
    ```
3.  **Run Development Server**:
    ```bash
    npx vite
    ```
4.  **Open Browser**: Visit `http://localhost:5173`.

### Option 2: Static Server
If you have a transpiler set up or are using a browser that supports your specific setup, you can use any static server:
```bash
# Using Python
python -m http.server 8000
# Using Node.js 'serve'
npx serve .
```

*Note: Since the project uses `.tsx` files, a build step (like the one provided by Vite) is required to convert the code to standard JavaScript for the browser.*

---
*Created with focus on financial literacy and experience-based learning.*
