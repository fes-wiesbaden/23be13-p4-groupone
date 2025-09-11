package com.gradesave.backend.controller;

import java.time.Instant;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/api")
public class HelloController {
    @PostMapping("/greeting")
    public Map<String, Object> greeting() {
        System.out.println("Got greeted by Frontend");
        return Map.of("message", "Hello from Spring", "time", Instant.now().toString());
    }
}
