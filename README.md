# 0x_exchange
This is a 0x protocol tool that allows you to quickly finish the fill Order,submitOrder.

install 
```
npm i 0x_exchange --save
```
ETH exchange WETH

```
let mnemonic = "xxx xxx xxx xxx xxx";
let wethContractAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
let relayerApiUrl = "https://api.radarrelay.com/0x/v0/";
let WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
let DAI_ADDRESS = "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359";
let clientUrl = "https://mainnet.infura.io/yXDUNwlNOcx0UJCWjzNr";

async function test(){
    try{
        let dtx = await require("0x_exchange").echangeWETH(mnemonic,clientUrl,wethContractAddress,"0.001",1);
        console.info(dtx);
    }catch (e){
        console.error(e);
    }
}

```

fillOrder

```
let mnemonic = "xxx xxx xxx xxx xxx";
let wethContractAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
let relayerApiUrl = "https://api.radarrelay.com/0x/v0/";
let WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
let DAI_ADDRESS = "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359";
let clientUrl = "https://mainnet.infura.io/yXDUNwlNOcx0UJCWjzNr";

async function test(){
    try{
        let fillOrderAmount = "0.005";
        let net = 1;
        let dtx = await require("0x_exchange").fillOrder(mnemonic,clientUrl,relayerApiUrl,WETH_ADDRESS,DAI_ADDRESS,net,fillOrderAmount);
        console.info(dtx);
    }catch (e){
        console.error(e);
    }
}

```

submitOrder

```
let mnemonic = "xxx xxx xxx xxx xxx";
let wethContractAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
let relayerApiUrl = "https://api.radarrelay.com/0x/v0/";
let WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
let DAI_ADDRESS = "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359";
let clientUrl = "https://mainnet.infura.io/yXDUNwlNOcx0UJCWjzNr";

async function test(){
    try{
        let fillOrderAmount = "0.005";
        let net = 1;
        let dtx = await require("0x_exchange").fillOrder(mnemonic,clientUrl,relayerApiUrl,WETH_ADDRESS,DAI_ADDRESS,net,fillOrderAmount);
        console.info(dtx);
    }catch (e){
        console.error(e);
    }
}

```


