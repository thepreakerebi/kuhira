import pytest
from fastapi.testclient import TestClient

from kuhira import plan
from kuhira.api import app

client = TestClient(app)


def test_health():
    assert client.get("/health").json() == {"ok": True}


def test_defaults_expose_the_psta5_gap():
    d = client.get("/defaults").json()
    assert d["remaining_ha"] == d["target_ha"] - d["actual_ha"] == 13_368
    assert d["subsidy_solar"] > d["subsidy_regular"]


def test_crops_include_the_bean_penalty():
    beans = next(c for c in client.get("/crops").json() if c["crop"] == "Beans")
    assert beans["bonus_pct"] < 0 and beans["p_value"] < plan.SIGNIFICANCE


def test_plan_with_defaults_allocates_the_remaining_target():
    body = client.post("/plan", json={}).json()
    assert len(body["ranking"]) == 30
    assert [r["rank"] for r in body["ranking"]] == list(range(1, 31))
    assert body["allocation"]["totals"]["hectares"] == pytest.approx(plan.REMAINING_HA, abs=30)


def test_plan_weights_change_the_ranking():
    dry = client.post("/plan", json={"weights": {"gain": 0, "gap": 0, "dryness": 1, "poverty": 0}}).json()
    poor = client.post("/plan", json={"weights": {"gain": 0, "gap": 0, "dryness": 0, "poverty": 1}}).json()
    assert dry["ranking"][0]["district"] != poor["ranking"][0]["district"]


@pytest.mark.parametrize("body", [{"hectares": -5}, {"subsidy_rate": 1.5}, {"weights": {"gain": 2}}])
def test_plan_rejects_out_of_range_input(body):
    assert client.post("/plan", json=body).status_code == 422


def test_farmer_estimate():
    r = client.post("/farmer", json={"district": "Kirehe", "crop": "Maize", "area_m2": 1000, "kit_cost_rwf": 90_000})
    body = r.json()
    assert r.status_code == 200
    assert body["extra_kg_per_season"] > 0 and body["farmer_pays_rwf"] == 45_000


def test_farmer_unknown_district_is_404():
    r = client.post("/farmer", json={"district": "Atlantis", "crop": "Maize", "area_m2": 1000, "kit_cost_rwf": 1})
    assert r.status_code == 404


def test_cors_allows_the_local_web_app():
    r = client.options("/plan", headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "POST"})
    assert r.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_boundaries_match_district_names():
    names = {f["properties"]["district"] for f in client.get("/boundaries").json()["features"]}
    assert names == set(plan.load_districts())


def test_farmer_vegetables_in_a_district_that_grows_few_still_gain():
    r = client.post(
        "/farmer", json={"district": "Kirehe", "crop": "Vegetables", "area_m2": 1000, "kit_cost_rwf": 90_000}
    )
    assert r.json()["extra_kg_per_season"] > 0
