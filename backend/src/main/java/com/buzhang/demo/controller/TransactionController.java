package com.buzhang.demo.controller;

import com.buzhang.demo.entity.TransactionRecord;
import com.buzhang.demo.mapper.TransactionMapper;
import com.buzhang.demo.service.BookkeepingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private BookkeepingService bookkeepingService;

    @Autowired
    private TransactionMapper transactionMapper;

    @PostMapping
    public TransactionRecord record(@RequestBody TransactionRecord record) {
        bookkeepingService.recordTransaction(record);
        return record;
    }

    @GetMapping
    public List<TransactionRecord> list(@RequestParam("userId") Long userId,
                                        @RequestParam(value = "start", required = false)
                                        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
                                        @RequestParam(value = "end", required = false)
                                        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        if (start != null && end != null) {
            return transactionMapper.findByUserAndPeriod(userId, start, end);
        }
        return transactionMapper.findByUser(userId);
    }

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardData(@RequestParam("userId") Long userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = now.toLocalDate().atTime(LocalTime.MAX);

        LocalDateTime startOfWeek = now.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY)).toLocalDate().atStartOfDay();
        LocalDateTime endOfWeek = startOfWeek.plusDays(6).toLocalDate().atTime(LocalTime.MAX);

        LocalDateTime startOfMonth = LocalDateTime.of(now.getYear(), now.getMonth(), 1, 0, 0);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusNanos(1);

        LocalDateTime startOfYear = LocalDateTime.of(now.getYear(), 1, 1, 0, 0);
        LocalDateTime endOfYear = startOfYear.plusYears(1).minusNanos(1);

        Map<String, Object> result = new java.util.HashMap<>();

        // 统计数据
        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("today", getIncomeExpense(userId, startOfDay, endOfDay));
        stats.put("week", getIncomeExpense(userId, startOfWeek, endOfWeek));
        stats.put("year", getIncomeExpense(userId, startOfYear, endOfYear));
        result.put("stats", stats);

        // 月度统计数据
        Map<String, Object> monthlyStats = getIncomeExpense(userId, startOfMonth, endOfMonth);
        BigDecimal income = (BigDecimal) monthlyStats.get("income");
        BigDecimal expense = (BigDecimal) monthlyStats.get("expense");
        monthlyStats.put("balance", income.subtract(expense));
        monthlyStats.put("totalExpense", expense);
        result.put("monthlyStats", monthlyStats);

        // 分类排行
        List<Map<String, Object>> ranking = transactionMapper.getCategoryRanking(userId, startOfMonth, endOfMonth, 5);
        // 计算百分比
        if (expense.compareTo(BigDecimal.ZERO) > 0) {
            for (Map<String, Object> item : ranking) {
                BigDecimal amount = (BigDecimal) item.get("amount");
                item.put("percent", amount.divide(expense, 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal(100)));
            }
        }
        result.put("categoryRanking", ranking);

        // 图表数据
        result.put("chartData", transactionMapper.getDailyStats(userId, startOfMonth, endOfMonth));

        return result;
    }

    private Map<String, Object> getIncomeExpense(Long userId, LocalDateTime start, LocalDateTime end) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("income", transactionMapper.sumByTypeAndPeriod(userId, "INCOME", "收入", start, end));
        map.put("expense", transactionMapper.sumByTypeAndPeriod(userId, "EXPENSE", "支出", start, end));
        return map;
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        bookkeepingService.deleteTransaction(id);
    }
}
