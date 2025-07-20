# Market Microstructure Simulator

A full-stack Market Microstructure Simulator built with Python (simulation engine), FastAPI (API), and React (UI). It models various trading agents, order book mechanics, and provides a rich, real-time visualization of market activity.

![Simulator Demo](https://via.placeholder.com/1200x675.png?text=Replace+this+with+a+GIF+or+Screenshot+of+your+app!)
*(Hint: Create a GIF of your app in action, upload it to your GitHub repo, and update the link here.)*

---

## ✨ Features

### Core Simulation
- **Agent-Based Modeling**: Simulates multiple agent types (Liquidity Providers, Market Takers, Noise Traders) with distinct behaviors.
- **Accurate Matching Engine**: Processes market and limit orders based on price-time priority.
- **Dynamic State**: Models an order queue with agent-specific latency for realistic order processing.

### Professional UI & Visualizations
- **Real-Time Dashboard**: All panels update live without needing a refresh.
- **3D Order Book Depth Chart**: An interactive 3D visualization of market depth using Three.js.
- **Candlestick Chart**: Professional-grade OHLC chart with volume profiles and multi-timeframe analysis.
- **Technical Indicators**: Overlay Simple Moving Averages (SMA) and Bollinger Bands on the price chart.
- **Time & Sales Ladder**: A real-time, auto-scrolling log of every executed trade.
- **Trade Volume Heat Map**: Visualizes price levels with the highest trading activity.
- **Agent Interaction Graph**: A dynamic network graph showing trades between agents as pulsing connections.

### Premium UX & Aesthetics
- **Modern Tech Stack**: Built with Python, FastAPI, and React.
- **Advanced Styling**: Features a polished "glassmorphism" aesthetic with animated gradient backgrounds, built with Tailwind CSS and shadcn/ui.
- **Interactive Controls**: Dynamically add/remove agents, control simulation speed with a custom slider, and reset the simulation on the fly.
- **Holographic Overlays**: Hover over agents in the PnL table to see detailed trading statistics.
- **Sound Design System**: Subtle audio feedback for trades and ambient market noise that intensifies with volume.

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI, NumPy
- **Frontend**: React.js, Axios
- **3D Graphics**: Three.js, @react-three/fiber, @react-three/drei
- **Charting**: ApexCharts
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Sound**: Tone.js

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- Python 3.8+
- Node.js and npm
- Git

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/market-microstructure-sim.git](https://github.com/YOUR_USERNAME/market-microstructure-sim.git)
    cd market-microstructure-sim
    ```

2.  **Setup the Backend (Python):**
    ```bash
    cd backend
    python -m venv .venv
    source .venv/bin/activate  # On Windows: .venv\Scripts\activate
    pip install -r requirements.txt
    ```

3.  **Setup the Frontend (React):**
    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application

You will need two separate terminals.

1.  **Start the Backend Server:**
    *(In your first terminal, from the `backend` directory)*
    ```bash
    uvicorn app:app --reload
    ```
    The API will be running at `http://localhost:8000`.

2.  **Start the Frontend Application:**
    *(In your second terminal, from the `frontend` directory)*
    ```bash
    npm start
    ```
    The application will open in your browser at `http://localhost:3000`.