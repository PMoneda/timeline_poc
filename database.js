var fs = require("fs");

function Database(name){
    this._name = name;
    this.INDEX = {};
    this.SEARCH = {
        transactions:{}
    };
}
Database.prototype.save = function(entity, branch, author, message){
    var repo = null;
    if (notExist(author)){
        author = "database-service";
    }
    if (notExist(message)){
        message = "save"
    }
    if (notExist(this.INDEX[entity._document._type])){
        this.INDEX[entity._document._type] = {};
    }
    if (notExist(this.INDEX[entity._document._type][entity._document.id])){
        repo = new Repository(entity._document._type+"-"+entity._document.id)
        this.INDEX[entity._document._type][entity._document.id] = repo;
    }else{
        repo = this.INDEX[entity._document._type][entity._document.id];
    }
    var branches = repo.current_branches();
    if (branches.find((s)=>s === branch) === undefined){
        branches.push(branch);
    }
    branches.forEach((b)=>{
        this.save_entity(entity,b,author,message);
    });
    
};
Database.prototype.save_entity = function(entity, branch, author, message){
    var repo = null;
    if (notExist(author)){
        author = "database-service";
    }
    if (notExist(message)){
        message = "save"
    }
    if (notExist(this.INDEX[entity._document._type])){
        this.INDEX[entity._document._type] = {};
    }
    if (notExist(this.INDEX[entity._document._type][entity._document.id])){
        repo = new Repository(entity._document._type+"-"+entity._document.id)
        this.INDEX[entity._document._type][entity._document.id] = repo;
    }else{
        repo = this.INDEX[entity._document._type][entity._document.id];
    }
    if (exist(branch)){
        repo.checkout(branch);
        entity._document._branch = branch;
    }else if(notExist(entity._document._branch)){
        entity._document._branch = repo.main_branch();
    }else if (exist(entity._document._branch)){
        repo.checkout(entity._document._branch);
    }
    var head = repo.head();
    if (notExist(head)){
        entity._document._version = 1;
    }else {
        entity._document._version = head.data()._document._version + 1;
    }
    var hash = repo.commit(entity,message,author,entity._document._branch);
    if(exist(entity._transaction)){
        if (notExist(this.SEARCH["transactions"][entity._transaction.id])){
            this.SEARCH["transactions"][entity._transaction.id] = [];
        }
        this.SEARCH["transactions"][entity._transaction.id].push({
            type:entity._document._type,
            branch:entity._document._branch,
            hash:hash
        });
    }
    this.sync();

    return entity;
};

Database.prototype.find_all = function(type){
    var reg = this.INDEX[type];
    var list = [];
    for(var id in reg){
        list.push(reg[id].head().data()._document);
    }
    return list;

};

Database.prototype.commits_by_transaction_id = function(id){
    var result = [];
    if(exist(this.SEARCH["transactions"][id])){
        var list = this.SEARCH["transactions"][id];
        for(var i in list){
            var entities = this.INDEX[list[i].type];
            for(var j in entities){
                var c = entities[j].commit_by_hash(list[i].hash);
                if(exist(c)){
                    result.push(c);
                }                
            }
        }
    }
    return result;
};


Database.prototype.fork = function(type,id,version,origin,branch){
    var commits = this.INDEX[type][id].commits_by_branch(origin);
    var commit = null;
    for (var i in commits){
        commit = commits[i];
        if (commit._data._document._version === version){
            break;
        }
    }
    if (commit !== null){
       //se o commit onde da quebra ou posterior é uma transacao
       //então deve-se replicar o fork em todas as entidades atingidas pela
       //transacao
       var hash = this.INDEX[type][id].fork(commit._hash,branch);
       var newCommits = this.INDEX[type][id].commits_by_branch(branch);
       for (var i in newCommits){
            commit = clone(newCommits[i]);
            commit._data._branch = branch;
            this.INDEX[type][id].override(commit._hash,commit._data,commit._message,commit._author);
        }
       this.INDEX[type][id].checkout(branch);
       return this.INDEX[type][id].commit_by_hash(hash).data();
    }
};

Database.prototype.sync = function(){
    fs.writeFileSync(this._name, JSON.stringify(this));
};

Database.prototype.get_by_id = function(type,id){
    if(exist(this.INDEX[type]) && exist(this.INDEX[type][id])){
        return this.INDEX[type][id].head().data()._document;
    }
};

Database.prototype.history = function(type, id){
    return castTo(History,clone(this.INDEX[type][id]));
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
                        print(db.get_by_id("account",1));    
                    },100)
                },100)    
            },100)    
        },100)    
    },100)    
},100)
*/
