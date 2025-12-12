package com.buzhang.demo.controller;

import com.buzhang.demo.entity.Budget;
import com.buzhang.demo.mapper.BudgetMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetMapper budgetMapper;

    @PostMapping
    public Budget create(@RequestBody Budget budget) {
        budgetMapper.insert(budget);
        return budget;
    }

    @PutMapping("/{id}")
    public Budget update(@PathVariable Long id, @RequestBody Budget budget) {
        budget.setId(id);
        budgetMapper.updateAmount(budget);
        return budgetMapper.findById(id);
    }

    @GetMapping
    public List<Budget> list(@RequestParam("userId") Long userId, @RequestParam("month") String month) {
        return budgetMapper.findByUserAndMonth(userId, month);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        budgetMapper.delete(id);
    }
}
