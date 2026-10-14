package com.aureliagrand.hotel.exception;

public class AccountRejectedException extends RuntimeException {
    public AccountRejectedException(String message) {
        super(message);
    }
}
