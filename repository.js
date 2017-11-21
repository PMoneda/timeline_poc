var sha1 = require('sha1');
var fs = require('fs');
function notExist(d){
    return d === null || d === undefined;
}
function exist(d){
    return !notExist(d);
}
function clone(d){
    return JSON.parse(JSON.stringify(d));
}
function print(s) {
    console.log(s);
}
function convertAll(type, collection){
    for(var k in collection){
        collection[k] = castTo(type,collection[k]);
    }
}
function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }
function castTo(baseClass, obj){
    var instance = new baseClass();
    for(var prop in obj){
        instance[prop] = obj[prop];
    }
    return instance;
}

function Repository(name){
    this.BRANCHES = {};
    this.CLOSED_BRANCHES = {};
    this.HEAD = {};
    this.INDEX = {};
    this._name = name;
    this.MAIN_BRANCH = null;
}
Repository.prototype.close = function(branch){
    this.CLOSED_BRANCHES[branch] = true;
};
Repository.prototype.isClosed = function(branch){
    return exist(this.CLOSED_BRANCHES[branch]);
};
Repository.prototype.open = function(branch){
    delete this.CLOSED_BRANCHES[branch];
};

Repository.prototype.head = function(branch){
    if (notExist(branch)){
        return this.HEAD[this.MAIN_BRANCH];    
    }
    return this.HEAD[branch];
};

Repository.prototype.checkout = function(branch){
    this.MAIN_BRANCH = branch; 
};

Repository.prototype.main_branch = function(){
    return this.MAIN_BRANCH; 
};

Repository.prototype.commits_by_branch = function(branch){
    var list = [];
    var base = this.BRANCHES[branch];    
    list.push(base)
    base = base.next(branch);
    while(base != null){
        var d = this.INDEX[base];
        list.push(d);
        base = d.next(branch);
    }
    return clone(list);
};

Repository.prototype.commit_by_hash = function(hash){
    return this.INDEX[hash];
};
Repository.prototype.override = function(hash, data, message, author){
    var commit = this.INDEX[hash];
    commit._data = data;
    commit._message = message;
    commit._author = author;
    this.save();
};

Repository.prototype.commit = function(rawdata,message,author,branch){
    var data = clone(rawdata);
    if (this.isClosed(branch)){
        throw "Unable to commit to a closed branch";
    }
    var commit = new CommitData(data,message,author,branch)
    this.INDEX[commit.hash()] = commit;
    if (notExist(this.HEAD[branch])){
        this.HEAD[branch] = commit;
    }else{
        var current = this.HEAD[branch];
        current.set_next(commit);
        commit.set_prev(current);
        this.HEAD[branch] = commit;
        this.INDEX[current.hash()] = current;
    }
    if (notExist(this.BRANCHES[branch])){
        this.BRANCHES[branch] = commit;
    }
    this.save();
    return commit.hash();
};

Repository.prototype.fork = function(hash, dest){
    var target = this.INDEX[hash];
    var newBranch = castTo(CommitData,clone(target));
    newBranch._message = "fork "+newBranch._message;
    
    newBranch.update_hash();
    newBranch.set_prev(target);
    newBranch.set_branch(dest);    
    target.set_next(newBranch);
    var ptr = newBranch.next(target.branch());
    newBranch.unlink()
    this.INDEX[newBranch.hash()] = newBranch;
    var curr = newBranch;
    this.BRANCHES[dest] = newBranch;
    this.HEAD[dest] = newBranch;
    while(ptr != null){
        ptr = this.INDEX[ptr];
        var dup = castTo(CommitData,clone(ptr));
        dup._message = "fork "+dup._message;
        dup.update_hash();
        dup.set_prev(curr);
        dup.set_branch(dest);
        curr.set_next(dup)
        curr = dup
        ptr = dup.next(target.branch());
        dup.unlink()
        this.HEAD[dest] = dup;
        this.INDEX[dup.hash()] = dup;
    }
    this.save();
    return newBranch.hash();
}
Repository.prototype.print = function(){
    print("Repositorio: "+this._name);
    print("Branches")
    for(var p in this.BRANCHES){
        print(p)
    }
    for(var p in this.BRANCHES){
        var pointer = this.BRANCHES[p];        
        pointer.print(this);        
    }
}

Repository.prototype.string = function(){
    return JSON.stringify(this);
}

Repository.prototype.save = function(){
   // fs.writeFileSync(this._name, JSON.stringify(this));
};
Repository.prototype.current_branches = function(){
    var branches = [];
    for(var branch in this.BRANCHES){
        if(notExist(this.CLOSED_BRANCHES[branch])){
            branches.push(branch);
        }        
    }
    return branches;
}



