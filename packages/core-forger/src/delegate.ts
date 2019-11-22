import { Utils as AppUtils } from "@arkecosystem/core-kernel";
import { Blocks, Crypto, Identities, Interfaces, Types, Utils } from "@arkecosystem/crypto";
import forge from "node-forge";
import wif from "wif";

// todo: review the implementation - quite messy right now
export class Delegate {
    public static encryptPassphrase(passphrase: string, network: Types.NetworkType, password: string): string {
        const keys = Identities.Keys.fromPassphrase(passphrase);
        const decoded = wif.decode(Identities.WIF.fromKeys(keys, network), network.wif);

        return Crypto.bip38.encrypt(decoded.privateKey, decoded.compressed, password);
    }

    public static decryptPassphrase(
        passphrase: string,
        network: Types.NetworkType,
        password: string,
    ): Interfaces.IKeyPair {
        const decryptedWif: Interfaces.IDecryptResult = Crypto.bip38.decrypt(passphrase, password);
        const wifKey: string = wif.encode(network.wif, decryptedWif.privateKey, decryptedWif.compressed);

        return Identities.Keys.fromWIF(wifKey, network);
    }

    public network: Types.NetworkType;
    public keySize: number;
    public iterations: number;

    public keys: Interfaces.IKeyPair | undefined;
    public publicKey: string | undefined;
    public address: string | undefined;

    public otpSecret: string | undefined;
    public bip38: boolean = false;
    public otp: string | undefined;
    public encryptedKeys: string | undefined;

    constructor(passphrase: string, network: Types.NetworkType, password?: string) {
        this.network = network;
        this.keySize = 32; // AES-256
        this.iterations = 5000;

        if (Crypto.bip38.verify(passphrase)) {
            AppUtils.assert.defined<string>(password);

            this.keys = Delegate.decryptPassphrase(passphrase, network, password);
            this.publicKey = this.keys.publicKey;
            this.address = Identities.Address.fromPublicKey(this.keys.publicKey, network.pubKeyHash);
            this.otpSecret = forge.random.getBytesSync(128);
            this.bip38 = true;

            this.encryptKeysWithOtp();
        } else {
            this.keys = Identities.Keys.fromPassphrase(passphrase);
            this.publicKey = this.keys.publicKey;
            this.address = Identities.Address.fromPublicKey(this.publicKey, network.pubKeyHash);
        }
    }

    public encryptKeysWithOtp(): void {
        AppUtils.assert.defined<Interfaces.IKeyPair>(this.keys);

        const wifKey: string = Identities.WIF.fromKeys(this.keys, this.network);

        this.keys = undefined;
        this.otp = forge.random.getBytesSync(16);
        this.encryptedKeys = this.encryptDataWithOtp(wifKey, this.otp);
    }

    public decryptKeysWithOtp(): void {
        AppUtils.assert.defined<string>(this.encryptedKeys);
        AppUtils.assert.defined<string>(this.otp);

        const wifKey: string = this.decryptDataWithOtp(this.encryptedKeys, this.otp);

        this.keys = Identities.Keys.fromWIF(wifKey, this.network);
        this.otp = undefined;
        this.encryptedKeys = undefined;
    }

    // @todo: reduce nesting
    public forge(
        transactions: Interfaces.ITransactionData[],
        options: Record<string, any>,
    ): Interfaces.IBlock | undefined {
        if (!options.version && (this.encryptedKeys || !this.bip38)) {
            const transactionData: { amount: Utils.BigNumber; fee: Utils.BigNumber } = {
                amount: Utils.BigNumber.ZERO,
                fee: Utils.BigNumber.ZERO,
            };

            const payloadBuffers: Buffer[] = [];
            for (const transaction of transactions) {
                AppUtils.assert.defined<string>(transaction.id);

                transactionData.amount = transactionData.amount.plus(transaction.amount);
                transactionData.fee = transactionData.fee.plus(transaction.fee);

                payloadBuffers.push(Buffer.from(transaction.id, "hex"));
            }

            if (this.bip38) {
                this.decryptKeysWithOtp();
            }

            AppUtils.assert.defined<Interfaces.IKeyPair>(this.keys);

            const block: Interfaces.IBlock | undefined = Blocks.BlockFactory.make(
                {
                    version: 0,
                    generatorPublicKey: this.publicKey,
                    timestamp: options.timestamp,
                    previousBlock: options.previousBlock.id,
                    previousBlockHex: options.previousBlock.idHex,
                    height: options.previousBlock.height + 1,
                    numberOfTransactions: transactions.length,
                    totalAmount: transactionData.amount,
                    totalFee: transactionData.fee,
                    reward: options.reward,
                    payloadLength: 32 * transactions.length,
                    payloadHash: Crypto.HashAlgorithms.sha256(payloadBuffers).toString("hex"),
                    transactions,
                },
                this.keys,
            );

            AppUtils.assert.defined<Interfaces.IBlock>(block);

            if (this.bip38) {
                this.encryptKeysWithOtp();
            }

            return block;
        }

        return undefined;
    }

    private encryptDataWithOtp(content: string, password: string): string {
        AppUtils.assert.defined<string>(this.otpSecret);

        const cipher: forge.cipher.BlockCipher = forge.cipher.createCipher(
            "AES-CBC",
            forge.pkcs5.pbkdf2(password, this.otpSecret, this.iterations, this.keySize),
        );
        cipher.start({ iv: this.otp });
        cipher.update(forge.util.createBuffer(content));
        cipher.finish();

        return forge.util.encode64(cipher.output.getBytes());
    }

    private decryptDataWithOtp(cipherText: string, password: string): string {
        AppUtils.assert.defined<string>(this.otpSecret);

        const decipher: forge.cipher.BlockCipher = forge.cipher.createDecipher(
            "AES-CBC",
            forge.pkcs5.pbkdf2(password, this.otpSecret, this.iterations, this.keySize),
        );
        decipher.start({ iv: this.otp });
        decipher.update(forge.util.createBuffer(forge.util.decode64(cipherText)));
        decipher.finish();

        return decipher.output.toString();
    }
}
