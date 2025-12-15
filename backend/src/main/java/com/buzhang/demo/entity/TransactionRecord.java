package com.buzhang.demo.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionRecord {
    private Long id;
    private Long userId;
    private Long accountId;
    private Long categoryId;
    private BigDecimal amount;
    private String type;
    private LocalDateTime tradeTime;
    private String remark;

    // 扩展字段，用于前端展示
    private String categoryName;
    private String categoryIcon;
    private String categoryType;
    private String accountName;
}
