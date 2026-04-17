"""
model_service.py
Trains an LSTM model (mirroring prorew4 notebook logic) and exposes predict_port().

If the CIC-IDS2018 CSV is placed at:
  /Users/saiprasanna/Downloads/Thursday-WorkingHours-Morning-WebAttacks.pcap_ISCX.csv
it will be used automatically; otherwise a synthetic dataset is generated.
"""

import os
import logging
from typing import Optional
import numpy as np
import pandas as pd

from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Paths ───────────────────────────────────────────────────────────────────
CSV_PATH = os.path.join(
    os.path.expanduser("~"),
    "Downloads",
    "Thursday-WorkingHours-Morning-WebAttacks.pcap_ISCX.csv",
)

# ── Game-theory constants ───────────────────────────────────────────────────
utility_matrix = np.array([
    [10, -5, -8],    # BENIGN
    [-10,  8,  6],   # Brute Force
    [-12,  9,  7],   # SQL Injection
    [-12,  9,  7],   # XSS
])

ACTIONS = {
    0: "Allow Connection",
    1: "Block Source IP",
    2: "Isolate Host",
}

CLASS_LABELS = ["BENIGN",
                "Web Attack - Brute Force",
                "Web Attack - SQL Injection",
                "Web Attack - XSS"]

# ── Globals set during init ─────────────────────────────────────────────────
model: Optional[Sequential] = None
scaler: Optional[StandardScaler] = None
le: Optional[LabelEncoder] = None
df_ports: Optional[pd.DataFrame] = None   # only set when real CSV is used
n_features: int = 0


# ── Synthetic dataset ───────────────────────────────────────────────────────
def _build_synthetic_dataset(n_samples_per_class: int = 3000):
    """
    Build a synthetic tabular dataset with 78 numeric features
    that mimics the CIC-IDS2018 structure.  Port-specific seeds
    ensure ports known from the dataset keep their expected labels.
    """
    rng = np.random.default_rng(42)
    n_features_local = 78

    # (port, label_index, mean_offset)
    KNOWN_PORTS = [
        (53,   0, 0.0),   # DNS  → BENIGN
        (389,  0, 0.1),   # LDAP → BENIGN
        (443,  0, 0.2),   # HTTPS → BENIGN
        (80,   1, 0.5),   # HTTP  → Brute Force
        (8080, 2, 0.8),   # Alt-HTTP → SQL Injection
        (3306, 2, 0.9),   # MySQL → SQL Injection
        (22,   1, 0.6),   # SSH   → Brute Force
        (21,   1, 0.7),   # FTP   → Brute Force
        (445,  3, 0.8),   # SMB   → XSS
        (8443, 3, 0.9),   # Alt-HTTPS → XSS
    ]

    X_list, y_list, port_list = [], [], []

    for label_idx in range(4):
        # generic samples for each class
        mean = label_idx * 2.0
        X_class = rng.normal(mean, 1.0, (n_samples_per_class, n_features_local))
        y_class = np.full(n_samples_per_class, label_idx)
        ports_class = np.zeros(n_samples_per_class, dtype=int)
        X_list.append(X_class)
        y_list.append(y_class)
        port_list.append(ports_class)

    # extra samples anchored to known ports
    for port, label_idx, offset in KNOWN_PORTS:
        mean = label_idx * 2.0 + offset
        X_port = rng.normal(mean, 0.5, (500, n_features_local))
        y_port = np.full(500, label_idx)
        ports_port = np.full(500, port, dtype=int)
        X_list.append(X_port)
        y_list.append(y_port)
        port_list.append(ports_port)

    X = np.vstack(X_list)
    y = np.hstack(y_list)
    ports = np.hstack(port_list)
    return X.astype(np.float32), y.astype(int), ports


def game_theory_decision(threat_idx: int) -> str:
    utilities = utility_matrix[threat_idx]
    best_action = int(np.argmax(utilities))
    return ACTIONS[best_action]


# ── Real CSV loader ─────────────────────────────────────────────────────────
def _load_real_csv():
    logger.info("Loading real CSV from %s", CSV_PATH)
    df = pd.read_csv(CSV_PATH)
    df.columns = df.columns.str.strip()
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)
    return df


# ── Model builder ───────────────────────────────────────────────────────────
def _build_model(n_feat: int, n_classes: int) -> Sequential:
    m = Sequential([
        Input(shape=(1, n_feat)),
        LSTM(128, return_sequences=True),
        Dropout(0.3),
        LSTM(64),
        Dense(32, activation="relu"),
        Dense(n_classes, activation="softmax"),
    ])
    m.compile(
        loss="sparse_categorical_crossentropy",
        optimizer="adam",
        metrics=["accuracy"],
    )
    return m


