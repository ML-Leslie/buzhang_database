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

    @Select("SELECT id, user_id, name, type, icon FROM category WHERE user_id = #{userId} ORDER BY id")
    List<Category> findByUser(Long userId);

    @Update("UPDATE category SET name = #{name}, type = #{type}, icon = #{icon} WHERE id = #{id}")
    void update(Category category);

    @Delete("DELETE FROM category WHERE id = #{id}")
    void delete(Long id);
}
