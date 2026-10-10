import pandas as pd
import pytest

from kuhira import season_c as sc


def plots(rows):
    return pd.DataFrame(rows).assign(
        small=1, ncrop=1.0, w=10.0, season="C", province="East", price=0.0, iseed=0, fert_used=0
    )


def test_plot_value_sums_crops_on_the_plot_and_keeps_rows_missing_a_key():
    c = plots(
        [
            {
                "year": 2024,
                "seg": "1",
                "farmer": "1",
                "plot": None,
                "district": "A",
                "crop": "Vegetables",
                "ha": 0.1,
                "kg": 500,
                "irrigated": 1,
            },
            {
                "year": 2024,
                "seg": "1",
                "farmer": "1",
                "plot": None,
                "district": "A",
                "crop": "Bush bean",
                "ha": 0.1,
                "kg": 50,
                "irrigated": 1,
            },
            {
                "year": 2024,
                "seg": "2",
                "farmer": "2",
                "plot": "1",
                "district": "A",
                "crop": "Vegetables",
                "ha": 0.2,
                "kg": 400,
                "irrigated": 0,
            },
        ]
    )
    v = sc.plot_values(c, pd.Series({"Vegetables": 200.0, "Beans": 600.0}))
    assert len(v) == 2  # the plot with no plot number is not dropped
    irrigated = v[v.irrigated == 1].rwf_per_ha.iat[0]
    assert irrigated == pytest.approx((500 * 200 + 50 * 600) / 0.1)


def test_uptake_compares_watered_dry_season_land_with_the_main_seasons():
    ab = plots(
        [
            {
                "year": 2024,
                "season": "A",
                "seg": "1",
                "farmer": "1",
                "plot": "1",
                "district": "A",
                "crop": "Maize",
                "ha": 1.0,
                "kg": 1,
                "irrigated": 1,
            },
            {
                "year": 2024,
                "season": "B",
                "seg": "1",
                "farmer": "1",
                "plot": "1",
                "district": "A",
                "crop": "Maize",
                "ha": 3.0,
                "kg": 1,
                "irrigated": 1,
            },
        ]
    ).assign(season=["A", "B"])
    c = plots(
        [
            {
                "year": 2024,
                "seg": "9",
                "farmer": "9",
                "plot": "1",
                "district": "A",
                "crop": "Vegetables",
                "ha": 1.0,
                "kg": 1,
                "irrigated": 1,
            }
        ]
    )
    assert sc.uptake_by_year(ab, c)[2024] == pytest.approx(1.0 / 2.0)


def test_crop_mix_is_watered_dry_season_area_shares():
    c = plots(
        [
            {
                "year": 2024,
                "seg": "1",
                "farmer": "1",
                "plot": "1",
                "district": "A",
                "crop": "Vegetables",
                "ha": 0.3,
                "kg": 1,
                "irrigated": 1,
            },
            {
                "year": 2024,
                "seg": "1",
                "farmer": "2",
                "plot": "1",
                "district": "A",
                "crop": "Irish potato",
                "ha": 0.1,
                "kg": 1,
                "irrigated": 1,
            },
            {
                "year": 2024,
                "seg": "1",
                "farmer": "3",
                "plot": "1",
                "district": "A",
                "crop": "Beans",
                "ha": 5.0,
                "kg": 1,
                "irrigated": 0,
            },
        ]
    )
    mix = sc.irrigated_crop_mix(c)
    assert mix.to_dict() == pytest.approx({"Vegetables": 0.75, "Irish potato": 0.25})
