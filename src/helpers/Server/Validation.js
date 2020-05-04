module.exports = {
    ValidateRegistration: function (inputs){
        var regex = [new RegExp(/^[\sa-zA-Z.,'-]{2,}$/),
            new RegExp(/^[\sa-zA-Z.,'-]{2,}$/),
            new RegExp(/^([\S]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/),
            new RegExp(/^[a-zA-Z0-9\-_!?+#$%&*]{4,30}$/),
            new RegExp(/^[\S]{7,35}$/),
        ];
        var noErrors = true;

        if (!regex[0].test(inputs.firstname)){
            noErrors = false;
        }
        if (!regex[1].test(inputs.lastname)){
            noErrors = false;
        }
        if (!regex[2].test(inputs.email)){
            noErrors = false;
        }
        if (!regex[3].test(inputs.username) && inputs.username != ""){
            noErrors = false;
        }
        if (!regex[4].test(inputs.password)) {
            noErrors = false;
        }
        if (noErrors) return true;
        else return false;
    },

    FormatRegistration: function (inputs){
        var reformattedBody = inputs;
        var firstname = reformattedBody.firstname.trim().toLowerCase();
        var lastname = reformattedBody.lastname.trim().toLowerCase();
        reformattedBody.firstname = firstname.charAt(0).toUpperCase() + firstname.slice(1);
        reformattedBody.lastname = lastname.charAt(0).toUpperCase() + lastname.slice(1);
        reformattedBody.email = reformattedBody.email.trim();
        if (reformattedBody.username == "") reformattedBody.username = null;

        return reformattedBody;
    }
};
