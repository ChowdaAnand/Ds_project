"""
Database management module for DATA SCIENCE DIGITAL LIBRARY PORTAL.
Supports both SQLite local database and provides schema for Supabase integration.
Initializes student profile:
  Name: CHOWDA ANAND
  College: MOHAN BABU UNIVERSITY
  Branch: CSE - Data Science
  Academic Year: 3rd Year
  Project Title: DATA SCIENCE DIGITAL LIBRARY PORTAL

10 Initial Data Science Experiments:
  DS01: Python Basics and Data Types
  DS02: NumPy Array Operations
  DS03: Pandas DataFrame Operations
  DS04: Data Cleaning and Missing Values
  DS05: Exploratory Data Analysis
  DS06: Data Visualization with Matplotlib
  DS07: Statistical Analysis
  DS08: Correlation Analysis
  DS09: Linear Regression
  DS10: Classification Model Evaluation
"""
import sqlite3
import os
import json
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "student.db")

DEFAULT_PROFILE = {
    "id": 1,
    "full_name": "CHOWDA ANAND",
    "college": "MOHAN BABU UNIVERSITY",
    "branch": "CSE - Data Science",
    "academic_year": "3rd Year",
    "project_title": "DATA SCIENCE DIGITAL LIBRARY PORTAL",
    "roll_number": "",
    "email": "",
    "section": "",
    "skills": "Python, NumPy, Pandas, Matplotlib, Seaborn, Scikit-learn, SQL, Data Analysis",
    "github_url": "",
    "linkedin_url": "",
    "avatar_path": "assets/profile.jpg",
    "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
}

MODULES_DATA = [
    {
        "id": "module_01",
        "number": "01",
        "kicker": "FOUNDATIONS",
        "title": "Introduction to Data Science & Python",
        "subtitle": "Data science lifecycle, Python syntax, scientific computing stack, and data structures.",
        "topics": [
            "What is Data Science? The full lifecycle: Collection -> Cleaning -> EDA -> Modeling -> Deployment",
            "Python scientific ecosystem: CPython, Pyodide, IPython, and standard libraries",
            "Core data structures: lists, tuples, dictionaries, sets, and comprehension constructs",
            "Vectorized computing paradigm and memory hierarchy in numerical programming"
        ],
        "reading_notes": """# Module 01: Foundations of Data Science & Python Programming

## 1. The Data Science Lifecycle
Data Science is an interdisciplinary field combining domain expertise, programming skills, and mathematics/statistics to extract actionable insights from structured and unstructured data.

The standard lifecycle consists of:
1. **Business/Scientific Understanding**: Defining problem statements, target KPIs, and success criteria.
2. **Data Acquisition & Ingestion**: Querying SQL databases, calling REST APIs, web scraping, and loading flat files (CSV, JSON, Parquet).
3. **Data Cleaning & Wrangling**: Treating missing values, identifying outliers, deduplication, and normalizing schemas.
4. **Exploratory Data Analysis (EDA)**: Computing summary statistics, uncovering hidden distributions, and plotting bivariate relationships.
5. **Feature Engineering & Modeling**: Selecting relevant predictors, scaling features, training estimators, and tuning hyperparameters.
6. **Evaluation & Verification**: Assessing model performance using metrics (R², MSE, Accuracy, Precision, Recall, F1-Score).
7. **Deployment & MLOps**: Packaging models into RESTful APIs, continuous monitoring, and drift detection.

## 2. Python Architecture for Scientific Computing
Python's elegance combined with powerful compiled C/Fortran backends (NumPy, SciPy) makes it the premier language for Data Science.
- **Dynamic Typing**: High developer velocity, rapid prototyping.
- **List Comprehensions**: Elegant one-line vector transformations: `[x**2 for x in data if x > 0]`
- **First-Class Functions**: Lambdas, `map()`, and `filter()` enable functional data processing pipelines.
""",
        "slides_file": "Module_01_Foundations.pdf"
    },
    {
        "id": "module_02",
        "number": "02",
        "kicker": "DATA PREPARATION",
        "title": "Data Collection, Ingestion & Preprocessing",
        "subtitle": "Sources, missing value treatment, imputation pipelines, deduplication, and feature scaling.",
        "topics": [
            "Data ingestion from CSV, JSON, Relational Databases (SQL), and REST APIs",
            "Missing Data Mechanisms: Missing Completely at Random (MCAR), MAR, and MNAR",
            "Imputation techniques: Mean, Median, Mode, Forward-fill, and KNN Imputation",
            "Feature scaling: Min-Max Normalization [0, 1] vs. Z-Score Standardization (μ=0, σ=1)"
        ],
        "reading_notes": """# Module 02: Data Collection, Ingestion & Preprocessing

## 1. The Realities of Dirty Data
In practical data science, raw datasets are rarely clean. Common defects include:
- Missing entries represented as NaN, Null, None, or sentinel values (-999, "?").
- Duplicate records caused by network retries or batch ETL bugs.
- Structural errors (misspelled categorical labels, mixed date formats).
- Measurement anomalies and statistical outliers.

## 2. Missing Value Imputation
- **Mean Imputation**: Replaces missing values with feature mean. Best for normally distributed continuous data without heavy outliers.
- **Median Imputation**: Replaces missing values with the 50th percentile. Robust against extreme skewness and outliers.
- **Mode Imputation**: Best for categorical features (imputing the most frequent category).

## 3. Feature Scaling Principles
Algorithms sensitive to feature magnitudes (KNN, SVM, Gradient Descent, K-Means) require feature scaling:
- **MinMaxScaler**: `x_norm = (x - x_min) / (x_max - x_min)` (Bounds data strictly between 0 and 1).
- **StandardScaler**: `z = (x - mu) / sigma` (Transforms feature to have mean = 0 and standard deviation = 1).
""",
        "slides_file": "Module_02_Preprocessing.pdf"
    },
    {
        "id": "module_03",
        "number": "03",
        "kicker": "EXPLORATION",
        "title": "Exploratory Data Analysis (EDA) & Visualization",
        "subtitle": "Univariate profiling, five-number summary, bivariate correlation, and visualization principles.",
        "topics": [
            "Univariate analysis: Histograms, KDE density curves, Box plots, and skewness",
            "Tukey's IQR outlier detection rule: [Q1 - 1.5*IQR, Q3 + 1.5*IQR]",
            "Bivariate & multivariate relationships: Scatter plots, pair plots, and heatmaps",
            "Grammar of Graphics and choosing the right chart for analytical storytelling"
        ],
        "reading_notes": """# Module 03: Exploratory Data Analysis & Scientific Visualization

## 1. What is EDA?
Pioneered by John Tukey, Exploratory Data Analysis is an approach to analyzing datasets to summarize their main characteristics, often with visual methods, without assuming a predefined statistical model.

## 2. The Five-Number Summary
A descriptive statistical summary consisting of:
1. **Minimum**: Lowest value in the dataset (excluding outliers).
2. **First Quartile (Q1 / 25th percentile)**: Splits lowest 25% of data.
3. **Median (Q2 / 50th percentile)**: Middle value of the sorted distribution.
4. **Third Quartile (Q3 / 75th percentile)**: Splits lowest 75% of data.
5. **Maximum**: Highest value in the dataset (excluding outliers).
- **Interquartile Range (IQR)**: `IQR = Q3 - Q1`.
- **Outlier Thresholds**: Points `< Q1 - 1.5 * IQR` or `> Q3 + 1.5 * IQR`.

## 3. Visualization Best Practices
- **Distribution**: Histograms, KDE density plots, Violin plots.
- **Comparison across Categories**: Bar charts, Box plots.
- **Correlation / Relationship**: Scatter plots with regression lines, Heatmaps.
- **Trends over Time**: Line charts with confidence intervals.
""",
        "slides_file": "Module_03_EDA_Visualization.pdf"
    },
    {
        "id": "module_04",
        "number": "04",
        "kicker": "MODELING",
        "title": "Statistics & Machine Learning",
        "subtitle": "Probability distributions, hypothesis testing, linear regression, and classification metrics.",
        "topics": [
            "Probability distributions: Normal, Binomial, Uniform, and Central Limit Theorem",
            "Ordinary Least Squares (OLS) Linear Regression: Assumptions, loss functions, and R²",
            "Supervised classification: Logistic regression, decision boundaries, and confusion matrices",
            "Performance diagnostics: Accuracy, Precision, Recall, F1-Score, and ROC-AUC curve"
        ],
        "reading_notes": """# Module 04: Statistics & Machine Learning Foundations

## 1. Inferential Statistics & Central Limit Theorem
The Central Limit Theorem (CLT) states that the sampling distribution of the sample mean approximates a normal distribution as the sample size becomes large (typically n >= 30), regardless of the population distribution shape. This enables confidence interval estimation and hypothesis testing.

## 2. Ordinary Least Squares (OLS) Linear Regression
Models the linear relationship between independent variable X and dependent variable Y:
`y_hat = w1 * X + w0`
- **Slope (w1)**: `Cov(X, Y) / Var(X)`
- **Intercept (w0)**: `mean(Y) - w1 * mean(X)`
- **R-squared (R²)**: `1 - (SS_res / SS_tot)` (Proportion of variance explained by model).

## 3. Classification Evaluation Matrix
When evaluating binary predictions against ground truth:
- **Precision**: `TP / (TP + FP)` (When model predicts Positive, how often is it right?)
- **Recall / Sensitivity**: `TP / (TP + FN)` (Out of all actual Positives, how many were caught?)
- **F1-Score**: `2 * (Precision * Recall) / (Precision + Recall)` (Harmonic mean, vital for imbalanced datasets).
""",
        "slides_file": "Module_04_Statistics_ML.pdf"
    },
    {
        "id": "module_05",
        "number": "05",
        "kicker": "APPLICATIONS",
        "title": "Advanced Data Science, MLOps & Real-World Applications",
        "subtitle": "Unsupervised clustering (K-Means), time series forecasting, MLOps lifecycle, and ethical AI.",
        "topics": [
            "Unsupervised learning: K-Means clustering algorithm and the Elbow Method for optimal K",
            "Time series components: Trend, Seasonality, Cyclicality, and Residual Noise",
            "Model deployment & MLOps: Serving models via REST APIs, containerization, and logging",
            "Ethical considerations: Algorithmic bias, data privacy (GDPR), and model interpretability"
        ],
        "reading_notes": """# Module 05: Advanced Data Science, MLOps & Applications

## 1. Unsupervised Learning: K-Means Clustering
Partitions n observations into K clusters where each observation belongs to the cluster with the nearest mean (centroid).
- **Objective**: Minimize Within-Cluster Sum of Squares (Inertia / SSE).
- **Elbow Method**: Plotting inertia vs. number of clusters K to identify the sharpest bend point where adding more clusters yields diminishing returns.

## 2. The MLOps Pipeline
Building a machine learning model is only 20% of practical production work. MLOps ensures:
- **Reproducibility**: Version controlling data (DVC), code (Git), and hyperparameters (MLflow).
- **Continuous Integration/Continuous Deployment (CI/CD)**: Automated test suites for model drift.
- **Monitoring**: Alerting on schema drift, latency bottlenecks, and prediction degradation.
""",
        "slides_file": "Module_05_Advanced_Applications.pdf"
    }
]

