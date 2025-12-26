
# **Software Requirements Specification (SRS) – Industrial Gas Turbine Compressor Dashboard**
**Version:** **11.0 (Final Comprehensive Requirements)**

---

## **1. Introduction**

### **1.1 Purpose**
This document defines the **final and unified software requirements** for the **Industrial Gas Turbine Compressor (IGT-12MW Class) Dashboard**. The system is a complete solution for monitoring, predictive maintenance, and **closed-loop optimization**, integrating Cloud AI, Edge AI, a Digital Twin, and robust Data Governance.

### **1.2 Scope**
The comprehensive scope includes:
- **Core Analytics:** **RTM**, **PdM**, and **DVR**.
- **Advanced Control:** **RTO** with **Direct Closed-Loop Control** and **Digital Twin Validation**.
- **Data Architecture:** **Kafka** streaming, **InfluxDB** storage, and full MLOps/DevOps pipeline.
- **Observability:** **Prometheus** for metrics and **Grafana** for dashboarding.
- **Governance:** Enforcement of Data Quality and Data Lineage policies.
- **Quality Assurance:** Mandatory implementation of **Unit Testing**.

### **1.3 Definitions & Acronyms**
| Term | Definition |
| :--- | :--- |
| **RTM** | **Real-Time Monitoring**: Live detection and visualization of current operating conditions. |
| **RTO** | **Real-Time Optimization**: Dynamic calculation and execution of optimal control setpoints. |
| **DVR** | **Data Validation and Reconciliation**: Process of detecting and correcting faulty sensor readings. |
| **PdM** | **Predictive Maintenance**: Forecasting equipment failures and Remaining Useful Life (RUL). |
| **Data Governance** | Management of data availability, usability, integrity, and security. |
| **Kafka** | Apache Kafka: Distributed streaming platform. |
| **InfluxDB** | High-performance Time-Series Database. |
| **Digital Twin** | A virtual replica of the physical compressor for simulation. |
| **Unit Test** | Automated testing of the smallest testable parts of an application ($\ge 85\%$ coverage). |

### **1.4 IGT-12MW Class Operational Profile (Generic Specifications)**
The system manages a twin-shaft gas turbine compressor in the 12-15 MW class, focusing on: Power Output ($\approx 12 - 15 \text{ MW}$), Pressure Ratio ($\approx 16:1 \text{ to } 18:1$), and Turbine Speed ($\approx 9,500 - 12,000 \text{ rpm}$).

---

## **2. Overall Description & Architecture**

### **2.1 System Overview**
The architecture is centered around **Kafka** for high-throughput streaming and **InfluxDB** for time-series storage. **Prometheus** and **Grafana** ensure observability. The system handles **Generated Data** (synthetic) and enforces strict **Data Governance** policies.

### **2.2 Data Segmentation & Management**
| Data Segment | Description | Storage/Purpose |
| :--- | :--- | :--- |
| **Sensor Data (Raw/Validated)** | High-frequency time-series data streams. | **InfluxDB** |
| **Historical Data** | Aggregated, audited data for long-term reports. | **MySQL/S3** |
| **Generated Data** | Synthetic data used for model training and simulation. | Separate Kafka Topic/S3 |

**FR-231 (Extensibility):** The system **shall** support configuration-based integration of new IGT units or external data sources (OPC-UA, MQTT) into the **Kafka** pipeline.

---

## **3. Functional Requirements**

### **3.1 Real-Time Monitoring (RTM) – Dual-Layer**
- **FR-311 (Cloud RTM):** Display live Sensor Data from **InfluxDB** with $\le 1$ second latency.
- **FR-312 (Edge AI RTM):** **RTM** Anomaly Detection models **shall** be deployed on **Edge Devices** (ONNX format) for local inference ($\le 100 \text{ms}$).

### **3.2 Predictive Maintenance (PdM)**
- **FR-321:** Forecast **RUL** for bearings, blades, and liners using **LSTM/Transformer** networks.
- **FR-322:** Provide actionable maintenance recommendations.

### **3.3 Data Validation & Reconciliation (DVR) and Data Quality**
- **FR-331 (Validation):** The **DVR** module **shall** enforce real-time **Data Quality** checks (range, completeness) and detect faulty sensors.
- **FR-332 (Reconciliation):** Reconcile data via **WLS** and publish the corrected stream back to the **Kafka** pipeline.

### **3.4 Real-Time Optimization (RTO) – Closed-Loop with Digital Twin**
- **FR-341:** The **RTO** module **shall** calculate optimal control setpoints using **MPC** and RL.
- **FR-342 (Digital Twin Validation):** The **RTO** output **shall** be simulated by the integrated **Digital Twin** to validate the predicted outcome **before** execution.
- **FR-343 (Direct Control):** Upon validation and Engineer approval, the **RTO** module **shall** execute parameter changes via a secured **OPC-UA Client** in a **Closed-Loop** manner.

