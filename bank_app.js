
function Account(balance, owner){
    this._version_type = 1;
    this.id = guid();
    this.balance = balance;
    this.owner = owner;
}


function CreateAccountCommand(initialBalance, owner){
    this.version = 1;
    this.input = [initialBalance,owner];
    this.account = new Account(initialBalance,owner);
}
CreateAccountCommand.prototype.output = function(){
    return this.account;
};



function CreditAccountCommand(account, value){
    this.version = 1;
    this.account = account;
    this.input = value;
    this.account.balance += value;
}

CreditAccountCommand.prototype.output = function() {
    return this.account;
}

function DebitAccountCommand(account, value){
    this.version = 1
    this.account = account;
    if (this.account.balance < value) {
        throw "insufficient funds";

    }
    this.input = value;
    this.account.balance -= value;
}

DebitAccountCommand.prototype.output = function(){
    return this.account;
};

function TransferTransaction(context, account_from, account_to, value){
    var transaction_id = guid();
    context._transaction = {};
    context._transaction.id = transaction_id;
    context._transaction.type = "transfer";
    context._transaction.version = 1;
    var debit = new DebitAccountCommand(account_from,value);
    var credit = new CreditAccountCommand(account_to,value);
    
    context.add(debit);
    context.add(credit);
    context.execute();
}

//Registra os servicos de comandos e transacoes no Lookup
var _lookup = new Lookup();

_lookup.register("CreateAccount",1,CreateAccountCommand);
_lookup.register("CreditAccount",1,CreditAccountCommand);
_lookup.register("DebitAccount",1,DebitAccountCommand);
_lookup.register("TransferTransaction",1,TransferTransaction);


