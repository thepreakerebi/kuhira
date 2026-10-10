"""One palette for every chart, matching the web app."""

import matplotlib.pyplot as plt

PRIMARY = "#C3D898"  # sage lime
FOREST = "#2C4A2E"  # ink green: text and strong marks
WATER = "#2F6E8F"  # irrigation blue
CLAY = "#B5543A"  # losses and negatives
SAND = "#F6F4EC"  # page ground
MUTED = "#6B7565"


def use() -> None:
    plt.rcParams.update(
        {
            "figure.facecolor": "white",
            "axes.facecolor": "white",
            "axes.edgecolor": MUTED,
            "axes.labelcolor": FOREST,
            "xtick.color": FOREST,
            "ytick.color": FOREST,
            "text.color": FOREST,
            "axes.spines.top": False,
            "axes.spines.right": False,
            "axes.grid": True,
            "grid.color": "#E6E8E1",
            "font.size": 10,
            "figure.dpi": 110,
            "axes.prop_cycle": plt.cycler(color=[WATER, PRIMARY, CLAY, FOREST]),
        }
    )
