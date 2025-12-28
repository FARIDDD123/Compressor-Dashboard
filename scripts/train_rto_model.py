import torch
import pandas as pd
import numpy as np
import random
import pickle
import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
    from sklearn.preprocessing import MinMaxScaler
    from sklearn.model_selection import train_test_split
    from backend.ml.rto_env import CompressorEnv
    from backend.ml.rto_agent import PPOAgent


def train_rto_model(config: dict):
    """
    Main function to run the PPO training and evaluation loop based on a config dictionary.
    """
    # -------- 1. Setup and Reproducibility --------
    SEED = config.get("seed", 42)
    np.random.seed(SEED)
    random.seed(SEED)
    torch.manual_seed(SEED)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # -------- 2. Load and Preprocess Data --------
    print("Loading and preprocessing data...")
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
    DATASET_PATH = os.path.join(PROJECT_ROOT, "datasets", "MASTER_DATASET.csv")
    df = pd.read_csv(DATASET_PATH)  # Adjusted path
    DATASET_PATH = os.path.join(PROJECT_ROOT, "datasets", "MASTER_DATASET.csv")
    df = pd.read_csv(DATASET_PATH)

    # Define state features from the environment class for consistency
    temp_env = CompressorEnv(df.head(1))
    state_features = temp_env.state_features
    del temp_env

    # Split data BEFORE scaling
    df_train, df_test = train_test_split(df, test_size=0.2, shuffle=False)

    # Fit scaler ONLY on training data to prevent data leakage
    scaler = MinMaxScaler()
    scaler.fit(df_train[state_features])
    print("Data loaded and scaler fitted on training data.")

    # -------- 3. Initialize Environments and Agent --------
    print("Initializing environments and agent...")
    # Create the training environment
    train_env = CompressorEnv(
        df_train, scaler=scaler, reward_weights=config["reward_weights"]
    )

    # Create the evaluation environment, injecting the dynamics models from the training env
    eval_env = CompressorEnv(
        df_test, scaler=scaler, dynamics_models=train_env.dynamics_models
    )

    agent = PPOAgent(
        state_dim=len(state_features),
        action_dim=1,
        actor_hidden_dims=config["actor_hidden_dims"],
        critic_hidden_dims=config["critic_hidden_dims"],
        actor_lr=config["actor_lr"],
        critic_lr=config["critic_lr"],
        gamma=config["gamma"],
        eps_clip=config["eps_clip"],
        device=device,
    )
    print("Initialization complete.")

    # -------- 4. Training and Evaluation Loop --------
    best_eval_reward = float("-inf")

    print("\n--- Starting Training & Evaluation Loop ---")
    for epoch in range(config["n_epochs"]):
        # --- Training Phase ---
        state, _ = train_env.reset()
        states, actions, log_probs, rewards, values, dones = [], [], [], [], [], []

        for t in range(config["timesteps_per_epoch"]):
            state_tensor = torch.tensor(state, dtype=torch.float32).to(device)
            action, log_prob, value = agent.select_action(state_tensor)

            next_state, reward, terminated, truncated, _ = train_env.step(
                action.cpu().numpy()
            )

            # Store experience
            states.append(state_tensor)
            actions.append(action)
            log_probs.append(log_prob)
            values.append(value)
            rewards.append(torch.tensor(reward, dtype=torch.float32).to(device))
            dones.append(torch.tensor(terminated, dtype=torch.float32).to(device))

            state = next_state
            if terminated:
                state, _ = train_env.reset()

        # Learn from the collected experience
        returns, advantages = agent.compute_gae(rewards, values, dones)
        agent.update(states, actions, log_probs, returns, advantages)

        # --- Evaluation Phase ---
        total_eval_reward = 0
        eval_state, _ = eval_env.reset()
        eval_done = False
        while not eval_done:
            eval_state_tensor = torch.tensor(eval_state, dtype=torch.float32).to(device)
            # In eval, we can act more deterministically by taking the mean
            action, _, _ = agent.select_action(
                eval_state_tensor
            )  # We don't need log_prob or value

            next_eval_state, reward, terminated, truncated, _ = eval_env.step(
                action.cpu().numpy()
            )
            total_eval_reward += reward
            eval_state = next_eval_state
            eval_done = terminated

        print(
            f"Epoch {epoch + 1}/{config['n_epochs']} | Evaluation Reward: {total_eval_reward:.2f}"
        )

        # Save best model based on evaluation reward
        if total_eval_reward > best_eval_reward:
            best_eval_reward = total_eval_reward

            best_model_data = {
                "actor": agent.actor.state_dict(),
                "critic": agent.critic.state_dict(),
                "scaler": scaler,
            }
            with open("best_ppo_model.pkl", "wb") as f:
                pickle.dump(best_model_data, f)
            print(
                f"  -> New best model (.pkl) saved with reward: {best_eval_reward:.2f}"
            )

            dummy_input = torch.randn(1, len(state_features), device=device)
            onnx_path = "best_ppo_actor.onnx"
            torch.onnx.export(
                agent.actor,
                dummy_input,
                onnx_path,
                input_names=["state"],
                output_names=["action"],
            )
            print(f"  -> Best actor exported to {onnx_path}")
    print("\n--- Saving Scaler Separately ---")
    scaler_only_path = os.path.join(PROJECT_ROOT, "artifacts", "rto_scaler.pkl")
    with open(scaler_only_path, "wb") as f:
        pickle.dump(scaler, f)
    print(f"✅ Scaler ONLY saved to {scaler_only_path}")
    print("\n--- Training complete. ---")


if __name__ == "__main__":
    CONFIG = {
        "seed": 42,
        # --- OPTIMIZED: Increased training time and improved hyperparameters ---
        "n_epochs": 200,  # Increased from 100
        "timesteps_per_epoch": 4096,  # Increased from 2048
        "actor_lr": 1e-4,  # Reduced from 3e-4 for better stability
        "critic_lr": 5e-4,  # Reduced from 1e-3
        "gamma": 0.995,  # Increased from 0.99 for longer-term planning
        "eps_clip": 0.2,
        "actor_hidden_dims": [256, 128, 64],  # Deeper network
        "critic_hidden_dims": [256, 128, 64],  # Deeper network
        # --- OPTIMIZED: Better balanced reward weights ---
        "reward_weights": {
            "efficiency": 10.0,  # Increased focus on efficiency
            "power": -0.005,  # Reduced penalty to allow exploration
            "vibration": -0.2,  # Increased penalty for vibration
        },
    }
    train_rto_model(CONFIG)
