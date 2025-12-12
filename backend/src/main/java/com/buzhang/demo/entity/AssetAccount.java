package com.buzhang.demo.entity;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AssetAccount {
    private Long id;
    private Long userId;
    private String name;
    private BigDecimal balance;
    private String type; // 储蓄卡/信用卡/现金
}
