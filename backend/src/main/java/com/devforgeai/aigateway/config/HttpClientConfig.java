package com.devforgeai.aigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.http.HttpClient;
import java.time.Duration;

/**
 * Provides a single shared HttpClient for all OpenRouter requests.
 * Re-using one client gives connection pooling and avoids overhead.
 */
@Configuration
public class HttpClientConfig {

    @Bean
    public HttpClient openRouterHttpClient(OpenRouterProperties props) {
        return HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(props.getTimeoutSeconds()))
                .version(HttpClient.Version.HTTP_1_1)
                .build();
    }
}
