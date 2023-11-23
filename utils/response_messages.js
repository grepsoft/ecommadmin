const Utils = require("./utils");

var AppMessages = {

  REGISTRATION_SUCCESS:
        "Your account was registered successfully. Please login and complete your profile.",
    UNAUTHORIZED: "You are not authorized to perform this action.",
    RECORD_NOT_FOUND: "We are sorry but this record was not found.",
    UNSUFFICIENT_BALANCE: "You have insufficient balance to perform this action.",
    SESSION_EXPIRED: "Your session has expired. Please login.",
    CARD_NOT_ACTIVE: "You can only add funds to an active card.",
    MINIMUM_LOAD_ERROR: (text, ...args) => Utils.stringReplaceTokens(text, args),

    ACTIVE: "Active",
    INACTIVE: "Inactive",
};

module.exports = AppMessages;