package com.buzhang.demo.service;

import com.buzhang.demo.entity.AssetAccount;
import com.buzhang.demo.entity.Category;
import com.buzhang.demo.entity.TransactionRecord;
import com.buzhang.demo.mapper.AssetAccountMapper;
import com.buzhang.demo.mapper.CategoryMapper;
import com.buzhang.demo.mapper.TransactionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class BookkeepingService {

    @Autowired // 自动装配依赖
    private TransactionMapper transactionMapper;

    @Autowired
    private AssetAccountMapper assetAccountMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Transactional // 事务管理
    public void recordTransaction(TransactionRecord record) {
        AssetAccount account = assetAccountMapper.findById(record.getAccountId());
        if (account == null) {
            throw new IllegalArgumentException("资产账户不存在");
        }

        Category category = categoryMapper.findById(record.getCategoryId());
        if (category == null) {
            throw new IllegalArgumentException("分类不存在");
        }

        if (record.getCreateTime() == null) {
            record.setCreateTime(LocalDateTime.now());
        }

        transactionMapper.insert(record);

        boolean income = isIncome(category.getType());
        BigDecimal newBalance = income
                ? account.getBalance().add(record.getAmount())
                : account.getBalance().subtract(record.getAmount());

        account.setBalance(newBalance);
        assetAccountMapper.updateBalance(account);
    }

    private boolean isIncome(String categoryType) {
        if (categoryType == null) {
            return false;
        }
        String normalized = categoryType.trim().toUpperCase();
        return normalized.equals("收入") || normalized.equals("INCOME");
    }
}