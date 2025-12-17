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
        // 简单的查重逻辑
        if (userMapper.findByUsername(user.getUsername()) != null) {
            throw new RuntimeException("用户名已存在");
        }
        userMapper.insert(user);
        return user;
    }

    @PostMapping("/login")
    public SysUser login(@RequestBody SysUser loginUser) {
        SysUser user = userMapper.findByUsername(loginUser.getUsername());
        if (user != null && user.getPassword().equals(loginUser.getPassword())) {
            return user;
        }
        throw new RuntimeException("用户名或密码错误");
    }

    @GetMapping
    public List<SysUser> list() {
        return userMapper.findAll();
    }

    @GetMapping("/{id}")
    public SysUser get(@PathVariable Long id) {
        return userMapper.findById(id);
    }

    @GetMapping("/check")
    public boolean checkUsername(@RequestParam String username) {
        return userMapper.findByUsername(username) != null;
    }
}
