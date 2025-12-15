package com.buzhang.demo.entity;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class Category {
    private Long id;
    private Long userId;
    private String name;
    private String type; // 支出/收入
    private String icon;
    private BigDecimal totalAmount; // 统计该分类下的流水总金额
}
