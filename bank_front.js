

function BankFront(){}

BankFront.prototype.create_account = function(){  
  _service.create_account(document.getElementById("create_account:balance").value,document.getElementById("create_account:owner").value);
  this.refresh_list();
};

BankFront.prototype.transfer = function(){  
  var from = document.getElementById("transfer:from").value;
  var to = document.getElementById("transfer:to").value;
  var value = parseInt(document.getElementById("transfer:value").value);
  _service.transfer(from,to,value);
  this.refresh_list();
};

BankFront.prototype.credit = function(){    
  var to = document.getElementById("credit:to").value;
  var value = parseInt(document.getElementById("credit:value").value);
  _service.credit(to,value);
  this.refresh_list();
};

BankFront.prototype.debit = function(){    
  var from = document.getElementById("debit:from").value;
  var value = parseInt(document.getElementById("debit:value").value);
  _service.debit(from,value);
  this.refresh_list();
};

BankFront.prototype.refresh_list = function(){  
  var list = document.getElementById("list");
  list.value = "";
  var accounts = _service.find_all();
  accounts.map((ac)=> ac.id + " " + ac.owner + " " + ac.balance + "\n").forEach((s)=> list.value += s);
};

var _front = new BankFront();

_service.create_account(10,"moneda");
_service.create_account(20,"canellas");
_service.create_account(50,"aline");

_front.refresh_list();