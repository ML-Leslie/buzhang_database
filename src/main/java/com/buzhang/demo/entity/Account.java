package com.buzhang.demo.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data // Lombok 注解，自动生成 Getter/Setter/ToString
public class Account {
    private Long id;                // 主键
    private BigDecimal amount;      // 金额 (涉及钱，建议用 BigDecimal)
    private String type;            // 类型：收入/支出
    private String category;        // 分类：吃饭/交通
    private String remark;          // 备注
    private LocalDateTime createTime; // 创建时间
}