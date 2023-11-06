var crypto = require('crypto');

const cipher = crypto.createCipher('aes192', 'a password');
var encrypted = cipher.update('sakthi', 'utf8', 'hex');
encrypted += cipher.final('hex');
console.log(encrypted);  //1757a4a08f89b22cf6f49e4f24624e1b

const decipher = crypto.createDecipher('aes192', 'a password');
var encrypted = '1757a4a08f89b22cf6f49e4f24624e1b';
var decrypted = decipher.update(encrypted, 'hex', 'utf8');
decrypted += decipher.final('utf8');
console.log(decrypted);


