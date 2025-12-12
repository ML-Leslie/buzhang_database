package com.buzhang.demo.mapper;

import com.buzhang.demo.entity.TransactionRecord;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface TransactionMapper {

    @Insert("INSERT INTO transaction_record(user_id, account_id, category_id, amount, create_time, remark) " +
            "VALUES(#{userId}, #{accountId}, #{categoryId}, #{amount}, COALESCE(#{createTime}, CURRENT_TIMESTAMP), #{remark})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(TransactionRecord record);

    @Select("SELECT id, user_id, account_id, category_id, amount, create_time, remark FROM transaction_record WHERE user_id = #{userId} ORDER BY create_time DESC")
    List<TransactionRecord> findByUser(Long userId);

    @Select("SELECT id, user_id, account_id, category_id, amount, create_time, remark FROM transaction_record WHERE user_id = #{userId} AND create_time >= #{start} AND create_time <= #{end} ORDER BY create_time DESC")
    List<TransactionRecord> findByUserAndPeriod(@Param("userId") Long userId, @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);
}
