package com.buzhang.demo.controller;

import com.buzhang.demo.entity.AssetAccount;
import com.buzhang.demo.mapper.AssetAccountMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AssetAccountMapper accountMapper;

    @Autowired
    private com.buzhang.demo.service.BookkeepingService bookkeepingService;

    @GetMapping
    public List<AssetAccount> list(@RequestParam("userId") Long userId) {
        return accountMapper.findByUser(userId);
    }

    @PostMapping
    public AssetAccount add(@RequestBody AssetAccount account) {
        accountMapper.insert(account);
        return account;
    }

    @PutMapping("/{id}")
    public AssetAccount update(@PathVariable Long id, @RequestBody AssetAccount account) {
        account.setId(id);
        accountMapper.updateInfo(account);
        return accountMapper.findById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        bookkeepingService.deleteAccountWithTransactions(id);
    }
}