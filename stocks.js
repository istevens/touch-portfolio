var com_zedmonk_stocks = (function() {

    function $(x) {
        return document.getElementById(x);
    }

    function listen(evnt, elem, func) {
        if (elem.addEventListener) { // W3C DOM
            elem.addEventListener(evnt,func,false);
        }
        else if (elem.attachEvent) { // IE DOM
            var r = elem.attachEvent("on"+evnt, func);
            return r;
        }
        else {
            window.alert('This browser not supported.');
        }
    }

    function StocksView(controller) {
        if(!this instanceof StocksView) {
            return new StocksView(controller);
        }
        this.controller = controller;
    }

    StocksView.prototype.load_stock_list = function() {
        var obj = this;
        this.controller.get_stock_list(
            function(s) {obj.insert_stocks(s);}
        );
    }

    StocksView.prototype.insert_stocks = function(stocks) {
        for(var i=0; i < stocks.length; i++) {
            var stock = stocks.item(i);
            var row = document.createElement('tr');
            row.innerHTML = '<td>' + stock['name'] + '</td><td>' + stock['symbol'] + '</td>';
            document.getElementById('stock_list').appendChild(row);
        }
    }

    StocksView.prototype.init_stock_form = function() {
        var obj = this;
        listen('submit', $('add_symbol'), function(event) {
            obj.submit_stock(event);
        });
    }

    StocksView.prototype.submit_stock = function(event) {
        var obj = this;
        var symbol = event.srcElement['symbol'].value;
        var callback = function(s) {obj.insert_stocks(s);};
        this.controller.add_stock(symbol, callback);
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
    }

    StocksController = function() {
        this.db = window.openDatabase('com.zedmonk.stocks', '0.1', 'A list of stocks', 10000);
        if(!this.db) {
            alert('This demo needs a HTML5 database.');
        }
        else {
            this.db.transaction(function(tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS stocks(\
                    name STRING NOT NULL,\
                    symbol STRING NOT NULL PRIMARY KEY\
                );', []);
            });
        }
    }

    StocksController.prototype.get_stock_list = function(callback) {
        this.db.transaction(function(tx) {
            tx.executeSql('SELECT * from stocks;', [], function(tx,rs) {callback(rs.rows);});
        });
    }

    StocksController.prototype.add_stock = function(symbol, callback) {
        this.db.transaction(
            function(tx) {
                tx.executeSql(
                    'INSERT INTO stocks (name, symbol) VALUES(?,?);', 
                    ['', symbol],
                    function(tx, stocks) {
                        tx.executeSql(
                            'SELECT * from stocks where rowid=?;', 
                            [stocks.insertId], 
                            function(tx,rs) {callback(rs.rows);}
                        );
                    }
                );
            }
        );
    }

    var controller = new StocksController;
    var view = new StocksView(controller);

    listen('load', window, function(){view.load_stock_list();});
    listen('load', window, function(){view.init_stock_form();});

})();
