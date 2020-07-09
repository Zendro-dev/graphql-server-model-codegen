require('colors');
var difftool = require('diff');
const ws_expr = /\s/g;
const verbose = false;

module.exports = {
  diffByLine: function (actual, expected) {
    var diff = difftool.diffTrimmedLines(actual, expected);
    //var diff = difftool.diffWords(actual, expected);
    var report = [];

    var lastRemoved = false;
    var lastAdded = false;
    var lastIdentical = false;
    var beforeLastMatched = false;
    var lastValue = '';

    diff.forEach((item, i) => {
      var identical = lastValue.replace(ws_expr, '') == item.value.replace(ws_expr, '');

      if (lastRemoved && !item.added)
      {
        if (beforeLastMatched && lastValue.replace(ws_expr, '') != '') {
          report.push('Unexpected: '+lastValue['red']);
        } else if (verbose) {
          report.push(lastValue['grey']);
        }
      }
      if (item.removed) {
        ;
      }
      else if (identical || (!item.added && !item.removed)) {
        report.push(item.value['green']);
      }
      else if (lastRemoved && item.added) {
        report.push('Actual:   '+lastValue['red']);
        report.push('Expected: '+item.value['blue']);
      }
      else if (item.added && item.value.replace(ws_expr, '') != '') {
        report.push('Missing: '+item.value['red']);
      }
      else if (verbose) {

      }

      beforeLastMatched = ((!lastAdded && !lastRemoved) || lastIdentical) && i > 2;
      lastRemoved = item.removed;
      lastAdded = item.added;
      lastValue = item.value;
      lastIdentical = identical;
    });

    return report.join('');
  },
  expr_all_whitespace: ws_expr
}
