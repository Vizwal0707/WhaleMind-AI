# %% [markdown]
# # Spatio-Temporal GNN Network Analysis and Pricing Bias Forecasting
# 
# This research notebook explores modeling dynamic blockchain transaction sequences as dynamic graph snapshots 
# and training a Spatio-Temporal Graph Neural Network (ST-GNN-GRU) to forecast token pricing biases.

# %%
import networkx as nx
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# %% [markdown]
# ## 1. Build Dynamic Graph Sequence
# We simulate a series of transactions and slice them chronologically into 3 snapshots.

# %%
# Simulate transaction data
rng = np.random.default_rng(seed=42)
start_time = datetime.now() - timedelta(days=5)

addresses = [
    "0x1F9090aaE28b8a3dCdf852A7412215ad1d1D507A", # Jump Crypto
    "0x8C6B2F8bA24A6eE031a0e5b768eA2f7a911aE322", # Amber Group
    "0xD8dA6BF26964aF9D7eEd9e03E53415D37aA96045", # vitalik.eth
    "0x28C6c06298d514Db089934071355E5743bf21d60", # Binance Cold
    "0xF977814e90dA44bFA03b6295A0616a897441aceC", # Binance Hot
]

txs = []
for i in range(100):
    txs.append({
        "from_address": rng.choice(addresses),
        "to_address": rng.choice(addresses),
        "amount_usd": float(rng.uniform(10000.0, 5000000.0)),
        "timestamp": start_time + timedelta(minutes=i * 60)
    })

# Remove self-loops
txs = [tx for tx in txs if tx["from_address"] != tx["to_address"]]
print(f"Total simulated transactions: {len(txs)}")

# %% [markdown]
# ## 2. Formulate Snapshots
# We divide the timeline into 3 snapshots and compute adjacency and node feature profiles.

# %%
seq_len = 3
master_G = nx.DiGraph()
for tx in txs:
    master_G.add_edge(tx["from_address"], tx["to_address"], weight=tx["amount_usd"])

nodes_list = list(master_G.nodes())
num_nodes = len(nodes_list)
print(f"Master Graph Nodes: {num_nodes}")

# Prepare snapshot sequences
x_seq = []
adj_seq = []

for t in range(1, seq_len + 1):
    limit = int(len(txs) * (t / seq_len))
    snapshot_txs = txs[:limit]
    
    sub_G = nx.DiGraph()
    for tx in snapshot_txs:
        if sub_G.has_edge(tx["from_address"], tx["to_address"]):
            sub_G[tx["from_address"]][tx["to_address"]]["weight"] += tx["amount_usd"]
        else:
            sub_G.add_edge(tx["from_address"], tx["to_address"], weight=tx["amount_usd"])
            
    # Node features: [degree, volume, active_days]
    x_feat = np.zeros((num_nodes, 3), dtype=np.float32)
    adj = np.zeros((num_nodes, num_nodes), dtype=np.float32)
    
    for idx, node in enumerate(nodes_list):
        if node in sub_G:
            # Degree centrality as a basic feature
            x_feat[idx, 0] = sub_G.degree(node)
            # Sum weight volume
            x_feat[idx, 1] = sum([d.get("weight", 0) for u, v, d in sub_G.edges(node, data=True)])
            x_feat[idx, 2] = t * 1.5  # mock age metrics progression
            
            for neighbor in sub_G.neighbors(node):
                if neighbor in nodes_list:
                    neighbor_idx = nodes_list.index(neighbor)
                    adj[idx, neighbor_idx] = sub_G[node][neighbor]["weight"]
                    
    x_seq.append(x_feat)
    adj_seq.append(adj)

x_seq_arr = np.stack(x_seq, axis=0)
adj_seq_arr = np.stack(adj_seq, axis=0)

print(f"X Sequence Shape: {x_seq_arr.shape}")
print(f"Adj Sequence Shape: {adj_seq_arr.shape}")

# %% [markdown]
# ## 3. Define and Train Temporal GNN Model in PyTorch
# We build a PyTorch Spatio-Temporal GNN featuring a GCN spatial layer followed by a GRU temporal sequence layer.

# %%
try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    import torch.optim as optim
    
    class SimpleGCN(nn.Module):
        def __init__(self, in_features, out_features):
            super().__init__()
            self.linear = nn.Linear(in_features, out_features)
            
        def forward(self, x, adj):
            # Normalization
            deg = torch.sum(adj, dim=1)
            d_inv = torch.pow(deg + 1e-5, -0.5)
            d_mat = torch.diag(d_inv)
            norm_adj = d_mat @ adj @ d_mat
            
            support = norm_adj @ x
            return self.linear(support)

    class TemporalGNN(nn.Module):
        def __init__(self, feat_dim, hidden_dim, num_classes=3):
            super().__init__()
            self.gcn = SimpleGCN(feat_dim, hidden_dim)
            self.rnn = nn.GRU(hidden_dim, hidden_dim, batch_first=True)
            self.classifier = nn.Linear(hidden_dim, num_classes)
            
        def forward(self, x_s, adj_s):
            seq_len, num_nodes, _ = x_s.shape
            embeds = []
            for t in range(seq_len):
                h_t = F.relu(self.gcn(x_s[t], adj_s[t]))
                embeds.append(h_t)
            
            # shape: [seq_len, num_nodes, hidden_dim] -> [num_nodes, seq_len, hidden_dim]
            rnn_in = torch.stack(embeds, dim=0).transpose(0, 1)
            out, _ = self.rnn(rnn_in)
            
            # Predict using final hidden step state
            return self.classifier(out[:, -1, :])

    # Convert to tensors
    x_tensor = torch.tensor(x_seq_arr, dtype=torch.float32)
    adj_tensor = torch.tensor(adj_seq_arr, dtype=torch.float32)
    labels = torch.randint(0, 3, (num_nodes,))  # mock target classes
    
    # Initialize model
    model = TemporalGNN(feat_dim=3, hidden_dim=8, num_classes=3)
    optimizer = optim.Adam(model.parameters(), lr=0.01)
    criterion = nn.CrossEntropyLoss()
    
    print("\n--- Training Spatio-Temporal GNN Model ---")
    for epoch in range(1, 11):
        model.train()
        optimizer.zero_grad()
        out = model(x_tensor, adj_tensor)
        loss = criterion(out, labels)
        loss.backward()
        optimizer.step()
        print(f"Epoch {epoch:02d} | Train Loss: {loss.item():.4f}")
except ImportError:
    print("\nPyTorch not available. Skipping neural network forward pass training logs.")
