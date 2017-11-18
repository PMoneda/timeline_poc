


function Lookup(){
    this.INDEX = {}
    this.CURRENT_VERSION = {};
}

Lookup.prototype.register = function(name,version,service){
    if (notExist(this.INDEX[name])){
        this.INDEX[name] = {};
        this.CURRENT_VERSION[name] = {};
    }
    if (notExist(this.INDEX[name][version])){
        this.INDEX[name][version] = {};        
    }
    this.INDEX[name][version] = service;
    this.CURRENT_VERSION[name] = version;
};

Lookup.prototype.get = function(name,version){
    if (notExist(version)){
        version = this.CURRENT_VERSION[name];
    }
    
    if (exist(this.INDEX[name]) && exist(this.INDEX[name][version])){
        return this.INDEX[name][version];
    }    
};