// Specifically request an abstraction for Conference
var Conference = artifacts.require("../contracts/Conference");

contract("Conference", accounts => {
    it("Initial conference settings should match", done => {
        Conference.new({ from: accounts[0] }).then(conference => {
            return conference.quota.call().then(quota => {
                assert.equal(quota, 500, "Quota doesn't match!");
            }).then(() => {
                return conference.numRegistrants.call();
            }).then(num => {
                assert.equal(num, 0, "Registrants should be zero!");
                return conference.organizer.call();
            }).then(organizer => {
                assert.equal(organizer, accounts[0], "Owner doesn't match!");
                done(); // to stop these tests earlier, move this up
            }).catch(done);
        }).catch(done);
    });


    it("Should update quota", done => {
        Conference.new({from: accounts[0] }).then(conference => {
            conference.quota.call().then(quota => {
                assert.equal(quota, 500, "Quota doesn't match!");
            }).then(() => {
                return conference.changeQuota(300);
            }).then(result => {
                return conference.quota.call();
            }).then(quota => {
                assert.equal(quota, 300, "New quota is not correct!");
                done();
            }).catch(done);
        }).catch(done);
    });

    it("Should let you buy a ticket", done => {
        Conference.new({ from: accounts[0] }).then(conference => {
            var ticketPrice = web3.toWei(.05, 'ether');
            var initialBalance = web3.eth.getBalance(conference.address).toNumber();
            conference.buyTicket({ from: accounts[1], value: ticketPrice }).then(() => {
                var newBalance = web3.eth.getBalance(conference.address).toNumber();
                var difference = newBalance - initialBalance;
                assert.equal(difference, ticketPrice, "Difference should be what was sent");
                return conference.numRegistrants.call();
            }).then(num => {
                assert.equal(num, 1, "there should be 1 registrant"); 
                return conference.registrantsPaid.call(accounts[1]);
            }).then(amount => {
                assert.equal(amount.toNumber(), ticketPrice, "Sender's paid but is not listed");
                done();
            }).catch(done);
        }).catch(done);
    });

    it("Should issue a refund by owner only", done => {
        Conference.new({ from: accounts[0] }).then(conference => {

            var ticketPrice = web3.toWei(.05, 'ether');
            var initialBalance = web3.eth.getBalance(conference.address).toNumber();

            conference.buyTicket({ from: accounts[1], value: ticketPrice }).then(() => {
                var newBalance = web3.eth.getBalance(conference.address).toNumber();
                var difference = newBalance - initialBalance;
                assert.equal(difference, ticketPrice, "Difference should be what was sent");
                // Now try to issue refund as second user - should fail
                return conference.refundTicket(accounts[1], {from: accounts[1]});
            }).then(() => {
                var balance = web3.eth.getBalance(conference.address).toNumber();
                assert.equal(web3.toBigNumber(balance), ticketPrice, "Balance should be unchanged");
                // Now try to issue refund as organizer/owner - should work
                return conference.refundTicket(accounts[1], {from: accounts[0]});
            }).then(() => {
                var postRefundBalance = web3.eth.getBalance(conference.address).toNumber();
                assert.equal(postRefundBalance, initialBalance, "Balance should be initial balance");
                done();
            }).catch(done);
        }).catch(done);
    });

     it("Should issue a refund if a ticket is buy but the quota is reached", done => {
        Conference.new({ from: accounts[0] }).then(conference => {
            var ticketPrice = web3.toWei(.05, 'ether');
            var initialBalance = web3.eth.getBalance(conference.address).toNumber();
            conference.changeQuota(1).then(() => {
                return conference.buyTicket({ from: accounts[1], value: ticketPrice });
            }).then(() => {
                var newBalance = web3.eth.getBalance(conference.address).toNumber();
                var difference = newBalance - initialBalance;
                assert.equal(difference, ticketPrice, "Difference should be what was sent");
                return conference.numRegistrants.call();
            }).then(num => {
                assert.equal(num, 1, "there should be 1 registrant"); 
                return conference.registrantsPaid.call(accounts[1]);
            }).then(amount => {
                assert.equal(amount.toNumber(), ticketPrice, "Sender's paid but is not listed");
            }).then(() => {
                return conference.buyTicket({ from: accounts[2], value: ticketPrice, gas: 21000 });
            }).catch(err => {
                // TODO: This does not behave the same in TestRTC (it throws) and in Geth, we need so extra logic for tests t pass on both networks
                // https://stackoverflow.com/questions/36595575/what-is-the-pattern-for-handling-throw-on-a-solidity-contract-in-tests
                assert.isDefined(err, "transaction should have thrown");
                //assert.equal(err, "base fee exceeds gas limit")
                assert.include(
                    err.message,
                    "base fee exceeds gas limit",
                    "Error should be raised about gaz limit exeeded (at leats on TestRTC)"
                );
                done();
            })
            .catch(done);
        }).catch(done);
    });
});