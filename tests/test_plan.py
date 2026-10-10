import pytest

from kuhira import plan
from kuhira.plan import Crop, District, DistrictCrop, Weights


def crop(name, bonus, p=0.001, price=100.0):
    return Crop(
        crop=name,
        bonus_pct=bonus,
        ci_low_pct=None,
        ci_high_pct=None,
        p_value=p,
        plots=100,
        irrigated_plots=50,
        price_rwf_per_kg=price,
    )


def district(name, crops, irrigated=0.01, dry=50.0, poverty=30.0, cropland=1000.0):
    return District(
        district=name,
        province="East",
        cropland_ha=cropland,
        irrigated_share=irrigated,
        dry_season_mm=dry,
        poverty_rate_pct=poverty,
        crops=[DistrictCrop(crop=c, share=s, yield_kg_per_ha=y) for c, s, y in crops],
    )


CROPS = {"Maize": crop("Maize", 20), "Beans": crop("Beans", -10), "Cassava": crop("Cassava", 30, p=0.4)}


def test_only_significant_bonus_counts():
    assert CROPS["Maize"].counted_bonus == pytest.approx(0.2)
    assert CROPS["Cassava"].counted_bonus == 0
    assert crop("Wheat", None, p=None).counted_bonus == 0


def test_gain_per_ha_weights_crops_by_share_and_lets_beans_subtract():
    d = district("A", [("Maize", 0.5, 1000), ("Beans", 0.5, 600)])
    assert plan.gain_per_ha(d, CROPS) == pytest.approx(0.5 * 1000 * 0.2 * 100 - 0.5 * 600 * 0.1 * 100)


def test_rescale_handles_inversion_and_flat_input():
    assert plan.rescale([0, 5, 10]) == [0, 0.5, 1]
    assert plan.rescale([0, 5, 10], invert=True) == [1, 0.5, 0]
    assert plan.rescale([3, 3]) == [0, 0]


def test_score_ranks_drier_district_first_when_only_dryness_counts():
    ds = {"Wet": district("Wet", [("Maize", 1, 1000)], dry=120), "Dry": district("Dry", [("Maize", 1, 1000)], dry=30)}
    ranked = plan.score(ds, CROPS, Weights(gain=0, gap=0, dryness=1, poverty=0))
    assert [r["district"] for r in ranked] == ["Dry", "Wet"]
    assert [r["rank"] for r in ranked] == [1, 2]
    assert ranked[0]["score"] == 100 and ranked[1]["score"] == 0


def test_score_with_all_zero_weights_does_not_divide_by_zero():
    ds = {"A": district("A", [("Maize", 1, 1000)]), "B": district("B", [("Beans", 1, 1000)])}
    assert all(r["score"] == 0 for r in plan.score(ds, CROPS, Weights(gain=0, gap=0, dryness=0, poverty=0)))


def test_allocate_splits_by_score_times_cropland_and_sums_costs():
    scored = [
        {"district": "A", "rank": 1, "score": 80, "cropland_ha": 1000, "gain_rwf_per_ha": 10_000},
        {"district": "B", "rank": 2, "score": 40, "cropland_ha": 1000, "gain_rwf_per_ha": 5_000},
        {"district": "C", "rank": 3, "score": 0, "cropland_ha": 5000, "gain_rwf_per_ha": 0},
    ]
    out = plan.allocate(scored, hectares=300, cost_per_ha=1_000_000, subsidy_rate=0.75)
    ha = {r["district"]: r["hectares"] for r in out["districts"]}
    assert ha == {"A": 200, "B": 100, "C": 0}
    assert out["totals"]["public_cost_rwf"] == 225_000_000
    assert out["totals"]["farmer_cost_rwf"] == 75_000_000
    assert out["totals"]["extra_value_rwf_per_year"] == (200 * 10_000 + 100 * 5_000) * plan.SEASONS_PER_YEAR


def test_farmer_estimate_for_quarter_hectare_of_maize():
    d = district("A", [("Maize", 1, 2000)])
    out = plan.farmer_estimate(d, CROPS["Maize"], area_m2=2500, kit_cost_rwf=90_000, subsidy_rate=0.5)
    assert out["rainfed_kg"] == 500
    assert out["extra_kg_per_season"] == 100
    assert out["extra_rwf_per_season"] == 10_000
    assert out["farmer_pays_rwf"] == 45_000
    assert out["seasons_to_repay"] == 4.5


def test_farmer_estimate_never_repays_when_crop_loses():
    d = district("A", [("Beans", 1, 600)])
    out = plan.farmer_estimate(d, CROPS["Beans"], area_m2=1000, kit_cost_rwf=90_000, subsidy_rate=0.5)
    assert out["extra_kg_per_season"] < 0 and out["seasons_to_repay"] is None


def test_processed_files_cover_thirty_districts_and_shares_sum_to_one():
    ds = plan.load_districts()
    assert len(ds) == 30
    for d in ds.values():
        assert sum(c.share for c in d.crops) == pytest.approx(1, abs=0.01)
