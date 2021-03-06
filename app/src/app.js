var Web3 = require('web3');
var contract = require("truffle-contract");

var Conference = contract(require("../../build/contracts/Conference.json"));

// Is there is an injected web3 instance?
var web3Provider;
if (typeof web3 !== 'undefined') {
  web3Provider = web3.currentProvider;
} else {
  // If no injected web3 instance is detected, fallback to the TestRPC
  web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
}

web3 = new Web3(web3Provider);

// State of the used conference contract
window.DApp = {
    currentConference: null,
    userAccount: null
};

window.onload = function() {
    Conference.setProvider(web3.currentProvider);

    // Get defined accounts on the client
    web3.eth.getAccounts(function(error, result) {
        if (error != null)
            console.log("Couldn't get accounts, error: " + error);

        // Pick a random account, becasue why not
        var rndAccId = Math.floor(Math.random() * result.length)
        DApp.userAccount = result[rndAccId];

        refreshUserInfos(DApp.userAccount);

        isValidContactSelected();
    });
};

// Refrehs the UI every 10 sec
window.setInterval(() => {
    if (DApp.currentConference && DApp.userAccount)
        refreshConferenceInfos(DApp.currentConference, DApp.userAccount);
    if (DApp.userAccount)
        refreshUserInfos(DApp.userAccount);
}, 10000);

var refreshUserInfos = function(account) {
    var ethPubKeyElt = document.getElementById('public-key');
    ethPubKeyElt.innerHTML = account;

    web3.eth.getBalance(account, (error, balance) => {
        var ethBalanceElt = document.getElementById('eth-balance');
        ethBalanceElt.innerHTML = web3.fromWei(balance.toNumber(), 'ether');
    });
}

var refreshConferenceInfos = function(conference, userPubKey) {
    var confPubKeyElt = document.getElementById('conference-eth-address');
    confPubKeyElt.innerHTML = conference.address

    web3.eth.getBalance(conference.address, (error, balance) => {
        var confBalanceElt = document.getElementById('conference-eth-balance');
        confBalanceElt.innerHTML = web3.fromWei(balance.toNumber(), 'ether') + " Eth";
    });

    conference.quota.call().then(quota => {
        var confQuotaElt = document.getElementById('max-registrations-count');
        confQuotaElt.innerHTML = quota + " people max";
    });

    conference.numRegistrants.call().then(numRegistrants => {
        var numRegistrantsElt = document.getElementById('registrations-count');
        numRegistrantsElt.innerHTML = numRegistrants + " people attending";
    });

    conference.organizer.call().then(confOwner => {
        var confOwnerElt = document.getElementById('conference-owner');
        confOwnerElt.innerHTML = confOwner;

        if (confOwner == userPubKey)
            confOwnerElt.innerHTML += " (you)"
    });

     conference.registrantsPaid.call(userPubKey).then(registrantsPaid => {
         var paidForConfElt = document.getElementById('paid-for-conf');
         if (registrantsPaid.toNumber(10) == 0)
            paidForConfElt.innerHTML = "You haven't paid to access the conference";
        else
             paidForConfElt.innerHTML = "You already paid " + web3.fromWei(registrantsPaid.toNumber(10)) + " Eth to access the conference !";
     });

    isValidContactSelected();
}

var createConference = function(userAccount) {
    const deploymentGasUsed = 4712388;
    const deploymentGasPrice = 100000000000;
    
    return Conference.new({ from: userAccount, gas: deploymentGasUsed, gasPrice: deploymentGasPrice });
}

var isValidContactSelected = function() {
    var validContractSelected = !!DApp.currentConference;
    document.getElementById("btn-register").disabled = !validContractSelected;
    document.getElementById("btn-changeQuota").disabled = !validContractSelected;
    document.getElementById("btn-endConference").disabled = !validContractSelected;
    document.getElementById("btn-refundTicket").disabled = !validContractSelected;

    return !!DApp.currentConference;
}

// UI accessible functions
DApp.CreateConference = function() {
    createConference(DApp.userAccount).then(newConference => {
        DApp.currentConference = newConference;
        refreshConferenceInfos(DApp.currentConference, DApp.userAccount);
        refreshUserInfos(DApp.userAccount);
    });
}

DApp.SearchConference = function() {
    var confSearchAddrElt = document.getElementById('conference-search-address');
    var conference = Conference.at(confSearchAddrElt.value);

    DApp.currentConference = conference;
    refreshConferenceInfos(DApp.currentConference, DApp.userAccount);
    refreshUserInfos(DApp.userAccount);
}

DApp.RegisterToConference = function() {
    var confSearchAddrElt = document.getElementById('conference-search-address');
    var conference = Conference.at(confSearchAddrElt.value);

    DApp.currentConference = conference;
    refreshConferenceInfos(DApp.currentConference, DApp.userAccount);
    refreshUserInfos(DApp.userAccount);
}

DApp.Register = function() {
    var registrationCostElt = document.getElementById('registration-cost');
    var registrationCost = web3.toWei(registrationCostElt.value, 'ether');

    DApp.currentConference.buyTicket({ from: DApp.userAccount, value: registrationCost }).then(() => {
        refreshConferenceInfos(DApp.currentConference, DApp.userAccount);
        refreshUserInfos(DApp.userAccount);
    });
}

DApp.ChangeQuota = function() {
    var newQuotaElt = document.getElementById('new-quota');
    var newQuota = newQuotaElt.value;

    DApp.currentConference.changeQuota(newQuota, { from: DApp.userAccount }).then(() => {
        refreshConferenceInfos(DApp.currentConference, DApp.userAccount);
        refreshUserInfos(DApp.userAccount);
    });
}

DApp.RefundTicket = function() {
    var refundedTickeOwnerElt = document.getElementById('refund-ticket-owner');
    var refundedTickeOwner = refundedTickeOwnerElt.value;

    DApp.currentConference.refundTicket(refundedTickeOwner, { from: DApp.userAccount }).then(() => {
        refreshConferenceInfos(DApp.currentConference, DApp.userAccount);
        refreshUserInfos(DApp.userAccount);
    });
}

DApp.EndConference = function() {
    DApp.currentConference.destroy({ from: DApp.userAccount }).then(() => {
        refreshConferenceInfos(DApp.currentConference, DApp.userAccount);
        refreshUserInfos(DApp.userAccount);
    });
}