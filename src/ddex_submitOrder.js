let ethereumjsutil = require("ethereumjs-util");
let hashPersonalMessage = ethereumjsutil.hashPersonalMessage;
let ecsign = ethereumjsutil.ecsign;
let toRpcSig = ethereumjsutil.toRpcSig;
let toBuffer = ethereumjsutil.toBuffer;
let privateToAddress = ethereumjsutil.privateToAddress;

async function post(data, options) {
    let https = require('https');
    let result = "";
    return new Promise(function (resolve, reject) {
        let req = https.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                result += chunk;
            });
            res.on('end', function () {
                resolve(result);
            });
        });
        req.on('error', (e) => {
            reject(e);
        });

        let json = JSON.stringify(data);
        req.write(json);
        req.end();
    });
}

/**
 *
 * @param privateKey
 * @param amount
 * @param price
 * @param side
 * @param marketId
 * @returns {Promise<string>}
 */
async function submitDdexOrder(privateKey,amount,price,side,marketId) {
    try{
        let message = "HYDRO-AUTHENTICATION@" + new Date().getTime();
        let address = "0x" + privateToAddress(privateKey).toString("hex");
        let shaAuth = hashPersonalMessage(toBuffer(message))
        let ecdsaSignatureAuth = ecsign(shaAuth, toBuffer(privateKey))
        let signatureAuth = toRpcSig(ecdsaSignatureAuth.v, ecdsaSignatureAuth.r, ecdsaSignatureAuth.s)
        let ddexSignature = address + '#' + message + '#' + signatureAuth
        let buildOptions = {
            host: 'api.ddex.io',
            port: 443,
            path: '/v2/orders/build',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Hydro-Authentication': ddexSignature
            }
        };
        let buildData = {
            amount: amount,
            price: price,
            side: side,
            marketId: marketId
        };
        let orderResult = await post(buildData, buildOptions);
        let orderJson = JSON.parse(orderResult);
        if (orderResult && orderJson.status === 0) {
            //给我未签名的订单签名
            let unsignOrder = orderJson.data.order;
            let orderId = unsignOrder.id;
            let shaOrder = hashPersonalMessage(toBuffer(orderId));
            let ecdsaSignatureOrder = ecsign(shaOrder, toBuffer(privateKey));
            let signatureOrder = toRpcSig(ecdsaSignatureOrder.v, ecdsaSignatureOrder.r, ecdsaSignatureOrder.s);

            //提交订单的请求地址
            let orderOptions = {
                host: 'api.ddex.io',
                port: 443,
                path: '/v2/orders',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Hydro-Authentication': ddexSignature
                }
            };
            let orderReq = {
                orderId: orderId,
                signature: signatureOrder
            };
            let placeOrderResult = await post(orderReq, orderOptions);
            let placeOrderJson = JSON.parse(placeOrderResult);
            if(placeOrderResult && placeOrderJson.status === 0){
                return orderId;
            }else{
                throw new Error(placeOrderResult);
            }
        } else {
            throw new Error(orderResult);
        }
    }catch (e){
        throw e;
    }
    return "";
}

module.exports = {
    submitDdexOrder
}