RESOURCES_DATA = [
    {
        "id": "res_01",
        "title": "Python for Data Analysis (3rd Edition)",
        "category": "Reference Book",
        "icon": "📖",
        "author": "Wes McKinney (Creator of Pandas)",
        "description": "The definitive guide to manipulating, processing, cleaning, and crunching datasets in Python.",
        "link": "https://wesmckinney.com/book/"
    },
    {
        "id": "res_02",
        "title": "NumPy Official Cheatsheet",
        "category": "Cheatsheet",
        "icon": "⚡",
        "author": "NumPy Core Team",
        "description": "Essential quick-reference guide covering array creation, indexing, slicing, math ufuncs, and linear algebra.",
        "link": "https://numpy.org/doc/stable/user/quickstart.html"
    },
    {
        "id": "res_03",
        "title": "Pandas Data Wrangling Cheatsheet",
        "category": "Cheatsheet",
        "icon": "🐼",
        "author": "Pandas Development Team",
        "description": "Comprehensive reference for reshaping, filtering, grouping, merging, and time-series indexing in DataFrames.",
        "link": "https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf"
    },
    {
        "id": "res_04",
        "title": "Matplotlib Visualization Architecture Guide",
        "category": "Visual Guide",
        "icon": "📊",
        "author": "Matplotlib Developers",
        "description": "Anatomy of a figure, subplots, color maps, markers, line styles, and publication-ready formatting.",
        "link": "https://matplotlib.org/cheatsheets/"
    },
    {
        "id": "res_05",
        "title": "Scikit-Learn Machine Learning Map",
        "category": "Algorithm Guide",
        "icon": "🤖",
        "author": "Scikit-Learn Community",
        "description": "Interactive flow chart helping data scientists navigate algorithm choices: regression, classification, and clustering.",
        "link": "https://scikit-learn.org/stable/tutorial/machine_learning_map/index.html"
    },
    {
        "id": "res_06",
        "title": "Kaggle Open Data Science Datasets",
        "category": "Dataset Repository",
        "icon": "🌐",
        "author": "Kaggle Community",
        "description": "Hundreds of thousands of public machine learning and exploratory datasets across healthcare, finance, and science.",
        "link": "https://www.kaggle.com/datasets"
    }
]

SAMPLE_DATASETS = {
    "student_performance.csv": """StudentID,Name,Gender,Department,StudyHours,Attendance,MidtermScore,FinalScore,Passed
101,Aarav,Male,CSE-DS,6.5,92.0,85.0,88.5,1
102,Bhavna,Female,CSE-DS,7.8,96.5,92.0,95.0,1
103,Chirag,Male,CSE-AI,4.2,84.0,68.0,72.5,1
104,Divya,Female,CSE-DS,5.5,89.5,78.5,82.0,1
105,Eshwar,Male,ECE,3.1,76.0,55.0,58.0,0
106,Farhan,Male,CSE-DS,8.0,94.0,90.5,94.0,1
107,Geeta,Female,CSE-DS,6.0,91.0,82.0,85.5,1
108,Harish,Male,ECE,3.8,79.5,60.0,64.0,1
109,Ishita,Female,CSE-AI,7.2,95.0,88.0,91.5,1
110,Jayant,Male,CSE-DS,2.5,70.0,48.0,50.0,0
111,Kavya,Female,CSE-DS,6.8,93.5,86.0,89.0,1
112,Lokesh,Male,CSE-AI,5.0,85.0,74.0,76.5,1""",

    "iris_sample.csv": """SepalLength,SepalWidth,PetalLength,PetalWidth,Species
5.1,3.5,1.4,0.2,setosa
4.9,3.0,1.4,0.2,setosa
4.7,3.2,1.3,0.2,setosa
4.6,3.1,1.5,0.2,setosa
5.0,3.6,1.4,0.2,setosa
7.0,3.2,4.7,1.4,versicolor
6.4,3.2,4.5,1.5,versicolor
6.9,3.1,4.9,1.5,versicolor
5.5,2.3,4.0,1.3,versicolor
6.5,2.8,4.6,1.5,versicolor
6.3,3.3,6.0,2.5,virginica
5.8,2.7,5.1,1.9,virginica
7.1,3.0,5.9,2.1,virginica
6.3,2.9,5.6,1.8,virginica
6.5,3.0,5.8,2.2,virginica"""
}

