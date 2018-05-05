var Zerojs = require("0x.js");
var HDWalletProvider = require("truffle-hdwallet-provider");
var connnect = require("@0xproject/connect");
var HttpClient = connnect.HttpClient;
var ZeroEx = Zerojs.ZeroEx;
var BigNumber = require("@0xproject/utils").BigNumber;

/**
 * fillOrder
 * @param mnemonic wallet mnemonic
 * @param clientUrl geth client node
 * @param relayerApiUrl relayerApiUrl eg:https://api.radarrelay.com/0x/v0/
 * @param baseTokenAddress the token you have
 * @param quoteTokenAddress the token address you want to transfer
 * @param fillOrderAmount how much base token you want to fill
 * @returns {Promise<string>}
 */
async function fillOrder(mnemonic, clientUrl, relayerApiUrl, baseTokenAddress, quoteTokenAddress, networkId,fillOrderAmount) {
    return new Promise(async function (resolve, reject) {
        try {
            let provider = new HDWalletProvider(mnemonic, clientUrl);
            let configs = {
                networkId: networkId,
            };
            let zeroEx = new ZeroEx(provider, configs);
            let accounts = await zeroEx.getAvailableAddressesAsync();
            let makerAddress = accounts[0];
            let relayerClient = new HttpClient(relayerApiUrl);
            let DECIMALS = 18;
            let orderbookRequest = {
                baseTokenAddress: baseTokenAddress,
                quoteTokenAddress: quoteTokenAddress
            };
            let orderbookResponse = await relayerClient.getOrderbookAsync(orderbookRequest);
            let sortedBids = orderbookResponse.bids.sort((orderA, orderB) => {
                const orderRateA = new BigNumber(orderA.takerTokenAmount).div(new BigNumber(orderA.makerTokenAmount));
                const orderRateB = new BigNumber(orderB.takerTokenAmount).div(new BigNumber(orderB.makerTokenAmount));
                return orderRateB.comparedTo(orderRateA);
            });
            let foa = ZeroEx.toBaseUnitAmount(new BigNumber(fillOrderAmount), DECIMALS);
            let bidToFill = sortedBids[sortedBids.length - 1];
            let fillTxHash = await zeroEx.exchange.fillOrderAsync(bidToFill, foa, true, makerAddress);
            let result = await zeroEx.awaitTransactionMinedAsync(fillTxHash, 1000, 1800000);
            if (result.logs) {
                await zeroEx.exchange.throwLogErrorsAsErrors(result.logs);
            }
            resolve(fillTxHash);
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * ETH WETH 1:1
 * @param mnemonic wallet mnemonic
 * @param wethTokenAddress the addres of weth
 * @param ethAmount how much eth you want to exchange
 * @returns {Promise<string>}
 */
async function exchangeWETH(mnemonic, clientUrl, wethTokenAddress, ethAmount, networkId) {
    return new Promise(async function (resolve, reject) {
        try {
            let provider = new HDWalletProvider(mnemonic, clientUrl);
            let configs = {
                networkId: networkId,
            };
            let zeroEx = new ZeroEx(provider, configs);
            let DECIMALS = 18;
            //ETH WETH
            let accounts = await zeroEx.getAvailableAddressesAsync();
            let makerAddress = accounts[0];

            const ethToConvert = ZeroEx.toBaseUnitAmount(new BigNumber(ethAmount), DECIMALS);
            let depositTxHash = await zeroEx.etherToken.depositAsync(wethTokenAddress, ethToConvert, makerAddress);
            let result = await zeroEx.awaitTransactionMinedAsync(depositTxHash, 1000, 1800000);
            if (result.logs) {
                await zeroEx.exchange.throwLogErrorsAsErrors(result.logs);
            }
            resolve(depositTxHash);
        } catch (e) {
            reject(e);
        }
    });
}


module.exports = {
    fillOrder,
    exchangeWETH
}