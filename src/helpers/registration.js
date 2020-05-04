var inputs = document.querySelectorAll("#registerForm input");
// If javascript is enabled, validation is all done with javascript
inputs.forEach(function(item){
    item.removeAttribute("required");
    item.removeAttribute("pattern");
})

var registerBtn = document.querySelector("#registerBtn");
registerBtn.setAttribute("type", "button");

var form = document.querySelector("#registerForm");
var firstnameMsg = document.querySelector("#firstnameMsg");
var lastnameMsg = document.querySelector("#lastnameMsg");
var emailMsg = document.querySelector("#emailMsg");
var usernameMsg = document.querySelector("#usernameMsg");
var passwordMsg = document.querySelector("#passwordMsg");
var confirmPasswordMsg = document.querySelector("#confirmPasswordMsg");

registerBtn.addEventListener("click", Validate);

function Validate(){

    ResetErrorMessages();

    var firstname = document.querySelector("#firstname");
    var lastname = document.querySelector("#lastname");
    var email = document.querySelector("#email");
    var username = document.querySelector("#username");
    var password = document.querySelector("#password");
    var confirmPassword = document.querySelector("#confirmPassword");

    var regex = [new RegExp(/^[\sa-zA-Z.,'-]{2,}$/),
        new RegExp(/^[\sa-zA-Z.,'-]{2,}$/),
        new RegExp(/^([\S]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/),
        new RegExp(/^[a-zA-Z0-9\-_!?+#$%&*]{4,30}$/),
        new RegExp(/^[\S]{7,35}$/),
    ];
    var noErrors = true;

    if (!regex[0].test(firstname.value)){
        if (firstname.value.length < 2) firstnameMsg.textContent = "Name must be at least 2 characters";
        else firstnameMsg.textContent = "Name cannot consist of numbers or special characters"
        noErrors = false;
    }
    if (!regex[1].test(lastname.value)){
        if (lastname.value.length < 2) lastnameMsg.textContent = "Name must be at least 2 characters";
        else lastnameMsg.textContent = "Name cannot consist of numbers or special characters";
        noErrors = false;
    }
    if (!regex[2].test(email.value)){
        if (email.value.length == 0) emailMsg.textContent = "Email is required";
        else emailMsg.textContent = "Email is not properly formatted";
        noErrors = false;
    }
    if (!regex[3].test(username.value) && username.value != ""){
        if (username.value.length < 4) usernameMsg.textContent = "Username must be at least 4 characters";
        else if (username.value.length > 30) usernameMsg.textContent = "Username cannot be greater than 30 characters";
        else usernameMsg.textContent = "Username can only contain letters, numbers and certain special characters: -_!?+#$%&*";
        noErrors = false;
    }
    if (!regex[4].test(password.value)) {
        if (password.value.length < 7) passwordMsg.textContent = "Password must be at least 7 characters";
        else if (password.value.length > 35) passwordMsg.textContent = "Password cannot be greater than 35 characters";
        else passwordMsg.textContent = "Password cannot contain whitespace";
        noErrors = false;
    }
    if (confirmPassword.value != password.value) {
        confirmPasswordMsg.textContent = "Passwords do not match";
        noErrors = false;
    }
    if (noErrors) {
        form.submit();
    }
};

function ResetErrorMessages(){
    firstnameMsg.textContent = "";
    lastnameMsg.textContent = "";
    emailMsg.textContent = "";
    usernameMsg.textContent = "";
    passwordMsg.textContent = "";
    confirmPasswordMsg.textContent = "";
}