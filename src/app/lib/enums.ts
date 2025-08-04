enum ProfileButtonsEnum {
    UPDATE = 'update',
    CANCEL = 'cancel',
    EDIT = 'edit',
}

enum PaymentMethodEnum {
    BANK_TRANSFER = 'BANK_TRANSFER',
    MOBILE_PAYMENT = 'MOBILE_PAYMENT',
    ZELLE_PAYMENT = 'ZELLE_PAYMENT',
    BINANCE_PAYMENT = 'BINANCE_PAYMENT',
    ZINLI_PAYMENT = 'ZINLI_PAYMENT',
    WALLY_PAYMENT = 'WALLY_PAYMENT',
    DEFAULT = 'BANK_TRANSFER'
}

enum ServiceEnum {
    STREAMING = 'STREAMING',
    RECHARGES = 'RECHARGES',
    EXCHANGE = 'EXCHANGE',
    MARKETING = 'MARKETING',
    LICENSES = 'LICENSES'
}

enum TransactionEnum {
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
    PROCESSED = 'PROCESSED'
}

enum RoleEnum {
    CLIENT = 'CLIENT',
    RESELLER = 'RESELLER',
    ADMIN = 'ADMIN',
    SUPERUSER = 'SUPERUSER',
}

export { ProfileButtonsEnum, PaymentMethodEnum, ServiceEnum, TransactionEnum, RoleEnum };