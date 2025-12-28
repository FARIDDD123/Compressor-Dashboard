import torch
import torch.nn.functional as F
from torch.distributions import Normal
from typing import List, Tuple, Optional
from backend.ml.rto_model import Actor, Critic


class PPOAgent:
    """
    PPO Agent with Actor-Critic architecture.
    Handles action selection, GAE computation, and network updates.
    """

    # CHANGED: Added type hints and options for model architecture
    def __init__(
        self,
        state_dim: int,
        action_dim: int,
        actor_hidden_dims: List[int] = [64, 64],
        critic_hidden_dims: List[int] = [64, 64],
        actor_lr: float = 1e-4,
        critic_lr: float = 1e-3,
        gamma: float = 0.99,
        eps_clip: float = 0.2,
        device: Optional[torch.device] = None,
    ):
        self.device = (
            device
            if device
            else torch.device("cuda" if torch.cuda.is_available() else "cpu")
        )

        # CHANGED: Pass the architecture configuration to the models
        self.actor = Actor(state_dim, action_dim, actor_hidden_dims).to(self.device)
        self.critic = Critic(state_dim, critic_hidden_dims).to(self.device)

        self.actor_optimizer = torch.optim.Adam(self.actor.parameters(), lr=actor_lr)
        self.critic_optimizer = torch.optim.Adam(self.critic.parameters(), lr=critic_lr)

        self.gamma = gamma
        self.eps_clip = eps_clip

    def select_action(
        self, state: torch.Tensor
    ) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """Selects an action based on the current policy and state."""
        with torch.no_grad():
            state = state.unsqueeze(0).to(self.device)
            mean = self.actor(state)
            mean = (mean + 1) / 2  # Scale from [-1, 1] to [0, 1]

            # A fixed standard deviation for exploration
            std = torch.full_like(mean, 0.1)
            dist = Normal(mean, std)

            action = dist.sample().clamp(0.0, 1.0)
            log_prob = dist.log_prob(action).sum(dim=-1)
            value = self.critic(state)

        return action.squeeze(0), log_prob.squeeze(0), value.squeeze(0)

    def compute_gae(
        self,
        rewards: List[torch.Tensor],
        values: List[torch.Tensor],
        dones: List[torch.Tensor],
        lam: float = 0.95,
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """Computes Generalized Advantage Estimation (GAE) and returns."""
        returns = []
        gae = 0
        # Append the last value to bootstrap
        values_bootstrapped = values + [values[-1].detach()]

        for step in reversed(range(len(rewards))):
            delta = (
                rewards[step]
                + self.gamma * values_bootstrapped[step + 1] * (1 - dones[step])
                - values_bootstrapped[step]
            )
            gae = delta + self.gamma * lam * (1 - dones[step]) * gae
            returns.insert(0, gae + values_bootstrapped[step])

        advantages = [ret - val for ret, val in zip(returns, values)]

        return torch.stack(returns).to(self.device), torch.stack(advantages).to(
            self.device
        )

    def update(
        self,
        states: List[torch.Tensor],
        actions: List[torch.Tensor],
        log_probs_old: List[torch.Tensor],
        returns: torch.Tensor,
        advantages: torch.Tensor,
    ):
        """Updates the actor and critic networks based on a batch of experience."""
        # Convert lists of tensors to a single tensor
        states = torch.stack(states).to(self.device)
        actions = torch.stack(actions).to(self.device)
        log_probs_old = torch.stack(log_probs_old).to(self.device)

        returns = returns.detach()
        advantages = advantages.detach()

        # Update Critic
        values = self.critic(states)
        critic_loss = F.mse_loss(values, returns)

        self.critic_optimizer.zero_grad()
        critic_loss.backward()
        self.critic_optimizer.step()

        # Update Actor using PPO-Clip objective
        mean = self.actor(states)
        mean = (mean + 1) / 2  # Also scale here to match action distribution
        std = torch.full_like(mean, 0.1)
        dist = Normal(mean, std)

        log_probs_new = dist.log_prob(actions).sum(dim=-1)
        ratios = torch.exp(log_probs_new - log_probs_old)

        surr1 = ratios * advantages
        surr2 = torch.clamp(ratios, 1 - self.eps_clip, 1 + self.eps_clip) * advantages
        actor_loss = -torch.min(surr1, surr2).mean()

        self.actor_optimizer.zero_grad()
        actor_loss.backward()
        self.actor_optimizer.step()
