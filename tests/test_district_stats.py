import pandas as pd
import pytest

from kuhira import district_stats as ds


@pytest.fixture
def recent():
    rows = [  # one intercropped plot (maize + beans) and one sole maize plot in Huye; one rice plot in Kirehe
        {
            "seg": "1",
            "farmer": "1",
            "plot": "1",
            "district": "Huye",
            "crop": "Maize",
            "ha": 0.2,
            "ncrop": 2,
            "irrigated": 0,
            "kg": 100,
            "price": 300,
        },
        {
            "seg": "1",
            "farmer": "1",
            "plot": "1",
            "district": "Huye",
            "crop": "Bush bean",
            "ha": 0.2,
            "ncrop": 2,
            "irrigated": 0,
            "kg": 50,
            "price": 9999,
        },
        {
            "seg": "1",
            "farmer": "2",
            "plot": "1",
            "district": "Huye",
            "crop": "Maize",
            "ha": 0.4,
            "ncrop": 1,
            "irrigated": 1,
            "kg": 600,
            "price": 400,
        },
        {
            "seg": "2",
            "farmer": "3",
            "plot": "1",
            "district": "Kirehe",
            "crop": "Paddy rice",
            "ha": 1.0,
            "ncrop": 1,
            "irrigated": 1,
            "kg": 4000,
            "price": 0,
        },
    ]
    df = pd.DataFrame(rows).assign(year=2024, season="A", small=1, w=10.0, province="South")
    return ds.recent_small(df)


def test_intercropped_area_is_split_between_crops(recent):
    shares = ds.crop_shares(recent)
    assert shares.loc["Huye", "Maize"] == pytest.approx((0.1 + 0.4) / 0.6)
    assert shares.loc["Huye", "Beans"] == pytest.approx(0.1 / 0.6)
    assert shares.sum(axis=1).tolist() == pytest.approx([1, 1])


def test_cropland_counts_each_plot_once(recent):
    assert ds.cropland_ha(recent)["Huye"] == pytest.approx(10 * (0.2 + 0.4))


def test_irrigated_share_is_by_area(recent):
    assert ds.irrigated_share(recent)["Huye"] == pytest.approx(0.4 / 0.6)
    assert ds.irrigated_share(recent)["Kirehe"] == 1


def test_prices_drop_missing_codes_and_zeros(recent):
    prices = ds.crop_prices(recent)
    assert prices["Maize"] == 350
    assert "Beans" not in prices and "Paddy rice" not in prices


def test_yields_use_rainfed_sole_crops_with_national_fallback(recent):
    sole = pd.concat([recent.iloc[[2]].assign(irrigated=0, kg=600)] * 3, ignore_index=True)
    y = ds.rainfed_yields(sole)
    assert y.loc["Huye", "Maize"] == pytest.approx(1500)  # 600 kg / 0.4 ha, fewer than MIN_PLOTS so national