### **3.5 Data Requirements and Sensor List (Mandatory Inputs)**
The system **shall** ingest and process high-frequency data points required for **RTM**, **PdM**, **DVR**, and **RTO**, including: **RPM**, **Torque**, **Temperature** ($\text{T}_{\text{in}}$, $\text{T}_{\text{exh}}$), **Pressure** ($\text{P}_{\text{in}}$, $\text{P}_{\text{out}}$), **Flow**, **Vibration** (Axial/Radial), **Actuator Position** (IGV), and **Emissions** (NOx/CO).

---

## **4. Non-Functional Requirements**

### **4.1 Security**
| Requirement | Description |
| :--- | :--- |
| **NF-411 (Application)** | **JWT** authentication and **RBAC**. |
| **NF-412 (Kafka In-Transit)** | **SSL/TLS** encryption for all **Kafka** communication. |
| **NF-414 (Control Isolation)** | RTO's OPC-UA communication **shall** use unique, restricted credentials. |

### **4.2 Development & Quality Assurance**
| Requirement | Description |
| :--- | :--- |
| **NF-421 (Unit Testing)** | Mandatory **Unit Tests** for all code with **$\ge 85\%$ code coverage**. |
| **NF-422 (Integration Testing)** | Automated tests validating end-to-end data flow (Kafka $\to$ InfluxDB $\to$ Flask API). |
| **NF-423 (Performance)** | **Kafka** consumer lag $\le 1$ second; API latency $\le 500$ milliseconds. |

### **4.3 DevOps/MLOps & Observability**
| Requirement | Description |
| :--- | :--- |
| **NF-431 (CI/CD)** | Full **CI/CD pipeline** for automated building, testing, and deployment (Kubernetes). |
| **NF-432 (MLOps - Tracking)** | Use **MLflow** for version control of models and **Generated Data** versions. |
| **NF-433 (Monitoring - Metrics)** | **Prometheus** **shall** be integrated to collect key metrics (CPU, Kafka Consumer Lag) from all microservices. |
| **NF-434 (Monitoring - Visualization)**| **Grafana** **shall** be deployed as the unified dashboarding tool, visualizing data from both **Prometheus** and **InfluxDB**. |

---

## **5. Data Governance Requirements**

### **5.1 Data Lineage and Auditability**
| Requirement ID | Requirement Description | Technical Details |
| :--- | :--- | :--- |
| **NF-511 (Lineage Logging)** | The system **shall** log the **Data Lineage** for all processed sensor readings, including source ID and the processing service (DVR, RTO) that modified the data. | Metadata tags within Kafka headers and specialized fields in the InfluxDB schema. |
| **NF-512 (Audit Trail)** | All data changes, especially those from **DVR** reconciliation or **RTO** execution, **shall** be recorded in an immutable audit log (**Historical Data** segment). | Store change records in MySQL (Original Value, Corrected Value, Algorithm ID). |

### **5.2 Data Ownership and Access**
| Requirement ID | Requirement Description | Technical Details |
| :--- | :--- | :--- |
| **NF-521 (Ownership Mapping)** | The system **shall** maintain metadata identifying the **Data Owner** responsible for each sensor group's accuracy. | Configurable mapping stored in the MySQL metadata database, linked to RBAC. |
| **NF-522 (Data Quality Reporting)** | A dedicated **Grafana** dashboard **shall** provide real-time reports on **Data Quality** metrics (e.g., frequency of **DVR** corrections, outlier rate). | Prometheus metrics scraped from the DVR service. |

---

## **6. Technical Implementation**

### **6.1 Core Stack**
- **UI/Frontend:** **React.js**.
- **Backend/API:** Python **Flask** (with Flask-SocketIO for WebSocket support).
- **Streaming Core:** **Apache Kafka**.
- **Time-Series DB:** **InfluxDB**.
- **Observability:** **Prometheus** and **Grafana**.

### **6.2 Advanced Subsystems**
- **Digital Twin:** Physics-based modeling, high-speed interaction for RL training.
- **Edge AI:** **RTM** models converted to **ONNX** format for local deployment.
- **SCADA:** **OPC-UA Client** for **RTO** control, and **OPC-UA Server** for publishing AI results.

---

## **7. AI/ML Frameworks and Testing Tools**

| Module | Core AI/ML Frameworks | Mandatory Unit Test Tools |
| :--- | :--- | :--- |
| **Cloud Intelligence** (PdM, RTO) | `TensorFlow`, `PyTorch`, `Scikit-learn`, `CasADi` | **Pytest** (for Python backend/ML logic) |
| **Frontend** (React.js) | N/A | **Jest** (for React components/UI logic) |






