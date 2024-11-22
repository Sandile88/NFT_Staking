const { ethers } = require ("hardhat");
const { expect } = require("chai");


describe ("NFTStaking", function () {
    let nftStaking, owner, otherUser, nft, zToken;

    beforeEach(async () =>  {
        try {
            [owner, otherUser] = await ethers.getSigners();

            const MockNFT = await ethers.getContractFactory('MockNFT');
            nft = await MockNFT.deploy();
            await nft.waitForDeployment();


            const ZAR = await ethers.getContractFactory('ZAR');
            zToken = await ZAR.deploy();
            await zToken.waitForDeployment();


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
        it("Can't unstake NFTs that aren't staked", async function () {
            const tokenIdsToStake = [0, 1, 2, 3, 4]; 
            const tokenIdsNotStaked = [5, 6];

    

            for(const tokenId of tokenIdsToStake) {
                await nft.mint(owner.getAddress(), tokenId);
                await nft.approve(nftStaking.getAddress(), tokenId);
            }
            await nftStaking.stake(tokenIdsToStake);
            expect(await nftStaking.totalStaked()).to.equal(tokenIdsToStake.length);

            expect(nftStaking.unstake(tokenIdsNotStaked)).to.be.revertedWith("not an owner");
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


        it("NFTs should return to owner", async function () {
            const tokenId = 1;
            await nft.mint(owner.getAddress(), 1);
            await nft.approve(nftStaking.getAddress(), tokenId);
            await nftStaking.stake([tokenId]);
            await nftStaking.unstake([tokenId]);

            const checkOwner = await nft.ownerOf(tokenId)
            expect(checkOwner).to.be.equal(owner.address);  
        })
    });


    describe("Rewards", function () {
        it("Rewards in a day", async function () {
            await nft.mint(owner.getAddress(), 1);
            await nft.connect(owner).approve(nftStaking.getAddress(), 1);
            await nftStaking.connect(owner).stake([1]);

            await network.provider.send("evm_increaseTime", [86400]);
            await network.provider.send("evm_mine");

            await nftStaking.connect(owner).claim([1]);

            const earnedReward = await nftStaking.earningInfo(owner.getAddress(), [1]);
            expect(earnedReward[0]).to.be.gte(0);            
        });


        it("Should return correct values in earningInfo", async function () {
            await nft.mint(owner.getAddress(), 1);
            await nft.connect(owner).approve(nftStaking.getAddress(), 1);
            await nftStaking.connect(owner).stake([1]);
    
            await network.provider.send("evm_increaseTime", [86400]);
            await network.provider.send("evm_mine");
    
            const reward = await nftStaking.earningInfo(owner.getAddress(), [1]);
            expect(reward[0]).to.be.gte(0);
        });

        it("Should reset the timestamp after claiming reward", async function () {
            await nft.mint(owner.getAddress(), 1);
            await nft.connect(owner).approve(nftStaking.getAddress(), 1);
            await nftStaking.connect(owner).stake([1]);
    
            await network.provider.send("evm_increaseTime", [86400]);
            await network.provider.send("evm_mine");

            await nftStaking.connect(owner).claim([1]);

            const earnedRewardAfterClaim = await nftStaking.earningInfo(owner.getAddress(), [1]);
            expect(earnedRewardAfterClaim[0]).to.equal(0);
        });
    });

    describe("Claiming", function () {
        it("Should not allow claiming rewards for NFTs you don't own", async function () {

            await nft.mint(owner.getAddress(), 1);
            await nft.connect(owner).approve(nftStaking.getAddress(), 1);
            await nftStaking.connect(owner).stake([1]);

            await network.provider.send("evm_increaseTime", [86400]);
            await network.provider.send("evm_mine");

            await expect(nftStaking.connect(otherUser).claim([1])).to.be.revertedWith("not an owner");

            await expect(nftStaking.connect(owner).claim([1])).to.not.be.reverted;
        })
    })


    describe("Different edge cases", function ()  {
        let tokenId;

        beforeEach(async () => {
            tokenId = 1;

            await nft.mint(owner.getAddress(), tokenId);
            await nft.approve(nftStaking.getAddress(), tokenId);
            await nftStaking.stake([tokenId]);
        });


        it("Should not double stake", async function () {
            await expect(nftStaking.stake([tokenId])).to.be.revertedWith("not your token");
        })

        it("Only owner has access", async function () {
            expect(nftStaking.connect(otherUser).claim([1])).to.be.rejectedWith("not an owner");
            expect(nftStaking.connect(owner).claim([1])).to.not.be.reverted;
        })

    })
});
