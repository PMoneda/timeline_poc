var BankDB = new Database("BankAppDB");
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

Context.prototype.fork = function(type,id,version,dest){    
    return this._db.fork(type,id,version,this._branch,dest);
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
        point._command.version_type = promise.version;
        point._command.input = promise.input;

        point._document = {};
        point._document = promise.output();
        point._document._type = promise.output().constructor.name;
        point._document._version_type = promise.output()._version_type;
        points.push(point);
    });
    return points;
}

function base_context(){
    return create_context("master");    
}

function create_context(branch){
    var current_user = document.getElementById('logged:user').value;
    return new Context(BankDB,branch, current_user);
}