DEFAULT_EXPERIMENTS = [
    {
        "id": 1,
        "code": "DS01",
        "title": "Python Basics and Data Types",
        "objective": "Understand fundamental Python syntax, primitive and collection data types, type conversions, and control flow in a scientific computing context.",
        "description": "Introduction to Python programming constructs including integers, floats, strings, booleans, lists, tuples, dictionaries, and sets. Demonstrates dynamic typing, memory references, list comprehensions, and functional methods (map, filter).",
        "required_libraries": "Python Standard Library",
        "starter_code": '''# DS01: Python Basics and Data Types
# Objective: Explore core Python types, structures, and operations

print("=" * 50)
print("DS01: Python Basics & Scientific Data Structures")
print("=" * 50)

# 1. Fundamental Numeric & String Types
val_int = 42
val_float = 3.14159
val_str = "Data Science Laboratory"
val_bool = True

print(f"Integer: {val_int} (Type: {type(val_int).__name__})")
print(f"Float:   {val_float:.4f} (Type: {type(val_float).__name__})")
print(f"String:  '{val_str}' (Length: {len(val_str)})")
print(f"Boolean: {val_bool} (Type: {type(val_bool).__name__})")

# 2. Composite Data Structures
data_list = [12, 45, 78, 23, 56, 89, 90]
data_tuple = ("CSE-DS", "3rd Year", "MBU")
data_dict = {
    "course": "Data Science",
    "code": "DS01",
    "credits": 4,
    "status": "Active"
}
data_set = {10, 20, 30, 20, 10} # Deduplication

print("\\n--- Collections ---")
print(f"List:       {data_list} (Sum: {sum(data_list)}, Max: {max(data_list)})")
print(f"Tuple:      {data_tuple} (Immutable record)")
print(f"Dictionary: {data_dict}")
print(f"Set:        {data_set} (Unique items)")

# 3. List Comprehensions & Transformation
squared_evens = [x**2 for x in data_list if x % 2 == 0]
print(f"\\nSquared Even Numbers: {squared_evens}")

# 4. Summary Output
print("\\n[SUCCESS] DS01 Python Basics executed cleanly with 0 errors.")
''',
        "instructions": "1. Run the starter code to observe basic data type behavior and list comprehension.\\n2. Modify the `data_list` with new values and re-run.\\n3. Add a custom dictionary key-value pair and print the updated keys.",
        "output_expectations": "Console output showing type names, string length, collection values, and transformed numbers.",
        "status": "Not Started"
    },
    {
        "id": 2,
        "code": "DS02",
        "title": "NumPy Array Operations",
        "objective": "Master high-performance n-dimensional array creation, indexing, slicing, broadcasting, and matrix operations using NumPy.",
        "description": "Explores NumPy's vectorized computation capabilities. Covers 1D and 2D ndarray initialization, shape manipulation, element-wise arithmetic, universal functions (ufuncs), matrix dot products, and statistical aggregations.",
        "required_libraries": "NumPy",
        "starter_code": '''# DS02: NumPy Array Operations
# Objective: Vectorized operations, broadcasting, and matrix math

import numpy as np

print("=" * 50)
print(f"DS02: NumPy Array Computing (NumPy v{np.__version__})")
print("=" * 50)

# 1. Array Creation & Properties
arr_1d = np.array([10, 20, 30, 40, 50, 60], dtype=np.float64)
arr_2d = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

print(f"1D Array: {arr_1d}")
print(f"1D Shape: {arr_1d.shape}, Dtype: {arr_1d.dtype}, Size: {arr_1d.size}")
print(f"\\n2D Matrix (3x3):\\n{arr_2d}")

# 2. Vectorized Math & Broadcasting
scaled_arr = arr_1d * 1.5 + 5.0
print(f"\\nVectorized (x * 1.5 + 5):\\n{scaled_arr}")

# 3. Aggregations across axes
print("\\n--- Matrix Aggregations ---")
print(f"Sum (all):        {np.sum(arr_2d)}")
print(f"Row-wise Means:   {np.mean(arr_2d, axis=1)}")
print(f"Col-wise Max:     {np.max(arr_2d, axis=0)}")
print(f"Standard Dev:     {np.std(arr_2d):.4f}")

# 4. Matrix Multiplication
identity = np.eye(3)
matrix_product = np.dot(arr_2d, identity)
print(f"\\nMatrix Dot Product (A @ I):\\n{matrix_product}")

print("\\n[SUCCESS] DS02 NumPy Array Operations executed successfully.")
''',
        "instructions": "1. Run the script to see 1D and 2D array shapes and operations.\\n2. Create a 4x4 random array with `np.random.rand(4, 4)`.\\n3. Calculate the determinant using `np.linalg.det()`.",
        "output_expectations": "Array representations, vectorized arithmetic results, axis aggregations, and matrix multiplication verification.",
        "status": "Not Started"
    },
    {
        "id": 3,
        "code": "DS03",
        "title": "Pandas DataFrame Operations",
        "objective": "Build, manipulate, filter, and inspect structured tabular datasets using Pandas Series and DataFrames.",
        "description": "Covers DataFrame creation from dictionaries, reading CSV data, indexing with loc/iloc, conditional filtering, adding/dropping columns, sorting, descriptive summaries (.info, .describe), and grouping basics.",
        "required_libraries": "Pandas, NumPy",
        "starter_code": '''# DS03: Pandas DataFrame Operations
# Objective: Tabular data analysis, boolean indexing, and aggregations

import pandas as pd
import numpy as np

print("=" * 50)
print(f"DS03: Pandas DataFrame Analysis (Pandas v{pd.__version__})")
print("=" * 50)

# 1. Create a structured DataFrame
dataset = {
    "StudentID": [101, 102, 103, 104, 105, 106],
    "Name": ["Aarav", "Bhavna", "Chirag", "Divya", "Eshwar", "Farhan"],
    "Branch": ["CSE-DS", "CSE-DS", "CSE-AI", "CSE-DS", "ECE", "CSE-DS"],
    "CGPA": [8.92, 9.45, 7.80, 8.65, 7.10, 9.15],
    "Attendance": [92.0, 96.5, 84.0, 89.5, 76.0, 94.0],
    "ProjectsCompleted": [4, 5, 2, 3, 2, 5]
}

df = pd.DataFrame(dataset)
print("Initial Student Dataset:")
print(df.to_string(index=False))

# 2. Dataset Information & Summary Stats
print("\\n--- Descriptive Statistics ---")
print(df[["CGPA", "Attendance", "ProjectsCompleted"]].describe().round(2))

# 3. Conditional Boolean Indexing
high_achievers = df[(df["CGPA"] >= 8.5) & (df["Attendance"] >= 90.0)]
print("\\n--- High Achievers (CGPA >= 8.5 & Attendance >= 90%) ---")
print(high_achievers[["StudentID", "Name", "Branch", "CGPA", "Attendance"]].to_string(index=False))

# 4. Feature Engineering: Performance Score
df["PerfScore"] = (df["CGPA"] * 10 + df["Attendance"] * 0.2 + df["ProjectsCompleted"] * 2).round(2)
print("\\nDataset with Computed Performance Score:")
print(df[["Name", "Branch", "CGPA", "PerfScore"]].to_string(index=False))

print("\\n[SUCCESS] DS03 Pandas operations executed cleanly.")
''',
        "instructions": "1. Run the starter code to inspect tabular summaries and filtered rows.\\n2. Filter students by Branch == 'CSE-DS'.\\n3. Calculate the median CGPA across the cohort.",
        "output_expectations": "Tabular printouts of student records, statistical summaries, boolean filter results, and engineered column scores.",
        "status": "Not Started"
    },
    {
        "id": 4,
        "code": "DS04",
        "title": "Data Cleaning and Missing Values",
        "objective": "Identify, analyze, and treat missing values (NaN/Null), duplicate entries, and corrupted types in raw datasets.",
        "description": "Techniques for data cleansing: isnull/isna detection, heatmap/count analysis, dropping records vs imputation strategies (mean, median, mode, forward-fill), outlier detection via IQR, and data type casting.",
        "required_libraries": "Pandas, NumPy",
        "starter_code": '''# DS04: Data Cleaning and Missing Values
# Objective: Null detection, imputation strategies, and deduplication

import pandas as pd
import numpy as np

print("=" * 50)
print("DS04: Data Cleaning & Preprocessing Pipeline")
print("=" * 50)

# 1. Create Raw Dirty Dataset with NaNs and Duplicates
raw_data = {
    "ID": [1, 2, 3, 4, 5, 6, 7, 7],
    "Name": ["Aarav", "Bhavna", "Chirag", "Divya", "Eshwar", "Farhan", "Geeta", "Geeta"],
    "Age": [20, np.nan, 21, 22, np.nan, 20, 23, 23],
    "TestScore": [88.0, 92.5, np.nan, 76.0, 64.0, np.nan, 95.0, 95.0],
    "Department": ["DS", "DS", "AI", np.nan, "ECE", "DS", "DS", "DS"]
}

df = pd.DataFrame(raw_data)
print("Raw Dataset (with NaNs and duplicate row 7):")
print(df)

# 2. Detect Missing Values
print("\\n--- Missing Value Audit ---")
missing_counts = df.isnull().sum()
print(missing_counts[missing_counts > 0])

# 3. Deduplication
initial_len = len(df)
df = df.drop_duplicates()
print(f"\\nRemoved {initial_len - len(df)} duplicate row(s). New shape: {df.shape}")

# 4. Imputation Strategies
# Numeric: Impute Age with median, TestScore with mean
age_median = df["Age"].median()
score_mean = df["TestScore"].mean()
dept_mode = df["Department"].mode()[0]

df["Age"] = df["Age"].fillna(age_median)
df["TestScore"] = df["TestScore"].fillna(round(score_mean, 1))
df["Department"] = df["Department"].fillna(dept_mode)

print("\\nCleaned & Imputed Dataset:")
print(df.to_string(index=False))
print(f"\\nVerification - Total Remaining Nulls: {df.isnull().sum().sum()}")
print("[SUCCESS] DS04 Data Cleaning pipeline completed.")
''',
        "instructions": "1. Run the script to detect and clean missing values.\\n2. Compare mean imputation vs median imputation on skewed data.\\n3. Try forward-fill using `.ffill()`.",
        "output_expectations": "Null audits, deduplication reports, and fully cleaned output with 0 remaining nulls.",
        "status": "Not Started"
    },
    {
        "id": 5,
        "code": "DS05",
        "title": "Exploratory Data Analysis",
        "objective": "Conduct comprehensive exploratory data analysis (EDA) using summary metrics, skewness, kurtosis, and correlation profiling.",
        "description": "Systematic EDA on sample multidimensional datasets. Includes five-number summary (min, Q1, median, Q3, max), variance, standard deviation, interquartile range (IQR), skewness, and group-wise aggregate comparisons.",
        "required_libraries": "Pandas, NumPy",
        "starter_code": '''# DS05: Exploratory Data Analysis
# Objective: Univariate, bivariate, and statistical distribution profiling

import pandas as pd
import numpy as np

print("=" * 50)
print("DS05: Exploratory Data Analysis (EDA)")
print("=" * 50)

# 1. Synthesize Multidimensional Student Performance Dataset
np.random.seed(42)
n = 100
study_hours = np.random.normal(loc=5.5, scale=1.5, size=n).clip(1, 10)
attendance = np.random.normal(loc=82, scale=8, size=n).clip(50, 100)
exam_scores = (study_hours * 6.5 + attendance * 0.45 + np.random.normal(0, 4, n)).clip(0, 100)
categories = np.random.choice(["Tier-1", "Tier-2", "Tier-3"], size=n, p=[0.3, 0.5, 0.2])

df = pd.DataFrame({
    "StudyHours": np.round(study_hours, 1),
    "Attendance": np.round(attendance, 1),
    "ExamScore": np.round(exam_scores, 1),
    "Category": categories
})

# 2. Univariate Five-Number Summary
print("--- Five-Number Summaries ---")
for col in ["StudyHours", "Attendance", "ExamScore"]:
    q1 = df[col].quantile(0.25)
    median = df[col].median()
    q3 = df[col].quantile(0.75)
    iqr = q3 - q1
    print(f"{col:12s} | Min: {df[col].min():5.1f} | Q1: {q1:5.1f} | Med: {median:5.1f} | Q3: {q3:5.1f} | Max: {df[col].max():5.1f} | IQR: {iqr:4.1f}")

# 3. Distribution Moments
print("\\n--- Distribution Shape Metrics ---")
print(f"ExamScore Mean:     {df['ExamScore'].mean():.2f}")
print(f"ExamScore StdDev:   {df['ExamScore'].std():.2f}")
print(f"ExamScore Skewness: {df['ExamScore'].skew():.3f} (Slightly {'right' if df['ExamScore'].skew() > 0 else 'left'}-skewed)")

# 4. Group-wise Bivariate Analysis
print("\\n--- Performance Metrics by Category ---")
grouped = df.groupby("Category").agg(
    Count=("ExamScore", "count"),
    AvgHours=("StudyHours", "mean"),
    AvgAttendance=("Attendance", "mean"),
    AvgScore=("ExamScore", "mean")
).round(2)
print(grouped)

print("\\n[SUCCESS] DS05 Exploratory Data Analysis verified.")
''',
        "instructions": "1. Run the EDA script to observe distribution metrics and five-number summaries.\\n2. Add outlier detection using the IQR rule (values < Q1 - 1.5*IQR or > Q3 + 1.5*IQR).\\n3. Compute group metrics by different slices.",
        "output_expectations": "Five-number summary statistics, distribution shape metrics, and grouped aggregate tables.",
        "status": "Not Started"
    },
    {
        "id": 6,
        "code": "DS06",
        "title": "Data Visualization with Matplotlib",
        "objective": "Generate analytical scientific figures (line plots, bar charts, scatter plots, and histograms) using Matplotlib and render them in the workspace.",
        "description": "Demonstrates Matplotlib visualization APIs: figure/axes setup, styling, custom color palettes, grid lines, labels, legends, annotations, and exporting high-resolution charts as base64 images.",
        "required_libraries": "Matplotlib, NumPy",
        "starter_code": '''# DS06: Data Visualization with Matplotlib
# Objective: Generate scientific statistical figures with Matplotlib

import matplotlib.pyplot as plt
import numpy as np

print("=" * 50)
print(f"DS06: Matplotlib Visualization (Matplotlib v{plt.matplotlib.__version__})")
print("=" * 50)

# 1. Generate Synthetic Data
np.random.seed(101)
x = np.linspace(0, 10, 50)
y_trend = 2.5 * x + 5 + np.random.normal(0, 2, size=len(x))
y_poly = -0.5 * (x - 5)**2 + 30

# 2. Create Figure with Subplots
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.5), facecolor="#1B2440")

# Plot 1: Linear Trend & Scatter
ax1.set_facecolor("#12182B")
ax1.scatter(x, y_trend, color="#6366F1", alpha=0.8, edgecolors="#818CF8", label="Data Points", s=40)
m, b = np.polyfit(x, y_trend, 1)
ax1.plot(x, m*x + b, color="#A78BFA", linewidth=2.5, linestyle="--", label=f"Fit: y = {m:.2f}x + {b:.1f}")
ax1.set_title("Experimental Trend & Regression Fit", color="#F8FAFC", fontsize=11, fontweight="bold")
ax1.set_xlabel("Feature Variable (X)", color="#A8B3CC")
ax1.set_ylabel("Target Response (Y)", color="#A8B3CC")
ax1.tick_params(colors="#A8B3CC")
ax1.grid(True, linestyle=":", alpha=0.3, color="#A8B3CC")
ax1.legend(facecolor="#1B2440", edgecolor="#6366F1", labelcolor="#F8FAFC")

# Plot 2: Non-Linear Function
ax2.set_facecolor("#12182B")
ax2.plot(x, y_poly, color="#10B981", linewidth=2.5, label="Parabolic Response")
ax2.fill_between(x, y_poly, color="#10B981", alpha=0.15)
ax2.set_title("Non-linear Dynamics Curve", color="#F8FAFC", fontsize=11, fontweight="bold")
ax2.set_xlabel("Independent Parameter (t)", color="#A8B3CC")
ax2.set_ylabel("Amplitude f(t)", color="#A8B3CC")
ax2.tick_params(colors="#A8B3CC")
ax2.grid(True, linestyle=":", alpha=0.3, color="#A8B3CC")
ax2.legend(facecolor="#1B2440", edgecolor="#10B981", labelcolor="#F8FAFC")

plt.tight_layout()
plt.show()

print("[CHART] Figure rendered successfully onto canvas.")
print("[SUCCESS] DS06 Matplotlib plotting complete.")
''',
        "instructions": "1. Run the code to view the generated dual-subplot visualization.\\n2. Change the curve function to `np.sin(x) * 15 + 20`.\\n3. Customize the chart titles and axis labels.",
        "output_expectations": "Direct interactive rendered Matplotlib canvas containing two dark-themed styled subplots.",
        "status": "Not Started"
    },
    {
        "id": 7,
        "code": "DS07",
        "title": "Statistical Analysis",
        "objective": "Apply inferential and descriptive statistics: measures of central tendency, dispersion, probability distributions, and confidence intervals.",
        "description": "Calculates statistical parameters: mean, harmonic mean, geometric mean, variance, standard deviation, standard error of the mean (SEM), z-scores, and 95% confidence intervals on sample data.",
        "required_libraries": "SciPy / NumPy / Math / Statistics",
        "starter_code": '''# DS07: Statistical Analysis
# Objective: Parametric metrics, dispersion, and confidence intervals

import numpy as np
import statistics
import math

print("=" * 50)
print("DS07: Statistical Analysis & Inference")
print("=" * 50)

# Sample Dataset: Sensor Readings / Lab Measurements
data = np.array([45.2, 47.8, 51.0, 49.3, 52.4, 48.7, 50.1, 46.5, 53.8, 49.9, 
                 51.2, 48.0, 52.1, 49.5, 50.6, 47.1, 54.0, 48.9, 50.3, 51.7])

n = len(data)
print(f"Sample Size (n): {n} observations")

# 1. Measures of Central Tendency
mean_val = float(np.mean(data))
median_val = float(np.median(data))
geo_mean = statistics.geometric_mean(data)

print("\\n--- Central Tendency ---")
print(f"Arithmetic Mean:  {mean_val:.4f}")
print(f"Median:           {median_val:.4f}")
print(f"Geometric Mean:   {geo_mean:.4f}")

# 2. Measures of Dispersion
var_sample = float(np.var(data, ddof=1))
std_sample = float(np.std(data, ddof=1))
sem = std_sample / math.sqrt(n)

print("\\n--- Dispersion & Error ---")
print(f"Sample Variance (s²): {var_sample:.4f}")
print(f"Sample StdDev (s):    {std_sample:.4f}")
print(f"Standard Error (SEM): {sem:.4f}")

# 3. Standard Scores (Z-Scores)
z_scores = (data - mean_val) / std_sample
outliers = data[np.abs(z_scores) > 2.0]
print(f"Potential Outliers (|z| > 2.0): {outliers.tolist() if len(outliers) > 0 else 'None'}")

# 4. 95% Confidence Interval for the Population Mean (t ~ 2.093 for df=19)
t_crit = 2.093
ci_lower = mean_val - t_crit * sem
ci_upper = mean_val + t_crit * sem
print(f"\\n95% Confidence Interval for Mean: [{ci_lower:.3f}, {ci_upper:.3f}]")

print("\\n[SUCCESS] DS07 Statistical Analysis complete.")
''',
        "instructions": "1. Run the script to calculate sample statistics and confidence interval bounds.\\n2. Modify the dataset to simulate higher variance and re-evaluate the SEM.\\n3. Check how sample size affects confidence interval width.",
        "output_expectations": "Computed arithmetic and geometric means, sample variance, SEM, z-score analysis, and 95% confidence interval boundaries.",
        "status": "Not Started"
    },
    {
        "id": 8,
        "code": "DS08",
        "title": "Correlation Analysis",
        "objective": "Compute and interpret bivariate relationships using Pearson linear correlation and Spearman rank correlation matrices.",
        "description": "Examines covariance and correlation between continuous variables. Evaluates correlation coefficient strength, directional sign, p-value significance, and identifies multicollinearity among features.",
        "required_libraries": "Pandas, NumPy",
        "starter_code": '''# DS08: Correlation Analysis
# Objective: Pearson and Spearman correlation matrices and interpretation

import pandas as pd
import numpy as np

print("=" * 50)
print("DS08: Feature Correlation Analysis")
print("=" * 50)

# 1. Synthesize Multivariable Dataset
np.random.seed(42)
n = 60
hours_studied = np.random.uniform(2, 10, n)
lecture_attendance = hours_studied * 8.5 + np.random.normal(0, 10, n)
lecture_attendance = np.clip(lecture_attendance, 40, 100)
assignments_score = hours_studied * 7.0 + lecture_attendance * 0.2 + np.random.normal(0, 5, n)
screen_time_distraction = 12 - hours_studied * 0.8 + np.random.normal(0, 2, n)
exam_grade = hours_studied * 5.5 + assignments_score * 0.35 - screen_time_distraction * 1.2 + np.random.normal(0, 3, n)

df = pd.DataFrame({
    "HoursStudied": np.round(hours_studied, 1),
    "Attendance": np.round(lecture_attendance, 1),
    "Assignments": np.round(assignments_score, 1),
    "DistractionHours": np.round(screen_time_distraction, 1),
    "FinalGrade": np.round(exam_grade, 1)
})

# 2. Pearson Correlation Matrix (Linear Relationships)
pearson_corr = df.corr(method="pearson").round(3)
print("Pearson Correlation Matrix (r):")
print(pearson_corr)

# 3. Interpret Target Correlations with FinalGrade
print("\\n--- Correlation with Target (FinalGrade) ---")
target_corr = pearson_corr["FinalGrade"].drop("FinalGrade").sort_values(ascending=False)
for feat, r in target_corr.items():
    relationship = "Strong Positive" if r > 0.7 else "Moderate Positive" if r > 0.3 else "Strong Negative" if r < -0.7 else "Moderate Negative" if r < -0.3 else "Weak/Negligible"
    print(f"  {feat:18s}: r = {r:+0.3f} ({relationship})")

# 4. Multicollinearity Check
print("\\n--- High Collinearity Check (|r| > 0.8 between predictors) ---")
pairs = []
cols = df.columns.drop("FinalGrade")
for i in range(len(cols)):
    for j in range(i + 1, len(cols)):
        r = pearson_corr.loc[cols[i], cols[j]]
        if abs(r) >= 0.75:
            pairs.append((cols[i], cols[j], r))

if pairs:
    for c1, c2, r in pairs:
        print(f"  Collinear pair: {c1} <-> {c2} (r = {r:.3f})")
else:
    print("  No excessive collinearity detected.")

print("\\n[SUCCESS] DS08 Correlation Analysis completed.")
''',
        "instructions": "1. Run the script to calculate Pearson correlation coefficients.\\n2. Change the method to `spearman` to test monotonic non-linear rank correlation.\\n3. Identify which feature has the highest predictive power for FinalGrade.",
        "output_expectations": "Full NxN correlation matrix, target correlation breakdown, and multicollinearity diagnosis.",
        "status": "Not Started"
    },
    {
        "id": 9,
        "code": "DS09",
        "title": "Linear Regression",
        "objective": "Build, fit, and evaluate an Ordinary Least Squares (OLS) Linear Regression model to predict numerical outcomes and compute error metrics.",
        "description": "Implementation of simple and multiple linear regression. Calculates slope coefficients, intercept, predictions, residuals, Mean Absolute Error (MAE), Mean Squared Error (MSE), Root Mean Squared Error (RMSE), and R-squared (R²).",
        "required_libraries": "NumPy, Pandas",
        "starter_code": '''# DS09: Linear Regression
# Objective: Train OLS regression model and calculate MSE, RMSE, R²

import numpy as np
import pandas as pd

print("=" * 50)
print("DS09: Linear Regression Model & Evaluation")
print("=" * 50)

# 1. Dataset: Feature X (Experience in Years), Target Y (Salary in Thousands)
X = np.array([1.1, 1.3, 1.5, 2.0, 2.2, 2.9, 3.0, 3.2, 3.2, 3.7, 
              3.9, 4.0, 4.0, 4.1, 4.5, 4.9, 5.1, 5.3, 5.9, 6.0])
Y = np.array([39.3, 46.2, 37.7, 43.5, 39.8, 56.6, 60.1, 54.4, 64.4, 57.1, 
              63.2, 55.7, 56.9, 57.0, 61.1, 67.9, 66.0, 83.0, 81.3, 93.9])

n = len(X)
x_mean = np.mean(X)
y_mean = np.mean(Y)

# 2. Closed-form OLS Fit: slope (w1) and intercept (w0)
# w1 = sum((x - x_bar)(y - y_bar)) / sum((x - x_bar)^2)
numerator = np.sum((X - x_mean) * (Y - y_mean))
denominator = np.sum((X - x_mean)**2)
slope = numerator / denominator
intercept = y_mean - slope * x_mean

print(f"Regression Equation: Y = {slope:.3f} * X + {intercept:.3f}")
print(f"Interpretation: For each additional year of experience, salary increases by ~${slope*1000:.0f}")

# 3. Predictions and Residuals
y_pred = slope * X + intercept
residuals = Y - y_pred

# 4. Error Metrics
mae = np.mean(np.abs(residuals))
mse = np.mean(residuals**2)
rmse = np.sqrt(mse)
ss_tot = np.sum((Y - y_mean)**2)
ss_res = np.sum(residuals**2)
r2 = 1.0 - (ss_res / ss_tot)

print("\\n--- Performance Metrics ---")
print(f"Mean Absolute Error (MAE):     {mae:.3f}")
print(f"Mean Squared Error (MSE):      {mse:.3f}")
print(f"Root Mean Squared Error (RMSE): {rmse:.3f}")
print(f"Coefficient of Determination (R²): {r2:.4f} (Explains {r2*100:.1f}% of variance)")

# 5. Out-of-Sample Predictions
test_years = np.array([2.5, 5.0, 7.5, 10.0])
test_preds = slope * test_years + intercept
print("\\n--- Forecast Predictions ---")
for yr, pred in zip(test_years, test_preds):
    print(f"  Experience: {yr:4.1f} yrs -> Predicted Salary: ${pred:.2f}k")

print("\\n[SUCCESS] DS09 Linear Regression fitted and verified.")
''',
        "instructions": "1. Run the script to view the fitted slope, intercept, and error metrics.\\n2. Compare the manual OLS formulas with Scikit-learn's `LinearRegression` if available.\\n3. Test the model with custom test inputs.",
        "output_expectations": "Regression line coefficients, MAE, MSE, RMSE, R² score, and future salary projections.",
        "status": "Not Started"
    },
    {
        "id": 10,
        "code": "DS10",
        "title": "Classification Model Evaluation",
        "objective": "Construct, test, and evaluate a classification model using confusion matrices, precision, recall, F1-score, and accuracy.",
        "description": "Comprehensive classification diagnostic toolkit: confusion matrix calculation (TP, FP, TN, FN), sensitivity/recall, specificity, precision, F1-harmonic mean, balanced accuracy, and classification report outputs.",
        "required_libraries": "NumPy, Pandas",
        "starter_code": '''# DS10: Classification Model Evaluation
# Objective: Confusion matrix, Precision, Recall, Specificity, F1-Score

import numpy as np
import pandas as pd

print("=" * 50)
print("DS10: Classification Model Performance Metrics")
print("=" * 50)

# 1. Ground Truth and Classifier Predictions (Binary Classification)
# 1 = Positive (e.g. Risk Detected), 0 = Negative (Healthy)
y_true = np.array([1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0])
y_pred = np.array([1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0])

n = len(y_true)
print(f"Evaluation Sample Size: {n} predictions")

# 2. Confusion Matrix Calculation
tp = np.sum((y_true == 1) & (y_pred == 1))
tn = np.sum((y_true == 0) & (y_pred == 0))
fp = np.sum((y_true == 0) & (y_pred == 1))
fn = np.sum((y_true == 1) & (y_pred == 0))

print("\\n--- Confusion Matrix ---")
print(f"                Predicted Pos (1)   Predicted Neg (0)")
print(f"Actual Pos (1):    TP = {tp:2d}              FN = {fn:2d}")
print(f"Actual Neg (0):    FP = {fp:2d}              TN = {tn:2d}")

# 3. Classification Metrics
accuracy = (tp + tn) / n
precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0 # Sensitivity / TPR
specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0 # TNR
f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

print("\\n--- Evaluation Metrics ---")
print(f"Accuracy:         {accuracy:.4f} ({accuracy*100:.1f}%)")
print(f"Precision:        {precision:.4f} (TP / (TP + FP))")
print(f"Recall (Sens):    {recall:.4f} (TP / (TP + FN))")
print(f"Specificity:      {specificity:.4f} (TN / (TN + FP))")
print(f"F1-Score:         {f1_score:.4f} (Harmonic mean of Prec & Rec)")

# 4. Summary Verdict
print(f"\\nModel Diagnosis: High sensitivity ({recall*100:.1f}%), false alarm rate is {fp/(fp+tn)*100:.1f}%.")
print("[SUCCESS] DS10 Classification Model Evaluation complete.")
''',
        "instructions": "1. Run the script to observe confusion matrix calculations and F1-score.\\n2. Modify the predictions array to simulate a more conservative classifier.\\n3. Calculate balanced accuracy: (Sensitivity + Specificity) / 2.",
        "output_expectations": "Confusion matrix 2x2 grid, accuracy, precision, recall, specificity, and F1-score computations.",
        "status": "Not Started"
    }
]

