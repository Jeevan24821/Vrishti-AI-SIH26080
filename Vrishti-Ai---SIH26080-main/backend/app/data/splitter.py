import pandas as pd
try:
    from backend.app.core.config import TRAIN_YEARS, VAL_YEARS, TEST_YEARS, UNSEEN_YEARS
except ModuleNotFoundError:
    from app.core.config import TRAIN_YEARS, VAL_YEARS, TEST_YEARS, UNSEEN_YEARS

def create_chronological_splits(df: pd.DataFrame) -> dict:
    """
    Partitions the dataset chronologically without temporal leakage.
    Returns dictionary with dataframes and partition metadata.
    """
    df_copy = df.copy()
    df_copy['year'] = df_copy['datetime'].dt.year

    train_df = df_copy[df_copy['year'].isin(TRAIN_YEARS)].copy()
    val_df = df_copy[df_copy['year'].isin(VAL_YEARS)].copy()
    test_df = df_copy[df_copy['year'].isin(TEST_YEARS)].copy()
    unseen_df = df_copy[df_copy['year'].isin(UNSEEN_YEARS)].copy()

    split_metadata = {
        "train": {
            "years": TRAIN_YEARS,
            "rows": len(train_df),
            "start_date": str(train_df['date'].min()),
            "end_date": str(train_df['date'].max()),
        },
        "validation": {
            "years": VAL_YEARS,
            "rows": len(val_df),
            "start_date": str(val_df['date'].min()),
            "end_date": str(val_df['date'].max()),
        },
        "test": {
            "years": TEST_YEARS,
            "rows": len(test_df),
            "start_date": str(test_df['date'].min()),
            "end_date": str(test_df['date'].max()),
        },
        "unseen": {
            "years": UNSEEN_YEARS,
            "rows": len(unseen_df),
            "start_date": str(unseen_df['date'].min()),
            "end_date": str(unseen_df['date'].max()),
        }
    }

    # Verify zero temporal overlap
    assert set(train_df.index).isdisjoint(set(val_df.index))
    assert set(val_df.index).isdisjoint(set(test_df.index))
    assert set(test_df.index).isdisjoint(set(unseen_df.index))

    return {
        "train_df": train_df,
        "val_df": val_df,
        "test_df": test_df,
        "unseen_df": unseen_df,
        "metadata": split_metadata
    }
