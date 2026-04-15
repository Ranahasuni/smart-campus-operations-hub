package com.smartcampus.config;
+
+import org.springframework.context.annotation.Bean;
+import org.springframework.context.annotation.Configuration;
+import org.springframework.data.mongodb.MongoDatabaseFactory;
+import org.springframework.data.mongodb.MongoTransactionManager;
+
+/**
+ * Configuration class to enable MongoDB transactions.
+ * Requirements: MongoDB must be running as a Replica Set.
+ */
+@Configuration
+public class MongoConfig {
+
+    @Bean
+    MongoTransactionManager transactionManager(MongoDatabaseFactory dbFactory) {
+        return new MongoTransactionManager(dbFactory);
+    }
+}
+
