from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"
RAW = DATA / "raw"
INTERIM = DATA / "interim"
EXTERNAL = DATA / "external"
PROCESSED = DATA / "processed"