## **8. System Architecture Diagrams**

### **8.1 Overall System Architecture**

```mermaid
graph TB
    A[Physical Gas Turbine] --> B[Sensor Network]
    B --> C[Edge Gateway]
    C --> D[Kafka Cluster]
    
    D --> E[Data Validation & Reconciliation]
    D --> F[Real-Time Monitoring]
    D --> G[Predictive Maintenance]
    D --> H[Digital Twin]
    
    E --> I[InfluxDB TSDB]
    F --> I
    G --> J[ML Model Repository]
    H --> K[Simulation Engine]
    
    I --> L[Grafana Dashboards]
    J --> L
    K --> M[Real-Time Optimization]
    
    M --> N[Control Actions]
    N --> A
    
    L --> O[Operators]
    M --> O
    
    style A fill:#e1f5fe
    style L fill:#f3e5f5
    style M fill:#e8f5e8
    style E fill:#fff3e0
```

---

## **9. Core Functional Modules**

### **9.1 Real-Time Monitoring (RTM) Architecture**

```mermaid
graph LR
    A[Raw Sensor Data] --> B[Data Ingestion]
    B --> C[Data Preprocessing]
    C --> D[Anomaly Detection]
    C --> E[Performance Metrics]
    C --> F[Health Indicators]
    
    D --> G[Alert Generation]
    E --> H[Dashboard Visualization]
    F --> H
    
    G --> I[Operator Notifications]
    H --> J[Real-Time Decisions]
    
    style D fill:#ffebee
    style H fill:#e8f5e8
    style G fill:#fff3e0
```

### **9.2 Predictive Maintenance (PdM) Framework**

```mermaid
graph TB
    A[Historical Sensor Data] --> B[Feature Engineering]
    A --> C[Failure Events Database]
    
    B --> D[ML Training Pipeline]
    C --> D
    
    D --> E[LSTM Networks]
    D --> F[Transformer Models]
    D --> G[Survival Analysis]
    
    E --> H[RUL Prediction]
    F --> H
    G --> H
    
    H --> I[Maintenance Scheduling]
    H --> J[Spare Parts Planning]
    H --> K[Risk Assessment]
    
    style H fill:#ffebee
    style I fill:#e8f5e8
    style J fill:#fff3e0
```

### **9.3 Data Validation & Reconciliation (DVR) System**

```mermaid
graph TB
    A[Raw Sensor Input] --> B[Data Quality Checks]
    B --> C{Range Validation}
    B --> D[Completeness Check]
    B --> E[Rate of Change Analysis]
    
    C --> F[Outlier Detection]
    D --> F
    E --> F
    
    F --> G[Faulty Sensor Identification]
    G --> H[Weighted Least Squares Reconciliation]
    
    H --> I[Corrected Data Stream]
    H --> J[Data Quality Metrics]
    
    I --> K[Downstream Systems]
    J --> L[Quality Dashboard]
    
    style F fill:#ffebee
    style H fill:#e8f5e8
    style I fill:#e1f5fe
```

### **9.4 Real-Time Optimization (RTO) with Digital Twin**

```mermaid
graph TB
    A[Current Operating State] --> B[Optimization Engine]
    C[Economic Objectives] --> B
    D[Operational Constraints] --> B
    
    B --> E[Optimal Setpoints]
    E --> F[Digital Twin Validation]
    
    F --> G{Simulation Results}
    G --> H[Safe for Implementation]
    G --> I[Unsafe - Reject]
    
    H --> J[Engineer Approval]
    J --> K[OPC-UA Control Execution]
    
    K --> L[Physical Actuators]
    L --> M[Performance Feedback]
    M --> B
    
    style F fill:#e1f5fe
    style B fill:#e8f5e8
    style K fill:#fff3e0
```

---

## **10. Data Pipeline & Streaming Architecture**

### **10.1 Kafka Streaming Infrastructure**

```mermaid
graph TB
    A[Sensor Producers] --> B[Kafka Cluster]
    
    subgraph Kafka Topics
        C[raw-sensor-data]
        D[validated-data]
        E[alerts-notifications]
        F[control-commands]
    end
    
    B --> C
    B --> D
    B --> E
    B --> F
    
    C --> G[DVR Consumer]
    C --> H[RTM Consumer]
    
    D --> I[PdM Consumer]
    D --> J[RTO Consumer]
    D --> K[InfluxDB Writer]
    
    F --> L[OPC-UA Producer]
    
    G --> D
    J --> F
    
    style B fill:#e1f5fe
    style C fill:#ffebee
    style D fill:#e8f5e8
```

