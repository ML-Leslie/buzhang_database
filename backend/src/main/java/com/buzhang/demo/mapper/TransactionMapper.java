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

    // 支持主页统计功能的查询
    @Select("SELECT COALESCE(SUM(amount), 0) FROM transaction_record " +
            "WHERE user_id = #{userId} AND (type = #{type} OR type = #{typeCn}) " +
            "AND trade_time >= #{start} AND trade_time <= #{end}")
    java.math.BigDecimal sumByTypeAndPeriod(@Param("userId") Long userId, 
                                            @Param("type") String type, 
                                            @Param("typeCn") String typeCn,
                                            @Param("start") java.time.LocalDateTime start, 
                                            @Param("end") java.time.LocalDateTime end);

    @Select("SELECT c.name as name, c.icon as icon, SUM(t.amount) as amount " +
            "FROM transaction_record t " +
            "JOIN category c ON t.category_id = c.id " +
            "WHERE t.user_id = #{userId} AND (t.type = 'EXPENSE' OR t.type = '支出') " +
            "AND t.trade_time >= #{start} AND t.trade_time <= #{end} " +
            "GROUP BY t.category_id, c.name, c.icon " +
            "ORDER BY amount DESC " +
            "LIMIT #{limit}")
    List<java.util.Map<String, Object>> getCategoryRanking(@Param("userId") Long userId, 
                                                           @Param("start") java.time.LocalDateTime start, 
                                                           @Param("end") java.time.LocalDateTime end,
                                                           @Param("limit") int limit);

    @Select("SELECT CAST(trade_time AS DATE) as date, " +
            "SUM(CASE WHEN (type = 'INCOME' OR type = '收入') THEN amount ELSE 0 END) as income, " +
            "SUM(CASE WHEN (type = 'EXPENSE' OR type = '支出') THEN amount ELSE 0 END) as expense " +
            "FROM transaction_record " +
            "WHERE user_id = #{userId} " +
            "AND trade_time >= #{start} AND trade_time <= #{end} " +
            "GROUP BY CAST(trade_time AS DATE) " +
            "ORDER BY date")
    List<java.util.Map<String, Object>> getDailyStats(@Param("userId") Long userId, 
                                                      @Param("start") java.time.LocalDateTime start, 
                                                      @Param("end") java.time.LocalDateTime end);
}
