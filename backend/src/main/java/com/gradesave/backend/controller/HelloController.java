package com.gradesave.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.Map;



@RestController
//@CrossOrigin(origins = "http://localhost:5173")

@RequestMapping("/api")
public class HelloController {
    @PostMapping("/greeting")
    public Map<String, Object> greeting() {
        System.out.println("The rizzler said hi");
        return Map.of("message", "Hello from Spring", "time", Instant.now().toString());
    }
}
