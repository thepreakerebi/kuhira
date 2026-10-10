import numpy as np
import pandas as pd
import pytest


@pytest.fixture
def synthetic_plots():
    """Survey-shaped plots where irrigation multiplies yield by exactly 1.20 (maize) and 0.90 (beans)."""
    rng = np.random.default_rng(7)
    n = 6000
    crop = rng.choice(["Maize", "Bush bean", "Climbing bean"], n)
    irrigated = (rng.random(n) < 0.15).astype(float)
    ha = rng.uniform(0.02, 0.5, n)
    district = rng.choice(["Kirehe", "Huye", "Musanze"], n)
    season = rng.choice(["A", "B"], n)
    effect = np.where(crop == "Maize", np.log(1.20), np.log(0.90))
    base = np.where(crop == "Maize", np.log(1500), np.log(700)) + np.where(district == "Kirehe", -0.2, 0.1)
    kg = np.exp(base + effect * irrigated + rng.normal(0, 0.3, n)) * ha
    return pd.DataFrame(
        {
            "year": 2024,
            "season": season,
            "seg": rng.integers(0, 300, n).astype(str),
            "farmer": np.arange(n).astype(str),
            "plot": "1",
            "province": "East",
            "district": district,
            "small": 1,
            "crop": crop,
            "ha": ha,
            "kg": kg,
            "price": 300.0,
            "ncrop": 1.0,
            "irrigated": irrigated,
            "fert_used": rng.integers(0, 2, n),
            "iseed": rng.integers(0, 2, n),
            "w": 1.0,
        }
    )
