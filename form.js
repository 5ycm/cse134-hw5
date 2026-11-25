
const contactForm = document.querySelector("#contact-form");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const commentsInput = document.querySelector("#comments");
const submitButton = contactForm.querySelector('button[type="submit"]');
const errorsInput = document.querySelector("#form-errors");

const infoArea = document.querySelector("#info-area");
const charCount = document.querySelector("#char-count");
const charStatus = document.querySelector("#char-status");

const errorArea = document.querySelector("#error-area");
const errorList = document.querySelector("#error-list");
const errorEmpty = document.querySelector("#error-empty");


const fields = [nameInput, emailInput, commentsInput];


const fieldLabels = {
    name: "Name",
    email: "Email",
    comments: "Message"
};


const requiredMessages = {
    name: "Name is required. Enter the name you would like me to use.",
    email: "Email is required. Enter an address I can reply to, like name@example.com.",
    comments: "Message is required. Write at least 10 characters."
};


const baseDescribedBy = {};

function rememberDescribedBy(field) {
    baseDescribedBy[field.id] = field.getAttribute("aria-describedby");
}

fields.forEach(rememberDescribedBy);


const editedFields = {
    name: false,
    email: false,
    comments: false
};


const form_errors = [];


const WARNING_THRESHOLD = 100;


infoArea.hidden = false;
errorArea.hidden = false;


// 2


function getErrorMessage(field) {
    const validity = field.validity;
    const label = fieldLabels[field.id];

    if (validity.valueMissing) {
        return requiredMessages[field.id];
    }
    if (validity.typeMismatch) {
        return "Enter a complete email address with an @ and a domain, like name@example.com.";
    }
    if (validity.tooShort) {
        return label + " is too short. Write at least " + field.minLength + " characters.";
    }
    if (validity.tooLong) {
        return label + " is too long. Shorten it to " + field.maxLength + " characters or fewer.";
    }
    return "";
}


function getErrorType(validity) {
    if (validity.valueMissing) return "valueMissing";
    if (validity.typeMismatch) return "typeMismatch";
    if (validity.tooShort) return "tooShort";
    if (validity.tooLong) return "tooLong";
    return "other";
}



function checkField(field) {
    field.setCustomValidity("");          // clear any old message first
    const message = getErrorMessage(field);
    field.setCustomValidity(message);     // "" means the field is valid
    return message;
}


// 3
function errorIdFor(field) {
    return field.id + "-error";
}

function isErrorShown(field) {
    return document.getElementById(errorIdFor(field)) !== null;
}

function focusLinkedField(event) {
    event.preventDefault();
    const fieldId = event.currentTarget.getAttribute("href").slice(1);
    document.getElementById(fieldId).focus();
}

function showError(field, message) {
    const errorId = errorIdFor(field);
    let item = document.getElementById(errorId);

    if (item === null) {
        item = document.createElement("li");
        item.id = errorId;


        let nextItem = null;
        for (let i = fields.indexOf(field) + 1; i < fields.length; i++) {
            const candidate = document.getElementById(errorIdFor(fields[i]));
            if (candidate !== null) {
                nextItem = candidate;
                break;
            }
        }
        errorList.insertBefore(item, nextItem);
    }


    if (item.dataset.message !== message) {
        item.dataset.message = message;
        item.textContent = "";

        const link = document.createElement("a");
        link.href = "#" + field.id;
        link.textContent = fieldLabels[field.id] + ":";
        link.addEventListener("click", focusLinkedField);

        item.append(link, " " + message);
    }

    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", baseDescribedBy[field.id] + " " + errorId);
    updateEmptyMessage();
}

function clearError(field) {
    const item = document.getElementById(errorIdFor(field));
    if (item !== null) {
        item.remove();
    }
    field.removeAttribute("aria-invalid");
    field.setAttribute("aria-describedby", baseDescribedBy[field.id]);
    updateEmptyMessage();
}

function updateEmptyMessage() {
    errorEmpty.hidden = errorList.children.length > 0;
}


function checkAndShow(field) {
    const message = checkField(field);
    if (message === "") {
        clearError(field);
    } else {
        showError(field, message);
    }
}


//4


function handleFieldInput(event) {
    const field = event.target;
    editedFields[field.id] = true;
    const message = checkField(field);
    if (isErrorShown(field)) {
        if (message === "") {
            clearError(field);
        } else {
            showError(field, message);
        }
    }
}

function handleFieldBlur(event) {
    const field = event.target;
    if (editedFields[field.id]) {
        checkAndShow(field);
    }
}

function addFieldListeners(field) {
    field.addEventListener("input", handleFieldInput);
    field.addEventListener("blur", handleFieldBlur);
}

fields.forEach(addFieldListeners);


// 5


function checkAllFields() {
    fields.forEach(checkField);
}

submitButton.addEventListener("click", checkAllFields);


let attemptNumber = 0;
let attemptInProgress = false;

function endAttempt() {
    attemptInProgress = false;
}

function handleInvalid(event) {
    const field = event.target;


    if (!attemptInProgress) {
        attemptInProgress = true;
        attemptNumber += 1;
        setTimeout(endAttempt, 0);
    }

    const message = checkField(field);
    if (message === "") {
        return;
    }
    showError(field, message);


    form_errors.push({
        attempt: attemptNumber,
        field: field.name,
        error: getErrorType(field.validity),
        message: message,
        time: new Date().toISOString()
    });
}

contactForm.addEventListener("invalid", handleInvalid, true);

function saveErrorLog() {
    errorsInput.value = JSON.stringify(form_errors);
}

contactForm.addEventListener("submit", saveErrorLog);


//6

const maxCharacters = commentsInput.maxLength;   // read from the HTML maxlength
let lastCountState = "normal";

function formatNumber(number) {
    return number.toLocaleString("en-US");
}

function updateCharCount() {
    const remaining = maxCharacters - commentsInput.value.length;
    const unit = remaining === 1 ? "character" : "characters";
    let state = "normal";
    let text = formatNumber(remaining) + " " + unit + " remaining.";

    if (remaining <= 0) {
        state = "limit";
        text = "You have reached the " + formatNumber(maxCharacters) +
            "-character limit. You can still edit or shorten your message.";
    } else if (remaining <= WARNING_THRESHOLD) {
        state = "warning";
        text = "Only " + formatNumber(remaining) + " " + unit +
            " left. You are close to the " + formatNumber(maxCharacters) + "-character limit.";
    }

    charCount.textContent = text;
    charCount.classList.toggle("is-warning", state === "warning");
    charCount.classList.toggle("is-limit", state === "limit");

    // only when the state changes
    if (state !== lastCountState) {
        charStatus.textContent = state === "normal" ? "" : text;
        lastCountState = state;
    }
}

commentsInput.addEventListener("input", updateCharCount);
updateCharCount();
