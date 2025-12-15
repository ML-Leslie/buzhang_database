package com.buzhang.demo.controller;

import com.buzhang.demo.entity.Category;
import com.buzhang.demo.mapper.CategoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private com.buzhang.demo.service.BookkeepingService bookkeepingService;

    @PostMapping
    public Category create(@RequestBody Category category) {
        categoryMapper.insert(category);
        return category;
    }

    @GetMapping
    public List<Category> list(@RequestParam("userId") Long userId) {
        return categoryMapper.findByUser(userId);
    }

    @PutMapping("/{id}")
    public Category update(@PathVariable Long id, @RequestBody Category category) {
        category.setId(id);
        categoryMapper.update(category);
        return categoryMapper.findById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        bookkeepingService.deleteCategoryWithTransactions(id);
    }
}
