package com.buzhang.demo.controller;

import com.buzhang.demo.entity.SysUser;
import com.buzhang.demo.mapper.SysUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private SysUserMapper userMapper;

    @PostMapping
    public SysUser register(@RequestBody SysUser user) {
        userMapper.insert(user);
        return user;
    }

    @GetMapping
    public List<SysUser> list() {
        return userMapper.findAll();
    }

    @GetMapping("/{id}")
    public SysUser get(@PathVariable Long id) {
        return userMapper.findById(id);
    }
}
