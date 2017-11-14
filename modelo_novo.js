var DB = null;
function start(){
    DB = new Database("ONSv2");    

    var doc1 = {
        _command:{
            _type:"create",
            _version_type:1
        },
        _document:{
            _type:"account",
            id:1,
            balance:100,
            owner:"person 1"
        }
    }
    DB.save(doc1,"master");

    var doc2 = {
        _command:{
            _type:"create"        
        },
        _document:{
            _type:"account",
            _version_type:1,
            id:2,
            balance:500,
            owner:"person 2"
        }
    }
    DB.save(doc2,"master");

    var tx_transfer = 3;
    var doc_credit = {
        _command:{
            _type:"credit",
            _input:20       
        },
        _transaction:{
            _type:"transfer",
            id:tx_transfer,
        },
        _document:{
            _type:"account",
            _version_type:1,
            id:1,
            balance:120,
            owner:"person 1"
        }
    };
    var doc_debit = {
        _command:{
            _type:"debit",
            _input:20
        },
        _transaction:{
            _type:"transfer",
            id:tx_transfer,
        },
        _document:{
            _type:"account",
            _version_type:1,
            id:2,
            balance:480,
            owner: "person 2"
        }
    }
    DB.save(doc_debit,"master");
    DB.save(doc_credit,"master");

    //nao precisa de transacao, e uma operacao atomica
    var doc_credit2 = {
        _command:{
            _type:"credit",
            _input:200       
        },
        _document:{
            _type:"account",
            _version_type:1,
            id:1,
            balance:320,
            owner:"person 1"
        }
    };
    DB.save(doc_credit2,"master");
    print(DB);
}
start()
