package com.Workpedia.Groovely.DTOs;

public record ErrorResponse(int status, String message, Object details) {
}