### **10.2 Monitoring & Observability Stack**

```mermaid
graph TB
    A[Microservices] --> B[Prometheus Metrics]
    C[Kafka Consumers] --> D[Consumer Lag Metrics]
    E[ML Models] --> F[Performance Metrics]
    
    B --> G[Prometheus Server]
    D --> G
    F --> G
    
    G --> H[Grafana Data Source]
    
    I[InfluxDB] --> H
    J[Business Metrics] --> H
    
    H --> K[Operational Dashboards]
    H --> L[Business Dashboards]
    H --> M[Technical Dashboards]
    
    K --> N[System Health]
    L --> O[KPI Tracking]
    M --> P[Debugging Views]
    
    style G fill:#e1f5fe
    style H fill:#e8f5e8
    style K fill:#fff3e0
```

---

## **11. Data Governance Framework**

### **11.1 Data Lineage & Quality Management**

```mermaid
graph TB
    A[Raw Data Sources] --> B[Lineage Tracking]
    B --> C[Kafka Headers]
    B --> D[InfluxDB Tags]
    
    E[Data Processing] --> F[Audit Logging]
    F --> G[MySQL Audit Tables]
    
    H[Data Quality Rules] --> I[Real-time Validation]
    I --> J[Quality Metrics]
    J --> K[Prometheus]
    
    L[Data Owners] --> M[RBAC Access Control]
    M --> N[Approval Workflows]
    
    K --> O[Quality Dashboards]
    G --> P[Compliance Reports]
    
    style B fill:#e1f5fe
    style I fill:#ffebee
    style O fill:#e8f5e8
```

---

## **12. Security Architecture**

### **12.1 Comprehensive Security Layers**

```mermaid
graph TB
    A[External Access] --> B[API Gateway]
    B --> C[JWT Authentication]
    C --> D[RBAC Authorization]
    
    E[Internal Services] --> F[Service Mesh]
    F --> G[mTLS Encryption]
    
    H[Kafka Cluster] --> I[SSL/TLS Encryption]
    H --> J[SASL Authentication]
    
    K[OPC-UA Control] --> L[Certificate Auth]
    K --> M[Network Segmentation]
    
    N[Data Storage] --> O[Encryption at Rest]
    N --> P[Access Logging]
    
    style C fill:#ffebee
    style G fill:#e8f5e8
    style I fill:#fff3e0
```

---

## **13. Deployment & DevOps**

### **13.1 CI/CD Pipeline Architecture**

```mermaid
graph TB
    A[Developer Commit] --> B[Git Repository]
    B --> C[CI Pipeline]
    
    C --> D[Unit Tests]
    C --> E[Integration Tests]
    C --> F[Security Scan]
    
    D --> G[Build Docker Images]
    E --> G
    F --> G
    
    G --> H[Push to Registry]
    H --> I[Deployment Staging]
    
    I --> J[Smoke Tests]
    J --> K[Production Deployment]
    
    K --> L[Prometheus Monitoring]
    K --> M[Rollback Capability]
    
    style D fill:#ffebee
    style G fill:#e1f5fe
    style K fill:#e8f5e8
```

---

## **8. Performance Requirements**

### **8.1 System Performance Matrix**

```mermaid
graph TB
    A[Performance Category] --> B[Latency Requirements]
    A --> C[Throughput Requirements]
    A --> D[Availability Requirements]
    
    B --> E[Edge Processing: ≤100ms]
    B --> F[Cloud RTM: ≤1s]
    B --> G[API Response: ≤500ms]
    
    C --> H[Kafka: ≥10K msgs/sec]
    C --> I[Database: ≥1K writes/sec]
    
    D --> J[System Uptime: ≥99.9%]
    D --> K[Data Pipeline: ≥99.95%]
    
    style E fill:#e8f5e8
    style F fill:#e8f5e8
    style H fill:#e1f5fe
```

---

## **9. Appendices**

### **9.1 Technology Stack Specification**

```mermaid
graph TB
    A[Technology Stack] --> B[Frontend Layer]
    A --> C[Backend Layer]
    A --> D[Data Layer]
    A --> E[AI/ML Layer]
    A --> F[Infrastructure Layer]
    
    B --> G[React.js]
    B --> H[Grafana Embedded]
    
    C --> I[Python Flask]
    C --> J[FastAPI]
    
    D --> K[Apache Kafka]
    D --> L[InfluxDB]
    D --> M[MySQL]
    
    E --> N[TensorFlow]
    E --> O[PyTorch]
    E --> P[MLflow]
    
    F --> Q[Kubernetes]
    F --> R[Docker]
    F --> S[Prometheus]
    
    style G fill:#e1f5fe
    style K fill:#fff3e0
    style N fill:#e8f5e8
