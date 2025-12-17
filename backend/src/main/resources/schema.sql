-- 1. 用户表 (系统使用者)
CREATE TABLE IF NOT EXISTS sys_user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 资产账户表
CREATE TABLE IF NOT EXISTS asset_account (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL, -- 关联用户
    name VARCHAR(50) NOT NULL, -- 账户名称
    balance DECIMAL(15, 2) DEFAULT 0.00, -- 当前余额
    type VARCHAR(20), -- 类型：DEBIT(储蓄), CREDIT(信用), CASH(现金)
    icon VARCHAR(50),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 收支分类表
CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL, -- 支持用户自定义分类
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) NOT NULL, -- 1:支出, 2:收入
    icon VARCHAR(50), -- 前端图标的名称
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 预算表
CREATE TABLE IF NOT EXISTS budget (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT,
    amount DECIMAL(15, 2) NOT NULL,
    month VARCHAR(7) NOT NULL, -- 格式 '2025-12'
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 交易流水表
CREATE TABLE IF NOT EXISTS transaction_record (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,	
    account_id INT NOT NULL, -- 关联哪个账户花的钱
    category_id INT NOT NULL, -- 关联是买什么东西
    amount DECIMAL(15, 2) NOT NULL, -- 金额
    type VARCHAR(10) NOT NULL, -- 1:支出, 2:收入
    remark VARCHAR(255),
    trade_time TIMESTAMP NOT NULL, -- 实际消费时间
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
