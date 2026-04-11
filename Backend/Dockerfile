# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9.5-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests

# ── Stage 2: Run ──────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the built JAR from stage 1
COPY --from=build /app/target/groovely-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Run with production profile
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
