# Real-Time Optimization (RTO)

## Objective
To provide real-time operational suggestions to the compressor operator, aiming to maximize efficiency while balancing performance against component wear-and-tear.

## Algorithm Used
- **PPO (Proximal Policy Optimization):** A state-of-the-art Reinforcement Learning (RL) algorithm was used to train an agent.
- **Custom Simulation Environment (`CompressorEnv`):** A custom environment was built to simulate the compressor's dynamics, allowing the agent to learn in a safe, offline setting.
- **Normalized Reward Function:** A sophisticated reward function was designed to balance multiple objectives: maximizing `efficiency` while minimizing `power_consumption` and `vibration`.

## Current Status & Next Steps
- [x] Train an initial PPO agent.
- [x] Implement a Kafka consumer (`rto_consumer`) to generate suggestions in real-time.
- [x] Create an API endpoint to serve the latest suggestion.
- [ ] **Needs Improvement:** Offline backtesting shows that the current model does not yet improve efficiency. The model requires further training and hyperparameter tuning.

## Why It Matters
A successful RTO module can lead to significant operational benefits:
- **Cost Savings:** Reduced power consumption.
- **Increased Lifespan:** Minimized vibration and wear-and-tear on components.
- **Improved Output:** Maximized operational efficiency.