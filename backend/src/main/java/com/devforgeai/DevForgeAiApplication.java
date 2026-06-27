package com.devforgeai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan("com.devforgeai.aigateway.config")
public class DevForgeAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(DevForgeAiApplication.class, args);
    }
}