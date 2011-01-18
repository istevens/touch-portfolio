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
            throw('This browser not supported.');
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
        listen('click', $('add_symbol_button'), bind(this, 'display_add_form'));
        listen('submit', $('add_symbol').firstElementChild, bind(this, 'submit_stock'));
    }

    StocksView.prototype.display_add_form = function() {
        $('add_symbol').style.setProperty('display', 'inline');
    }

    StocksView.prototype.submit_stock = function(event) {
        var form = event.srcElement
        var symbol = form['symbol'].value;
        var callback = bind(this, 'insert_stocks');
        this.controller.add_stock(symbol, callback);
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
        form.parentElement.style.setProperty('display', 'none');
    }

    StocksController = function() {
        this.db = null;
        if(window.openDatabase) {
            this.db = window.openDatabase('com.zedmonk.stocks', '0.1', 'A list of stocks', 10000);
        }

        if(!this.db) {
            throw('This demo needs a HTML5 database.');
        }
        else {
            this.transaction(
                'CREATE TABLE IF NOT EXISTS stocks(\
                    name STRING NOT NULL,\
                    symbol STRING NOT NULL PRIMARY KEY\
                );',
                []
            );
        }
    }

    StocksController.prototype.transaction = function(sql, args, success, failure) {
        this.db.transaction(function(tx) {
            tx.executeSql(sql, args, success, failure);
        });
    }

    StocksController.prototype.rs_bind = function(callback) {
        return function(tx, rs) {callback(rs.rows);}
    }

    StocksController.prototype.get_stock_list = function(callback) {
        this.transaction('SELECT * from stocks;', [], this.rs_bind(callback));
    }

    StocksController.prototype.add_stock = function(symbol, callback) {
        obj = this;
        this.transaction(
            'INSERT INTO stocks (name, symbol) VALUES(?,?);', 
            ['', symbol],
            function(tx, stocks) {
                tx.executeSql(
                    'SELECT * from stocks where rowid=?;', 
                    [stocks.insertId], 
                    obj.rs_bind(callback)
                );
            }
        );
    }

    try {
        var controller = new StocksController();
        var view = new StocksView(controller);

        listen('load', window, bind(view, 'load_stock_list'));
        listen('load', window, bind(view, 'init_stock_form'));
    } catch(e) {
        if(window.alert) {
            window.alert(e);
        } else {
            throw(e);
        }
    }

})();
