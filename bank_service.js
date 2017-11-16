

function BankService(){}


BankService.prototype.create_account = function(){
    var ctx = base_context();
    var new_account = new CreateAccountCommand(document.getElementById("create_account:balance").value,document.getElementById("create_account:owner").value);
    ctx.add(new_account);
    ctx.execute();
}

BankService.prototype.find_all = function(){
    var ctx = base_context();
    var accounts = ctx._db.find_all("Account");
    return accounts;
}

var _service = new BankService();