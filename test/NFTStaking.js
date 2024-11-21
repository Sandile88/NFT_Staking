const { ethers } = require ("hardhat");
const { expect } = require("chai");


describe ("NFTStaking", function () {
    let nftStaking, owner, nft, zToken;

    beforeEach(async () =>  {
        try {
            [owner] = await ethers.getSigners();

            const MockNFT = await ethers.getContractFactory('MockNFT');
            nft = await MockNFT.deploy();
            await nft.waitForDeployment();


            const ZAR = await ethers.getContractFactory('ZAR');
            zToken = await ZAR.deploy();
            await zToken.waitForDeployment();
            // await zToken.transferOwnership(owner.address);



            const NFTStaking = await ethers.getContractFactory('NFTStaking');
            nftStaking = await NFTStaking.deploy(nft.getAddress(), zToken.getAddress());
            await nftStaking.waitForDeployment();

            await zToken.setStakingContract(nftStaking.getAddress());


        } catch (error) {
            console.error("Failed: ", error);
            throw error;

        }

    });


    describe("Staking", function () {
        beforeEach(async () => {         
            const tokenId = 1;
            await nft.mint(owner.getAddress(), tokenId);
        });


        it("Should set the right owner", async function () {
            expect(await nftStaking.owner()).to.equal(owner.address);
          });


        it("Total stake should start as zero", async function () {
            expect(await nftStaking.totalStaked()).to.equal(0);
        });


        it("Can stake a one NFT", async function () {
            const tokenId = 1;
            await nft.approve(nftStaking.getAddress(), tokenId);
            await nftStaking.stake([tokenId]);
            expect(await nftStaking.totalStaked()).to.equal(1);
            
        });
    });


    describe("Unstaking", function () {
        it("Total stake should decrease correctly", async function () {
            expect(await nftStaking.totalStaked()).to.equal(0);
        });


        it("Can unstake multiple NFTs", async function () {
            const tokenIdsToStake = [0, 1, 2, 3, 4]; 
            const tokenIdsToUnstake = [2, 4];
            for(const tokenId of tokenIdsToStake) {
                await nft.mint(owner.getAddress(), tokenId);
                await nft.approve(nftStaking.getAddress(), tokenId);
            }
            await nftStaking.stake(tokenIdsToStake);
            expect(await nftStaking.totalStaked()).to.equal(tokenIdsToStake.length);

            await nftStaking.unstake(tokenIdsToUnstake);
            expect(await nftStaking.totalStaked()).to.equal(tokenIdsToStake.length - tokenIdsToUnstake.length);



      
        });
    });
})