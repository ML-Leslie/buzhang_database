package com.buzhang.demo.mapper;

import com.buzhang.demo.entity.Budget;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface BudgetMapper {

    @Insert("INSERT INTO budget(user_id, category_id, amount, month) VALUES(#{userId}, #{categoryId}, #{amount}, #{month})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(Budget budget);

    @Update("UPDATE budget SET amount = #{amount} WHERE id = #{id}")
    void updateAmount(Budget budget);

    @Select("SELECT id, user_id, category_id, amount, month FROM budget WHERE user_id = #{userId} AND month = #{month}")
    List<Budget> findByUserAndMonth(@Param("userId") Long userId, @Param("month") String month);

    @Select("SELECT id, user_id, category_id, amount, month FROM budget WHERE id = #{id}")
    Budget findById(Long id);

    @Delete("DELETE FROM budget WHERE id = #{id}")
    void delete(Long id);
}
