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
    });

    // describe("Claiming", function () {
    //     it("Can claim rewards without unstaking", async function () {

    //         await nft.mint(owner.getAddress(), 1);
    //         await nft.connect(owner).approve(nftStaking.getAddress(), 1);
    //         await nftStaking.connect(owner).stake([1]);

    //         await network.provider.send("evm_increaseTime", [86400]);
    //         await network.provider.send("evm_mine");


    //         const initialBalance = await nftStaking.balanceOf(owner.getAddress());
    //         await expect(nftStaking.claim([1])).to.emit(nftStaking, "Claimed").withArgs(owner.getAddress(), await nftStaking.earningInfo(owner.getAddress(), [1][0]);
            
    //     })
    // })

    describe("Events", function ()  {
        it("Should emit an event when staking", async function () {
            await nft.mint(owner.getAddress(), 1);
            await nft.connect(owner).approve(nftStaking.getAddress(), 1);

            await expect(nftStaking.connect(owner).stake([1]))
            .to.emit(nftStaking, "NFTStaked")
            .withArgs(owner.getAddress(), 1, await ethers.provider.getBlock("latest")
            .then((block) => block.timestamp));            
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






})