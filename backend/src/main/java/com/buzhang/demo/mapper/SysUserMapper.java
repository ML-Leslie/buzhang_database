package com.buzhang.demo.mapper;

import com.buzhang.demo.entity.SysUser;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface SysUserMapper {

    @Insert("INSERT INTO sys_user(username, password, email) VALUES(#{username}, #{password}, #{email})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(SysUser user);

    @Select("SELECT id, username, password, email FROM sys_user WHERE id = #{id}")
    SysUser findById(Long id);

    @Select("SELECT id, username, password, email FROM sys_user WHERE username = #{username}")
    SysUser findByUsername(String username);

    @Select("SELECT id, username, password, email FROM sys_user ORDER BY id")
    List<SysUser> findAll();
}
