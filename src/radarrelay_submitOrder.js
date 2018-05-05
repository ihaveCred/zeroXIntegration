var Zerojs = require("0x.js");
var HDWalletProvider = require("truffle-hdwallet-provider");
var connnect = require("@0xproject/connect");
var HttpClient = connnect.HttpClient;
var ZeroEx = Zerojs.ZeroEx;
var BigNumber = require("@0xproject/utils").BigNumber;

/**
 *
 * @param mnemonic wallet mnemonic
 * @param clientUrl geth client node
 * @param relayerApiUrl relayerApiUrl eg:https://api.radarrelay.com/0x/v0/
 * @param makerTokenAddress the token you have
 * @param takerTokenAddress the token address you want to buy
 * @param makerTokenAmount how much token you want to sell
 * @param takerTokenAmount how much token you want to buy
 * @param unixExpireTime ExpireTime unix timestamps
 * @returns {Promise<string>}
 */
async function submitOrder(mnemonic, clientUrl, relayerApiUrl, makerTokenAddress, takerTokenAddress, makerTokenAmount, takerTokenAmount, unixExpireTime, networkId) {
    return new Promise(async function (resolve, reject) {
        try {
            let provider = new HDWalletProvider(mnemonic, clientUrl);
            let configs = {
                networkId: networkId,
            };
            let zeroEx = new ZeroEx(provider, configs);
            let relayerClient = new HttpClient(relayerApiUrl);
            let EXCHANGE_ADDRESS = await zeroEx.exchange.getContractAddress();
            let DECIMALS = 18;
            let addresses = await zeroEx.getAvailableAddressesAsync();
            let ownerAddress = addresses[0];
            let mta = ZeroEx.toBaseUnitAmount(new BigNumber(makerTokenAmount), DECIMALS);
            let tta = ZeroEx.toBaseUnitAmount(new BigNumber(takerTokenAmount), DECIMALS);
            const feesRequest = {
                exchangeContractAddress: EXCHANGE_ADDRESS,
                maker: ownerAddress,
                taker: ZeroEx.NULL_ADDRESS,
                makerTokenAddress: makerTokenAddress,
                takerTokenAddress: takerTokenAddress,
                makerTokenAmount:mta,
                takerTokenAmount:tta,
                expirationUnixTimestampSec: new BigNumber(unixExpireTime),
                salt: ZeroEx.generatePseudoRandomSalt(),
            };
            let feesResponse = await relayerClient.getFeesAsync(feesRequest);
            let order = {
                ...feesRequest,
                ...feesResponse,
            };
            let orderHash = ZeroEx.getOrderHashHex(order);
            let ecSignature = await zeroEx.signOrderHashAsync(orderHash, ownerAddress, false);
            let signedOrder = {
                ...order,
                ecSignature,
            };
            await relayerClient.submitOrderAsync(signedOrder);
            resolve(orderHash);
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = {
    submitOrder
}