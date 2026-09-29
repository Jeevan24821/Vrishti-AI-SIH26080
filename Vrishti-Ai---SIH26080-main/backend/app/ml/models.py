try:
    from backend.app.ml.MODELSS import (
        BaselineNWPModel,
        LinearMOSModel,
        GlobalMLModel,
        HistGradientBoostingMLModel,
        XGBoost1000Model,
        RegimeClassifier,
        RegimeAwareMLModel,
        OracleRegimeMLModel,
        HeavyRainProbabilityModel
    )
except ModuleNotFoundError:
    from app.ml.MODELSS import (
        BaselineNWPModel,
        LinearMOSModel,
        GlobalMLModel,
        HistGradientBoostingMLModel,
        XGBoost1000Model,
        RegimeClassifier,
        RegimeAwareMLModel,
        OracleRegimeMLModel,
        HeavyRainProbabilityModel
    )
