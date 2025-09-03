package com.gradesave.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HelloController {
    @GetMapping("/greeting")
    public Map<String, Object> greeting() {
        return Map.of("message", "Hello from Spring", "time", Instant.now().toString());
    }
}
