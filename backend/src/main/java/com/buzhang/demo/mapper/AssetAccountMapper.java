package com.buzhang.demo.mapper;

import com.buzhang.demo.entity.AssetAccount;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface AssetAccountMapper {

    @Insert("INSERT INTO asset_account(user_id, name, balance, type, icon) VALUES(#{userId}, #{name}, #{balance}, #{type}, #{icon})")
    @Options(useGeneratedKeys = true, keyProperty = "id") // 使用自增主键
    void insert(AssetAccount account);

    @Select("SELECT id, user_id, name, balance, type, icon FROM asset_account WHERE id = #{id}")
    AssetAccount findById(Long id);

    @Select("SELECT id, user_id, name, balance, type, icon FROM asset_account WHERE user_id = #{userId} ORDER BY id")
    List<AssetAccount> findByUser(Long userId);

    @Update("UPDATE asset_account SET balance = #{balance} WHERE id = #{id}")
    void updateBalance(AssetAccount account);

    @Update("UPDATE asset_account SET name = #{name}, type = #{type}, icon = #{icon}, balance = #{balance} WHERE id = #{id}")
    void updateInfo(AssetAccount account);

    @Delete("DELETE FROM asset_account WHERE id = #{id}")
    void delete(Long id);
}
