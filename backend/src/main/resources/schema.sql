CREATE TABLE IF NOT EXISTS sys_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    email VARCHAR(128)
);

CREATE TABLE IF NOT EXISTS asset_account (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES sys_user(id),
    name VARCHAR(64) NOT NULL,
    balance NUMERIC(18,2) DEFAULT 0 NOT NULL,
    type VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS category (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES sys_user(id),
    name VARCHAR(64) NOT NULL,
    type VARCHAR(16) NOT NULL,
    icon VARCHAR(64),
    CONSTRAINT category_type_ck CHECK (UPPER(type) IN ('收入', '支出', 'INCOME', 'EXPENSE'))
);

CREATE TABLE IF NOT EXISTS budget (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES sys_user(id),
    category_id BIGINT REFERENCES category(id),
    amount NUMERIC(18,2) NOT NULL,
    month VARCHAR(7) NOT NULL
);

CREATE TABLE IF NOT EXISTS transaction_record (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES sys_user(id),
    account_id BIGINT NOT NULL REFERENCES asset_account(id),
    category_id BIGINT NOT NULL REFERENCES category(id),
    amount NUMERIC(18,2) NOT NULL,
    create_time TIMESTAMP NOT NULL DEFAULT NOW(),
    remark VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_asset_account_user ON asset_account(user_id);
CREATE INDEX IF NOT EXISTS idx_category_user ON category(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_user_month ON budget(user_id, month);
CREATE INDEX IF NOT EXISTS idx_transaction_user_time ON transaction_record(user_id, create_time);
