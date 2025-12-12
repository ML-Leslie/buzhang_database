package com.buzhang.demo.controller;

import com.buzhang.demo.entity.Account;
import com.buzhang.demo.mapper.AccountMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // 表示这个类所有方法返回的都是 JSON 数据
@RequestMapping("/api/accounts") // 统一的基础路径
public class AccountController {

    @Autowired // 自动注入 Mapper
    private AccountMapper accountMapper;

    // 接口1：获取账单列表
    // 访问方式：GET http://localhost:8080/api/accounts
    @GetMapping
    public List<Account> list() {
        return accountMapper.findAll();
    }

    // 接口2：新增一笔账单
    // 访问方式：POST http://localhost:8080/api/accounts
    // 参数需要在 Body 中以 JSON 格式传递
    @PostMapping
    public String add(@RequestBody Account account) {
        accountMapper.insert(account);
        return "记账成功！";
    }
}