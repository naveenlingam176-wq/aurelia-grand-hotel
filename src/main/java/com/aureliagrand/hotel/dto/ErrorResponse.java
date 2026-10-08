package com.aureliagrand.hotel.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Standard API error response structure")
public class ErrorResponse {

    @Schema(description = "HTTP status code", example = "404")
    private int status;

    @Schema(description = "Operation success indicator (false for errors)", example = "false")
    private boolean success;

    @Schema(description = "Detailed human-readable error explanation", example = "Resource not found")
    private String message;

    @Schema(description = "Timestamp of the error in ISO-8601 UTC format", example = "2026-09-21T18:40:00Z")
    private String timestamp;

    public ErrorResponse() {
    }

    public ErrorResponse(int status, boolean success, String message, String timestamp) {
        this.status = status;
        this.success = success;
        this.message = message;
        this.timestamp = timestamp;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
