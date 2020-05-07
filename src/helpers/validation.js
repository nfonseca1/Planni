var inputs = {}

var validation = {
    firstname: () => {
        if ((new RegExp(/^[\sa-zA-Z.,'-]{2,}$/)).test(inputs.firstname)) return "";
        if (inputs.firstname.length < 2) return "Name must be at least 2 characters";
        else return "Name cannot consist of numbers or special characters";
    },
    lastname: () => {
        if ((new RegExp(/^[\sa-zA-Z.,'-]{2,}$/)).test(inputs.lastname)) return "";
        if (inputs.lastname.length < 2) return "Name must be at least 2 characters";
        else return "Name cannot consist of numbers or special characters";
    },
    email: () => {
        if ((new RegExp(/^([\S]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/)).test(inputs.email)) return "";
        if (inputs.email.length === 0) return "Email is required";
        else return "Email is not properly formatted";
    },
    username: () => {
        if ((new RegExp(/^[a-zA-Z0-9\-_!?+#$%&*]{4,30}$/)).test(inputs.username)) return "";
        if (inputs.username === "") return "";
        else if (inputs.username.length < 4) return "Username must be at least 4 characters";
        else if (inputs.username.length > 30) return "Username cannot be greater than 30 characters";
        else return "Username can only contain letters, numbers and certain special characters: -_!?+#$%&*";
    },
    password: () => {
        if ((new RegExp(/^[\S]{7,35}$/)).test(inputs.password)) return "";
        if (inputs.password.length < 7) return "Password must be at least 7 characters";
        else if (inputs.password.length > 35) return "Password cannot be greater than 35 characters";
        else return "Password cannot contain whitespace";
    },
    confirmPassword: () => {
        if (inputs.confirmPassword === inputs.password) return "";
        else return "Passwords must match";
    }
}

function validateAll(fields){
    var obj = {};
    for (var i in validation){
        inputs[i] = fields[i];
        obj[i + "Msg"] = validation[i]();
    }
    return obj;
}

function validate(input){
    if (validation[input.name].regex.test(input.value) === false){
        return validation[input.name].validate(input.value);
    }
    else return "";
}

export default validateAll;