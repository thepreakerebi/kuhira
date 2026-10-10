import numpy as np
import pandas as pd

from kuhira.sas import clean_district, find_var, irrigated_flag, normalize_key, yes


def test_find_var_matches_label_and_honours_exclude():
    names = ["s2q22", "s2q21"]
    labels = ["Total quantity of harvest for this crop (all plots)", "Total quantity of harvest (kg)"]
    assert find_var(names, labels, r"Total quantity of harvest", exclude=r"for this crop") == "s2q21"


def test_find_var_word_boundary_skips_large_farmer_segment_label():
    names = ["Segment_ID", "farmer_id"]
    labels = ["Segment/Large scale farmer Identification", "Farmer ID"]
    assert find_var(names, labels, r"Farmer ID\b") == "farmer_id"


def test_normalize_key_makes_float_and_string_ids_equal():
    assert normalize_key(pd.Series([12.0, "12", " 7 "])).tolist() == ["12", "12", "7"]


def test_clean_district_strips_codes_and_fixes_typo():
    assert clean_district(pd.Series(["11 Nyarugenege", "57-Kirehe", "huye"])).tolist() == [
        "Nyarugenge", "Kirehe", "Huye"]


def test_yes_reads_labels_and_codes():
    assert yes(pd.Series(["Yes", "1. Yes", "No", None, np.nan])).tolist() == [True, True, False, False, False]


def test_irrigated_flag_uses_farmer_answer_when_plot_answer_missing():
    irr = pd.Series(["Yes", "No", np.nan, np.nan])
    irr_any = pd.Series([np.nan, np.nan, "No", np.nan])
    out = irrigated_flag(irr, irr_any)
    assert out.iloc[:3].tolist() == [1, 0, 0]
    assert np.isnan(out.iloc[3])
