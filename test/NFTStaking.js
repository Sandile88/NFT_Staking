const { ethers } = require ("hardhat");

describe ("NFTStaking", function () {
    let nftStaking, owner;

    beforeEach(async () =>  {
        try {
            [owner] = await ethers.getSigners();
            const NFTStaking = await ethers.getContractFactory('NFTStaking');
            const nft = 
            const token = 

            nftStaking = await NFTStaking.deploy(nft, token);
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