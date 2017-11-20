

function BankService(){}


BankService.prototype.create_account = function(balance,owner){
    var ctx = base_context();
    var cmd = _lookup.get("CreateAccountCommand");
    var new_account = new cmd(balance,owner);
    ctx.add(new_account);
    ctx.execute();
}

BankService.prototype.transfer = function(from_id,to_id, value){
    var ctx = base_context();
    var from = castTo(Account,ctx._db.get_by_id("Account",from_id));
    var to = castTo(Account,ctx._db.get_by_id("Account",to_id));
    var tx = _lookup.get("TransferTransaction");
    tx(ctx,from,to,value);
}

BankService.prototype.credit = function(to_id, value){
    var ctx = base_context();
    var to = castTo(Account,ctx._db.get_by_id("Account",to_id));
    var cmd = _lookup.get("CreditAccountCommand");
    ctx.add(new cmd(to,value));
    ctx.execute();    
}

BankService.prototype.debit = function(from_id, value){
    var ctx = base_context();
    var from = castTo(Account,ctx._db.get_by_id("Account",from_id));
    var cmd = _lookup.get("DebitAccountCommand");
    ctx.add(new cmd(from,value));
    ctx.execute();    
}

BankService.prototype.reproduce = function(key, branch){
    var ctx = base_context();
    ctx.fork(key.type,key.id,key.version, branch);    
}

BankService.prototype.reprocess = function(key, branch){
    var ctx = base_context();    
    ctx.fork(key.type,key.id,key.version, branch);
}

BankService.prototype.history = function(from_id){
    var ctx = base_context();
    var history = ctx._db.history("Account",from_id);
    return history;
}

BankService.prototype.find_all = function(){
    var ctx = base_context();
    var accounts = ctx._db.find_all("Account");
    return accounts;
}

var _service = new BankService();

