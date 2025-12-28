# Frontend Dashboard Architecture

**Version:** 1.0
**Date:** September 9, 2025

## 1. Goal

The frontend dashboard serves as the primary user interface for the SGT-400 Digital Twin system. Its goal is to provide a responsive, interactive, and intuitive experience for various user roles (Operators, Engineers) to monitor the compressor's health, receive real-time alerts, and view AI-driven recommendations.

The dashboard is built as a **Single Page Application (SPA)** to ensure a fast and fluid user experience.

---

## 2. Core Technologies

* **Build Tool:** **Vite** is used for its fast development server and optimized build process.
* **Framework:** The entire application is built on **React 18+**.
* **Styling:** **Material-UI (MUI)** provides a comprehensive suite of pre-built components, ensuring a consistent and professional look and feel that follows modern design principles.
* **State Management:** **Redux Toolkit** is used as the central state management solution. It provides a predictable state container that manages all application-wide data, including live sensor readings, alerts, and API responses.
* **Charting:** **Recharts** is used for creating responsive and interactive charts for data visualization.
* **API Communication:**
    * **Axios** is used for all asynchronous HTTP requests to the backend's REST APIs.
    * **Socket.IO Client** is used to establish and manage a persistent **WebSocket** connection for receiving real-time data and alerts.

---

## 3. Project Structure

The frontend code is organized using a **feature-sliced architecture** to ensure scalability and maintainability.

* `/src/api/`: Contains all functions related to backend communication (both REST and WebSocket).
* `/src/app/`: Holds the central Redux store configuration.
* `/src/assets/`: Stores static assets like images (company logo) and global styles.
* `/src/components/common/`: Contains reusable, generic components used across multiple pages (e.g., `PageHeader`, `Notifier`).
* `/src/features/`: Each business logic module (like `rtm`, `pdm`) has its own folder containing its specific Redux slice and components.
* `/src/hooks/`: Contains custom React hooks, such as `useWebSocket`, to encapsulate complex logic.
* `/src/layouts/`: Defines the main structure of the application, including the sidebar and top app bar (`MainLayout.jsx`).
* `/src/pages/`: Contains the top-level component for each page of the application.
* `/src/routes/`: Manages all application routing using `react-router-dom`.

---

## 4. Page Breakdown & Functionality

The dashboard consists of four main pages:

### 4.1. Overview Page (`/`)
* **Purpose:** Provides a high-level, at-a-glance summary of the compressor's health.
* **Data Source:** Fetches data from the `/api/status/overview` REST endpoint.
* **Components:** Displays four main `StatCard` components showing System Status, RUL, Average Efficiency, and recent alerts.

### 4.2. Real-Time Monitoring Page (`/monitoring`)
* **Purpose:** Offers a detailed, real-time view of sensor data and anomaly alerts.
* **Data Source:** Receives a continuous stream of data from the `new_data` and `new_alert` WebSocket events.
* **Components:**
    * A live `LineChart` that updates every few seconds.
    * An `AnomalyAlerts` panel that displays the latest alerts from the RTM model.
    * Time-range filter buttons that allow users to view live data in different time windows (e.g., last 10 minutes, last hour).

### 4.3. Maintenance Page (`/maintenance`)
* **Purpose:** Provides engineers with predictive maintenance insights.
* **Data Source:** Fetches the latest RUL prediction from the `/api/predict/rul` REST endpoint.
* **Components:**
    * A large display card showing the predicted Remaining Useful Life (RUL) in days.
    * A list of actionable maintenance recommendations (currently mocked).

### 4.4. Optimization Page (`/optimization`)
* **Purpose:** Displays real-time suggestions from the RTO model to improve efficiency.
* **Data Source:** Periodically fetches the latest suggestion from the `/api/rto/suggestion` endpoint and the efficiency history from `/api/rto/efficiency_history`.
* **Components:**
    * A "Suggestion Card" that shows the latest recommendation.
    * A historical line chart displaying the efficiency trend over the last 24 hours.