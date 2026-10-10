import pytest

from kuhira.water_bonus import MIN_IRRIGATED, estimate, estimate_all, estimate_within, prepare


def test_recovers_known_positive_bonus(synthetic_plots):
    row = estimate(prepare(synthetic_plots), "Maize")
    assert row["bonus_pct"] == pytest.approx(20, abs=4)
    assert row["ci_low_pct"] < 20 < row["ci_high_pct"]
    assert row["p_value"] < 0.05


def test_groups_bean_varieties_and_recovers_penalty(synthetic_plots):
    row = estimate(prepare(synthetic_plots), "Beans")
    assert row["bonus_pct"] == pytest.approx(-10, abs=4)


def test_within_estimator_agrees_with_dummies(synthetic_plots):
    df = prepare(synthetic_plots)
    assert estimate_within(df, "Maize")["bonus_pct"] == pytest.approx(estimate(df, "Maize")["bonus_pct"], abs=1.5)


def test_too_few_irrigated_plots_is_not_estimated(synthetic_plots):
    few = synthetic_plots[(synthetic_plots.crop != "Maize") | (synthetic_plots.irrigated == 0)].copy()
    few.loc[few[few.crop == "Maize"].index[: MIN_IRRIGATED - 1], "irrigated"] = 1.0
    row = estimate(prepare(few), "Maize")
    assert row["bonus_pct"] is None and row["irrigated_plots"] < MIN_IRRIGATED


def test_large_farmers_are_excluded(synthetic_plots):
    synthetic_plots["small"] = 0
    assert prepare(synthetic_plots).empty


def test_estimate_all_lists_every_crop(synthetic_plots):
    assert len(estimate_all(synthetic_plots)) == 10