TOOLS_DATA = [
    {
        "id": "python",
        "name": "Python",
        "category": "Core Language",
        "icon": "🐍",
        "version": "3.12+",
        "purpose": "General-purpose high-level programming language providing dynamic typing, comprehensive standard library, and scientific computation ecosystem.",
        "experiments": ["DS01", "DS02", "DS03", "DS04", "DS05", "DS06", "DS07", "DS08", "DS09", "DS10"],
        "doc_url": "https://www.python.org/doc/"
    },
    {
        "id": "numpy",
        "name": "NumPy",
        "category": "Numerical Computing",
        "icon": "🔢",
        "version": "1.26+",
        "purpose": "Fundamental library for array programming, vectorized linear algebra, Fourier transforms, random number generation, and high-performance matrix math.",
        "experiments": ["DS02", "DS03", "DS04", "DS05", "DS06", "DS07", "DS08", "DS09", "DS10"],
        "doc_url": "https://numpy.org/doc/stable/"
    },
    {
        "id": "pandas",
        "name": "Pandas",
        "category": "Data Wrangling",
        "icon": "🐼",
        "version": "2.2+",
        "purpose": "Fast, powerful tabular data analysis and manipulation toolkit providing Series, DataFrame structures, missing-data handling, and group-by pipelines.",
        "experiments": ["DS03", "DS04", "DS05", "DS08", "DS09", "DS10"],
        "doc_url": "https://pandas.pydata.org/docs/"
    },
    {
        "id": "matplotlib",
        "name": "Matplotlib",
        "category": "Data Visualization",
        "icon": "📊",
        "version": "3.8+",
        "purpose": "Comprehensive plotting library for creating static, animated, and interactive 2D statistical publications, charts, subplots, and figures.",
        "experiments": ["DS06", "DS09"],
        "doc_url": "https://matplotlib.org/stable/users/index.html"
    },
    {
        "id": "seaborn",
        "name": "Seaborn",
        "category": "Statistical Graphics",
        "icon": "🌊",
        "version": "0.13+",
        "purpose": "High-level statistical data visualization library built on top of Matplotlib, closely integrated with Pandas data structures.",
        "experiments": ["DS05", "DS06", "DS08"],
        "doc_url": "https://seaborn.pydata.org/"
    },
    {
        "id": "scikit-learn",
        "name": "Scikit-learn",
        "category": "Machine Learning",
        "icon": "🤖",
        "version": "1.4+",
        "purpose": "Robust open-source machine learning library featuring classification, regression, clustering, model selection, preprocessing, and performance metrics.",
        "experiments": ["DS09", "DS10"],
        "doc_url": "https://scikit-learn.org/stable/documentation.html"
    },
    {
        "id": "jupyter",
        "name": "Jupyter Notebook",
        "category": "Interactive Computing",
        "icon": "🪐",
        "version": "7.0+",
        "purpose": "Web-based interactive computing platform allowing execution of code blocks, inline visualization display, markdown equations, and reproducible workflows.",
        "experiments": ["DS01", "DS02", "DS03", "DS04", "DS05", "DS06", "DS07", "DS08", "DS09", "DS10"],
        "doc_url": "https://docs.jupyter.org/en/latest/"
    },
    {
        "id": "sql",
        "name": "SQL (Structured Query Language)",
        "category": "Database Engine",
        "icon": "🗄️",
        "version": "ANSI SQL / SQLite3",
        "purpose": "Domain-specific language used in programming and designed for managing relational database data via CRUD operations, joins, and aggregates.",
        "experiments": ["DS01", "DS03", "DS04"],
        "doc_url": "https://www.sqlite.org/docs.html"
    },
    {
        "id": "colab",
        "name": "Google Colab",
        "category": "Cloud Environment",
        "icon": "☁️",
        "version": "Cloud Hosted",
        "purpose": "Hosted Jupyter notebook service provided by Google offering zero-setup collaborative cloud computing, GPU acceleration, and drive integration.",
        "experiments": ["DS02", "DS06", "DS09", "DS10"],
        "doc_url": "https://colab.research.google.com/"
    },
    {
        "id": "github",
        "name": "GitHub",
        "category": "Version Control",
        "icon": "🐙",
        "version": "Git 2.40+",
        "purpose": "Cloud platform for version control and source code collaboration using Git, providing issue tracking, CI/CD pipelines, and project documentation hosting.",
        "experiments": ["DS01", "DS02", "DS03", "DS04", "DS05", "DS06", "DS07", "DS08", "DS09", "DS10"],
        "doc_url": "https://docs.github.com/en"
    }
]

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()

    # 1. Profiles Table
    c.execute("""
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY,
            full_name TEXT NOT NULL,
            college TEXT NOT NULL,
            branch TEXT NOT NULL,
            academic_year TEXT NOT NULL,
            project_title TEXT NOT NULL,
            roll_number TEXT,
            email TEXT,
            section TEXT,
            skills TEXT,
            github_url TEXT,
            linkedin_url TEXT,
            avatar_path TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    """)

    # 2. Experiments Table
    c.execute("""
        CREATE TABLE IF NOT EXISTS experiments (
            id INTEGER PRIMARY KEY,
            code TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            objective TEXT NOT NULL,
            description TEXT NOT NULL,
            required_libraries TEXT,
            starter_code TEXT,
            instructions TEXT,
            output_expectations TEXT,
            status TEXT DEFAULT 'Not Started',
            last_run_at TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    """)

    # 3. Experiment Runs (Execution History)
    c.execute("""
        CREATE TABLE IF NOT EXISTS experiment_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 1,
            experiment_id INTEGER,
            experiment_code TEXT,
            status TEXT NOT NULL,
            execution_duration_ms INTEGER,
            stdout TEXT,
            stderr TEXT,
            exit_code INTEGER,
            created_at TEXT,
            FOREIGN KEY (experiment_id) REFERENCES experiments(id)
        )
    """)

    # 4. Experiment Outputs (Uploaded Files & Visualizations)
    c.execute("""
        CREATE TABLE IF NOT EXISTS experiment_outputs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 1,
            experiment_id INTEGER,
            experiment_code TEXT,
            file_name TEXT NOT NULL,
            storage_path TEXT NOT NULL,
            content_type TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            created_at TEXT,
            FOREIGN KEY (experiment_id) REFERENCES experiments(id)
        )
    """)

    # Preserve old students table if present
    c.execute("CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY, name TEXT)")

    # Seed Default Profile if empty
    c.execute("SELECT COUNT(*) FROM profiles WHERE id = 1")
    if c.fetchone()[0] == 0:
        c.execute("""
            INSERT INTO profiles (
                id, full_name, college, branch, academic_year, project_title,
                roll_number, email, section, skills, github_url, linkedin_url,
                avatar_path, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            DEFAULT_PROFILE["id"],
            DEFAULT_PROFILE["full_name"],
            DEFAULT_PROFILE["college"],
            DEFAULT_PROFILE["branch"],
            DEFAULT_PROFILE["academic_year"],
            DEFAULT_PROFILE["project_title"],
            DEFAULT_PROFILE["roll_number"],
            DEFAULT_PROFILE["email"],
            DEFAULT_PROFILE["section"],
            DEFAULT_PROFILE["skills"],
            DEFAULT_PROFILE["github_url"],
            DEFAULT_PROFILE["linkedin_url"],
            DEFAULT_PROFILE["avatar_path"],
            DEFAULT_PROFILE["created_at"],
            DEFAULT_PROFILE["updated_at"]
        ))
    else:
        # Ensure name and college match the user's explicit profile specification
        c.execute("""
            UPDATE profiles SET
                full_name = 'CHOWDA ANAND',
                college = 'MOHAN BABU UNIVERSITY',
                branch = 'CSE - Data Science',
                academic_year = '3rd Year',
                project_title = 'DATA SCIENCE DIGITAL LIBRARY PORTAL'
            WHERE id = 1
        """)

    # Seed or Update 10 Experiments (DS01 to DS10)
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    for exp in DEFAULT_EXPERIMENTS:
        c.execute("SELECT id, status FROM experiments WHERE code = ?", (exp["code"],))
        existing = c.fetchone()
        if not existing:
            c.execute("""
                INSERT INTO experiments (
                    id, code, title, objective, description, required_libraries,
                    starter_code, instructions, output_expectations, status,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                exp["id"],
                exp["code"],
                exp["title"],
                exp["objective"],
                exp["description"],
                exp["required_libraries"],
                exp["starter_code"],
                exp["instructions"],
                exp["output_expectations"],
                exp["status"],
                now_str,
                now_str
            ))
        else:
            # Update metadata without overwriting student status if completed
            c.execute("""
                UPDATE experiments SET
                    title = ?,
                    objective = ?,
                    description = ?,
                    required_libraries = ?,
                    starter_code = ?,
                    instructions = ?,
                    output_expectations = ?,
                    updated_at = ?
                WHERE code = ?
            """, (
                exp["title"],
                exp["objective"],
                exp["description"],
                exp["required_libraries"],
                exp["starter_code"],
                exp["instructions"],
                exp["output_expectations"],
                now_str,
                exp["code"]
            ))

    conn.commit()
    conn.close()