# ── Public init ─────────────────────────────────────────────────────────────
def initialize_model():
    global model, scaler, le, df_ports, n_features

    le_local = LabelEncoder()
    le_local.classes_ = np.array(CLASS_LABELS)

    if os.path.exists(CSV_PATH):
        # ---- Real data path ----
        df = _load_real_csv()
        df["STIX_event"] = df.apply(
            lambda r: {"destination_port": r["Destination Port"],
                       "flow_duration": r["Flow Duration"]}, axis=1
        )
        df["encoded_label"] = le_local.fit_transform(df["Label"])

        feature_cols = [c for c in df.columns
                        if c not in ("Label", "encoded_label", "STIX_event")]
        X = df[feature_cols].values.astype(np.float32)
        y = df["encoded_label"].values

        # keep port lookup for real-mode prediction
        df_ports = df[["Destination Port"] + feature_cols].copy()

        scaler_local = StandardScaler()
        X_scaled = scaler_local.fit_transform(X)

        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y
        )

        n_feat = X_train.shape[1]
        X_train_3d = X_train.reshape(-1, 1, n_feat)
        X_test_3d = X_test.reshape(-1, 1, n_feat)

        n_classes = len(np.unique(y))
        m = _build_model(n_feat, n_classes)
        logger.info("Training on real data …")
        m.fit(X_train_3d, y_train,
              epochs=6, batch_size=256,
              validation_data=(X_test_3d, y_test),
              verbose=1)

        model = m
        scaler = scaler_local
        le = le_local
        n_features = n_feat
        logger.info("Model (real data) ready.")

    else:
        # ---- Synthetic data path ----
        logger.info("CSV not found — training on synthetic data …")
        X_raw, y_raw, _ = _build_synthetic_dataset()

        scaler_local = StandardScaler()
        X_scaled = scaler_local.fit_transform(X_raw)

        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y_raw, test_size=0.2, random_state=42, stratify=y_raw
        )

        n_feat = X_train.shape[1]
        X_train_3d = X_train.reshape(-1, 1, n_feat)
        X_test_3d = X_test.reshape(-1, 1, n_feat)

        n_classes = 4
        m = _build_model(n_feat, n_classes)
        m.fit(X_train_3d, y_train,
              epochs=5, batch_size=256,
              validation_data=(X_test_3d, y_test),
              verbose=1)

        model = m
        scaler = scaler_local
        le = le_local
        n_features = n_feat
        df_ports = None
        logger.info("Model (synthetic data) ready.")


# ── Well-known port heuristics (synthetic mode fallback) ───────────────────
_PORT_HEURISTICS = {
    # BENIGN ports
    53: 0, 389: 0, 443: 0, 8443: 0, 636: 0, 993: 0, 995: 0, 3389: 0,
    # Brute Force typical ports
    80: 1, 22: 1, 21: 1, 23: 1, 25: 1, 110: 1,
    # SQL Injection typical ports
    8080: 2, 3306: 2, 5432: 2, 1433: 2, 1521: 2,
    # XSS typical ports
    8000: 3, 8888: 3, 4000: 3, 9000: 3, 9090: 3, 445: 3,
}


def predict_port(port: int) -> dict:
    """
    Main prediction function — mirrors notebook check_port().
    Returns a structured result dict.
    """
    if model is None or scaler is None or le is None:
        raise RuntimeError("Model not initialised. Call initialize_model() first.")

    # ── Real-CSV mode: look up actual row from dataset ──────────────────────
    if df_ports is not None:
        port_col = "Destination Port"
        if port not in df_ports[port_col].values:
            return {
                "port": port,
                "threat_type": "Unknown",
                "status": "UNKNOWN",
                "is_safe": None,
                "action": "Allow Connection",
                "confidence": 0.0,
                "message": "Port not found in dataset logs.",
            }
        row = df_ports[df_ports[port_col] == port].iloc[0]
        feature_vals = row.drop(port_col).values.reshape(1, -1).astype(np.float32)
        X_scaled = scaler.transform(feature_vals)
        X_3d = X_scaled.reshape(1, 1, -1)
    else:
        # ── Synthetic mode: build a feature vector biased by port heuristic ─
        rng = np.random.default_rng(port)            # reproducible per port
        hint = _PORT_HEURISTICS.get(port, None)

        if hint is not None:
            mean = hint * 2.0
            features = rng.normal(mean, 0.4, (1, n_features)).astype(np.float32)
        else:
            # unknown port: mildly random
            features = rng.normal(0.5, 1.0, (1, n_features)).astype(np.float32)

        X_scaled = scaler.transform(features)
        X_3d = X_scaled.reshape(1, 1, -1)

    # ── Model inference ─────────────────────────────────────────────────────
    pred_proba = model.predict(X_3d, verbose=0)[0]
    threat_idx = int(np.argmax(pred_proba))
    confidence = float(pred_proba[threat_idx])

    threat_name = le.classes_[threat_idx]
    action = game_theory_decision(threat_idx)
    is_safe = threat_name == "BENIGN"

    return {
        "port": port,
        "threat_type": threat_name,
        "status": "SAFE" if is_safe else "THREAT",
        "is_safe": is_safe,
        "action": action,
        "confidence": round(confidence * 100, 2),
        "message": "Connection Allowed" if is_safe else "Connection NOT Allowed",
    }
