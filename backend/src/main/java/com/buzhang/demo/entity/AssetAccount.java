package com.buzhang.demo.entity;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AssetAccount {
    private Long id;
    private Long userId;
    private String name;
    private BigDecimal balance;
    private String type; // 现金账户/储蓄账户/虚拟账户/投资账户/负债账户/其他账户
    private String icon;
}
