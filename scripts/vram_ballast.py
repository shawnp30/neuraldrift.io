"""Holds a fixed amount of GPU memory to constrain the VRAM available to a benchmark.

Usage: <python with CUDA torch> vram_ballast.py <GiB>
Prints "READY <bytes>" once the memory is allocated and touched, then holds it until killed.
This constrains free VRAM on the same GPU; it does not emulate a GPU with less memory.
"""

import sys
import time

import torch

gib = float(sys.argv[1])
chunk = 256 * 1024 * 1024
remaining = int(gib * 1024 ** 3)
held = []
while remaining > 0:
    size = min(chunk, remaining)
    t = torch.empty(size, dtype=torch.uint8, device="cuda")
    t.fill_(1)  # Touch the pages so the allocation is resident, not just reserved
    held.append(t)
    remaining -= size
torch.cuda.synchronize()
print(f"READY {sum(t.numel() for t in held)}", flush=True)
while True:
    time.sleep(3600)
