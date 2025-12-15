package com.buzhang.demo.mapper;

import com.buzhang.demo.entity.Category;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface CategoryMapper {

    @Insert("INSERT INTO category(user_id, name, type, icon) VALUES(#{userId}, #{name}, #{type}, #{icon})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(Category category);

    @Select("SELECT id, user_id, name, type, icon FROM category WHERE id = #{id}")
    Category findById(Long id);

    @Select("SELECT c.id, c.user_id, c.name, c.type, c.icon, COALESCE(SUM(t.amount), 0) as totalAmount " +
            "FROM category c " +
            "LEFT JOIN transaction_record t ON c.id = t.category_id " +
            "WHERE c.user_id = #{userId} " +
            "GROUP BY c.id, c.user_id, c.name, c.type, c.icon " +
            "ORDER BY c.id")
    List<Category> findByUser(Long userId);

    @Update("UPDATE category SET name = #{name}, type = #{type}, icon = #{icon} WHERE id = #{id}")
    void update(Category category);

    @Delete("DELETE FROM category WHERE id = #{id}")
    void delete(Long id);
}
