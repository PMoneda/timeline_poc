

function BankService(){}


BankService.prototype.create_account = function(balance,owner){
    var ctx = base_context();
    var new_account = new CreateAccountCommand(balance,owner);
    ctx.add(new_account);
    ctx.execute();
}

BankService.prototype.transfer = function(from_id,to_id, value){
    var ctx = base_context();
    var from = castTo(Account,ctx._db.getById("Account",from_id));
    var to = castTo(Account,ctx._db.getById("Account",to_id));
    TransferTransaction(ctx,from,to,value);   
}

BankService.prototype.credit = function(to_id, value){
    var ctx = base_context();
    var to = castTo(Account,ctx._db.getById("Account",to_id));
    ctx.add(new CreditAccountCommand(to,value));
    ctx.execute();    
}

BankService.prototype.debit = function(from_id, value){
    var ctx = base_context();
    var from = castTo(Account,ctx._db.getById("Account",from_id));
    ctx.add(new DebitAccountCommand(from,value));
    ctx.execute();    
}

BankService.prototype.find_all = function(){
    var ctx = base_context();
    var accounts = ctx._db.find_all("Account");
    return accounts;
}

var _service = new BankService();

