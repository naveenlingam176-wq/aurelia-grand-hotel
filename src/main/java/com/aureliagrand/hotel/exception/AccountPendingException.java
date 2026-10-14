package com.aureliagrand.hotel.exception;

public class AccountPendingException extends RuntimeException {
    public AccountPendingException(String message) {
        super(message);
    }
}
