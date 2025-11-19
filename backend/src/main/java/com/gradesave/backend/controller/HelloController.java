package com.gradesave.backend.controller;

import java.time.Instant;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;



@RestController
@RequestMapping("/api")
public class HelloController {
    private static final Logger log = LoggerFactory.getLogger(HelloController.class);
    @PostMapping("/greeting")
    public Map<String, Object> greeting() {
        log.info("Got greeted by Frontend");
        return Map.of("message", "Hello from Spring", "time", Instant.now().toString());
    }
}