function load (repo){
    var data = fs.readFileSync(repo, 'UTF-8');
    var obj = JSON.parse(data);
    return castRepository(obj);
};
function castRepository(obj){
    var r = castTo(Repository,obj);
    convertAll(CommitData,r.INDEX)
    convertAll(CommitData,r.HEAD)
    convertAll(CommitData,r.BRANCHES)
    return r;
}

function castDataHistory(obj){
    var r = castTo(DataHistory,obj);
    convertAll(CommitData,r.INDEX)
    convertAll(CommitData,r.HEAD)
    convertAll(CommitData,r.BRANCHES)
    return r;
}


function CommitData(data, message, author, branch){
    this._prev = null;
    this._next = {};
    this._timestamp = new Date().getTime();
    this._data = data;
    this._message = message;
    this._author = author;
    this._branch = branch;
    this.update_hash();
}



CommitData.prototype.update_hash = function(){
    if (typeof(this._timestamp) === "string" ){
        this._timestamp = new Date(this._timestamp);
    }
    this._hash = sha1(JSON.stringify(this._data) + this._timestamp+this._message);
}
CommitData.prototype.print = function(repo){    
    print("Branch: "+this._branch+ "   Message: " + this._message);
    print(this._data);
    for(var branches in this._next){
        var next = this._next[branches];        
        repo.INDEX[next].print(repo);
    }
};

CommitData.prototype.data = function(){
    return this._data;
};

CommitData.prototype.next = function(branch){
    if (notExist(branch)){
        branch = this._branch;
    }
    return this._next[branch];
};

CommitData.prototype.hash = function(){
    return this._hash;
};

CommitData.prototype.prev = function(){
    return this._prev;
};

CommitData.prototype.branch = function(){
    return this._branch
};

CommitData.prototype.set_branch = function(branch){
    this._branch = branch;
};
CommitData.prototype.set_prev = function(prevCommit){
    this._prev = prevCommit.hash();
};

CommitData.prototype.unlink = function(branch){
    if (notExist(branch)){
        delete this._next;
        this._next = {};
    }else{
        delete this._next[branch]
    }
    
};
CommitData.prototype.set_next = function(nextCommit){
    this._next[nextCommit.branch()] = nextCommit.hash();
};



//DataHistory e uma estrutura de dados igual ao Repository
//mas a diferenca esta em quais acoes o DataHistory pode tomar
//em relacao ao repositorio
//o DataHistory é um repositório read-only
function DataHistory(){
    this.BRANCHES = {};
    this.CLOSED_BRANCHES = {};
    this.HEAD = {};
    this.INDEX = {};
    this._name = name;
    this.MAIN_BRANCH = null;
};

DataHistory.prototype.checkout = function(branch){
    this.MAIN_BRANCH = branch;
}

DataHistory.prototype.branches = function(){
    var branches = [];
    for(var branch in this.BRANCHES){
        branches.push(branch);
    }
    return branches;
}

DataHistory.prototype.commits = function(){
    var commits = [];
    for(var hash in this.INDEX){
        commits.push(clone(this.INDEX[hash]));
    }
    commits.sort(function(c1, c2){return c1._timestamp-c2._timestamp});
    return commits;
}

DataHistory.prototype.closed_branches = function(){
    var branches = [];
    for(var branch in this.CLOSED_BRANCHES){
        branches.push(branch);
    }
    return branches;
}

DataHistory.prototype.commits_by_branch = function(branch){
    var list = [];
    var base = this.BRANCHES[branch];    
    list.push(base)
    base = base.next(branch);
    while(base != null){
        var d = this.INDEX[base];
        list.push(d);
        base = d.next(branch);
    }
    list.sort(function(c1, c2){return c1._timestamp-c2._timestamp});
    return list;
};
DataHistory.prototype.commit_by_hash = function(hash){
    return this.INDEX[hash];
};





/*
//Using
r = new Repository("asd");
var h1 = r.commit("teste moneda 2","A", "philippe moneda","master")
var h2 = r.commit("teste moneda 2","B", "philippe moneda","master")
var h3 = r.commit("teste moneda 2","C", "philippe moneda","master")
var h4 = r.commit("teste moneda 2","D", "philippe moneda","master")
var h5 = r.commit("teste moneda 2","E", "philippe moneda","master")
var h6 = r.commit("teste moneda 2","F", "philippe moneda","master")
var h7 = r.commit("teste moneda 2","G", "philippe moneda","master")
var h8 = r.commit("teste moneda 2","H", "philippe moneda","master")

r.fork(h4,"feature2");

var h9 = r.commit("teste moneda 2","A", "philippe moneda","f1")
var h10 = r.commit("teste moneda 2","B", "philippe moneda","f1")
var h11 = r.commit("teste moneda 2","C", "philippe moneda","f1")
var h12 = r.commit("teste moneda 2","D", "philippe moneda","f1")

r.save();*/
