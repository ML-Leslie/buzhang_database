package com.buzhang.demo.mapper;

import com.buzhang.demo.entity.TransactionRecord;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface TransactionMapper {

    @Insert("INSERT INTO transaction_record(user_id, account_id, category_id, amount, type, trade_time, remark) " +
            "VALUES(#{userId}, #{accountId}, #{categoryId}, #{amount}, #{type}, COALESCE(#{tradeTime}, CURRENT_TIMESTAMP), #{remark})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(TransactionRecord record);

    @Select("SELECT t.id, t.user_id, t.account_id, t.category_id, t.amount, t.type, t.trade_time, t.remark, " +
            "c.name as categoryName, c.icon as categoryIcon, c.type as categoryType, a.name as accountName " +
            "FROM transaction_record t " +
            "LEFT JOIN category c ON t.category_id = c.id " +
            "LEFT JOIN asset_account a ON t.account_id = a.id " +
            "WHERE t.user_id = #{userId} ORDER BY t.trade_time DESC")
    List<TransactionRecord> findByUser(Long userId);

    @Select("SELECT t.id, t.user_id, t.account_id, t.category_id, t.amount, t.type, t.trade_time, t.remark, " +
            "c.name as categoryName, c.icon as categoryIcon, c.type as categoryType, a.name as accountName " +
            "FROM transaction_record t " +
            "LEFT JOIN category c ON t.category_id = c.id " +
            "LEFT JOIN asset_account a ON t.account_id = a.id " +
            "WHERE t.user_id = #{userId} AND t.trade_time >= #{start} AND t.trade_time <= #{end} " +
            "ORDER BY t.trade_time DESC")
    List<TransactionRecord> findByUserAndPeriod(@Param("userId") Long userId, @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

    @Select("SELECT * FROM transaction_record WHERE category_id = #{categoryId}")
    List<TransactionRecord> findByCategoryId(Long categoryId);

    @Delete("DELETE FROM transaction_record WHERE category_id = #{categoryId}")
    void deleteByCategoryId(Long categoryId);

    @Delete("DELETE FROM transaction_record WHERE account_id = #{accountId}")
    void deleteByAccountId(Long accountId);

    @Select("SELECT * FROM transaction_record WHERE id = #{id}")
    TransactionRecord findById(Long id);

    @Delete("DELETE FROM transaction_record WHERE id = #{id}")
    void deleteById(Long id);
}
