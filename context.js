var BankDB = new Database("BankAppDB");
var current_scenario = "master";
function Context(db, scenario, user){
    this._branch = scenario;
    this._user = user;
    this._db = db;
    this.promises = [];
}

Context.prototype.add = function(command){
    this.promises.push(command);
};

Context.prototype.execute = function(){
    var points = this._map_points();
    points.forEach((p)=>{
        this._db.save(p,this._branch,this._user);
    });
};
Context.prototype._map_points = function(){
    var points = [];
    this.promises.forEach((promise)=>{
        //montar o poonto P(Tx,Cy,Ez)
        var point = {};
        if (exist(this._transaction)){
            point._transaction = this._transaction;
        }
        point._command = {};
        point._command.type = promise.constructor.name;
        point._command._version_type = promise._version;
        point._command.input = promise._input;

        point._document = {};
        point._document = promise.output();
        point._document._type = promise.output().constructor.name;
        point._document._version_type = promise.output()._version_type;
        points.push(point);
    });
    return points;
}

function base_context(){
    var current_user = document.getElementById('logged:user').value;
    return new Context(BankDB,current_scenario, current_user);
}