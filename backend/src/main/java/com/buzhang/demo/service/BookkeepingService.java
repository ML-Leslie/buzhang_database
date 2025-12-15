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
import java.util.List;

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

        if (record.getTradeTime() == null) {
            record.setTradeTime(LocalDateTime.now());
        }

        transactionMapper.insert(record);

        boolean income = isIncome(category.getType());
        boolean isLiability = "负债账户".equals(account.getType());

        BigDecimal newBalance;
        if (isLiability) {
            // 负债账户：支出增加负债（余额增加），收入减少负债（余额减少）
            newBalance = income
                    ? account.getBalance().subtract(record.getAmount())
                    : account.getBalance().add(record.getAmount());
        } else {
            // 资产账户：收入增加余额，支出减少余额
            newBalance = income
                    ? account.getBalance().add(record.getAmount())
                    : account.getBalance().subtract(record.getAmount());
        }

        account.setBalance(newBalance);
        assetAccountMapper.updateBalance(account);
    }

    @Transactional
    public void deleteCategoryWithTransactions(Long categoryId) {
        // 1. 获取该分类下的所有流水
        List<TransactionRecord> transactions = transactionMapper.findByCategoryId(categoryId);

        // 2. 遍历流水，回滚账户余额
        for (TransactionRecord record : transactions) {
            AssetAccount account = assetAccountMapper.findById(record.getAccountId());
            if (account != null) {
                // 获取分类类型（因为流水记录中可能没有存type，或者需要从分类获取，但这里分类即将删除，
                // 且record中可能只有categoryId。不过TransactionMapper.findByCategoryId是 select *，
                // 如果record中有type字段最好。如果没有，需要查Category。
                // 但这里我们已知是要删除某个Category，所以可以直接查这个Category的信息）
                Category category = categoryMapper.findById(categoryId);
                if (category == null) continue; // 分类不存在，跳过

                boolean income = isIncome(category.getType());
                boolean isLiability = "负债账户".equals(account.getType());

                BigDecimal newBalance;
                // 回滚逻辑：与记录时相反
                // 记录时：
                // 负债账户：支出 -> +余额, 收入 -> -余额
                // 资产账户：支出 -> -余额, 收入 -> +余额
                
                // 删除时（回滚）：
                // 负债账户：删除支出 -> -余额, 删除收入 -> +余额
                // 资产账户：删除支出 -> +余额, 删除收入 -> -余额

                if (isLiability) {
                    newBalance = income
                            ? account.getBalance().add(record.getAmount()) // 删除收入，负债增加
                            : account.getBalance().subtract(record.getAmount()); // 删除支出，负债减少
                } else {
                    newBalance = income
                            ? account.getBalance().subtract(record.getAmount()) // 删除收入，余额减少
                            : account.getBalance().add(record.getAmount()); // 删除支出，余额增加
                }
                account.setBalance(newBalance);
                assetAccountMapper.updateBalance(account);
            }
        }

        // 3. 删除流水
        transactionMapper.deleteByCategoryId(categoryId);

        // 4. 删除分类
        categoryMapper.delete(categoryId);
    }

    @Transactional
    public void deleteAccountWithTransactions(Long accountId) {
        // 1. 删除该账户下的所有流水
        transactionMapper.deleteByAccountId(accountId);
        
        // 2. 删除账户
        assetAccountMapper.delete(accountId);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        TransactionRecord record = transactionMapper.findById(id);
        if (record == null) {
            throw new IllegalArgumentException("流水记录不存在");
        }

        AssetAccount account = assetAccountMapper.findById(record.getAccountId());
        Category category = categoryMapper.findById(record.getCategoryId());

        // 如果账户存在，需要回滚余额
        if (account != null) {
            // 确定是收入还是支出
            // 优先使用记录中的类型，如果没有则使用分类的类型
            String typeToCheck = record.getType();
            if (typeToCheck == null && category != null) {
                typeToCheck = category.getType();
            }

            boolean income = isIncome(typeToCheck);
            boolean isLiability = "负债账户".equals(account.getType());

            BigDecimal newBalance;
            if (isLiability) {
                // 负债账户回滚：
                // 原本：收入 -> 减少负债(余额减少)；支出 -> 增加负债(余额增加)
                // 删除：收入 -> 增加负债(余额增加)；支出 -> 减少负债(余额减少)
                newBalance = income
                        ? account.getBalance().add(record.getAmount())
                        : account.getBalance().subtract(record.getAmount());
            } else {
                // 资产账户回滚：
                // 原本：收入 -> 增加余额；支出 -> 减少余额
                // 删除：收入 -> 减少余额；支出 -> 增加余额
                newBalance = income
                        ? account.getBalance().subtract(record.getAmount())
                        : account.getBalance().add(record.getAmount());
            }
            account.setBalance(newBalance);
            assetAccountMapper.updateBalance(account);
        }

        transactionMapper.deleteById(id);
    }

    private boolean isIncome(String categoryType) {
        if (categoryType == null) {
            return false;
        }
        String normalized = categoryType.trim().toUpperCase();
        return normalized.equals("收入") || normalized.equals("INCOME");
    }
}