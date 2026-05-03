-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(30)  NOT NULL,
    active      BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMP    DEFAULT NOW()
);

-- Table des chambres
CREATE TABLE IF NOT EXISTS rooms (
    id               BIGSERIAL PRIMARY KEY,
    room_number      VARCHAR(10)    NOT NULL UNIQUE,
    category         VARCHAR(20)    NOT NULL,
    price_per_night  NUMERIC(10,2)  NOT NULL,
    status           VARCHAR(20)    DEFAULT 'LIBRE',
    floor            INTEGER,
    description      TEXT
);

-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
    id           BIGSERIAL PRIMARY KEY,
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(150),
    phone        VARCHAR(20),
    id_document  VARCHAR(50),
    nationality  VARCHAR(50),
    created_at   TIMESTAMP DEFAULT NOW()
);

-- Table des services
CREATE TABLE IF NOT EXISTS services (
    id          BIGSERIAL PRIMARY KEY,
    label       VARCHAR(100)   NOT NULL,
    unit_price  NUMERIC(10,2)  NOT NULL
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS reservations (
    id          BIGSERIAL PRIMARY KEY,
    client_id   BIGINT REFERENCES clients(id)  ON DELETE SET NULL,
    room_id     BIGINT REFERENCES rooms(id)    ON DELETE SET NULL,
    check_in    DATE          NOT NULL,
    check_out   DATE          NOT NULL,
    status      VARCHAR(20)   DEFAULT 'CONFIRMEE',
    deposit     NUMERIC(10,2) DEFAULT 0,
    created_by  BIGINT REFERENCES users(id)    ON DELETE SET NULL,
    created_at  TIMESTAMP     DEFAULT NOW()
);

-- Table des services consommés par réservation
CREATE TABLE IF NOT EXISTS reservation_services (
    id               BIGSERIAL PRIMARY KEY,
    reservation_id   BIGINT REFERENCES reservations(id) ON DELETE CASCADE,
    service_id       BIGINT REFERENCES services(id)     ON DELETE SET NULL,
    quantity         INTEGER DEFAULT 1
);

-- Table des factures
CREATE TABLE IF NOT EXISTS invoices (
    id                BIGSERIAL PRIMARY KEY,
    reservation_id    BIGINT REFERENCES reservations(id) ON DELETE SET NULL,
    total_amount      NUMERIC(10,2),
    tva_rate          NUMERIC(5,2)  DEFAULT 20.0,
    deposit_deducted  NUMERIC(10,2) DEFAULT 0,
    net_to_pay        NUMERIC(10,2),
    status            VARCHAR(20)   DEFAULT 'EN_ATTENTE',
    issued_at         TIMESTAMP     DEFAULT NOW(),
    closed_at         TIMESTAMP
);
