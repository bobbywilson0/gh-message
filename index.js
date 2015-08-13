var sshKeyToPEM = require('ssh-key-to-pem');
$ = require('jquery');
var crypto = require('crypto');
require('typeahead.js');
var NodeRSA = require('node-rsa');
var Bloodhound = require("typeahead.js/dist/bloodhound");
var Handlebars = require('handlebars');

$(function() {
    var users = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        identify: function(obj) { return obj.id; },
        remote: {
            url: 'https://api.github.com/search/users?q=%QUERY',
            filter: function(results) {
                return results["items"];
            },
            wildcard: '%QUERY'
        }
    });

    $('.typeahead').typeahead(null, {
        name: 'login',
        display: 'login',
        source: users
    });

    function randomValueHex (len) {
        return crypto.randomBytes(Math.ceil(len/2))
            .toString('hex')
            .slice(0,len);
    }

    $('#username').on("change", function() {
        $('.output').html('');
        if($(this).val()) {
            $.getJSON("https://api.github.com/users/" + $(this).val() + "/keys", function(body) {
                var keys = body.map(function (obj) {
                    return obj.key
                }).filter(function (key) {
                    return /^ssh-rsa\b/.test(key);
                });

                if(keys.length === 0) {
                    $('.col-lg-8').prepend("<p class='alert alert-danger'>The user you are trying to message doesn't have any RSA keys.</p>");
                }

                var tokenEncryptedMessages = keys.map(function(pubkey) {
                    var key = new NodeRSA(sshKeyToPEM(pubkey), 'pkcs8-public-pem');
                    var token = randomValueHex(32);
                    var encryptedToken = key.encrypt(token, 'base64');

                    return {token: token, encrypted: encryptedToken};
                });

                $('#execute').on("click", function() {
                    var algorithm = 'aes-256-cbc';
                    var input = $('#input').val();

                    var messages = tokenEncryptedMessages.map(function(tokens) {
                        var cipher = crypto.createCipher(algorithm, tokens.token);
                        var crypted = cipher.update(input,'utf8','base64');
                        crypted += cipher.final('base64');
                        return {message: crypted, downloadMessage: encodeURI(crypted + "\n"), key: tokens.encrypted}
                    });

                    var source = $("#result").html();
                    var template = Handlebars.compile(source);
                    var html = template(messages);
                    $('.output').html(html);
                })

            });
        }
    });
});