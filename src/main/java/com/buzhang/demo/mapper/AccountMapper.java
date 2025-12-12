package com.buzhang.demo.mapper;

import com.buzhang.demo.entity.Account;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper // 告诉 Spring Boot 这是一个操作数据库的接口
public interface AccountMapper {

    // 1. 插入一条记账记录
    // 注意：#{property} 对应的是 Account 类里的属性名
    @Insert("INSERT INTO account_record(id, amount, type, category, remark, create_time) " +
            "VALUES(#{id}, #{amount}, #{type}, #{category}, #{remark}, CURRENT_TIMESTAMP)")
    void insert(Account account);

    // 2. 查询所有记录，按时间倒序
    @Select("SELECT * FROM account_record ORDER BY create_time DESC")
    List<Account> findAll();
}