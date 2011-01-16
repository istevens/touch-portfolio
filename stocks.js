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

    var db = window.openDatabase('com.zedmonk.stocks', '0.1', 'A list of stocks', 10000);
    if(!db) {
        alert('This demo needs a HTML5 database.');
    }
    else {
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS stocks(\
                name STRING NOT NULL,\
                symbol STRING NOT NULL PRIMARY KEY\
            );', []);
        });
    }

    function insert_stocks(tx, stocks) {
        var r = stocks.rows;
        for(var i=0; i < r.length; i++) {
            var stock = r.item(i);
            var row = document.createElement('tr');
            row.innerHTML = '<td>' + stock['name'] + '</td><td>' + stock['symbol'] + '</td>';
            document.getElementById('stock_list').appendChild(row);
        }
    }

    function load_stock_list() {
        db.transaction(function(tx) {
            tx.executeSql('SELECT * from stocks;', [], insert_stocks);
        });
    }

    function add_stock(event) {
        var symbol = event.srcElement['symbol'].value;
        db.transaction(
            function(tx) {
                tx.executeSql(
                    'INSERT INTO stocks (name, symbol) VALUES(?,?);', 
                    ['', symbol],
                    function(tx, stocks) {
                        tx.executeSql('SELECT * from stocks where rowid=?;', [stocks.insertId], insert_stocks);
                    }
                );
            }
        );
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
    }

    function init_stock_form() {
        listen('submit', $('add_symbol'), add_stock);
    }

    listen('load', window, load_stock_list);
    listen('load', window, init_stock_form);

})();
