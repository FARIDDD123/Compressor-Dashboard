import pandas as pd
import os

# Define the dataset directory
DATASET_DIR = "datasets"

# Define the input files for the final merge
base_file = "master_dataset_final.csv"
context_file = "extended_compressor_data_with_timestamp.csv"

try:
    # Load the datasets
    df_base = pd.read_csv(os.path.join(DATASET_DIR, base_file))
    df_context = pd.read_csv(os.path.join(DATASET_DIR, context_file))

    print("✅ Datasets loaded successfully.")

    # 1. Identify the unique columns to add
    base_columns = set(df_base.columns)
    context_columns = set(df_context.columns)
    unique_context_cols = list(context_columns - base_columns)

    print("\nUnique columns to add from 'extended_compressor_data...':")
    if unique_context_cols:
        for col in unique_context_cols:
            print(f"- {col}")
    else:
        print("No new unique columns found.")

    # 2. Select columns to merge (unique columns + merge key)
    merge_key = "Time"
    if unique_context_cols:
        columns_to_add = [merge_key] + unique_context_cols

        # 3. Perform the final merge
        df_master = pd.merge(
            df_base, df_context[columns_to_add], on=merge_key, how="left"
        )
    else:
        # If no new columns, the base is the final master
        df_master = df_base

    print("\n✅ Final merge successful.")
    print(f"Columns before final merge: {df_base.shape[1]}")
    print(f"Columns in MASTER DATASET: {df_master.shape[1]}")

    # 4. Save the ultimate master dataset
    output_filename = os.path.join(DATASET_DIR, "MASTER_DATASET.csv")
    df_master.to_csv(output_filename, index=False)

    print(f"\n✅ MASTER DATASET created and saved to:\n{output_filename}")

except Exception as e:
    print(f"❌ An error occurred: {e}")
