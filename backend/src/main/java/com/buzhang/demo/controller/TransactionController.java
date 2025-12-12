package com.buzhang.demo.controller;

import com.buzhang.demo.entity.TransactionRecord;
import com.buzhang.demo.mapper.TransactionMapper;
import com.buzhang.demo.service.BookkeepingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

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
}
