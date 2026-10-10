import pandas as pd
import pytest

from kuhira.rainfall import dry_season_mm, load_districts


def test_dry_season_sums_june_to_august_then_averages_years():
    rain = pd.DataFrame([
        {"district": "Huye", "year": y, "month": m, "mm": mm}
        for y, scale in [(2000, 1), (2001, 3)] for m, mm in [(5, 100 * scale), (6, 10 * scale), (7, 5 * scale), (8, 15 * scale)]
    ])
    assert dry_season_mm(rain)["Huye"] == pytest.approx((30 + 90) / 2)


def test_boundaries_have_all_thirty_districts():
    d = load_districts()
    assert len(d) == 30 and d.district.is_unique
