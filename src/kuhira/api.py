"""HTTP API for the Kuhira web app."""

import json
import os
from functools import cache

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from kuhira import plan
from kuhira.paths import EXTERNAL

app = FastAPI(title="Kuhira API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("KUHIRA_WEB_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class PlanRequest(BaseModel):
    weights: plan.Weights = plan.Weights()
    hectares: float = Field(plan.REMAINING_HA, gt=0, le=200_000)
    cost_per_ha_rwf: float = Field(plan.COST_PER_HA_RWF, gt=0, le=50_000_000)
    subsidy_rate: float = Field(plan.SUBSIDY_REGULAR, ge=0, le=1)


class FarmerRequest(BaseModel):
    district: str
    crop: str
    area_m2: float = Field(gt=0, le=100_000)
    kit_cost_rwf: float = Field(gt=0, le=50_000_000)
    subsidy_rate: float = Field(plan.SUBSIDY_REGULAR, ge=0, le=1)


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.get("/defaults")
def defaults() -> dict:
    return {
        "target_ha": plan.SSIT_TARGET_HA,
        "actual_ha": plan.SSIT_ACTUAL_HA,
        "remaining_ha": plan.REMAINING_HA,
        "cost_per_ha_rwf": plan.COST_PER_HA_RWF,
        "subsidy_regular": plan.SUBSIDY_REGULAR,
        "subsidy_solar": plan.SUBSIDY_SOLAR,
        "weights": plan.Weights().model_dump(),
        "kits": plan.KITS,
    }


@app.get("/crops")
def crops() -> list[plan.Crop]:
    return list(plan.load_crops().values())


@app.get("/districts")
def districts() -> list[plan.District]:
    return list(plan.load_districts().values())


@cache
def load_boundaries() -> dict:
    geo = json.loads((EXTERNAL / "boundaries" / "rwa_ADM2_simplified.geojson").read_text())
    for f in geo["features"]:
        f["properties"] = {"district": f["properties"]["shapeName"]}
    return geo


@app.get("/boundaries")
def boundaries() -> dict:
    """District outlines (geoBoundaries RWA ADM2, CC BY 4.0)."""
    return load_boundaries()


@app.post("/plan")
def make_plan(req: PlanRequest) -> dict:
    ranking = plan.score(plan.load_districts(), plan.load_crops(), req.weights)
    return {"ranking": ranking,
            "allocation": plan.allocate(ranking, req.hectares, req.cost_per_ha_rwf, req.subsidy_rate)}


@app.post("/farmer")
def farmer(req: FarmerRequest) -> dict:
    district = plan.load_districts().get(req.district)
    crop = plan.load_crops().get(req.crop)
    if district is None or crop is None:
        raise HTTPException(404, "Unknown district or crop")
    return plan.farmer_estimate(district, crop, req.area_m2, req.kit_cost_rwf, req.subsidy_rate)
