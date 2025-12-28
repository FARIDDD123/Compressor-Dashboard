import torch
import torch.nn as nn
from typing import List


# NEW: A helper function to dynamically create a network from a list of layer sizes
def create_mlp(
    layer_dims: List[int],
    activation: nn.Module = nn.ReLU,
    output_activation: nn.Module = nn.Identity(),
) -> nn.Sequential:
    """Creates a Multi-Layer Perceptron (MLP) dynamically."""
    layers = []
    for i in range(len(layer_dims) - 1):
        layers.append(nn.Linear(layer_dims[i], layer_dims[i + 1]))
        if i < len(layer_dims) - 2:
            layers.append(activation())
    layers.append(output_activation)
    return nn.Sequential(*layers)


class Actor(nn.Module):
    """
    Neural network for policy approximation (Actor).
    Maps a state to an action.
    """

    # CHANGED: Now accepts a list of hidden layer dimensions
    def __init__(
        self, input_dim: int, output_dim: int, hidden_dims: List[int] = [64, 64]
    ):
        """
        Args:
            input_dim (int): Dimension of the state space.
            output_dim (int): Dimension of the action space.
            hidden_dims (List[int]): A list containing the size of each hidden layer.
        """
        super(Actor, self).__init__()

        # Define the dimensions of all layers
        layer_dims = [input_dim] + hidden_dims + [output_dim]

        # Create the network dynamically with a Tanh output activation
        self.net = create_mlp(layer_dims, output_activation=nn.Tanh())

    def forward(self, state: torch.Tensor) -> torch.Tensor:
        """
        Performs a forward pass through the network.

        Args:
            state (torch.Tensor): The input state.

        Returns:
            torch.Tensor: The output action, in the range [-1, 1].
        """
        return self.net(state)


class Critic(nn.Module):
    """
    Neural network for value function approximation (Critic).
    Maps a state to its estimated value.
    """

    # CHANGED: Now accepts a list of hidden layer dimensions
    def __init__(self, input_dim: int, hidden_dims: List[int] = [64, 64]):
        """
        Args:
            input_dim (int): Dimension of the state space.
            hidden_dims (List[int]): A list containing the size of each hidden layer.
        """
        super(Critic, self).__init__()

        # The output of the critic is always a single value
        output_dim = 1
        layer_dims = [input_dim] + hidden_dims + [output_dim]

        # Create the network dynamically with no output activation (Identity)
        self.net = create_mlp(layer_dims)

    def forward(self, state: torch.Tensor) -> torch.Tensor:
        """
        Performs a forward pass through the network.

        Args:
            state (torch.Tensor): The input state.

        Returns:
            torch.Tensor: The estimated value of the state.
        """
        return self.net(state)
