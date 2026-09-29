import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from backend.app.api.routes import multi_service

for st_name, pipe in multi_service.pipelines.items():
    pipe.ensure_loaded()
    print(f"=== {st_name} DISTRICTS ===", flush=True)
    if pipe.df is not None:
        for d_name, group in pipe.df.groupby("district_name"):
            loc_id = group.iloc[0]["location_id"]
            taluka = group.iloc[0]["taluka_name"]
            print(f"{d_name:25} -> {loc_id} ({taluka})", flush=True)
