var fs = require("fs");

function Database(name){
    this._name = name;
    this.INDEX = {};
    this.SEARCH = {
        transactions:{}
    };
}
Database.prototype.save = function(entity, branch){
    var repo = null;
    if (notExist(this.INDEX[entity._type])){
        this.INDEX[entity._type] = {};
    }
    if (notExist(this.INDEX[entity._type][entity.id])){
        repo = new Repository(entity._type+"-"+entity.id)
        this.INDEX[entity._type][entity.id] = repo;
    }else{
        repo = this.INDEX[entity._type][entity.id];
    }
    if (exist(branch)){
        repo.setMainBranch(branch);
        entity._branch = branch;
    }else if(notExist(entity._branch)){
        entity._branch = repo.mainBranch();
    }else if (exist(entity._branch)){
        repo.setMainBranch(entity._branch);
    }
    var head = repo.head();
    if (notExist(head)){
        entity._version = 1;
    }else {
        entity._version = head.data()._version + 1;
    }
    var hash = repo.commit(entity,"save","database-service",entity._branch);
    if(exist(entity._transaction)){
        if (notExist(this.SEARCH["transactions"][entity._transaction.id])){
            this.SEARCH["transactions"][entity._transaction.id] = [];
        }
        this.SEARCH["transactions"][entity._transaction.id].push({
            type:entity._type,
            branch:entity._branch,
            hash:hash
        });
    }
    this.sync();

    return entity;
};

Database.prototype.commitsByTransactionId = function(id){
    var result = [];
    if(exist(this.SEARCH["transactions"][id])){
        var list = this.SEARCH["transactions"][id];
        for(var i in list){
            var entities = this.INDEX[list[i].type];
            for(var j in entities){
                var c = entities[j].getCommitByHash(list[i].hash);
                if(exist(c)){
                    result.push(c);
                }                
            }
        }
    }
    return result;
};


Database.prototype.fork = function(type,id,version,origin,branch){
    var commits = this.INDEX[type][id].getCommitsByBranch(origin);
    var commit = null;
    for (var i in commits){
        commit = commits[i];
        if (commit._data._version === version){
            break;
        }
    }
    if (commit !== null){
       //se o commit onde da quebra ou posterior é uma transacao
       //então deve-se replicar o fork em todas as entidades atingidas pela
       //transacao
       var hash = this.INDEX[type][id].fork(commit._hash,branch);
       var newCommits = this.INDEX[type][id].getCommitsByBranch(branch);
       for (var i in newCommits){
            commit = clone(newCommits[i]);
            commit._data._branch = branch;
            this.INDEX[type][id].override(commit._hash,commit._data,commit._message,commit._author);
        }
       this.INDEX[type][id].setMainBranch(branch);
       return this.INDEX[type][id].getCommitByHash(hash).data();
    }
};


Database.prototype.sync = function(){
    fs.writeFileSync(this._name, JSON.stringify(this));
};

Database.prototype.getById = function(type,id){
    if(exist(this.INDEX[type]) && exist(this.INDEX[type][id])){
        return this.INDEX[type][id].head().data();
    }
};

Database.prototype.history = function(type, id, branch){
    return this.INDEX[type][id].getCommitsByBranch(branch).map((c) => c._data);
}

function loadDabase (name){
    var data = fs.readFileSync(name, 'UTF-8');
    var obj = JSON.parse(data);
    var r = castTo(Database,obj);
    for(var collection in r.INDEX){
        for (var entity in r.INDEX[collection]){
            var a = castRepository(r.INDEX[collection][entity]);
            r.INDEX[collection][entity] = a;
        }
    }
    return r;
};

var db = new Database("ons");
var account = {
    _type:"account",
    id:1,
    balance:0,
    owner:"philippe"
}
/*
setTimeout(()=>{
    db.save(account,"master");
    account.balance += 10;
    setTimeout(()=>{
        db.save(account,"master");
        account.balance += 10;
        setTimeout(()=>{
            db.save(account,"master");
            account.balance += 10;
            setTimeout(()=>{
                db.save(account,"master");
                account.balance += 10;
                setTimeout(()=>{
                    db.save(account,"master");
                    account.balance += 10;
                    setTimeout(()=>{
                        account.balance += 50;
                        db.save(account,"master");
                       
                        print(account.balance);
                        print(db.getById("account",1));    
                    },100)
                },100)    
            },100)    
        },100)    
    },100)    
},100)
*/
