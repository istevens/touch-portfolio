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

    function bind(obj, method) {
        return function() {
            var args = [];
            for(var n = 0; n < arguments.length; n++) {
                args.push(arguments[n]);
            }
            obj[method].apply(obj, args);
        };
    }

    function StocksView(controller) {
        if(!this instanceof StocksView) {
            return new StocksView(controller);
        }
        this.controller = controller;
    }

    StocksView.prototype.load_stock_list = function() {
        var callback = bind(this, 'insert_stocks');
        this.controller.get_stock_list(callback);
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
        listen('submit', $('add_symbol'), bind(this, 'submit_stock'));
    }

    StocksView.prototype.submit_stock = function(event) {
        var symbol = event.srcElement['symbol'].value;
        var callback = bind(this, 'insert_stocks');
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

    listen('load', window, bind(view, 'load_stock_list'));
    listen('load', window, bind(view, 'init_stock_form'));

})();
