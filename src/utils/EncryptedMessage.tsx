import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

export function encryptMessage(plainTextMessage: string, receiverPublicKeyBase64: string) {
    const messageUint8 = naclUtil.decodeUTF8(plainTextMessage); // message ko bytes mein convert
    const receiverPublicKey = naclUtil.decodeBase64(receiverPublicKeyBase64); // receiver ka public key

    const nonce = nacl.randomBytes(nacl.box.nonceLength); // random nonce
    const senderEphemeralKeyPair = nacl.box.keyPair(); // sender ka temporary key pair

    const encrypted = nacl.box(messageUint8, nonce, receiverPublicKey, senderEphemeralKeyPair.secretKey);

    return JSON.stringify({
        ciphertext: naclUtil.encodeBase64(encrypted),
        nonce: naclUtil.encodeBase64(nonce),
        senderPublicKey: naclUtil.encodeBase64(senderEphemeralKeyPair.publicKey),
    });
}


export function decryptMessage(
    encryptedMessageJson: string,
    decryptedPrivateKey: Uint8Array // Changed from password to decrypted key
): string | null {
    try {
        const { ciphertext, nonce, senderPublicKey } = JSON.parse(encryptedMessageJson);

        // No need to decrypt private key again - we already have it decrypted
        const privateKeyUint8 = decryptedPrivateKey;
        const nonceUint8 = naclUtil.decodeBase64(nonce);
        const ciphertextUint8 = naclUtil.decodeBase64(ciphertext);
        const senderPublicKeyUint8 = naclUtil.decodeBase64(senderPublicKey);

        const decrypted = nacl.box.open(
            ciphertextUint8,
            nonceUint8,
            senderPublicKeyUint8,
            privateKeyUint8
        );

        return decrypted ? naclUtil.encodeUTF8(decrypted) : null;
    } catch (err) {
        console.error("❌ Decryption failed:", err);
        return null;
    }
}