def get_profile():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM profiles WHERE id = 1")
    row = c.fetchone()
    conn.close()
    if row:
        return dict(row)
    return DEFAULT_PROFILE

def update_profile(data):
    conn = get_connection()
    c = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Only update authorized fields
    fields = [
        "full_name", "college", "branch", "academic_year", "roll_number",
        "email", "section", "skills", "github_url", "linkedin_url", "avatar_path"
    ]
    updates = []
    values = []
    for f in fields:
        if f in data:
            updates.append(f"{f} = ?")
            values.append(data[f])

    if updates:
        values.append(now_str)
        query = f"UPDATE profiles SET {', '.join(updates)}, updated_at = ? WHERE id = 1"
        c.execute(query, tuple(values))
        conn.commit()

    c.execute("SELECT * FROM profiles WHERE id = 1")
    row = c.fetchone()
    conn.close()
    return dict(row) if row else DEFAULT_PROFILE

def get_experiments():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM experiments ORDER BY id ASC")
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_experiment(exp_identifier):
    conn = get_connection()
    c = conn.cursor()
    if isinstance(exp_identifier, int) or (isinstance(exp_identifier, str) and exp_identifier.isdigit()):
        c.execute("SELECT * FROM experiments WHERE id = ?", (int(exp_identifier),))
    else:
        c.execute("SELECT * FROM experiments WHERE UPPER(code) = UPPER(?)", (str(exp_identifier).strip(),))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None

