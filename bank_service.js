

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
    var history = ctx._db.history(key.type,key.id);
    function base_commit(key){                
        var commits = history.commits_by_branch(key.branch);
        //Se eu quero reproduzir a parte de um dado ponto eu tenho q pegar o documento
        //na versao anterior e caso nao exista eu pego o primeiro e executo o comando
        //que gerou a primeira versao
        var base_commit = commits.find((c)=>c._data._document._version === key.version -1);
        if (base_commit === undefined){
            base_commit = commits[0];
        }
        return base_commit;
    }
    var current = base_commit(key);
    //estado da entidade imediatamente antes do primeiro comando q devera ser reproduzido
    var current_entity = current._data._document;
    current = history.commit_by_hash(current.next());
    var out = [];
    while(current){
        var args = [];
        var cmd = current._data._command;
        var instance = _lookup.get(cmd.type,cmd.version_type);
        args.push(clone(current_entity),cmd.input);
        args = args.flatMap();
        var exec = new instance(...args);
        out.push(exec.output());
        current = history.commit_by_hash(current.next());
        current_entity = args[0];
    }    
    return out;
}

BankService.prototype.reprocess = function(key, branch){
    print("a");
    var ctx = base_context();    
    var a = ctx.fork(key.type,key.id,key.version, branch);
    print(a);
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

