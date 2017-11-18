

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

BankFront.prototype.history = function(){    
  var from = document.getElementById("history:from").value;  
  var history = _service.history(from);
  var commits = history.commits();
  var source   = document.getElementById("history-timeline-template").innerHTML;
  var template = Handlebars.compile(source);
  var dataset = [];
  var i = 1;
  commits.forEach((c)=>{
    var context = {};
    context.branch = c._branch;
    context.author = c._author;
    context.action = c._data._command.type;
    context.action_version =  c._data._command._version_type;
    context.input = JSON.stringify(c._data._command.input);
    context.document_type = c._data._document._type;
    context.props = [];
    for(var prop in c._data._document){
      if (prop[0]!== "_"){
        context.props.push({prop_name:prop,prop_value:c._data._document[prop]})
      }
    }
    var item = {id: i, content: template(context), start: new Date(c._timestamp)};
    dataset.push(item);
    i++;
  });

  var container = document.getElementById('visualization');  
  container.innerHTML = "";
  var items = new vis.DataSet(dataset);
  var options = {};
  // Create a Timeline
  var timeline = new vis.Timeline(container, items, options);
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