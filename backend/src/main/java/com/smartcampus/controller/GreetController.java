package com.smartcampus.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class GreetController {

    @GetMapping("/greet/{name}")
    public Map<String, String> greet(
            @PathVariable String name,
            @RequestParam(required = false, defaultValue = "Hello") String message) {
        
        return Map.of(
            "name", name,
            "message", message,
            "greeting", message + ", " + name + "!"
        );
    }
}
