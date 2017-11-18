
function Account(balance, owner){
    this._version_type = 1;
    this.id = guid();
    this.balance = balance;
    this.owner = owner;
}


function CreateAccountCommand(initialBalance, owner){
    this._version = 1;
    this._input = [initialBalance,owner];
    this.account = new Account(initialBalance,owner);
}
CreateAccountCommand.prototype.output = function(){
    return this.account;
};



function CreditAccountCommand(account, value){
    this._version = 1;
    this.account = account;
    this._input = value;
    this.account.balance += value;
}

CreditAccountCommand.prototype.output = function() {
    return this.account;
}

function DebitAccountCommand(account, value){
    this._version = 1
    this.account = account;
    if (this.account.balance < value) {
        throw "insufficient funds";

    }
    this._input = value;
    this.account.balance -= value;
}

DebitAccountCommand.prototype.output = function(){
    return this.account;
};

function TransferTransaction(context, account_from, account_to, value){
    var transaction_id = guid();
    context._transaction = {};
    context._transaction.id = transaction_id;
    var debit = new DebitAccountCommand(account_from,value);
    var credit = new CreditAccountCommand(account_to,value);
    
    context.add(debit);
    context.add(credit);
    context.execute();
}


