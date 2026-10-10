"""Download CHIRPS v2.0 Africa monthly rainfall and keep only a Rwanda window (saves ~99% of disk).

Usage: uv run python scripts/fetch_chirps.py [last_year last_month]
"""

import gzip
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

import rasterio
from rasterio.windows import from_bounds

from kuhira.rainfall import CHIRPS_DIR

BASE = "https://data.chc.ucsb.edu/products/CHIRPS-2.0/africa_monthly/tifs/chirps-v2.0.{y}.{m:02d}.tif.gz"
BBOX = (28.7, -2.95, 31.05, -0.95)  # Rwanda plus a margin, lon/lat
LAST = tuple(map(int, sys.argv[1:3])) if len(sys.argv) > 2 else (2026, 8)


def fetch(ym: tuple[int, int]) -> None:
    y, m = ym
    dst = CHIRPS_DIR / f"chirps_rwa_{y}_{m:02d}.tif"
    if dst.exists():
        return
    for _ in range(3):
        try:
            raw = gzip.decompress(urllib.request.urlopen(BASE.format(y=y, m=m), timeout=120).read())
            break
        except OSError as e:
            print("retry", y, m, e, flush=True)
    else:
        print("FAILED", y, m, flush=True)
        return
    with rasterio.MemoryFile(raw) as mf, mf.open() as src:
        window = from_bounds(*BBOX, transform=src.transform)
        data = src.read(1, window=window)
        profile = src.profile | {"height": data.shape[0], "width": data.shape[1],
                                 "transform": src.window_transform(window), "compress": "deflate"}
        with rasterio.open(dst, "w", **profile) as out:
            out.write(data, 1)
    print("ok", y, m, flush=True)


if __name__ == "__main__":
    CHIRPS_DIR.mkdir(parents=True, exist_ok=True)
    months = [(y, m) for y in range(1995, LAST[0] + 1) for m in range(1, 13) if (y, m) <= LAST]
    with ThreadPoolExecutor(12) as ex:
        list(ex.map(fetch, months))
