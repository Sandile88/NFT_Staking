const { ethers } = require ("hardhat");

describe ("NFTStaking", function () {
    let nftStaking, owner, nft, zToken;

    beforeEach(async () =>  {
        try {
            [owner] = await ethers.getSigners();
            // const nft = 


            const ZAR = await ethers.getContractFactory('ZAR');
            zToken = await ZAR.deploy();
            await zToken.waitForDeployment();


            const NFTStaking = await ethers.getContractFactory('NFTStaking');
            nftStaking = await NFTStaking.deploy(nft, Ztoken);
            await nftStaking.waitForDeployment();

        } catch (error) {
            console.error("Failed: ", error);
            throw error;

        }

    });


    describe("Staking", function () {
        it("Total stake should start as zero", async function () {

    });

        
    })





})