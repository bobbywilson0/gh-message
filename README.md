# Mailbeam

The original idea started with this tweet from @puffnfresh (https://twitter.com/puffnfresh/status/628924036475711488).

Mailbeam is a little client-side application that allows you to send encrypted
messages to any GitHub user that has an RSA public key associated with their username.

The software is at a very early stage and I think there is a lot that can be done to improve user experience.

## How it works

*Sending*

1. End-user enters a github username, clear text message into form, and clicks submit.
2. Public keys come back from GitHub for username in question
3. 32-bit token is generated
4. aes-256-cbc cipher encrypts plain text message with token as password
5. Token is encrypted with receiving user's public keys
6. Encrypted message and encrypted token are returned

*Receiving*

Run this command

```bash
    openssl enc -d -a -nosalt -aes-256-cbc -in ~/Downloads/message.txt -k \
    $(openssl enc -d -A -base64 -in ~/Downloads/key.txt | \
    openssl rsautl -decrypt -oaep -inkey ~/.ssh/id_rsa)
```

1. Decrypt RSA encrypted token with private key
2. Use the decrypted token as the password to decrypt the message
3. Read clear text message


## Upcoming Features

1. Option to persist encrytped messages.
2. API for allowing other clients to create / send messages.
3. Construct and send email though smtp mail server.

## Challenges

1. A big challenge right now is streamlining the UX enough to where it doesn't feel cumbersome. Right now it feels
cumbersome.
2. Security: audits, best-practices, integrity. I don't claim to be a security expert, so don't hesitate to be critical
of my decisions.
3. Adoption, I am not a well known name in the tech community, but I do think this project has potential to be a useful
tool in sending encrypted messages to fellow GitHub users.

## Dream

I think the best experience for this app is like the original tweet stated, a quick easy way to send encrypted messages
to other GitHub users. Ideally I think if you have a good client for sending and receiving there doesn't have to be any
running complicated commands in your terminal. Ideally you can save the location of your private key and sending and
receiving becomes trivial.