import sys
from pathlib import Path

if len(sys.argv) < 4:
    print("Usage: view_segment.py <path> <start> <end>")
    sys.exit(1)

path = Path(sys.argv[1])
start = int(sys.argv[2])
end = int(sys.argv[3])

lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
for idx in range(start - 1, min(end, len(lines))):
    sys.stdout.buffer.write(f"{idx+1}: {lines[idx]}\n".encode("utf-8"))