def record_experiment_run(exp_id, status, duration_ms, stdout, stderr, exit_code=0):
    conn = get_connection()
    c = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Get exp code
    c.execute("SELECT code FROM experiments WHERE id = ?", (exp_id,))
    row = c.fetchone()
    code = row["code"] if row else f"DS{exp_id:02d}"

    c.execute("""
        INSERT INTO experiment_runs (
            user_id, experiment_id, experiment_code, status,
            execution_duration_ms, stdout, stderr, exit_code, created_at
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (exp_id, code, status, duration_ms, stdout, stderr, exit_code, now_str))

    # Update experiment status
    c.execute("""
        UPDATE experiments SET
            status = ?,
            last_run_at = ?,
            updated_at = ?
        WHERE id = ?
    """, (status, now_str, now_str, exp_id))

    conn.commit()
    conn.close()

def get_experiment_runs(exp_id=None, limit=20):
    conn = get_connection()
    c = conn.cursor()
    if exp_id:
        c.execute("""
            SELECT * FROM experiment_runs 
            WHERE experiment_id = ? 
            ORDER BY id DESC LIMIT ?
        """, (exp_id, limit))
    else:
        c.execute("""
            SELECT * FROM experiment_runs 
            ORDER BY id DESC LIMIT ?
        """, (limit,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def add_experiment_output(exp_id, file_name, storage_path, content_type, file_size):
    conn = get_connection()
    c = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    c.execute("SELECT code FROM experiments WHERE id = ?", (exp_id,))
    row = c.fetchone()
    code = row["code"] if row else f"DS{exp_id:02d}"

    c.execute("""
        INSERT INTO experiment_outputs (
            user_id, experiment_id, experiment_code, file_name,
            storage_path, content_type, file_size, created_at
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?)
    """, (exp_id, code, file_name, storage_path, content_type, file_size, now_str))

    output_id = c.lastrowid
    conn.commit()
    conn.close()
    return output_id

def get_experiment_outputs(exp_id=None):
    conn = get_connection()
    c = conn.cursor()
    if exp_id:
        c.execute("""
            SELECT * FROM experiment_outputs 
            WHERE experiment_id = ? 
            ORDER BY id DESC
        """, (exp_id,))
    else:
        c.execute("""
            SELECT * FROM experiment_outputs 
            ORDER BY id DESC
        """)
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_stats():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM experiments")
    total = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM experiments WHERE status = 'Completed'")
    completed = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM experiments WHERE status = 'Running'")
    running = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM experiments WHERE status = 'Failed'")
    failed = c.fetchone()[0]

    pending = total - completed - running - failed
    if pending < 0:
        pending = 0

    percentage = round((completed / total * 100), 1) if total > 0 else 0

    c.execute("""
        SELECT r.*, e.title as experiment_title 
        FROM experiment_runs r 
        LEFT JOIN experiments e ON r.experiment_id = e.id 
        ORDER BY r.id DESC LIMIT 5
    """)
    recent_runs = [dict(r) for r in c.fetchall()]

    conn.close()
    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "running": running,
        "failed": failed,
        "percentage": percentage,
        "recent_activity": recent_runs
    }

def get_tools():
    return TOOLS_DATA

def get_modules():
    return MODULES_DATA

def get_resources():
    return RESOURCES_DATA

def get_sample_dataset(name="student_performance.csv"):
    return SAMPLE_DATASETS.get(name, list(SAMPLE_DATASETS.values())[0])

if __name__ == "__main__":
    init_db()
    print("[INFO] Database successfully initialized with DS01-DS10 and student profile.")

