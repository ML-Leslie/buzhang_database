package com.buzhang.demo.entity;

import lombok.Data;

@Data
public class Category {
    private Long id;
    private Long userId;
    private String name;
    private String type; // 支出/收入
    private String icon;
}
