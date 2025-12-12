package com.buzhang.demo.entity;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class Budget {
    private Long id;
    private Long userId;
    private Long categoryId;
    private BigDecimal amount;
    private String month; // YYYY-MM
}
